import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { updateAppointmentStatus } from "@/server/appointments";

const patchSchema = z.object({
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
});

export const Route = createFileRoute("/api/appointments/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const body = await request.json();
          const payload = patchSchema.parse(body);
          const data = await updateAppointmentStatus(params.id, payload.status);
          if (!data) return Response.json({ error: "not_found" }, { status: 404 });
          return Response.json({ data });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json({ error: "validation_error" }, { status: 400 });
          }
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
