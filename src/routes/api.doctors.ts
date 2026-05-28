import { createFileRoute } from "@tanstack/react-router";
import { listDoctors } from "@/server/doctors";

export const Route = createFileRoute("/api/doctors")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const query = new URL(request.url).searchParams.get("query") ?? undefined;
          const data = await listDoctors(query);
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
