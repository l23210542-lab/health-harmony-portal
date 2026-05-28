import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check, Clock, Loader2, Pill, Calendar, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPatientSession } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import type { PatientDashboardData } from "@/server/dashboard";

export const Route = createFileRoute("/patient/")({
  component: PatientHome,
});

function PatientHome() {
  const session = getPatientSession();
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/patient/dashboard?patientId=${encodeURIComponent(session.id)}`);
      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "No se pudo cargar tu panel.");
      }
      const json = (await res.json()) as { data: PatientDashboardData };
      setData(json.data);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Error al cargar el panel.");
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMarkTaken = async () => {
    if (!data?.nextAlert) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/alerts/${data.nextAlert.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "taken" }),
      });
      if (!res.ok) throw new Error();
      await load();
    } finally {
      setMarking(false);
    }
  };

  const nextAlert = data?.nextAlert;
  const todaySchedule = data?.todaySchedule ?? [];
  const minutesUntil = nextAlert
    ? Math.max(0, Math.round((new Date(nextAlert.scheduled_time).getTime() - Date.now()) / 60000))
    : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-base font-medium text-muted-foreground">Buenos días,</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{session?.name ?? "Paciente"}</h1>
      </header>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center">
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
      ) : (
        <>
          {nextAlert ? (
            <section
              className="relative overflow-hidden rounded-3xl bg-gradient-primary p-7 text-primary-foreground shadow-card md:p-10"
              aria-labelledby="next-med"
            >
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm font-bold backdrop-blur">
                    <Bell className="h-4 w-4" />
                    {minutesUntil !== null && minutesUntil <= 60
                      ? `Próxima toma · en ${minutesUntil} min`
                      : "Próxima toma programada"}
                  </span>
                  <h2 id="next-med" className="text-3xl font-extrabold leading-tight md:text-4xl">
                    {nextAlert.medication.name}
                  </h2>
                  <p className="text-lg text-white/90">
                    {nextAlert.medication.dose}
                    {nextAlert.medication.instructions ? ` · ${nextAlert.medication.instructions}` : ""}
                  </p>
                  <p className="flex items-center gap-2 text-base text-white/80">
                    <Clock className="h-5 w-5" /> {formatTime(nextAlert.scheduled_time)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={marking}
                  onClick={() => void handleMarkTaken()}
                  className="inline-flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-lg font-bold text-primary shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
                >
                  {marking ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Check className="h-6 w-6" strokeWidth={3} />
                  )}
                  Marcar como tomada
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              No tienes tomas pendientes por ahora. Revisa tus recetas activas.
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Adherencia esta semana"
              value={`${data?.adherencePercent ?? 100}%`}
              tone="success"
            />
            <StatCard
              icon={<Pill className="h-6 w-6" />}
              label="Medicinas activas"
              value={String(data?.activeMedicationsCount ?? 0)}
              tone="primary"
            />
            <StatCard
              icon={<Calendar className="h-6 w-6" />}
              label="Próxima cita"
              value={
                data?.nextAppointment
                  ? format(new Date(data.nextAppointment.date_time), "EEE d", { locale: es })
                  : "—"
              }
              tone="primary"
            />
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Hoy</h2>
            {todaySchedule.length === 0 ? (
              <p className="text-muted-foreground">Sin tomas programadas para hoy.</p>
            ) : (
              <ul className="space-y-3">
                {todaySchedule.map((item, index) => {
                  const uiStatus =
                    item.status === "taken"
                      ? "taken"
                      : item.status === "missed"
                        ? "pending"
                        : index === 0 && item.status === "pending"
                          ? "next"
                          : "pending";
                  return (
                    <ScheduleItem
                      key={item.id}
                      time={formatTime(item.scheduled_time)}
                      name={item.medication.name}
                      purpose={item.medication.purpose}
                      status={uiStatus}
                      dbStatus={item.status}
                    />
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
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
    tone === "success" ? "bg-success-soft text-success" : "bg-primary-soft text-primary";
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
  dbStatus,
}: {
  time: string;
  name: string;
  purpose: string;
  status: "next" | "pending" | "taken";
  dbStatus: string;
}) {
  const config =
    dbStatus === "missed"
      ? { ring: "ring-2 ring-destructive/40", pill: "bg-destructive/10 text-destructive", label: "Omitida" }
      : {
          next: { ring: "ring-2 ring-primary", pill: "bg-primary text-primary-foreground", label: "Ahora" },
          pending: { ring: "", pill: "bg-muted text-muted-foreground", label: "Pendiente" },
          taken: { ring: "opacity-70", pill: "bg-success-soft text-success", label: "Tomada ✓" },
        }[status];

  return (
    <li className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft ${config.ring}`}>
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
