import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/patient/register")({
  head: () => ({ meta: [{ title: "Registro — Portal del Paciente" }] }),
  component: PatientRegisterPage,
});

function PatientRegisterPage() {
  return <AuthScreen role="patient" mode="register" />;
}
