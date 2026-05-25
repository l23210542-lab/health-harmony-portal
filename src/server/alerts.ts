import {
  mutateDb,
  readDb,
  type AlertLog,
  type DatabaseSchema,
  type Medication,
} from "@/server/database";
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

async function resolvePatientInfo(
  db: DatabaseSchema,
  patientId: string,
): Promise<{ id: string; name: string; email: string }> {
  const local = db.users.find((u) => u.id === patientId && u.role === "patient");
  if (local) {
    return { id: local.id, name: local.name, email: local.email };
  }

  try {
    const remote = await getPatientById(patientId);
    if (remote) return remote;
  } catch {
    // fallback si Supabase no está configurado
  }

  return { id: patientId, name: "Paciente desconocido", email: "" };
}

/**
 * Simula un cron: marca como "missed" las alertas pending cuyo scheduled_time ya pasó.
 */
export async function markExpiredPendingAlertsAsMissed(): Promise<number> {
  const now = new Date();

  return mutateDb((db) => {
    let count = 0;
    for (const alert of db.alerts) {
      if (alert.status === "pending" && new Date(alert.scheduled_time) < now) {
        alert.status = "missed";
        count += 1;
      }
    }
    return count;
  });
}

function buildMedicationMap(medications: Medication[]): Map<string, Medication> {
  return new Map(medications.map((m) => [m.id, m]));
}

function toMissedAlertDetail(alert: AlertLog, medication: Medication | undefined): MissedAlertDetail {
  return {
    id: alert.id,
    scheduled_time: alert.scheduled_time,
    status: "missed",
    medication: {
      id: alert.medication_id,
      name: medication?.name ?? "Medicamento no registrado",
      purpose: medication?.purpose ?? "—",
      dose: medication?.dose ?? "—",
    },
  };
}

/**
 * Actualiza alertas vencidas y devuelve reportes agrupados por paciente con alertas "missed".
 * Si doctorId está definido, solo incluye pacientes con recetas emitidas por ese doctor.
 */
export async function getMissedAlertsReports(doctorId?: string): Promise<MissedAlertsReportPayload> {
  const updatedToMissed = await markExpiredPendingAlertsAsMissed();
  const db = await readDb();
  const medicationMap = buildMedicationMap(db.medications);

  let allowedPatientIds: Set<string> | null = null;
  if (doctorId?.trim()) {
    allowedPatientIds = new Set(
      db.prescriptions.filter((p) => p.doctor_id === doctorId).map((p) => p.patient_id),
    );
  }

  const missedByPatient = new Map<string, MissedAlertDetail[]>();

  for (const alert of db.alerts) {
    if (alert.status !== "missed") continue;
    if (allowedPatientIds && !allowedPatientIds.has(alert.patient_id)) continue;

    const medication = medicationMap.get(alert.medication_id);
    const detail = toMissedAlertDetail(alert, medication);
    const existing = missedByPatient.get(alert.patient_id) ?? [];
    existing.push(detail);
    missedByPatient.set(alert.patient_id, existing);
  }

  const reports: PatientMissedReport[] = [];

  for (const [patientId, missedAlerts] of missedByPatient) {
    const patient = await resolvePatientInfo(db, patientId);
    missedAlerts.sort(
      (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime(),
    );
    reports.push({
      patient,
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
