import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Clock, FileText, Loader2, Plus, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDoctorSession } from "@/lib/auth";
import { formatTime, initials } from "@/lib/format";
import type { DoctorDashboardStats } from "@/server/dashboard";

export const Route = createFileRoute("/doctor/")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  const session = getDoctorSession();
  const [stats, setStats] = useState<DoctorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/doctor/dashboard?doctorId=${encodeURIComponent(session.id)}`);
      if (!res.ok) throw new Error("No se pudo cargar el dashboard.");
      const json = (await res.json()) as { data: DoctorDashboardStats };
      setStats(json.data);
    } catch (err) {
      setStats(null);
      setError(err instanceof Error ? err.message : "Error al cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date();
  const todayAppointments = stats?.todayAppointments ?? [];
  const recentPatients = stats?.recentPatients ?? [];

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

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="font-semibold text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Si acabas de migrar la base de datos, ejecuta en Supabase el renombrado{" "}
            <code className="rounded bg-muted px-1">mode → visit_mode</code> en la tabla{" "}
            <code className="rounded bg-muted px-1">appointments</code> y vuelve a intentar.
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 rounded-2xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <Stat icon={<CalendarDays className="h-6 w-6" />} label="Citas hoy" value={String(stats?.appointmentsToday ?? 0)} tone="primary" />
            <Stat icon={<Users className="h-6 w-6" />} label="Pacientes activos" value={String(stats?.activePatients ?? 0)} tone="primary" />
            <Stat icon={<FileText className="h-6 w-6" />} label="Recetas esta semana" value={String(stats?.prescriptionsThisWeek ?? 0)} tone="success" />
            <Stat icon={<TrendingUp className="h-6 w-6" />} label="Adherencia promedio" value={`${stats?.averageAdherence ?? 100}%`} tone="success" />
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-extrabold tracking-tight">Agenda de hoy</h2>
                <Link from="/doctor" to="calendar" className="text-sm font-bold text-primary hover:underline">
                  Ver calendario →
                </Link>
              </div>
              {todayAppointments.length === 0 ? (
                <p className="text-muted-foreground">No hay citas programadas para hoy.</p>
              ) : (
                <ul className="space-y-3">
                  {todayAppointments.map((appt, i) => {
                    const apptDate = new Date(appt.date_time);
                    const status =
                      appt.status === "completed"
                        ? "done"
                        : apptDate <= now && i === 0
                          ? "next"
                          : "upcoming";
                    return (
                      <Appt
                        key={appt.id}
                        time={formatTime(appt.date_time)}
                        name={appt.patient_name}
                        reason={appt.reason}
                        status={status}
                      />
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-5 text-xl font-extrabold tracking-tight">Pacientes recientes</h2>
              {recentPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no tienes pacientes con recetas o citas.</p>
              ) : (
                <ul className="space-y-3">
                  {recentPatients.map((p) => (
                    <li key={p.id}>
                      <div className="flex w-full items-center gap-3 rounded-2xl p-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-success text-success-foreground font-extrabold">
                          {initials(p.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-base font-bold">{p.name}</div>
                          <div className="truncate text-sm text-muted-foreground">
                            {p.activeMeds} medicinas · Adherencia {p.adherence}%
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
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
