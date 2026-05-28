import { createFileRoute } from "@tanstack/react-router";
import { getPatientMedications } from "@/server/prescriptions";

export const Route = createFileRoute("/api/patient/prescriptions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const patientId = new URL(request.url).searchParams.get("patientId");
          if (!patientId) {
            return Response.json({ error: "patient_id_required" }, { status: 400 });
          }
          const data = await getPatientMedications(patientId);
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
