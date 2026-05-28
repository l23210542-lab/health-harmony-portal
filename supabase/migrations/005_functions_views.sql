-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists prescriptions_set_updated_at on public.prescriptions;
create trigger prescriptions_set_updated_at
  before update on public.prescriptions
  for each row execute function public.set_updated_at();

drop trigger if exists medications_set_updated_at on public.medications;
create trigger medications_set_updated_at
  before update on public.medications
  for each row execute function public.set_updated_at();

drop trigger if exists alerts_set_updated_at on public.alerts;
create trigger alerts_set_updated_at
  before update on public.alerts
  for each row execute function public.set_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- Genera alertas de toma según frecuencia y duración (PRD flujo 1)
create or replace function public.generate_medication_alerts(
  p_medication_id uuid,
  p_patient_id uuid,
  p_frequency_hours integer,
  p_duration_days integer,
  p_starts_at timestamptz default timezone('utc', now())
)
returns integer
language plpgsql
as $$
declare
  total_hours integer;
  elapsed integer;
  inserted_count integer := 0;
begin
  if p_frequency_hours <= 0 or p_duration_days <= 0 then
    raise exception 'frequency_hours y duration_days deben ser positivos';
  end if;

  total_hours := p_duration_days * 24;
  elapsed := 0;

  while elapsed < total_hours loop
    insert into public.alerts (patient_id, medication_id, scheduled_time, status)
    values (
      p_patient_id,
      p_medication_id,
      p_starts_at + make_interval(hours => elapsed),
      'pending'
    );
    inserted_count := inserted_count + 1;
    elapsed := elapsed + p_frequency_hours;
  end loop;

  return inserted_count;
end;
$$;

-- Cron lógico: pending vencidas → missed (PRD flujo 2)
create or replace function public.mark_expired_pending_alerts()
returns integer
language plpgsql
as $$
declare
  updated_count integer;
begin
  update public.alerts
  set status = 'missed'
  where status = 'pending'
    and scheduled_time < timezone('utc', now());

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

-- Adherencia: % de alertas tomadas sobre total resuelto (taken + missed)
create or replace function public.compute_patient_adherence(p_patient_id uuid)
returns numeric
language sql
stable
as $$
  select coalesce(
    round(
      100.0 * count(*) filter (where status = 'taken')
      / nullif(count(*) filter (where status in ('taken', 'missed')), 0),
      1
    ),
    100
  )
  from public.alerts
  where patient_id = p_patient_id;
$$;

-- Vista: relación lógica doctor–paciente (unión de recetas y citas)
create or replace view public.v_doctor_patient_relationship as
select distinct doctor_id, patient_id, 'prescription'::text as link_source
from public.prescriptions
union
select distinct doctor_id, patient_id, 'appointment'::text as link_source
from public.appointments;

-- Vista: medicamentos activos (dentro de ventana de duración desde receta)
create or replace view public.v_active_medications as
select
  m.id,
  m.prescription_id,
  m.name,
  m.dose,
  m.purpose,
  m.instructions,
  m.frequency_hours,
  m.duration_days,
  p.doctor_id,
  p.patient_id,
  p.created_at as prescription_created_at,
  (p.created_at + make_interval(days => m.duration_days)) as ends_at,
  case
    when timezone('utc', now()) <= (p.created_at + make_interval(days => m.duration_days))
    then 'active'
    else 'completed'
  end as treatment_status
from public.medications m
join public.prescriptions p on p.id = m.prescription_id;

-- Renombrar mode → visit_mode (PostgreSQL reserva mode() como agregado ordenado)
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

-- Vista: agenda del día por doctor
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
