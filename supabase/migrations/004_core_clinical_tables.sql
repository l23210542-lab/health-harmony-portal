-- Tipos enumerados alineados con la aplicación
do $$ begin
  create type public.appointment_status as enum (
    'scheduled', 'confirmed', 'completed', 'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_status as enum ('pending', 'taken', 'missed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.appointment_mode as enum ('in_person', 'video');
exception when duplicate_object then null;
end $$;

-- Relación lógica doctor ↔ paciente vía recetas y citas (tablas puente implícitas)
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid not null references public.prescriptions (id) on delete cascade,
  name text not null,
  dose text not null,
  purpose text not null,
  instructions text,
  frequency_hours integer not null check (frequency_hours > 0),
  duration_days integer not null check (duration_days > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  scheduled_time timestamptz not null,
  status public.alert_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  date_time timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  visit_mode public.appointment_mode not null default 'in_person',
  place text not null default '',
  reason text not null default 'Consulta general',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists prescriptions_doctor_id_idx on public.prescriptions (doctor_id);
create index if not exists prescriptions_patient_id_idx on public.prescriptions (patient_id);
create index if not exists medications_prescription_id_idx on public.medications (prescription_id);
create index if not exists alerts_patient_id_idx on public.alerts (patient_id);
create index if not exists alerts_medication_id_idx on public.alerts (medication_id);
create index if not exists alerts_scheduled_time_idx on public.alerts (scheduled_time);
create index if not exists alerts_status_idx on public.alerts (status);
create index if not exists appointments_doctor_id_idx on public.appointments (doctor_id);
create index if not exists appointments_patient_id_idx on public.appointments (patient_id);
create index if not exists appointments_date_time_idx on public.appointments (date_time);
