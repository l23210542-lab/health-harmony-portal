import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DoctorLayout } from "@/components/DoctorLayout";

export const Route = createFileRoute("/doctor")({
  head: () => ({
    meta: [
      { title: "Portal del Doctor — Care Sync" },
      {
        name: "description",
        content: "Gestiona tu agenda, pacientes y crea recetas digitales en segundos.",
      },
    ],
  }),
  component: DoctorLayout,
});

void Outlet;
});
