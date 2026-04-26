import { createFileRoute } from "@tanstack/react-router";
import { Bell, ChevronRight, LogOut, Mail, Phone, Shield, User } from "lucide-react";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [{ title: "Mi Perfil — Care Sync" }],
  }),
  component: Profile,
});

function Profile() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Mi Perfil</h1>
      </header>

      {/* Card */}
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="bg-gradient-primary p-8 text-primary-foreground">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/20 text-3xl font-extrabold backdrop-blur">
              MG
            </div>
            <div>
              <div className="text-2xl font-extrabold">María González</div>
              <div className="text-sm text-white/80">Paciente desde 2023</div>
            </div>
          </div>
        </div>
        <ul className="divide-y divide-border">
          <InfoRow icon={<Mail className="h-5 w-5" />} label="Correo" value="maria.g@email.com" />
          <InfoRow icon={<Phone className="h-5 w-5" />} label="Teléfono" value="+52 55 1234 5678" />
          <InfoRow icon={<User className="h-5 w-5" />} label="Edad" value="34 años" />
        </ul>
      </section>

      {/* Settings */}
      <section className="rounded-3xl border border-border bg-card shadow-soft">
        <h2 className="px-6 pb-2 pt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Preferencias
        </h2>
        <ul className="divide-y divide-border">
          <SettingRow icon={<Bell className="h-5 w-5" />} label="Notificaciones" />
          <SettingRow icon={<Shield className="h-5 w-5" />} label="Privacidad y seguridad" />
        </ul>
      </section>

      <button
        type="button"
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
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </div>
        <span className="flex-1 text-base font-bold">{label}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>
    </li>
  );
}
