import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, FileText, Search } from "lucide-react";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Pacientes — Care Sync" }] }),
  component: Patients,
});

const patients = [
  { name: "María González", age: 34, lastVisit: "Hoy", meds: 3, adherence: 92, initials: "MG" },
  { name: "Carlos Ramírez", age: 56, lastVisit: "Ayer", meds: 2, adherence: 78, initials: "CR" },
  { name: "Lucía Mendoza", age: 41, lastVisit: "21 Abr", meds: 4, adherence: 95, initials: "LM" },
  { name: "Jorge Hernández", age: 62, lastVisit: "20 Abr", meds: 5, adherence: 65, initials: "JH" },
  { name: "Ana Torres", age: 29, lastVisit: "15 Abr", meds: 1, adherence: 100, initials: "AT" },
  { name: "Pedro Salinas", age: 48, lastVisit: "10 Abr", meds: 2, adherence: 84, initials: "PS" },
];

function Patients() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Pacientes</h1>
        <p className="mt-2 text-base text-muted-foreground">{patients.length} pacientes activos</p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar por nombre o ID…"
          className="h-16 w-full rounded-2xl border-2 border-border bg-card pl-14 pr-5 text-base font-medium shadow-soft outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      {/* Patient list */}
      <ul className="grid gap-3 md:grid-cols-2">
        {patients.map((p) => (
          <li
            key={p.name}
            className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-xl font-extrabold text-primary-foreground">
              {p.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-lg font-bold">{p.name}</span>
                <span className="text-sm text-muted-foreground">· {p.age}a</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> {p.meds} medicinas
                </span>
                <span>· Visita: {p.lastVisit}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      p.adherence >= 85
                        ? "bg-gradient-success"
                        : p.adherence >= 70
                        ? "bg-warning"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${p.adherence}%` }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums">{p.adherence}%</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </li>
        ))}
      </ul>
    </div>
  );
}
