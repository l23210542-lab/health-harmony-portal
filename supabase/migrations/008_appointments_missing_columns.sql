-- La tabla appointments pudo crearse sin visit_mode/place/reason (CREATE TABLE IF NOT EXISTS no altera tablas existentes).

do $$ begin
  create type public.appointment_mode as enum ('in_person', 'video');
exception
  when duplicate_object then null;
end $$;

-- Si quedó la columna antigua "mode", renombrar
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'mode'
  ) then
    alter table public.appointments rename column mode to visit_mode;
  end if;
end $$;

alter table public.appointments
  add column if not exists visit_mode public.appointment_mode not null default 'in_person';

alter table public.appointments
  add column if not exists place text not null default '';

alter table public.appointments
  add column if not exists reason text not null default 'Consulta general';

-- Vista del dashboard/calendario (requiere visit_mode)
create or replace view public.v_doctor_today_appointments as
select
  a.id,
  a.doctor_id,
  a.patient_id,
  a.date_time,
  a.status,
  a.visit_mode,
  a.place,
  a.reason,
  pt.name as patient_name
from public.appointments a
join public.patients pt on pt.id = a.patient_id
where a.date_time::date = timezone('utc', now())::date
  and a.status in ('scheduled', 'confirmed');
