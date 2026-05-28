-- Permisos de lectura sobre vistas expuestas vía PostgREST/Supabase API

grant select on public.v_active_medications to anon, authenticated;
grant select on public.v_doctor_patient_relationship to anon, authenticated;
grant select on public.v_doctor_today_appointments to anon, authenticated;
