-- Perfil extendido para pacientes (PRD: phone; UI: edad vía birth_date)
alter table public.patients
  add column if not exists phone text,
  add column if not exists birth_date date;

comment on column public.patients.phone is 'Teléfono de contacto del paciente';
comment on column public.patients.birth_date is 'Fecha de nacimiento para calcular edad en la app';
