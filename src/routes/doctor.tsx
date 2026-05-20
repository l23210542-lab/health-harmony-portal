import { createFileRoute, redirect } from "@tanstack/react-router";
import { DoctorLayout } from "@/components/DoctorLayout";
import { getDoctorSession, isDoctorAuthPath } from "@/lib/auth";

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
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;

    const session = getDoctorSession();
    const onAuthPage = isDoctorAuthPath(location.pathname);

    if (onAuthPage && session) {
      throw redirect({ to: "/doctor" });
    }

    if (!onAuthPage && !session) {
      throw redirect({
        to: "/doctor/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: DoctorLayout,
});
