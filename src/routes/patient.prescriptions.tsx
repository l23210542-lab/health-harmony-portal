import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Pill, Clock, Info, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/patient/prescriptions")({
  head: () => ({
    meta: [{ title: "Mis Recetas — Care Sync" }],
  }),
  component: Prescriptions,
});

type Med = {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  purpose: string;
  instructions: string;
  status: "active" | "completed";
  doctor: string;
  date: string;
};

const meds: Med[] = [
  {
    id: "1",
    name: "Amoxicilina 500mg",
    dose: "1 cápsula",
    frequency: "Cada 8 horas",
    duration: "7 días",
    purpose: "Tratamiento de infección bacteriana en la garganta. Antibiótico de amplio espectro.",
    instructions: "Tomar con un vaso lleno de agua. Completar todo el tratamiento aunque te sientas mejor.",
    status: "active",
    doctor: "Dra. Elena Ríos",
    date: "23 Abr 2026",
  },
  {
    id: "2",
    name: "Ibuprofeno 400mg",
    dose: "1 tableta",
    frequency: "Cada 6 horas si hay dolor",
    duration: "5 días",
    purpose: "Antiinflamatorio para reducir inflamación y dolor.",
    instructions: "Tomar siempre con alimentos para evitar molestias estomacales.",
    status: "active",
    doctor: "Dra. Elena Ríos",
    date: "23 Abr 2026",
  },
  {
    id: "3",
    name: "Loratadina 10mg",
    dose: "1 tableta",
    frequency: "Cada 24 horas",
    duration: "30 días",
    purpose: "Antihistamínico para controlar síntomas de alergia estacional.",
    instructions: "Tomar preferiblemente en la noche.",
    status: "active",
    doctor: "Dr. Marco Vega",
    date: "10 Abr 2026",
  },
  {
    id: "4",
    name: "Paracetamol 500mg",
    dose: "2 tabletas",
    frequency: "Cada 8 horas",
    duration: "3 días",
    purpose: "Manejo de fiebre y dolor leve a moderado.",
    instructions: "No exceder 8 tabletas en 24 horas.",
    status: "completed",
    doctor: "Dra. Elena Ríos",
    date: "15 Mar 2026",
  },
];

function Prescriptions() {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const filtered = meds.filter((m) => m.status === tab);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mis Recetas</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Toca cualquier medicamento para ver detalles y propósito.
        </p>
      </header>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl bg-muted p-1.5">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-12 rounded-xl px-6 text-base font-bold transition ${
              tab === t
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            {t === "active" ? "Activas" : "Pasadas"}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {filtered.map((m) => (
          <MedCard key={m.id} med={m} />
        ))}
      </ul>
    </div>
  );
}

function MedCard({ med }: { med: Med }) {
  const [open, setOpen] = useState(false);
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
              <Clock className="h-4 w-4" /> {med.frequency}
            </span>
            <span>· {med.duration}</span>
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
            value={med.instructions}
          />
          <div className="grid gap-3 rounded-2xl bg-card p-4 sm:grid-cols-3">
            <SmallStat label="Dosis" value={med.dose} />
            <SmallStat label="Frecuencia" value={med.frequency} />
            <SmallStat label="Duración" value={med.duration} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Recetado por <strong className="text-foreground">{med.doctor}</strong></span>
            <span>{med.date}</span>
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
