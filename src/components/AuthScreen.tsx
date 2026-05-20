import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Stethoscope, UserRound } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import {
  loginDoctor,
  loginPatient,
  registerDoctor,
  registerPatient,
  type UserRole,
} from "@/lib/auth";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  role: UserRole;
  mode: AuthMode;
  redirectTo?: string;
};

const copy: Record<
  UserRole,
  Record<AuthMode, { title: string; subtitle: string; submit: string; toggle: string; toggleTo: string }>
> = {
  doctor: {
    login: {
      title: "Iniciar sesión",
      subtitle: "Accede a tu portal para gestionar pacientes y recetas.",
      submit: "Entrar al portal",
      toggle: "¿No tienes cuenta?",
      toggleTo: "Regístrate",
    },
    register: {
      title: "Crear cuenta",
      subtitle: "Regístrate como doctor para usar Care Sync.",
      submit: "Crear cuenta",
      toggle: "¿Ya tienes cuenta?",
      toggleTo: "Inicia sesión",
    },
  },
  patient: {
    login: {
      title: "Iniciar sesión",
      subtitle: "Consulta tus recetas, citas y alertas de medicación.",
      submit: "Entrar al portal",
      toggle: "¿No tienes cuenta?",
      toggleTo: "Regístrate",
    },
    register: {
      title: "Crear cuenta",
      subtitle: "Regístrate como paciente para sincronizar tu salud.",
      submit: "Crear cuenta",
      toggle: "¿Ya tienes cuenta?",
      toggleTo: "Inicia sesión",
    },
  },
};

const inputClass =
  "h-14 w-full rounded-xl border-2 border-border bg-surface px-4 text-base font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

export function AuthScreen({ role, mode, redirectTo }: AuthScreenProps) {
  const navigate = useNavigate();
  const text = copy[role][mode];
  const portalBase = role === "doctor" ? "/doctor" : "/patient";
  const loginPath = role === "doctor" ? "/doctor/login" : "/patient/login";
  const registerPath = role === "doctor" ? "/doctor/register" : "/patient/register";
  const Icon = role === "doctor" ? Stethoscope : UserRound;
  const toneClasses =
    role === "doctor"
      ? "bg-gradient-primary text-primary-foreground"
      : "bg-gradient-success text-success-foreground";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresa un correo electrónico.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }

    if (!password.trim()) {
      setError("Ingresa una contraseña.");
      return;
    }

    if (mode === "register" && password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (role === "doctor") {
        if (mode === "login") {
          await loginDoctor({ email, password });
        } else {
          await registerDoctor({ name, email, password, specialty });
        }
      } else if (mode === "login") {
        await loginPatient({ email, password });
      } else {
        await registerPatient({ name, email, password });
      }

      navigate({ to: redirectTo || portalBase });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="md" />
          <div className={`mt-6 grid h-14 w-14 place-items-center rounded-2xl ${toneClasses}`}>
            <Icon className="h-7 w-7" strokeWidth={2.25} />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight">{text.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{text.subtitle}</p>
          {mode === "register" && (
            <span className="mt-4 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Tu perfil se guardará en Supabase
            </span>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
        >
          {mode === "register" && (
            <AuthField label="Nombre completo" required>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "doctor" ? "Ej. Dr. Carlos Pérez" : "Ej. Ana López"}
                className={inputClass}
                autoComplete="name"
              />
            </AuthField>
          )}

          <AuthField label="Correo electrónico" required>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className={inputClass}
              autoComplete="email"
            />
          </AuthField>

          {mode === "register" && role === "doctor" && (
            <AuthField label="Especialidad">
              <input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej. Medicina Interna"
                className={inputClass}
              />
            </AuthField>
          )}

          <AuthField label="Contraseña" required>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className={inputClass}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </AuthField>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-2 w-full min-h-14 rounded-2xl text-base font-bold shadow-soft disabled:opacity-60 ${toneClasses}`}
          >
            {isSubmitting ? "Procesando…" : text.submit}
          </button>

          <p className="pt-2 text-center text-sm text-muted-foreground">
            {text.toggle}{" "}
            <Link
              to={mode === "login" ? registerPath : loginPath}
              className="font-bold text-primary hover:underline"
            >
              {text.toggleTo}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function AuthField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
