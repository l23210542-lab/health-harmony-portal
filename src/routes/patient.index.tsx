import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Clock, Pill, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/patient/")({
  component: PatientHome,
});

function PatientHome() {
  return (
    <div className="space-y-8">
      {/* Greeting */}
      <header>
        <p className="text-base font-medium text-muted-foreground">Buenos días,</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">María González</h1>
      </header>

      {/* Hero alert: next medication */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-primary p-7 text-primary-foreground shadow-card md:p-10"
        aria-labelledby="next-med"
      >
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur">
              <Bell className="h-4 w-4" /> Próxima toma · en 25 min
            </span>
            <h2 id="next-med" className="text-3xl font-extrabold leading-tight md:text-4xl">
              Amoxicilina 500mg
            </h2>
            <p className="text-lg text-white/90">1 cápsula · con un vaso de agua</p>
            <p className="flex items-center gap-2 text-base text-white/80">
              <Clock className="h-5 w-5" /> 09:00 AM
            </p>
          </div>
          <button
            className="inline-flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-lg font-bold text-primary shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
            type="button"
          >
            <Check className="h-6 w-6" strokeWidth={3} /> Marcar como tomada
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Adherencia esta semana"
          value="92%"
          tone="success"
        />
        <StatCard
          icon={<Pill className="h-6 w-6" />}
          label="Medicinas activas"
          value="3"
          tone="primary"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6" />}
          label="Próxima cita"
          value="Mié 28"
          tone="primary"
        />
      </section>

      {/* Schedule today */}
      <section>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Hoy</h2>
        <ul className="space-y-3">
          <ScheduleItem time="09:00" name="Amoxicilina 500mg" purpose="Infección de garganta" status="next" />
          <ScheduleItem time="14:00" name="Ibuprofeno 400mg" purpose="Dolor e inflamación" status="pending" />
          <ScheduleItem time="20:00" name="Loratadina 10mg" purpose="Alergia estacional" status="pending" />
          <ScheduleItem time="06:00" name="Amoxicilina 500mg" purpose="Infección de garganta" status="taken" />
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "success";
}) {
  const toneClasses =
    tone === "success"
      ? "bg-success-soft text-success"
      : "bg-primary-soft text-primary";
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClasses}`}>{icon}</div>
      <div className="mt-4 text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

function ScheduleItem({
  time,
  name,
  purpose,
  status,
}: {
  time: string;
  name: string;
  purpose: string;
  status: "next" | "pending" | "taken";
}) {
  const config = {
    next: {
      ring: "ring-2 ring-primary",
      pill: "bg-primary text-primary-foreground",
      label: "Ahora",
    },
    pending: {
      ring: "",
      pill: "bg-muted text-muted-foreground",
      label: "Pendiente",
    },
    taken: {
      ring: "opacity-70",
      pill: "bg-success-soft text-success",
      label: "Tomada ✓",
    },
  }[status];

  return (
    <li
      className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft ${config.ring}`}
    >
      <div className="grid w-16 shrink-0 text-center">
        <div className="text-2xl font-extrabold tabular-nums">{time}</div>
      </div>
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Pill className="h-7 w-7" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-bold">{name}</div>
        <div className="truncate text-sm text-muted-foreground">{purpose}</div>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${config.pill}`}>
        {config.label}
      </span>
    </li>
  );
}
