import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

export const Route = createFileRoute("/doctor/calendar")({
  head: () => ({ meta: [{ title: "Calendario — Care Sync" }] }),
  component: CalendarPage,
});

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthDays = Array.from({ length: 35 }, (_, i) => i - 1); // offset for placeholder

const eventsByDay: Record<number, number> = {
  3: 4, 5: 2, 8: 6, 12: 3, 15: 8, 18: 1, 22: 5, 26: 7, 28: 4,
};

const todayEvents = [
  { time: "09:00", name: "María González", type: "Seguimiento" },
  { time: "10:30", name: "Carlos Ramírez", type: "Consulta general" },
  { time: "11:15", name: "Lucía Mendoza", type: "Control de presión" },
  { time: "12:00", name: "Jorge Hernández", type: "Resultados lab" },
  { time: "16:00", name: "Pedro Salinas", type: "Primera vez" },
];

function CalendarPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Calendario</h1>
        <p className="mt-2 text-base text-muted-foreground">Visualiza y gestiona tus citas.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Calendar grid */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-tight">Abril 2026</div>
              <div className="text-sm text-muted-foreground">28 citas este mes</div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Mes anterior"
                className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-surface transition hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
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
            {monthDays.map((d, i) => {
              if (d <= 0 || d > 30) {
                return <div key={i} className="aspect-square" />;
              }
              const events = eventsByDay[d] || 0;
              const isToday = d === 26;
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
                  <div className="text-sm font-bold">{d}</div>
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

        {/* Today's appointments */}
        <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-1 text-xl font-extrabold tracking-tight">Hoy · 26 Abr</h2>
          <p className="mb-5 text-sm text-muted-foreground">{todayEvents.length} citas</p>
          <ul className="space-y-3">
            {todayEvents.map((e) => (
              <li
                key={e.time}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold tabular-nums">{e.time}</div>
                  <div className="truncate text-sm font-bold">{e.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{e.type}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
