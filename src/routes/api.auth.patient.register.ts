import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { registerPatientInDb } from "@/server/patients";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(4),
});

export const Route = createFileRoute("/api/auth/patient/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = registerSchema.parse(await request.json());
          const patient = await registerPatientInDb(body);
          return Response.json({ data: patient }, { status: 201 });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json(
              { error: "validation_error", details: error.issues.map((i) => i.message) },
              { status: 400 },
            );
          }
          if (error instanceof Error) {
            if (error.message === "email_already_exists") {
              return Response.json({ error: "email_already_exists" }, { status: 409 });
            }
            if (error.message === "supabase_not_configured") {
              return Response.json({ error: "supabase_not_configured" }, { status: 503 });
            }
          }
          return Response.json({ error: "register_failed" }, { status: 500 });
        }
      },
    },
  },
});
