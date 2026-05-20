import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Clock, FileText, Plus, TrendingUp, Users } from "lucide-react";
import { getDoctorSession } from "@/lib/auth";

export const Route = createFileRoute("/doctor/")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const session = getDoctorSession();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-base font-medium text-muted-foreground">Buenos días,</p>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{session?.name ?? "Doctor"}</h1>
        </div>
        <Link
          from="/doctor"
          to="prescriptions/new"
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 text-base font-bold text-primary-foreground shadow-soft transition hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} /> Nueva receta
        </Link>
      </header>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <Stat icon={<CalendarDays className="h-6 w-6" />} label="Citas hoy" value="8" tone="primary" />
        <Stat icon={<Users className="h-6 w-6" />} label="Pacientes activos" value="142" tone="primary" />
        <Stat icon={<FileText className="h-6 w-6" />} label="Recetas esta semana" value="34" tone="success" />
        <Stat icon={<TrendingUp className="h-6 w-6" />} label="Adherencia promedio" value="87%" tone="success" />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today schedule */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight">Agenda de hoy</h2>
            <Link to="/doctor/calendar" className="text-sm font-bold text-primary hover:underline">
              Ver calendario →
            </Link>
          </div>
          <ul className="space-y-3">
            <Appt time="09:00" name="María González" reason="Seguimiento · Infección" status="next" />
            <Appt time="10:30" name="Carlos Ramírez" reason="Consulta general" status="upcoming" />
            <Appt time="11:15" name="Lucía Mendoza" reason="Revisión de presión" status="upcoming" />
            <Appt time="12:00" name="Jorge Hernández" reason="Resultados de laboratorio" status="upcoming" />
            <Appt time="08:00" name="Ana Torres" reason="Chequeo anual" status="done" />
          </ul>
        </section>

        {/* Recent patients */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-5 text-xl font-extrabold tracking-tight">Pacientes recientes</h2>
          <ul className="space-y-3">
            {[
              { name: "María González", info: "3 medicinas activas", initials: "MG" },
              { name: "Carlos Ramírez", info: "Última visita: ayer", initials: "CR" },
              { name: "Lucía Mendoza", info: "Adherencia 95%", initials: "LM" },
            ].map((p) => (
              <li key={p.name}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-muted"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-success text-success-foreground font-extrabold">
                    {p.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-bold">{p.name}</div>
                    <div className="truncate text-sm text-muted-foreground">{p.info}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Stat({
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
    tone === "success" ? "bg-success-soft text-success" : "bg-primary-soft text-primary";
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClasses}`}>{icon}</div>
      <div className="mt-4 text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

function Appt({
  time,
  name,
  reason,
  status,
}: {
  time: string;
  name: string;
  reason: string;
  status: "next" | "upcoming" | "done";
}) {
  const config = {
    next: { ring: "ring-2 ring-primary", pill: "bg-primary text-primary-foreground", label: "Ahora" },
    upcoming: { ring: "", pill: "bg-muted text-muted-foreground", label: "Próxima" },
    done: { ring: "opacity-60", pill: "bg-success-soft text-success", label: "Completada" },
  }[status];
  return (
    <li className={`flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 ${config.ring}`}>
      <div className="flex w-16 shrink-0 flex-col items-center text-center">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-lg font-extrabold tabular-nums">{time}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-bold">{name}</div>
        <div className="truncate text-sm text-muted-foreground">{reason}</div>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${config.pill}`}>
        {config.label}
      </span>
    </li>
  );
}
