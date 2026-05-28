import { getSupabase } from "@/server/supabase";
import type { Appointment, AppointmentMode, AppointmentStatus } from "@/server/types";
import { getDoctorById } from "@/server/doctors";
import { getPatientById } from "@/server/patients";

export type AppointmentWithNames = Appointment & {
  doctor_name: string;
  doctor_specialty: string;
  patient_name: string;
};

export type CreateAppointmentInput = {
  doctorId: string;
  patientId: string;
  dateTime: string;
  visitMode?: AppointmentMode;
  place?: string;
  reason?: string;
};

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const supabase = getSupabase();

  const [doctor, patient] = await Promise.all([
    getDoctorById(input.doctorId),
    getPatientById(input.patientId),
  ]);

  if (!doctor) throw new Error("doctor_not_found");
  if (!patient) throw new Error("patient_not_found");

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id: input.doctorId,
      patient_id: input.patientId,
      date_time: input.dateTime,
      visit_mode: input.visitMode ?? "in_person",
      place: input.place?.trim() ?? "",
      reason: input.reason?.trim() ?? "Consulta general",
      status: "scheduled",
    })
    .select("id, doctor_id, patient_id, date_time, status, visit_mode, place, reason")
    .single();

  if (error || !data) throw new Error(error?.message ?? "appointment_insert_failed");
  return data as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<Appointment | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("id, doctor_id, patient_id, date_time, status, visit_mode, place, reason")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Appointment | null;
}

async function enrichAppointments(rows: Appointment[]): Promise<AppointmentWithNames[]> {
  const doctorCache = new Map<string, { name: string; specialty: string }>();
  const patientCache = new Map<string, string>();

  return Promise.all(
    rows.map(async (row) => {
      if (!doctorCache.has(row.doctor_id)) {
        const doc = await getDoctorById(row.doctor_id);
        doctorCache.set(row.doctor_id, {
          name: doc?.name ?? "Doctor",
          specialty: doc?.specialty ?? "",
        });
      }
      if (!patientCache.has(row.patient_id)) {
        const pat = await getPatientById(row.patient_id);
        patientCache.set(row.patient_id, pat?.name ?? "Paciente");
      }
      const doc = doctorCache.get(row.doctor_id)!;
      return {
        ...row,
        doctor_name: doc.name,
        doctor_specialty: doc.specialty,
        patient_name: patientCache.get(row.patient_id)!,
      };
    }),
  );
}

export async function listAppointments(filters: {
  doctorId?: string;
  patientId?: string;
  from?: string;
  to?: string;
}): Promise<AppointmentWithNames[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, date_time, status, visit_mode, place, reason")
    .order("date_time");

  if (filters.doctorId) query = query.eq("doctor_id", filters.doctorId);
  if (filters.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters.from) query = query.gte("date_time", filters.from);
  if (filters.to) query = query.lte("date_time", filters.to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return enrichAppointments((data ?? []) as Appointment[]);
}

export async function getDoctorTodayAppointments(doctorId: string): Promise<AppointmentWithNames[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return listAppointments({
    doctorId,
    from: start.toISOString(),
    to: end.toISOString(),
  });
}

export async function countAppointmentsForMonth(doctorId: string, year: number, month: number): Promise<number> {
  const supabase = getSupabase();
  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

  const { count, error } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .gte("date_time", from)
    .lte("date_time", to);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function getAppointmentsByDayForMonth(
  doctorId: string,
  year: number,
  month: number,
): Promise<Record<number, number>> {
  const supabase = getSupabase();
  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select("date_time")
    .eq("doctor_id", doctorId)
    .gte("date_time", from)
    .lte("date_time", to);

  if (error) throw new Error(error.message);

  const counts: Record<number, number> = {};
  for (const row of data ?? []) {
    const day = new Date(row.date_time as string).getDate();
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return counts;
}
