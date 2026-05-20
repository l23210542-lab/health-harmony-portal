import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthScreen } from "@/components/AuthScreen";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/patient/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Portal del Paciente" }] }),
  validateSearch: loginSearchSchema,
  component: PatientLoginPage,
});

function PatientLoginPage() {
  const { redirect } = Route.useSearch();
  return <AuthScreen role="patient" mode="login" redirectTo={redirect} />;
}
