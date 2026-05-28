import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, FileText, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getDoctorSession } from "@/lib/auth";
import { formatRelativeVisit, initials } from "@/lib/format";
import type { DoctorPatientListItem } from "@/server/dashboard";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({ meta: [{ title: "Pacientes — Care Sync" }] }),
  component: Patients,
});

function Patients() {
  const session = getDoctorSession();
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<DoctorPatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/doctor/patients?doctorId=${encodeURIComponent(session.id)}&query=${encodeURIComponent(query)}`,
      );
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { data: DoctorPatientListItem[] };
      setPatients(json.data);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [session?.id, query]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Pacientes</h1>
        <p className="mt-2 text-base text-muted-foreground">
          {loading ? "Cargando…" : `${patients.length} paciente(s) vinculado(s)`}
        </p>
      </header>

      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="h-16 w-full rounded-2xl border-2 border-border bg-card pl-14 pr-5 text-base font-medium shadow-soft outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        />
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-10 text-center text-muted-foreground">
          No hay pacientes con recetas o citas contigo aún.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {patients.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-xl font-extrabold text-primary-foreground">
                {initials(p.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-lg font-bold">{p.name}</span>
                  {p.age != null && <span className="text-sm text-muted-foreground">· {p.age}a</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> {p.activeMeds} medicinas
                  </span>
                  <span>· {formatRelativeVisit(p.lastVisit)}</span>
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
      )}
    </div>
  );
}
