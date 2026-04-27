import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { updateAlertStatus } from "@/server/prescriptions";

const updateAlertSchema = z.object({
  status: z.enum(["pending", "taken", "missed"]),
});

export const Route = createFileRoute("/api/alerts/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        try {
          const body = await request.json();
          const payload = updateAlertSchema.parse(body);
          const updatedAlert = await updateAlertStatus(params.id, payload.status);

          if (!updatedAlert) {
            return Response.json({ error: "alert_not_found" }, { status: 404 });
          }

          return Response.json({ data: updatedAlert });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json(
              { error: "validation_error", details: error.issues.map((issue) => issue.message) },
              { status: 400 },
            );
          }
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
