import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Calendar, Check, Clock, Loader2, MapPin, Plus, Stethoscope, Video, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPatientSession } from "@/lib/auth";
import { formatDateCard, formatTime, modeLabel } from "@/lib/format";
import type { AppointmentWithNames } from "@/server/appointments";
import type { DoctorPublic } from "@/server/supabase";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [{ title: "Mis Citas — Care Sync" }],
  }),
  component: Appointments,
});

function Appointments() {
  const session = getPatientSession();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<AppointmentWithNames[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments?patientId=${encodeURIComponent(session.id)}`);
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { data: AppointmentWithNames[] };
      setAppointments(json.data);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date();
  const upcoming = appointments.filter(
    (a) =>
      new Date(a.date_time) >= now &&
      (a.status === "scheduled" || a.status === "confirmed"),
  );
  const past = appointments.filter(
    (a) =>
      new Date(a.date_time) < now ||
      a.status === "completed" ||
      a.status === "cancelled",
  );
  const list = tab === "upcoming" ? upcoming : past;
  const next = upcoming.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0];

  const handleConfirm = async (id: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    void load();
  };

  const handleCancel = async (id: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    void load();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mis Citas</h1>
          <p className="mt-2 text-base text-muted-foreground">Agenda y gestiona tus consultas.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 text-base font-bold text-primary-foreground shadow-soft transition hover:scale-[1.02]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} /> Agendar nueva cita
        </button>
      </header>

      {showForm && session && (
        <BookAppointmentForm
          patientId={session.id}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            void load();
          }}
        />
      )}

      {tab === "upcoming" && next && !loading && (
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
                <div className="text-2xl font-extrabold">{next.doctor_name}</div>
                <div className="text-base text-muted-foreground">{next.doctor_specialty}</div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    {format(new Date(next.date_time), "EEE d MMM", { locale: es })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" /> {formatTime(next.date_time)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> {next.place || modeLabel(next.visit_mode)}
                  </span>
                </div>
              </div>
            </div>
            {next.status === "scheduled" && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleConfirm(next.id)}
                  className="min-h-12 rounded-2xl bg-success px-5 text-base font-bold text-success-foreground transition hover:scale-[1.02]"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => void handleCancel(next.id)}
                  className="min-h-12 rounded-2xl border-2 border-border bg-surface px-5 text-base font-bold text-foreground transition hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <div role="tablist" aria-label="Filtrar citas" className="inline-flex rounded-2xl bg-muted p-1.5">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-12 rounded-xl px-6 text-base font-bold transition ${
              tab === t ? "bg-surface text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t === "upcoming" ? "Próximas" : "Pasadas"}
          </button>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-extrabold tracking-tight">
          {tab === "upcoming" ? "Próximas" : "Pasadas"}
        </h2>
        {loading ? (
          <div className="flex min-h-32 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No hay citas en esta categoría.
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((a) => {
              const card = formatDateCard(a.date_time);
              const mode = modeLabel(a.visit_mode);
              const isPast = tab === "past";
              const outcome =
                a.status === "cancelled" ? "cancelled" : a.status === "completed" ? "completed" : undefined;
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-nowrap"
                >
                  <div
                    className={`flex w-20 shrink-0 flex-col items-center rounded-2xl py-3 ${
                      isPast ? "bg-muted text-muted-foreground" : "bg-primary-soft text-primary"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase">{card.day}</span>
                    <span className="text-2xl font-extrabold leading-tight">{card.date}</span>
                    <span className="text-xs font-semibold">{card.month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold">{a.doctor_name}</div>
                    <div className="text-sm text-muted-foreground">{a.doctor_specialty}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Clock className="h-4 w-4 text-primary" /> {formatTime(a.date_time)}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {mode === "Video" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        {a.place || mode}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${
                        mode === "Video" ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
                      }`}
                    >
                      {mode}
                    </span>
                    {isPast && outcome && (
                      <span
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          outcome === "completed"
                            ? "bg-success-soft text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {outcome === "completed" ? (
                          <>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Realizada
                          </>
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5" strokeWidth={3} /> Cancelada
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function BookAppointmentForm({
  patientId,
  onClose,
  onSuccess,
}: {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [doctors, setDoctors] = useState<DoctorPublic[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [visitMode, setVisitMode] = useState<"in_person" | "video">("in_person");
  const [place, setPlace] = useState("");
  const [reason, setReason] = useState("Consulta general");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/doctors")
      .then((r) => r.json())
      .then((j: { data: DoctorPublic[] }) => setDoctors(j.data ?? []))
      .catch(() => setDoctors([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !dateTime) {
      setError("Selecciona doctor, fecha y hora.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const iso = new Date(dateTime).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientId,
          dateTime: iso,
          visitMode,
          place: place || (visitMode === "video" ? "Videollamada" : "Consultorio"),
          reason,
        }),
      });
      if (!res.ok) throw new Error("No se pudo agendar la cita.");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al agendar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="space-y-4 rounded-3xl border border-primary/30 bg-card p-6 shadow-card"
    >
      <h2 className="text-xl font-extrabold">Agendar nueva cita</h2>
      {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
      <label className="block space-y-1">
        <span className="text-sm font-bold">Doctor</span>
        <select
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3"
          required
        >
          <option value="">Seleccionar…</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {d.specialty}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-bold">Fecha y hora</span>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3"
          required
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-bold">Modalidad</span>
        <select
          value={visitMode}
          onChange={(e) => setVisitMode(e.target.value as "in_person" | "video")}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3"
        >
          <option value="in_person">Presencial</option>
          <option value="video">Video</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-bold">Lugar</span>
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder={visitMode === "video" ? "Videollamada" : "Clínica / consultorio"}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-bold">Motivo</span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-surface px-3"
        />
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="min-h-12 flex-1 rounded-2xl bg-gradient-primary font-bold text-primary-foreground"
        >
          {saving ? "Guardando…" : "Confirmar cita"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-h-12 rounded-2xl border border-border px-5 font-bold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
