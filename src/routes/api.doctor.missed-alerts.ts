import { createFileRoute } from "@tanstack/react-router";
import { getMissedAlertsReports } from "@/server/alerts";

export const Route = createFileRoute("/api/doctor/missed-alerts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const doctorId = url.searchParams.get("doctorId") ?? undefined;
          const data = await getMissedAlertsReports(doctorId);
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
