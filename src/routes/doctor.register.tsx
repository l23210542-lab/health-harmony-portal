import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/doctor/register")({
  head: () => ({ meta: [{ title: "Registro — Portal del Doctor" }] }),
  component: DoctorRegisterPage,
});

function DoctorRegisterPage() {
  return <AuthScreen role="doctor" mode="register" />;
}
