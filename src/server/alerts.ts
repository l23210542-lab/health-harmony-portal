import { getSupabase } from "@/server/supabase";
import { getPatientById } from "@/server/patients";

export type MissedAlertDetail = {
  id: string;
  scheduled_time: string;
  status: "missed";
  medication: {
    id: string;
    name: string;
    purpose: string;
    dose: string;
  };
};

export type PatientMissedReport = {
  patient: {
    id: string;
    name: string;
    email: string;
  };
  missedAlerts: MissedAlertDetail[];
  missedCount: number;
};

export type MissedAlertsReportPayload = {
  updatedToMissed: number;
  reports: PatientMissedReport[];
  generatedAt: string;
};

export type PatientAlertScheduleItem = {
  id: string;
  scheduled_time: string;
  status: "pending" | "taken" | "missed";
  medication: {
    id: string;
    name: string;
    dose: string;
    purpose: string;
    instructions: string;
  };
};

export async function markExpiredPendingAlertsAsMissed(): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("mark_expired_pending_alerts");
  if (error) {
    console.warn("[alerts] mark_expired_pending_alerts RPC:", error.message);
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("alerts")
      .update({ status: "missed" })
      .eq("status", "pending")
      .lt("scheduled_time", now);
    if (updateError) throw new Error(updateError.message);
    return 0;
  }
  return (data as number) ?? 0;
}

type MedicationRow = {
  id: string;
  name: string;
  dose: string;
  purpose: string;
  instructions: string | null;
};

async function loadMedicationMap(
  supabase: ReturnType<typeof import("@/server/supabase").getSupabase>,
  medicationIds: string[],
): Promise<Map<string, MedicationRow>> {
  const map = new Map<string, MedicationRow>();
  if (medicationIds.length === 0) return map;

  const { data, error } = await supabase
    .from("medications")
    .select("id, name, dose, purpose, instructions")
    .in("id", medicationIds);

  if (error) throw new Error(error.message);
  for (const med of data ?? []) {
    map.set(med.id as string, med as MedicationRow);
  }
  return map;
}

function toScheduleItem(
  row: { id: string; scheduled_time: string; status: string; medication_id: string },
  med: MedicationRow | undefined,
): PatientAlertScheduleItem {
  return {
    id: row.id,
    scheduled_time: row.scheduled_time,
    status: row.status as PatientAlertScheduleItem["status"],
    medication: {
      id: med?.id ?? row.medication_id,
      name: med?.name ?? "—",
      dose: med?.dose ?? "—",
      purpose: med?.purpose ?? "—",
      instructions: med?.instructions ?? "",
    },
  };
}

export async function getMissedAlertsReports(doctorId?: string): Promise<MissedAlertsReportPayload> {
  const supabase = getSupabase();
  const updatedToMissed = await markExpiredPendingAlertsAsMissed();

  let patientIdsFilter: string[] | null = null;
  if (doctorId?.trim()) {
    const { data: prescriptions } = await supabase
      .from("prescriptions")
      .select("patient_id")
      .eq("doctor_id", doctorId);
    patientIdsFilter = [...new Set((prescriptions ?? []).map((p) => p.patient_id as string))];
    if (patientIdsFilter.length === 0) {
      return { updatedToMissed, reports: [], generatedAt: new Date().toISOString() };
    }
  }

  let query = supabase
    .from("alerts")
    .select(
      `
      id,
      scheduled_time,
      status,
      patient_id,
      medications (
        id,
        name,
        purpose,
        dose
      )
    `,
    )
    .eq("status", "missed")
    .order("scheduled_time");

  if (patientIdsFilter) {
    query = query.in("patient_id", patientIdsFilter);
  }

  const { data: missedRows, error } = await query;
  if (error) throw new Error(error.message);

  const missedByPatient = new Map<string, MissedAlertDetail[]>();

  for (const row of missedRows ?? []) {
    const med = row.medications as {
      id: string;
      name: string;
      purpose: string;
      dose: string;
    } | null;
    const detail: MissedAlertDetail = {
      id: row.id as string,
      scheduled_time: row.scheduled_time as string,
      status: "missed",
      medication: {
        id: med?.id ?? "",
        name: med?.name ?? "Medicamento no registrado",
        purpose: med?.purpose ?? "—",
        dose: med?.dose ?? "—",
      },
    };
    const pid = row.patient_id as string;
    const existing = missedByPatient.get(pid) ?? [];
    existing.push(detail);
    missedByPatient.set(pid, existing);
  }

  const reports: PatientMissedReport[] = [];

  for (const [patientId, missedAlerts] of missedByPatient) {
    const patient = await getPatientById(patientId);
    missedAlerts.sort(
      (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime(),
    );
    reports.push({
      patient: patient ?? { id: patientId, name: "Paciente desconocido", email: "" },
      missedAlerts,
      missedCount: missedAlerts.length,
    });
  }

  reports.sort((a, b) => b.missedCount - a.missedCount || a.patient.name.localeCompare(b.patient.name));

  return {
    updatedToMissed,
    reports,
    generatedAt: new Date().toISOString(),
  };
}

export async function getPatientAlertsForDay(
  patientId: string,
  day: Date = new Date(),
): Promise<PatientAlertScheduleItem[]> {
  const supabase = getSupabase();
  await markExpiredPendingAlertsAsMissed();

  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("alerts")
    .select("id, scheduled_time, status, medication_id")
    .eq("patient_id", patientId)
    .gte("scheduled_time", start.toISOString())
    .lte("scheduled_time", end.toISOString())
    .order("scheduled_time");

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<{
    id: string;
    scheduled_time: string;
    status: string;
    medication_id: string;
  }>;
  const medMap = await loadMedicationMap(
    supabase,
    rows.map((r) => r.medication_id),
  );
  return rows.map((row) => toScheduleItem(row, medMap.get(row.medication_id)));
}

export async function getNextPendingAlert(patientId: string): Promise<PatientAlertScheduleItem | null> {
  const supabase = getSupabase();
  await markExpiredPendingAlertsAsMissed();

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("alerts")
    .select("id, scheduled_time, status, medication_id")
    .eq("patient_id", patientId)
    .eq("status", "pending")
    .gte("scheduled_time", now)
    .order("scheduled_time")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as {
    id: string;
    scheduled_time: string;
    status: string;
    medication_id: string;
  };
  const medMap = await loadMedicationMap(supabase, [row.medication_id]);
  return toScheduleItem({ ...row, status: "pending" }, medMap.get(row.medication_id));
}

export async function getPatientAdherence(patientId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("compute_patient_adherence", {
    p_patient_id: patientId,
  });
  if (!error) return Number(data ?? 100);

  console.warn("[alerts] compute_patient_adherence RPC:", error.message);

  const { data: rows, error: queryError } = await supabase
    .from("alerts")
    .select("status")
    .eq("patient_id", patientId);

  if (queryError) throw new Error(queryError.message);

  const taken = (rows ?? []).filter((r) => r.status === "taken").length;
  const resolved = (rows ?? []).filter((r) => r.status === "taken" || r.status === "missed").length;
  return resolved > 0 ? Math.round((100 * taken) / resolved) : 100;
}
