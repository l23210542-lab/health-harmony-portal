-- Corrige FKs de appointments si apuntaban a public.users (esquema antiguo)

alter table public.appointments
  drop constraint if exists appointments_doctor_id_fkey;

alter table public.appointments
  drop constraint if exists appointments_patient_id_fkey;

alter table public.appointments
  add constraint appointments_doctor_id_fkey
  foreign key (doctor_id) references public.doctors (id) on delete cascade;

alter table public.appointments
  add constraint appointments_patient_id_fkey
  foreign key (patient_id) references public.patients (id) on delete cascade;
