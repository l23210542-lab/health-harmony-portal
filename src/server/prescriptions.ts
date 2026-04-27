import { mutateDb, readDb, type AlertLog, type Medication, type Prescription, type User } from "@/server/database";

export type CreateMedicationInput = {
  name: string;
  dose: string;
  purpose: string;
  instructions: string;
  frequencyHours: number;
  durationDays: number;
};

export type CreatePrescriptionInput = {
  doctorId: string;
  patientId: string;
  notes?: string;
  medications: CreateMedicationInput[];
};

export type CreatedPrescriptionPayload = {
  prescription: Prescription;
  medications: Medication[];
  alerts: AlertLog[];
};

export function getPatientsByName(query?: string): Promise<User[]> {
  const normalized = query?.trim().toLowerCase() ?? "";
  return readDb().then((db) =>
    db.users
      .filter((u) => u.role === "patient")
      .filter((u) => (normalized ? u.name.toLowerCase().includes(normalized) : true)),
  );
}

export function createPrescription(input: CreatePrescriptionInput): Promise<CreatedPrescriptionPayload> {
  return mutateDb((db) => {
    const doctor = db.users.find((u) => u.id === input.doctorId && u.role === "doctor");
    const patient = db.users.find((u) => u.id === input.patientId && u.role === "patient");

    if (!doctor) throw new Error("doctor_not_found");
    if (!patient) throw new Error("patient_not_found");
    if (!input.medications.length) throw new Error("medications_required");

    const prescription: Prescription = {
      id: crypto.randomUUID(),
      doctor_id: doctor.id,
      patient_id: patient.id,
      created_at: new Date().toISOString(),
      notes: input.notes?.trim() ?? "",
    };

    const now = new Date();
    const medications: Medication[] = [];
    const alerts: AlertLog[] = [];

    for (const medInput of input.medications) {
      const medication: Medication = {
        id: crypto.randomUUID(),
        prescription_id: prescription.id,
        name: medInput.name.trim(),
        dose: medInput.dose.trim(),
        purpose: medInput.purpose.trim(),
        instructions: medInput.instructions.trim(),
        frequency_hours: medInput.frequencyHours,
        duration_days: medInput.durationDays,
      };
      medications.push(medication);

      const totalHours = medInput.durationDays * 24;
      for (let elapsedHours = 0; elapsedHours < totalHours; elapsedHours += medInput.frequencyHours) {
        const scheduledDate = new Date(now);
        scheduledDate.setHours(scheduledDate.getHours() + elapsedHours);
        alerts.push({
          id: crypto.randomUUID(),
          patient_id: patient.id,
          medication_id: medication.id,
          scheduled_time: scheduledDate.toISOString(),
          status: "pending",
        });
      }
    }

    db.prescriptions.push(prescription);
    db.medications.push(...medications);
    db.alerts.push(...alerts);

    return { prescription, medications, alerts };
  });
}

export async function updateAlertStatus(id: string, status: AlertLog["status"]): Promise<AlertLog | null> {
  return mutateDb((db) => {
    const alert = db.alerts.find((item) => item.id === id);
    if (!alert) return null;
    alert.status = status;
    return alert;
  });
}
