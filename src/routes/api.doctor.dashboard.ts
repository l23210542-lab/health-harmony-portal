import { createFileRoute } from "@tanstack/react-router";
import { getDoctorDashboard } from "@/server/dashboard";

export const Route = createFileRoute("/api/doctor/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const doctorId = new URL(request.url).searchParams.get("doctorId");
          if (!doctorId) {
            return Response.json({ error: "doctor_id_required" }, { status: 400 });
          }
          const data = await getDoctorDashboard(doctorId);
          return Response.json({ data });
        } catch (error) {
          const message = error instanceof Error ? error.message : "internal_server_error";
          console.error("[api/doctor/dashboard]", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
