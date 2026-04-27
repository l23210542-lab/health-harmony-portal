import { createFileRoute } from "@tanstack/react-router";
import { getPatientsByName } from "@/server/prescriptions";

export const Route = createFileRoute("/api/patients")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const query = url.searchParams.get("query") ?? undefined;
        const patients = await getPatientsByName(query);
        return Response.json({ data: patients });
      },
    },
  },
});
