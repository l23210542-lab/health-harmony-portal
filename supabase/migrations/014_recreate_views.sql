-- Recrea vistas si 005 falló a medias

create or replace view public.v_doctor_patient_relationship as
select distinct doctor_id, patient_id, 'prescription'::text as link_source
from public.prescriptions
union
select distinct doctor_id, patient_id, 'appointment'::text as link_source
from public.appointments;

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
