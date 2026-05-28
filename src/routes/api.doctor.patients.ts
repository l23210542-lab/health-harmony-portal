import { createFileRoute } from "@tanstack/react-router";
import { getDoctorPatients } from "@/server/dashboard";

export const Route = createFileRoute("/api/doctor/patients")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const doctorId = url.searchParams.get("doctorId");
          if (!doctorId) {
            return Response.json({ error: "doctor_id_required" }, { status: 400 });
          }
          const query = url.searchParams.get("query") ?? undefined;
          const data = await getDoctorPatients(doctorId, query);
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
