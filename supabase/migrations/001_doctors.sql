-- Tabla de doctores para Care Sync (prototipo)
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  specialty text default 'Medicina General',
  password text not null,
  created_at timestamptz not null default now()
);

create index if not exists doctors_email_idx on public.doctors (lower(email));

alter table public.doctors enable row level security;

-- Políticas abiertas solo para prototipo (reemplazar en producción)
drop policy if exists "doctors_anon_select" on public.doctors;
drop policy if exists "doctors_anon_insert" on public.doctors;

create policy "doctors_anon_select"
  on public.doctors
  for select
  to anon, authenticated
  using (true);

create policy "doctors_anon_insert"
  on public.doctors
  for insert
  to anon, authenticated
  with check (true);
