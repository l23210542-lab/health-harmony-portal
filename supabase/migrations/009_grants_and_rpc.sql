-- Recrear función de alertas y otorgar permisos RPC (anon/authenticated)

create or replace function public.generate_medication_alerts(
  p_medication_id uuid,
  p_patient_id uuid,
  p_frequency_hours integer,
  p_duration_days integer,
  p_starts_at timestamptz default timezone('utc', now())
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  total_hours integer;
  elapsed integer;
  inserted_count integer := 0;
begin
  if p_frequency_hours <= 0 or p_duration_days <= 0 then
    raise exception 'frequency_hours y duration_days deben ser positivos';
  end if;

  total_hours := p_duration_days * 24;
  elapsed := 0;

  while elapsed < total_hours loop
    insert into public.alerts (patient_id, medication_id, scheduled_time, status)
    values (
      p_patient_id,
      p_medication_id,
      p_starts_at + make_interval(hours => elapsed),
      'pending'::public.alert_status
    );
    inserted_count := inserted_count + 1;
    elapsed := elapsed + p_frequency_hours;
  end loop;

  return inserted_count;
end;
$$;

grant execute on function public.generate_medication_alerts(uuid, uuid, integer, integer, timestamptz) to anon, authenticated;

-- Estas funciones pueden existir desde 005; permisos explícitos
do $$
begin
  grant execute on function public.mark_expired_pending_alerts() to anon, authenticated;
exception
  when undefined_function then null;
end $$;

do $$
begin
  grant execute on function public.compute_patient_adherence(uuid) to anon, authenticated;
exception
  when undefined_function then null;
end $$;
