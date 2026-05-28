import { getSupabase } from "@/server/supabase";
import { getNextPendingAlert, getPatientAdherence, getPatientAlertsForDay } from "@/server/alerts";
import { getDoctorTodayAppointments } from "@/server/appointments";
import { getDoctorById } from "@/server/doctors";
import { getPatientById } from "@/server/patients";

export type DoctorDashboardStats = {
  appointmentsToday: number;
  activePatients: number;
  prescriptionsThisWeek: number;
  averageAdherence: number;
  todayAppointments: Awaited<ReturnType<typeof getDoctorTodayAppointments>>;
  recentPatients: Array<{
    id: string;
    name: string;
    activeMeds: number;
    adherence: number;
    lastVisit: string | null;
  }>;
};

export type PatientDashboardData = {
  adherencePercent: number;
  activeMedicationsCount: number;
  nextAppointment: {
    id: string;
    date_time: string;
    doctor_name: string;
    doctor_specialty: string;
    visit_mode: string;
    place: string;
  } | null;
  nextAlert: Awaited<ReturnType<typeof getNextPendingAlert>>;
  todaySchedule: Awaited<ReturnType<typeof getPatientAlertsForDay>>;
};

export async function getDoctorDashboard(doctorId: string): Promise<DoctorDashboardStats> {
  const supabase = getSupabase();
  const todayAppointments = await getDoctorTodayAppointments(doctorId);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count: prescriptionsThisWeek } = await supabase
    .from("prescriptions")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .gte("created_at", weekAgo.toISOString());

  const { data: relationships } = await supabase
    .from("v_doctor_patient_relationship")
    .select("patient_id")
    .eq("doctor_id", doctorId);

  const patientIds = [...new Set((relationships ?? []).map((r) => r.patient_id as string))];

  let adherenceSum = 0;
  let adherenceCount = 0;

  const recentPatients: DoctorDashboardStats["recentPatients"] = [];

  for (const patientId of patientIds.slice(0, 8)) {
    const patient = await getPatientById(patientId);
    if (!patient) continue;

    const adherence = await getPatientAdherence(patientId);
    adherenceSum += adherence;
    adherenceCount += 1;

    const { count: activeMeds } = await supabase
      .from("v_active_medications")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("treatment_status", "active");

    const { data: lastAppt } = await supabase
      .from("appointments")
      .select("date_time")
      .eq("doctor_id", doctorId)
      .eq("patient_id", patientId)
      .order("date_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    recentPatients.push({
      id: patientId,
      name: patient.name,
      activeMeds: activeMeds ?? 0,
      adherence: Math.round(adherence),
      lastVisit: (lastAppt?.date_time as string) ?? null,
    });
  }

  recentPatients.sort((a, b) => b.adherence - a.adherence);

  return {
    appointmentsToday: todayAppointments.length,
    activePatients: patientIds.length,
    prescriptionsThisWeek: prescriptionsThisWeek ?? 0,
    averageAdherence: adherenceCount > 0 ? Math.round(adherenceSum / adherenceCount) : 100,
    todayAppointments,
    recentPatients: recentPatients.slice(0, 5),
  };
}

export type DoctorPatientListItem = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  activeMeds: number;
  adherence: number;
  lastVisit: string | null;
};

export async function getDoctorPatients(
  doctorId: string,
  query?: string,
): Promise<DoctorPatientListItem[]> {
  const supabase = getSupabase();

  const { data: relationships, error } = await supabase
    .from("v_doctor_patient_relationship")
    .select("patient_id")
    .eq("doctor_id", doctorId);

  if (error) throw new Error(error.message);

  const patientIds = [...new Set((relationships ?? []).map((r) => r.patient_id as string))];
  const normalized = query?.trim().toLowerCase() ?? "";
  const results: DoctorPatientListItem[] = [];

  for (const patientId of patientIds) {
    const { data: row, error: patError } = await supabase
      .from("patients")
      .select("id, name, email, birth_date")
      .eq("id", patientId)
      .maybeSingle();

    if (patError || !row) continue;

    if (
      normalized &&
      !row.name.toLowerCase().includes(normalized) &&
      !row.email.toLowerCase().includes(normalized)
    ) {
      continue;
    }

    const adherence = await getPatientAdherence(patientId);

    const { count: activeMeds } = await supabase
      .from("v_active_medications")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("treatment_status", "active");

    const { data: lastAppt } = await supabase
      .from("appointments")
      .select("date_time")
      .eq("doctor_id", doctorId)
      .eq("patient_id", patientId)
      .order("date_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    let age: number | null = null;
    if (row.birth_date) {
      const birth = new Date(row.birth_date as string);
      const today = new Date();
      age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
    }

    results.push({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      age,
      activeMeds: activeMeds ?? 0,
      adherence: Math.round(adherence),
      lastVisit: (lastAppt?.date_time as string) ?? null,
    });
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

async function countActiveMedications(patientId: string): Promise<number> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from("v_active_medications")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .eq("treatment_status", "active");

  if (!error) return count ?? 0;

  console.warn("[dashboard] v_active_medications:", error.message);

  const { data: meds, error: medsError } = await supabase
    .from("medications")
    .select("id, duration_days, prescriptions!inner(patient_id, created_at)")
    .eq("prescriptions.patient_id", patientId);

  if (medsError) throw new Error(medsError.message);

  const now = Date.now();
  return (meds ?? []).filter((m) => {
    const rx = m.prescriptions as { patient_id: string; created_at: string };
    const start = new Date(rx.created_at).getTime();
    const end = start + (m.duration_days as number) * 24 * 60 * 60 * 1000;
    return now <= end;
  }).length;
}

export async function getPatientDashboard(patientId: string): Promise<PatientDashboardData> {
  const supabase = getSupabase();
  const adherencePercent = Math.round(await getPatientAdherence(patientId));
  const activeMedicationsCount = await countActiveMedications(patientId);

  const now = new Date().toISOString();
  const { data: nextApptRow, error: apptError } = await supabase
    .from("appointments")
    .select("id, date_time, doctor_id, visit_mode, place")
    .eq("patient_id", patientId)
    .in("status", ["scheduled", "confirmed"])
    .gte("date_time", now)
    .order("date_time")
    .limit(1)
    .maybeSingle();

  if (apptError) {
    console.warn("[dashboard] appointments:", apptError.message);
  }

  let nextAppointment: PatientDashboardData["nextAppointment"] = null;
  if (nextApptRow) {
    const doc = await getDoctorById(nextApptRow.doctor_id as string);
    nextAppointment = {
      id: nextApptRow.id as string,
      date_time: nextApptRow.date_time as string,
      doctor_name: doc?.name ?? "Doctor",
      doctor_specialty: doc?.specialty ?? "",
      visit_mode: nextApptRow.visit_mode as string,
      place: nextApptRow.place as string,
    };
  }

  const [nextAlert, todaySchedule] = await Promise.all([
    getNextPendingAlert(patientId),
    getPatientAlertsForDay(patientId),
  ]);

  return {
    adherencePercent,
    activeMedicationsCount,
    nextAppointment,
    nextAlert,
    todaySchedule,
  };
}

export type PatientProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  age: number | null;
  created_at: string;
};

export async function getPatientProfile(patientId: string): Promise<PatientProfile | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("patients")
    .select("id, name, email, phone, birth_date, created_at")
    .eq("id", patientId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  let age: number | null = null;
  if (data.birth_date) {
    const birth = new Date(data.birth_date as string);
    const today = new Date();
    age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  }

  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    phone: (data.phone as string | null) ?? null,
    birth_date: (data.birth_date as string | null) ?? null,
    age,
    created_at: data.created_at as string,
  };
}
