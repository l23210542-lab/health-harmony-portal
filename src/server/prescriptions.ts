import { mutateDb, readDb, type AlertLog, type Medication, type Prescription, type User } from "@/server/database";
import { getDoctorById } from "@/server/doctors";
import { getPatientById, searchPatients } from "@/server/patients";

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

export async function getPatientsByName(query?: string): Promise<User[]> {
  try {
    const fromSupabase = await searchPatients(query);
    if (fromSupabase.length > 0) {
      return fromSupabase.map((p) => ({
        id: p.id,
        role: "patient" as const,
        name: p.name,
        email: p.email,
        phone: "",
      }));
    }
  } catch {
    // fallback a datos locales del prototipo
  }

  const normalized = query?.trim().toLowerCase() ?? "";
  const db = await readDb();
  return db.users
    .filter((u) => u.role === "patient")
    .filter((u) => (normalized ? u.name.toLowerCase().includes(normalized) : true));
}

export async function createPrescription(input: CreatePrescriptionInput): Promise<CreatedPrescriptionPayload> {
  const [supabaseDoctor, supabasePatient] = await Promise.all([
    getDoctorById(input.doctorId).catch(() => null),
    getPatientById(input.patientId).catch(() => null),
  ]);

  return mutateDb((db) => {
    const localDoctor = db.users.find((u) => u.id === input.doctorId && u.role === "doctor");
    const localPatient = db.users.find((u) => u.id === input.patientId && u.role === "patient");

    const doctorId = localDoctor?.id ?? supabaseDoctor?.id;
    const patientId = localPatient?.id ?? supabasePatient?.id;

    if (!doctorId) throw new Error("doctor_not_found");
    if (!patientId) throw new Error("patient_not_found");
    if (!input.medications.length) throw new Error("medications_required");

    const prescription: Prescription = {
      id: crypto.randomUUID(),
      doctor_id: doctorId,
      patient_id: patientId,
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
          patient_id: patientId,
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
