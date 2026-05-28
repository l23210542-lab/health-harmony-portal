-- Verifica tablas clínicas mínimas (por si 004 no se aplicó completo)

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

do $$ begin
  create type public.alert_status as enum ('pending', 'taken', 'missed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  scheduled_time timestamptz not null,
  status public.alert_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.prescriptions enable row level security;
alter table public.medications enable row level security;
alter table public.alerts enable row level security;

drop policy if exists "prescriptions_anon_all" on public.prescriptions;
create policy "prescriptions_anon_all"
  on public.prescriptions for all to anon, authenticated using (true) with check (true);

drop policy if exists "medications_anon_all" on public.medications;
create policy "medications_anon_all"
  on public.medications for all to anon, authenticated using (true) with check (true);

drop policy if exists "alerts_anon_all" on public.alerts;
create policy "alerts_anon_all"
  on public.alerts for all to anon, authenticated using (true) with check (true);
