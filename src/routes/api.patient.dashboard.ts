import { createFileRoute } from "@tanstack/react-router";
import { getPatientDashboard } from "@/server/dashboard";

export const Route = createFileRoute("/api/patient/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const patientId = new URL(request.url).searchParams.get("patientId");
          if (!patientId) {
            return Response.json({ error: "patient_id_required" }, { status: 400 });
          }
          const data = await getPatientDashboard(patientId);
          return Response.json({ data });
        } catch (error) {
          const message = error instanceof Error ? error.message : "internal_server_error";
          console.error("[api/patient/dashboard]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
