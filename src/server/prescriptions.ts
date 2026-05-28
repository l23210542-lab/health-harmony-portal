import { getSupabase } from "@/server/supabase";
import type { AlertLog, Medication, Prescription } from "@/server/types";
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

export async function getPatientsByName(query?: string) {
  return searchPatients(query);
}

async function generateAlertsViaRpc(
  supabase: ReturnType<typeof getSupabase>,
  params: {
    medicationId: string;
    patientId: string;
    frequencyHours: number;
    durationDays: number;
    startsAt: string;
  },
): Promise<number> {
  const { data, error } = await supabase.rpc("generate_medication_alerts", {
    p_medication_id: params.medicationId,
    p_patient_id: params.patientId,
    p_frequency_hours: params.frequencyHours,
    p_duration_days: params.durationDays,
    p_starts_at: params.startsAt,
  });

  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

async function generateAlertsViaInserts(
  supabase: ReturnType<typeof getSupabase>,
  params: {
    medicationId: string;
    patientId: string;
    frequencyHours: number;
    durationDays: number;
    startsAt: string;
  },
): Promise<AlertLog[]> {
  const rows: Array<{
    patient_id: string;
    medication_id: string;
    scheduled_time: string;
    status: AlertLog["status"];
  }> = [];

  const start = new Date(params.startsAt);
  const totalHours = params.durationDays * 24;

  for (let elapsed = 0; elapsed < totalHours; elapsed += params.frequencyHours) {
    const scheduled = new Date(start);
    scheduled.setHours(scheduled.getHours() + elapsed);
    rows.push({
      patient_id: params.patientId,
      medication_id: params.medicationId,
      scheduled_time: scheduled.toISOString(),
      status: "pending",
    });
  }

  if (rows.length === 0) return [];

  const { data, error } = await supabase
    .from("alerts")
    .insert(rows)
    .select("id, patient_id, medication_id, scheduled_time, status");

  if (error) throw new Error(error.message);
  return (data ?? []) as AlertLog[];
}

export async function createPrescription(input: CreatePrescriptionInput): Promise<CreatedPrescriptionPayload> {
  const supabase = getSupabase();

  const [doctor, patient] = await Promise.all([
    getDoctorById(input.doctorId),
    getPatientById(input.patientId),
  ]);

  if (!doctor) throw new Error("doctor_not_found");
  if (!patient) throw new Error("patient_not_found");
  if (!input.medications.length) throw new Error("medications_required");

  const { data: prescription, error: rxError } = await supabase
    .from("prescriptions")
    .insert({
      doctor_id: input.doctorId,
      patient_id: input.patientId,
      notes: input.notes?.trim() || null,
    })
    .select("id, doctor_id, patient_id, created_at, notes")
    .single();

  if (rxError || !prescription) {
    if (rxError?.code === "23503") {
      throw new Error(
        "doctor_or_patient_not_in_database: El doctor o paciente no existe en Supabase. " +
          "Cierra sesión, vuelve a registrarte o inicia sesión, y asegúrate de ejecutar la migración 011 en Supabase.",
      );
    }
    throw new Error(rxError?.message ?? "prescription_insert_failed");
  }

  const medications: Medication[] = [];
  const alerts: AlertLog[] = [];
  const startsAt = new Date().toISOString();

  for (const medInput of input.medications) {
    const { data: medication, error: medError } = await supabase
      .from("medications")
      .insert({
        prescription_id: prescription.id,
        name: medInput.name.trim(),
        dose: medInput.dose.trim(),
        purpose: medInput.purpose.trim(),
        instructions: medInput.instructions.trim() || null,
        frequency_hours: medInput.frequencyHours,
        duration_days: medInput.durationDays,
      })
      .select(
        "id, prescription_id, name, dose, purpose, instructions, frequency_hours, duration_days",
      )
      .single();

    if (medError || !medication) {
      throw new Error(medError?.message ?? "medication_insert_failed");
    }

    medications.push(medication as Medication);

    const alertParams = {
      medicationId: medication.id,
      patientId: input.patientId,
      frequencyHours: medInput.frequencyHours,
      durationDays: medInput.durationDays,
      startsAt,
    };

    try {
      const count = await generateAlertsViaRpc(supabase, alertParams);
      if (count > 0) {
        const { data: generatedAlerts, error: alertsError } = await supabase
          .from("alerts")
          .select("id, patient_id, medication_id, scheduled_time, status")
          .eq("medication_id", medication.id)
          .order("scheduled_time");

        if (alertsError) throw new Error(alertsError.message);
        alerts.push(...((generatedAlerts ?? []) as AlertLog[]));
      }
    } catch (rpcError) {
      console.warn("[createPrescription] RPC generate_medication_alerts falló, usando inserción directa:", rpcError);
      try {
        const inserted = await generateAlertsViaInserts(supabase, alertParams);
        alerts.push(...inserted);
      } catch (insertError) {
        const msg = insertError instanceof Error ? insertError.message : String(insertError);
        if (msg.includes("23503") || msg.includes("foreign key")) {
          throw new Error(
            "alerts_foreign_key: Las alertas no se pudieron guardar. Ejecuta la migración 012 en Supabase " +
              "(FK alerts → patients/medications, no users).",
          );
        }
        throw insertError;
      }
    }
  }

  return {
    prescription: prescription as Prescription,
    medications,
    alerts,
  };
}

export async function updateAlertStatus(id: string, status: AlertLog["status"]): Promise<AlertLog | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("alerts")
    .update({ status })
    .eq("id", id)
    .select("id, patient_id, medication_id, scheduled_time, status")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AlertLog | null;
}

export type PatientMedicationView = {
  id: string;
  name: string;
  dose: string;
  purpose: string;
  instructions: string;
  frequency_hours: number;
  duration_days: number;
  treatment_status: "active" | "completed";
  doctor_name: string;
  prescription_date: string;
};

export async function getPatientMedications(patientId: string): Promise<PatientMedicationView[]> {
  const supabase = getSupabase();

  type MedRow = {
    id: string;
    name: string;
    dose: string;
    purpose: string;
    instructions: string | null;
    frequency_hours: number;
    duration_days: number;
    treatment_status: "active" | "completed";
    doctor_id: string;
    prescription_created_at: string;
  };

  let rows: MedRow[] = [];

  const { data: viewData, error: viewError } = await supabase
    .from("v_active_medications")
    .select(
      "id, name, dose, purpose, instructions, frequency_hours, duration_days, treatment_status, doctor_id, prescription_created_at",
    )
    .eq("patient_id", patientId)
    .order("prescription_created_at", { ascending: false });

  if (!viewError) {
    rows = (viewData ?? []) as MedRow[];
  } else {
    console.warn("[prescriptions] v_active_medications:", viewError.message);

    const { data: prescriptions, error: rxError } = await supabase
      .from("prescriptions")
      .select("id, doctor_id, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });

    if (rxError) throw new Error(rxError.message);

    const rxList = prescriptions ?? [];
    if (rxList.length === 0) return [];

    const rxById = new Map(rxList.map((rx) => [rx.id as string, rx]));
    const rxIds = rxList.map((rx) => rx.id as string);

    const { data: medications, error: medError } = await supabase
      .from("medications")
      .select("id, prescription_id, name, dose, purpose, instructions, frequency_hours, duration_days")
      .in("prescription_id", rxIds);

    if (medError) throw new Error(medError.message);

    const now = Date.now();
    rows = (medications ?? [])
      .map((med) => {
        const rx = rxById.get(med.prescription_id as string);
        if (!rx) return null;

        const createdAt = rx.created_at as string;
        const endMs =
          new Date(createdAt).getTime() + (med.duration_days as number) * 24 * 60 * 60 * 1000;
        const treatment_status: "active" | "completed" = now <= endMs ? "active" : "completed";

        return {
          id: med.id as string,
          name: med.name as string,
          dose: med.dose as string,
          purpose: med.purpose as string,
          instructions: med.instructions as string | null,
          frequency_hours: med.frequency_hours as number,
          duration_days: med.duration_days as number,
          treatment_status,
          doctor_id: rx.doctor_id as string,
          prescription_created_at: createdAt,
        };
      })
      .filter((row): row is MedRow => row !== null)
      .sort(
        (a, b) =>
          new Date(b.prescription_created_at).getTime() - new Date(a.prescription_created_at).getTime(),
      );
  }

  const doctorIds = [...new Set(rows.map((r) => r.doctor_id))];
  const doctorMap = new Map<string, string>();

  await Promise.all(
    doctorIds.map(async (id) => {
      const doc = await getDoctorById(id);
      if (doc) doctorMap.set(id, doc.name);
    }),
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    dose: row.dose,
    purpose: row.purpose,
    instructions: row.instructions ?? "",
    frequency_hours: row.frequency_hours,
    duration_days: row.duration_days,
    treatment_status: row.treatment_status,
    doctor_name: doctorMap.get(row.doctor_id) ?? "Doctor",
    prescription_date: row.prescription_created_at,
  }));
}
