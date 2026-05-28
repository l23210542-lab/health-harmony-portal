import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Loader2, LogOut, Mail, Phone, Shield, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getPatientSession, logoutPatient } from "@/lib/auth";
import { formatMemberSince, initials } from "@/lib/format";
import type { PatientProfile } from "@/server/dashboard";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [{ title: "Mi Perfil — Care Sync" }],
  }),
  component: Profile,
});

function Profile() {
  const session = getPatientSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/patient/profile?patientId=${encodeURIComponent(session.id)}`);
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { data: PatientProfile };
      setProfile(json.data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLogout = () => {
    logoutPatient();
    navigate({ to: "/patient/login", search: {} });
  };

  const displayName = profile?.name ?? session?.name ?? "Paciente";
  const memberSince = profile?.created_at
    ? formatMemberSince(profile.created_at)
    : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mi Perfil</h1>
      </header>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="bg-gradient-primary p-8 text-primary-foreground">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/20 text-3xl font-extrabold backdrop-blur">
                  {initials(displayName)}
                </div>
                <div>
                  <div className="text-2xl font-extrabold">{displayName}</div>
                  <div className="text-sm text-white/80">
                    {memberSince ? `Paciente desde ${memberSince}` : "Paciente Care Sync"}
                  </div>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-border">
              <InfoRow icon={<Mail className="h-5 w-5" />} label="Correo" value={profile?.email ?? session?.email ?? "—"} />
              <InfoRow
                icon={<Phone className="h-5 w-5" />}
                label="Teléfono"
                value={profile?.phone ?? "No registrado"}
              />
              <InfoRow
                icon={<User className="h-5 w-5" />}
                label="Edad"
                value={profile?.age != null ? `${profile.age} años` : "No registrada"}
              />
            </ul>
          </section>

          <section className="rounded-3xl border border-border bg-card shadow-soft">
            <h2 className="px-6 pb-2 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Preferencias
            </h2>
            <ul className="divide-y divide-border">
              <SettingRow icon={<Bell className="h-5 w-5" />} label="Notificaciones" />
              <SettingRow icon={<Shield className="h-5 w-5" />} label="Privacidad y seguridad" />
            </ul>
          </section>
        </>
      )}

      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-destructive/30 bg-card px-6 text-base font-bold text-destructive transition hover:bg-destructive/10"
      >
        <LogOut className="h-5 w-5" /> Cerrar sesión
      </button>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-4 px-6 py-4">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
        <div className="text-base font-bold">{value}</div>
      </div>
    </li>
  );
}

function SettingRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li>
      <button
        type="button"
        className="flex min-h-16 w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-muted"
      >
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>
        <span className="flex-1 text-base font-bold">{label}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </li>
  );
}
