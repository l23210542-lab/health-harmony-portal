# Migraciones Care Sync

Ejecuta en orden en el SQL Editor de Supabase (o con `supabase db push`):

1. `001_doctors.sql` — Auth doctores
2. `002_patients.sql` — Auth pacientes
3. `003_extend_profiles.sql` — Teléfono y fecha de nacimiento
4. `004_core_clinical_tables.sql` — Recetas, medicamentos, alertas, citas (FK a doctors/patients)
5. `005_functions_views.sql` — Funciones `generate_medication_alerts`, `mark_expired_pending_alerts`, `compute_patient_adherence`, vistas
6. `006_rls_clinical.sql` — Políticas RLS prototipo
7. `007_rename_appointment_mode_column.sql` — Renombra `mode` → `visit_mode` (si existía)
8. `008_appointments_missing_columns.sql` — **Importante:** agrega `visit_mode`, `place`, `reason` si la tabla ya existía sin ellas
9. `009_grants_and_rpc.sql` — Permisos RPC para crear recetas/alertas (`generate_medication_alerts`)
10. `010_verify_clinical_tables.sql` — Crea tablas clínicas si faltan
11. `011_fix_prescription_foreign_keys.sql` — FK de `prescriptions` → `doctors` / `patients` (no `users`)
12. `012_fix_alerts_foreign_keys.sql` — FK de `alerts` → `patients` / `medications`
13. `013_fix_appointments_foreign_keys.sql` — FK de `appointments` → `doctors` / `patients`

## Modelo relacional

```
doctors ──┬── prescriptions ── medications ── alerts
          │         │
patients ─┴─────────┴── appointments
```

La vista `v_doctor_patient_relationship` une doctores y pacientes que comparten receta o cita.
