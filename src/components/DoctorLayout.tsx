import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, PlusSquare, Users } from "lucide-react";
import { Logo } from "./Logo";
import type { ComponentType } from "react";

type NavItem = {
  to: "/doctor" | "/doctor/calendar" | "/doctor/patients" | "/doctor/prescriptions/new";
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

const items: NavItem[] = [
  { to: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/calendar", label: "Calendario", icon: CalendarDays },
  { to: "/doctor/patients", label: "Pacientes", icon: Users },
  { to: "/doctor/prescriptions/new", label: "Crear Receta", icon: PlusSquare },
];

export function DoctorLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 hidden h-screen w-72 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="px-6 py-6">
          <Logo size="md" />
        </div>
        <nav className="flex-1 space-y-2 px-4" aria-label="Navegación principal">
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/doctor"
                ? location.pathname === "/doctor"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-4 rounded-2xl px-4 py-4 text-base font-semibold transition ${
                  active
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="m-4 rounded-2xl border border-border bg-primary-soft p-4">
          <div className="text-sm font-semibold text-foreground">Dra. Elena Ríos</div>
          <div className="text-xs text-muted-foreground">Medicina Interna · #45821</div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" />
          <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-success">
            Doctor
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-28 md:px-10 md:py-10 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl md:hidden"
        aria-label="Navegación móvil"
      >
        <div className="flex items-stretch justify-around px-2 py-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/doctor"
                ? location.pathname === "/doctor"
                : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition ${
                  active ? "bg-primary-soft text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
                <span className="text-center leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
