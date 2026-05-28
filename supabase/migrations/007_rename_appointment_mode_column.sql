-- PostgreSQL reserva MODE como agregado ordenado; la columna no puede llamarse "mode" en vistas/SQL.
-- Idempotente: solo renombra si aún existe la columna "mode".
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'appointments'
      and column_name = 'mode'
  ) then
    alter table public.appointments rename column mode to visit_mode;
  end if;
end $$;
