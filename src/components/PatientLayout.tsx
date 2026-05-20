import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Calendar, FileText, Home, LogOut, User } from "lucide-react";
import { Logo } from "./Logo";
import { getPatientSession, isPatientAuthPath, logoutPatient } from "@/lib/auth";
import type { ComponentType } from "react";

type NavItem = {
  to: "/" | "prescriptions" | "appointments" | "profile";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  matchPath: string;
};

const items: NavItem[] = [
  { to: "/", matchPath: "/patient", label: "Hoy", icon: Home },
  { to: "prescriptions", matchPath: "/patient/prescriptions", label: "Recetas", icon: FileText },
  { to: "appointments", matchPath: "/patient/appointments", label: "Citas", icon: Calendar },
  { to: "profile", matchPath: "/patient/profile", label: "Perfil", icon: User },
];

export function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getPatientSession();
  const isAuthPage = isPatientAuthPath(location.pathname);

  const handleLogout = () => {
    logoutPatient();
    navigate({ to: "/patient/login", search: {} });
  };

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-8">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold text-foreground sm:inline">{session?.name}</span>
            <Link
              to="/patient"
              from="/patient"
              className="relative grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition hover:scale-105"
              aria-label="Notificaciones"
            >
              <Bell className="h-6 w-6" strokeWidth={2.25} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-surface" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-12 w-12 place-items-center rounded-2xl border border-border text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 py-2">
          {items.map(({ to, matchPath, label, icon: Icon }) => {
            const active =
              matchPath === "/patient"
                ? location.pathname === "/patient" || location.pathname === "/patient/"
                : location.pathname.startsWith(matchPath);
            return (
              <Link
                key={matchPath}
                from="/patient"
                to={to}
                className={`flex min-h-16 min-w-20 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-muted"
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
