-- Tabla de pacientes para Care Sync (prototipo)
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

create index if not exists patients_email_idx on public.patients (lower(email));

alter table public.patients enable row level security;

drop policy if exists "patients_anon_select" on public.patients;
drop policy if exists "patients_anon_insert" on public.patients;

create policy "patients_anon_select"
  on public.patients
  for select
  to anon, authenticated
  using (true);

create policy "patients_anon_insert"
  on public.patients
  for insert
  to anon, authenticated
  with check (true);
