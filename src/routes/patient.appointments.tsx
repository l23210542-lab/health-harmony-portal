import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Plus, Stethoscope, Video } from "lucide-react";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [{ title: "Mis Citas — Care Sync" }],
  }),
  component: Appointments,
});

const upcoming = [
  {
    id: "1",
    doctor: "Dra. Elena Ríos",
    specialty: "Medicina Interna",
    date: "Mié 28 Abr",
    time: "10:30 AM",
    mode: "Presencial",
    place: "Clínica San Rafael · Cons. 204",
  },
  {
    id: "2",
    doctor: "Dr. Marco Vega",
    specialty: "Alergología",
    date: "Lun 5 May",
    time: "4:00 PM",
    mode: "Video",
    place: "Videollamada",
  },
];

function Appointments() {
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
              <div className="text-2xl font-extrabold">Dra. Elena Ríos</div>
              <div className="text-base text-muted-foreground">Medicina Interna</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> Mié 28 Abr</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> 10:30 AM</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Clínica San Rafael</span>
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

      {/* List */}
      <section>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">Próximas</h2>
        <ul className="space-y-3">
          {upcoming.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-nowrap"
            >
              <div className="flex w-20 shrink-0 flex-col items-center rounded-2xl bg-primary-soft py-3 text-primary">
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
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                  a.mode === "Video"
                    ? "bg-success-soft text-success"
                    : "bg-primary-soft text-primary"
                }`}
              >
                {a.mode}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
