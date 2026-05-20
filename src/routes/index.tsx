import { createFileRoute, Link } from "@tanstack/react-router";
import { Stethoscope, UserRound, ArrowRight, ShieldCheck, Bell, FileText } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Care Sync — Recetas, citas y alertas en un solo lugar" },
      {
        name: "description",
        content:
          "Care Sync conecta doctores y pacientes con recetas digitales, gestión de citas y alertas inteligentes de medicación.",
      },
      { property: "og:title", content: "Care Sync — Sistema médico interactivo" },
      {
        property: "og:description",
        content: "Recetas digitales, citas y alertas de medicación.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <span className="hidden rounded-full bg-success-soft px-4 py-2 text-sm font-bold text-success md:inline-flex">
          Prototipo MVP
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-8 text-primary-foreground shadow-card md:p-16">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-success/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" /> Confiable · Accesible · Seguro
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Tu salud, sincronizada en cada toma.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90 md:text-xl">
              Recetas digitales claras, citas organizadas y alertas que nunca olvidan.
              Elige tu portal para comenzar.
            </p>
          </div>
        </section>

        {/* Portal cards */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <PortalCard
            to="/patient/login"
            badge="Para pacientes"
            title="Portal del Paciente"
            description="Recibe alertas de cada toma, consulta tus recetas y agenda citas con tus doctores."
            icon={<UserRound className="h-8 w-8" strokeWidth={2.5} />}
            tone="primary"
          />
          <PortalCard
            to="/doctor/login"
            badge="Para doctores"
            title="Portal del Doctor"
            description="Crea recetas en segundos, gestiona tu calendario y dale seguimiento a tus pacientes."
            icon={<Stethoscope className="h-8 w-8" strokeWidth={2.5} />}
            tone="success"
          />
        </section>

        {/* Features */}
        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Feature
            icon={<FileText className="h-6 w-6" />}
            title="Recetas digitales"
            text="Sin letra ilegible. Dosis, frecuencia y propósito siempre claros."
          />
          <Feature
            icon={<Bell className="h-6 w-6" />}
            title="Alertas precisas"
            text="Recordatorios automáticos calculados desde la frecuencia recetada."
          />
          <Feature
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Adherencia +90%"
            text="Pacientes que cumplen su tratamiento gracias a notificaciones infalibles."
          />
        </section>
      </main>
    </div>
  );
}

function PortalCard({
  to,
  badge,
  title,
  description,
  icon,
  tone,
}: {
  to: "/patient/login" | "/doctor/login";
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "primary" | "success";
}) {
  const toneClasses =
    tone === "primary"
      ? "bg-primary-soft text-primary"
      : "bg-success-soft text-success";
  const buttonClasses =
    tone === "primary"
      ? "bg-gradient-primary text-primary-foreground"
      : "bg-gradient-success text-success-foreground";

  return (
    <Link
      to={to}
      search={{}}
      className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${toneClasses}`}>
        {icon}
      </div>
      <div className="mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {badge}
      </div>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
      <div
        className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-base font-bold ${buttonClasses}`}
      >
        Entrar <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
