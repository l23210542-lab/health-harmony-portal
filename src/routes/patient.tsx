import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientLayout } from "@/components/PatientLayout";

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
  component: PatientLayout,
});

// keep Outlet import alive
void Outlet;
});
