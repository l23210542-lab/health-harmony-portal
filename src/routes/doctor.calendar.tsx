import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getDoctorSession } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import type { AppointmentWithNames } from "@/server/appointments";

export const Route = createFileRoute("/doctor/calendar")({
  head: () => ({ meta: [{ title: "Calendario — Care Sync" }] }),
  component: CalendarPage,
});

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function CalendarPage() {
  const session = getDoctorSession();
  const [viewDate, setViewDate] = useState(() => new Date());
  const [eventsByDay, setEventsByDay] = useState<Record<number, number>>({});
  const [todayEvents, setTodayEvents] = useState<AppointmentWithNames[]>([]);
  const [loading, setLoading] = useState(true);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth() + 1;

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const from = new Date(year, month - 1, 1).toISOString();
      const to = new Date(year, month, 0, 23, 59, 59, 999).toISOString();

      const res = await fetch(
        `/api/appointments?doctorId=${encodeURIComponent(session.id)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { data: AppointmentWithNames[] };

      const counts: Record<number, number> = {};
      for (const appt of json.data) {
        const day = new Date(appt.date_time).getDate();
        counts[day] = (counts[day] ?? 0) + 1;
      }
      setEventsByDay(counts);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      setTodayEvents(
        json.data.filter((a) => {
          const d = new Date(a.date_time);
          return d >= todayStart && d <= todayEnd;
        }),
      );
    } catch {
      setEventsByDay({});
      setTodayEvents([]);
    } finally {
      setLoading(false);
    }
  }, [session?.id, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthLabel = format(viewDate, "MMMM yyyy", { locale: es });
  const totalMonth = Object.values(eventsByDay).reduce((a, b) => a + b, 0);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ day: number | null }> = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: null });
    for (let d = 1; d <= lastDay; d++) cells.push({ day: d });
    while (cells.length % 7 !== 0) cells.push({ day: null });
    return cells;
  }, [year, month]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Calendario</h1>
        <p className="mt-2 text-base text-muted-foreground">Visualiza y gestiona tus citas.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold capitalize tracking-tight">{monthLabel}</div>
              <div className="text-sm text-muted-foreground">
                {loading ? "Cargando…" : `${totalMonth} cita(s) este mes`}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Mes anterior"
                onClick={prevMonth}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-surface transition hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={nextMonth}
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-surface transition hover:bg-muted"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {days.map((d) => (
              <div key={d} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
            {calendarCells.map((cell, i) => {
              if (cell.day === null) return <div key={i} className="aspect-square" />;
              const events = eventsByDay[cell.day] || 0;
              const isToday = isCurrentMonth && cell.day === today.getDate();
              return (
                <button
                  key={i}
                  type="button"
                  className={`aspect-square rounded-2xl border p-1.5 text-left transition hover:scale-[1.04] ${
                    isToday
                      ? "border-primary bg-gradient-primary text-primary-foreground shadow-soft"
                      : "border-border bg-surface hover:bg-muted"
                  }`}
                >
                  <div className="text-sm font-bold">{cell.day}</div>
                  {events > 0 && (
                    <div
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isToday ? "bg-white/25 text-primary-foreground" : "bg-success-soft text-success"
                      }`}
                    >
                      {events}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">
            Hoy · {format(today, "d MMM", { locale: es })}
          </h2>
          <p className="mb-5 text-sm text-muted-foreground">
            {loading ? "…" : `${todayEvents.length} cita(s)`}
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : todayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin citas para hoy.</p>
          ) : (
            <ul className="space-y-3">
              {todayEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold tabular-nums">{formatTime(e.date_time)}</div>
                    <div className="truncate text-sm font-bold">{e.patient_name}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.reason}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
