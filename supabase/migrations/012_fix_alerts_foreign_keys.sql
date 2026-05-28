-- Corrige FKs de alerts si apuntaban a public.users (esquema antiguo)

alter table public.alerts
  drop constraint if exists alerts_patient_id_fkey;

alter table public.alerts
  drop constraint if exists alerts_medication_id_fkey;

alter table public.alerts
  add constraint alerts_patient_id_fkey
  foreign key (patient_id) references public.patients (id) on delete cascade;

alter table public.alerts
  add constraint alerts_medication_id_fkey
  foreign key (medication_id) references public.medications (id) on delete cascade;
