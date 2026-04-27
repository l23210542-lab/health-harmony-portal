import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Search, Trash2, User } from "lucide-react";

export const Route = createFileRoute("/doctor/prescriptions/new")({
  head: () => ({ meta: [{ title: "Crear Receta — Care Sync" }] }),
  component: NewPrescription,
});

type Med = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  purpose: string;
  instructions: string;
};

const emptyMed = (): Med => ({
  id: crypto.randomUUID(),
  name: "",
  dose: "",
  frequency: "",
  duration: "",
  purpose: "",
  instructions: "",
});

function NewPrescription() {
  const [meds, setMeds] = useState<Med[]>([emptyMed()]);
  const [patientSearch, setPatientSearch] = useState("");
  const [patients, setPatients] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    void fetch(`/api/patients?query=${encodeURIComponent(patientSearch)}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la lista de pacientes");
        return res.json() as Promise<{ data: Array<{ id: string; name: string; email: string }> }>;
      })
      .then((payload) => setPatients(payload.data))
      .catch(() => setPatients([]));
  }, [patientSearch]);

  const update = (id: string, field: keyof Med, value: string) =>
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  const remove = (id: string) =>
    setMeds((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));

  const submitPrescription = async () => {
    const emptyMedication = meds.find(
      (m) => !m.name.trim() || !m.dose.trim() || !m.purpose.trim() || !m.frequency.trim() || !m.duration.trim(),
    );

    if (!selectedPatientId) {
      setStatus({ type: "error", message: "Selecciona un paciente antes de enviar la receta." });
      return;
    }

    if (emptyMedication) {
      setStatus({ type: "error", message: "Completa todos los campos obligatorios de cada medicamento." });
      return;
    }

    const hasInvalidNumbers = meds.some((m) => Number.isNaN(Number(m.frequency)) || Number.isNaN(Number(m.duration)));
    if (hasInvalidNumbers) {
      setStatus({ type: "error", message: "Frecuencia y duración deben ser números válidos." });
      return;
    }

    setIsSaving(true);
    setStatus({ type: "idle", message: "" });

    try {
      const payload = {
        doctorId: "doc-1",
        patientId: selectedPatientId,
        notes,
        medications: meds.map((m) => ({
          name: m.name.trim(),
          dose: m.dose.trim(),
          purpose: m.purpose.trim(),
          instructions: m.instructions.trim(),
          frequencyHours: Number(m.frequency),
          durationDays: Number(m.duration),
        })),
      };

      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { error?: string };
        throw new Error(errorPayload.error ?? "No se pudo guardar la receta");
      }

      setStatus({
        type: "success",
        message: "Receta creada correctamente. Se generaron alertas de toma automáticamente.",
      });
      setMeds([emptyMed()]);
      setNotes("");
      setSelectedPatientId("");
      setPatientSearch("");
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Ocurrió un error al enviar la receta.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Nueva receta</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Las alertas se generan automáticamente según la frecuencia.
          </p>
        </div>
      </header>

      {/* Patient selector */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-primary">
          Paciente
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="Buscar paciente por nombre…"
            className="h-16 w-full rounded-2xl border-2 border-border bg-surface pl-14 pr-5 text-lg font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>
        <div className="mt-4">
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-border bg-surface px-4 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="">Selecciona un paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.email}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Medications */}
      <section className="space-y-5">
        <h2 className="text-xl font-extrabold tracking-tight">Medicamentos</h2>
        {meds.map((m, idx) => (
          <article
            key={m.id}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-base font-extrabold text-primary-foreground">
                  {idx + 1}
                </div>
                <span className="text-base font-bold">Medicamento</span>
              </div>
              {meds.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-border text-destructive transition hover:bg-destructive/10"
                  aria-label="Eliminar medicamento"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Name with autocomplete */}
              <Field label="Nombre del medicamento" required>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={m.name}
                    onChange={(e) => update(m.id, "name", e.target.value)}
                    placeholder="Ej. Amoxicilina 500mg"
                    className="h-14 w-full rounded-xl border-2 border-border bg-surface pl-12 pr-4 text-base font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </div>
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Dosis" required>
                  <input
                    value={m.dose}
                    onChange={(e) => update(m.id, "dose", e.target.value)}
                    placeholder="1 cápsula"
                    className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </Field>
                <Field label="Frecuencia" required>
                  <input
                    value={m.frequency}
                    onChange={(e) => update(m.id, "frequency", e.target.value)}
                    placeholder="8"
                    className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </Field>
                <Field label="Duración" required>
                  <input
                    value={m.duration}
                    onChange={(e) => update(m.id, "duration", e.target.value)}
                    placeholder="7"
                    className="h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                </Field>
              </div>

              <Field label="Propósito · ¿Para qué sirve?" required>
                <textarea
                  value={m.purpose}
                  onChange={(e) => update(m.id, "purpose", e.target.value)}
                  rows={2}
                  placeholder="Ej. Antibiótico para infección de garganta"
                  className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-base font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
              </Field>

              <Field label="Instrucciones especiales">
                <textarea
                  value={m.instructions}
                  onChange={(e) => update(m.id, "instructions", e.target.value)}
                  rows={2}
                  placeholder="Ej. Tomar con alimentos. Evitar alcohol."
                  className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-base font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                />
              </Field>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={() => setMeds([...meds, emptyMed()])}
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft px-6 text-base font-bold text-primary transition hover:border-primary hover:bg-primary-soft/70"
        >
          <Plus className="h-5 w-5" strokeWidth={3} /> Agregar otro medicamento
        </button>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Field label="Notas de la receta">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Indicaciones generales para el paciente"
            className="w-full rounded-xl border-2 border-border bg-surface px-4 py-3 text-base font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </Field>
      </section>

      {status.type !== "idle" && (
        <section
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            status.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </section>
      )}

      {/* Actions */}
      <section className="sticky bottom-24 z-10 flex flex-wrap gap-3 rounded-3xl border border-border bg-card/95 p-4 shadow-card backdrop-blur md:bottom-4">
        <button
          type="button"
          className="min-h-14 flex-1 rounded-2xl border-2 border-border bg-surface px-6 text-base font-bold text-foreground transition hover:bg-muted"
        >
          Guardar borrador
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={submitPrescription}
          className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-success px-6 text-base font-bold text-success-foreground shadow-soft transition hover:scale-[1.01]"
        >
          <Check className="h-5 w-5" strokeWidth={3} /> {isSaving ? "Guardando..." : "Enviar receta al paciente"}
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
