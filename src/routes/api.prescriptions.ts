import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createPrescription } from "@/server/prescriptions";

const createPrescriptionSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  notes: z.string().optional(),
  medications: z
    .array(
      z.object({
        name: z.string().min(1),
        dose: z.string().min(1),
        purpose: z.string().min(1),
        instructions: z.string().optional().default(""),
        frequencyHours: z.number().int().positive(),
        durationDays: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const Route = createFileRoute("/api/prescriptions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const payload = createPrescriptionSchema.parse(body);
          const result = await createPrescription(payload);
          return Response.json({ data: result }, { status: 201 });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json(
              { error: "validation_error", details: error.issues.map((issue) => issue.message) },
              { status: 400 },
            );
          }
          if (error instanceof Error) {
            if (error.message === "doctor_not_found" || error.message === "patient_not_found") {
              return Response.json({ error: error.message }, { status: 404 });
            }
            if (error.message === "medications_required") {
              return Response.json({ error: error.message }, { status: 400 });
            }
          }
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
