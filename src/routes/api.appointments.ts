import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createAppointment, listAppointments } from "@/server/appointments";

const createSchema = z.object({
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  dateTime: z.string().min(1),
  visitMode: z.enum(["in_person", "video"]).optional(),
  place: z.string().optional(),
  reason: z.string().optional(),
});

export const Route = createFileRoute("/api/appointments")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const data = await listAppointments({
            doctorId: url.searchParams.get("doctorId") ?? undefined,
            patientId: url.searchParams.get("patientId") ?? undefined,
            from: url.searchParams.get("from") ?? undefined,
            to: url.searchParams.get("to") ?? undefined,
          });
          return Response.json({ data });
        } catch {
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const payload = createSchema.parse(body);
          const data = await createAppointment({
            doctorId: payload.doctorId,
            patientId: payload.patientId,
            dateTime: payload.dateTime,
            visitMode: payload.visitMode,
            place: payload.place,
            reason: payload.reason,
          });
          return Response.json({ data }, { status: 201 });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return Response.json({ error: "validation_error" }, { status: 400 });
          }
          if (error instanceof Error) {
            if (error.message === "doctor_not_found" || error.message === "patient_not_found") {
              return Response.json({ error: error.message }, { status: 404 });
            }
          }
          return Response.json({ error: "internal_server_error" }, { status: 500 });
        }
      },
    },
  },
});
