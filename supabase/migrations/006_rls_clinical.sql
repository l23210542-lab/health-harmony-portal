-- RLS prototipo (mismo criterio que doctors/patients)
alter table public.prescriptions enable row level security;
alter table public.medications enable row level security;
alter table public.alerts enable row level security;
alter table public.appointments enable row level security;

-- prescriptions
drop policy if exists "prescriptions_anon_all" on public.prescriptions;
create policy "prescriptions_anon_all"
  on public.prescriptions for all to anon, authenticated
  using (true) with check (true);

-- medications
drop policy if exists "medications_anon_all" on public.medications;
create policy "medications_anon_all"
  on public.medications for all to anon, authenticated
  using (true) with check (true);

-- alerts
drop policy if exists "alerts_anon_all" on public.alerts;
create policy "alerts_anon_all"
  on public.alerts for all to anon, authenticated
  using (true) with check (true);

-- appointments
drop policy if exists "appointments_anon_all" on public.appointments;
create policy "appointments_anon_all"
  on public.appointments for all to anon, authenticated
  using (true) with check (true);
