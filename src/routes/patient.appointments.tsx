import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Check, Clock, MapPin, Plus, Stethoscope, Video, X } from "lucide-react";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [{ title: "Mis Citas — Care Sync" }],
  }),
  component: Appointments,
});

type Status = "upcoming" | "past";

type Appt = {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  mode: "Presencial" | "Video";
  place: string;
  status: Status;
  outcome?: "completed" | "cancelled";
};

const appointments: Appt[] = [
  {
    id: "1",
    doctor: "Dra. Elena Ríos",
    specialty: "Medicina Interna",
    date: "Mié 28 Abr",
    time: "10:30 AM",
    mode: "Presencial",
    place: "Clínica San Rafael · Cons. 204",
    status: "upcoming",
  },
  {
    id: "2",
    doctor: "Dr. Marco Vega",
    specialty: "Alergología",
    date: "Lun 5 May",
    time: "4:00 PM",
    mode: "Video",
    place: "Videollamada",
    status: "upcoming",
  },
  {
    id: "3",
    doctor: "Dra. Elena Ríos",
    specialty: "Medicina Interna",
    date: "Vie 23 Abr",
    time: "9:00 AM",
    mode: "Presencial",
    place: "Clínica San Rafael · Cons. 204",
    status: "past",
    outcome: "completed",
  },
  {
    id: "4",
    doctor: "Dra. Lucía Paredes",
    specialty: "Dermatología",
    date: "Jue 10 Abr",
    time: "11:15 AM",
    mode: "Video",
    place: "Videollamada",
    status: "past",
    outcome: "completed",
  },
  {
    id: "5",
    doctor: "Dr. Marco Vega",
    specialty: "Alergología",
    date: "Mar 1 Abr",
    time: "3:30 PM",
    mode: "Presencial",
    place: "Centro Médico Norte",
    status: "past",
    outcome: "cancelled",
  },
];

function Appointments() {
  const [tab, setTab] = useState<Status>("upcoming");
  const list = appointments.filter((a) => a.status === tab);
  const next = appointments.find((a) => a.status === "upcoming");

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mis Citas</h1>
          <p className="mt-2 text-base text-muted-foreground">Agenda y gestiona tus consultas.</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 text-base font-bold text-primary-foreground shadow-soft transition hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} /> Agendar nueva cita
        </button>
      </header>

      {/* Featured next */}
      {tab === "upcoming" && next && (
        <section className="rounded-3xl border-2 border-primary/20 bg-card p-7 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
            <Calendar className="h-4 w-4" /> Próxima cita
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground">
                <Stethoscope className="h-10 w-10" strokeWidth={2.25} />
              </div>
              <div>
                <div className="text-2xl font-extrabold">{next.doctor}</div>
                <div className="text-base text-muted-foreground">{next.specialty}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {next.date}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {next.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {next.place.split(" · ")[0]}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-12 rounded-2xl bg-success px-5 text-base font-bold text-success-foreground transition hover:scale-[1.02]"
              >
                Confirmar
              </button>
              <button
                type="button"
                className="min-h-12 rounded-2xl border-2 border-border bg-surface px-5 text-base font-bold text-foreground transition hover:bg-muted"
              >
                Reprogramar
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Filtrar citas"
        className="inline-flex rounded-2xl bg-muted p-1.5"
      >
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-12 rounded-xl px-6 text-base font-bold transition ${
              tab === t
                ? "bg-surface text-foreground shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            {t === "upcoming" ? "Próximas" : "Pasadas"}
          </button>
        ))}
      </div>

      {/* List */}
      <section>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">
          {tab === "upcoming" ? "Próximas" : "Pasadas"}
        </h2>
        {list.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No hay citas en esta categoría.
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-nowrap"
              >
                <div
                  className={`flex w-20 shrink-0 flex-col items-center rounded-2xl py-3 ${
                    a.status === "past"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  <span className="text-xs font-bold uppercase">{a.date.split(" ")[0]}</span>
                  <span className="text-2xl font-extrabold leading-tight">{a.date.split(" ")[1]}</span>
                  <span className="text-xs font-semibold">{a.date.split(" ")[2]}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg font-bold">{a.doctor}</div>
                  <div className="text-sm text-muted-foreground">{a.specialty}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Clock className="h-4 w-4 text-primary" /> {a.time}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      {a.mode === "Video" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      {a.place}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                      a.mode === "Video"
                        ? "bg-success-soft text-success"
                        : "bg-primary-soft text-primary"
                    }`}
                  >
                    {a.mode}
                  </span>
                  {a.status === "past" && a.outcome && (
                    <span
                      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        a.outcome === "completed"
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {a.outcome === "completed" ? (
                        <><Check className="h-3.5 w-3.5" strokeWidth={3} /> Realizada</>
                      ) : (
                        <><X className="h-3.5 w-3.5" strokeWidth={3} /> Cancelada</>
                      )}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
