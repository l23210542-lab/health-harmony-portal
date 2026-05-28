import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Pill, Clock, Info, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPatientSession } from "@/lib/auth";
import { frequencyLabel } from "@/lib/format";
import type { PatientMedicationView } from "@/server/prescriptions";

export const Route = createFileRoute("/patient/prescriptions")({
  head: () => ({
    meta: [{ title: "Mis Recetas — Care Sync" }],
  }),
  component: Prescriptions,
});

function Prescriptions() {
  const session = getPatientSession();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [meds, setMeds] = useState<PatientMedicationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/patient/prescriptions?patientId=${encodeURIComponent(session.id)}`);
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "No se pudieron cargar tus recetas.");
      }
      const json = (await res.json()) as { data: PatientMedicationView[] };
      setMeds(json.data);
    } catch (err) {
      setMeds([]);
      setError(err instanceof Error ? err.message : "Error al cargar recetas.");
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = meds.filter((m) => m.treatment_status === tab);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mis Recetas</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Toca cualquier medicamento para ver detalles y propósito.
        </p>
      </header>

      <div className="inline-flex rounded-2xl bg-muted p-1.5">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-12 rounded-xl px-6 text-base font-bold transition ${
              tab === t ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t === "active" ? "Activas" : "Pasadas"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          No hay medicamentos {tab === "active" ? "activos" : "pasados"}.
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((m) => (
            <MedCard key={m.id} med={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MedCard({ med }: { med: PatientMedicationView }) {
  const [open, setOpen] = useState(false);
  const freq = frequencyLabel(med.frequency_hours);

  return (
    <li className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-muted/50"
        aria-expanded={open}
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Pill className="h-8 w-8" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-bold">{med.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {freq}
            </span>
            <span>· {med.duration_days} días</span>
          </div>
        </div>
        <ChevronDown
          className={`h-6 w-6 shrink-0 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border bg-primary-soft/40 p-6">
          <DetailRow icon={<Info className="h-5 w-5" />} label="Propósito" value={med.purpose} />
          <DetailRow
            icon={<AlertCircle className="h-5 w-5" />}
            label="Instrucciones"
            value={med.instructions || "Sin instrucciones adicionales."}
          />
          <div className="grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-3">
            <SmallStat label="Dosis" value={med.dose} />
            <SmallStat label="Frecuencia" value={freq} />
            <SmallStat label="Duración" value={`${med.duration_days} días`} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              Recetado por <strong className="text-foreground">{med.doctor_name}</strong>
            </span>
            <span>{format(new Date(med.prescription_date), "d MMM yyyy", { locale: es })}</span>
          </div>
        </div>
      )}
    </li>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">{label}</div>
        <div className="mt-0.5 text-base leading-relaxed text-foreground">{value}</div>
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-bold">{value}</div>
    </div>
  );
}
