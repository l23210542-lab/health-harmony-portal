import { createFileRoute, redirect } from "@tanstack/react-router";
import { PatientLayout } from "@/components/PatientLayout";
import { getPatientSession, isPatientAuthPath } from "@/lib/auth";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "Portal del Paciente — Care Sync" },
      {
        name: "description",
        content: "Tu dashboard de salud: alertas de medicación, recetas activas y próximas citas.",
      },
    ],
  }),
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;

    const session = getPatientSession();
    const onAuthPage = isPatientAuthPath(location.pathname);

    if (onAuthPage && session) {
      throw redirect({ to: "/patient" });
    }

    if (!onAuthPage && !session) {
      throw redirect({
        to: "/patient/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: PatientLayout,
});
