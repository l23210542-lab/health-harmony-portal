import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { loginDoctorFromDb } from "@/server/doctors";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const Route = createFileRoute("/api/auth/doctor/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = loginSchema.parse(await request.json());
          const doctor = await loginDoctorFromDb(body.email, body.password);
          return Response.json({ data: doctor });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json(
              { error: "validation_error", details: error.issues.map((i) => i.message) },
              { status: 400 },
            );
          }
          if (error instanceof Error) {
            if (error.message === "invalid_credentials") {
              return Response.json({ error: "invalid_credentials" }, { status: 401 });
            }
            if (error.message === "supabase_not_configured") {
              return Response.json({ error: "supabase_not_configured" }, { status: 503 });
            }
          }
          return Response.json({ error: "login_failed" }, { status: 500 });
        }
      },
    },
  },
});
