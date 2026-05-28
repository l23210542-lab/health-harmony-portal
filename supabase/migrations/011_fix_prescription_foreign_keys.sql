-- Corrige FKs si prescriptions apuntaba a public.users (esquema antiguo)
-- Auth actual usa doctors y patients.

alter table public.prescriptions
  drop constraint if exists prescriptions_doctor_id_fkey;

alter table public.prescriptions
  drop constraint if exists prescriptions_patient_id_fkey;

alter table public.prescriptions
  add constraint prescriptions_doctor_id_fkey
  foreign key (doctor_id) references public.doctors (id) on delete cascade;

alter table public.prescriptions
  add constraint prescriptions_patient_id_fkey
  foreign key (patient_id) references public.patients (id) on delete cascade;
