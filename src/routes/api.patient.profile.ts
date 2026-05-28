import { createFileRoute } from "@tanstack/react-router";
import { getPatientProfile } from "@/server/dashboard";

export const Route = createFileRoute("/api/patient/profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const patientId = new URL(request.url).searchParams.get("patientId");
          if (!patientId) {
            return Response.json({ error: "patient_id_required" }, { status: 400 });
          }
          const data = await getPatientProfile(patientId);
          if (!data) return Response.json({ error: "not_found" }, { status: 404 });
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
