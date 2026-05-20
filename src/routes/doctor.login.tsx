import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthScreen } from "@/components/AuthScreen";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/doctor/login")({
  head: () => ({ meta: [{ title: "Iniciar sesión — Portal del Doctor" }] }),
  validateSearch: loginSearchSchema,
  component: DoctorLoginPage,
});

function DoctorLoginPage() {
  const { redirect } = Route.useSearch();
  return <AuthScreen role="doctor" mode="login" redirectTo={redirect} />;
}
