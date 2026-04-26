import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bell, Calendar, FileText, Home, User } from "lucide-react";
import { Logo } from "./Logo";
import type { ComponentType } from "react";

type NavItem = {
  to: "/patient" | "/patient/prescriptions" | "/patient/appointments" | "/patient/profile";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const items: NavItem[] = [
  { to: "/patient", label: "Hoy", icon: Home },
  { to: "/patient/prescriptions", label: "Recetas", icon: FileText },
  { to: "/patient/appointments", label: "Citas", icon: Calendar },
  { to: "/patient/profile", label: "Perfil", icon: User },
];

export function PatientLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Logo size="sm" />
          <Link
            to="/patient"
            className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition hover:scale-105"
            aria-label="Notificaciones"
          >
            <Bell className="h-6 w-6" strokeWidth={2.25} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-surface" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 py-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/patient"
                ? location.pathname === "/patient"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-h-16 min-w-20 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
