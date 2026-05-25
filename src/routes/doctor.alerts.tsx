import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  Loader2,
  Pill,
  Printer,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDoctorSession } from "@/lib/auth";
import type { MissedAlertsReportPayload, PatientMissedReport } from "@/server/alerts";

export const Route = createFileRoute("/doctor/alerts")({
  head: () => ({
    meta: [{ title: "Reportes de Adherencia — Care Sync" }],
  }),
  component: DoctorAlertsReports,
});

function formatScheduledTime(iso: string): string {
  return format(new Date(iso), "dd/MM/yyyy · HH:mm", { locale: es });
}

function formatReportDate(iso: string): string {
  return format(new Date(iso), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
}

function DoctorAlertsReports() {
  const session = getDoctorSession();
  const [payload, setPayload] = useState<MissedAlertsReportPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const doctorId = session?.id;
      const url = doctorId
        ? `/api/doctor/missed-alerts?doctorId=${encodeURIComponent(doctorId)}`
        : "/api/doctor/missed-alerts";

      const response = await fetch(url);
      if (!response.ok) throw new Error("No se pudieron cargar los reportes de adherencia.");

      const json = (await response.json()) as { data: MissedAlertsReportPayload };
      setPayload(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes.");
      setPayload(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Encabezado formal — solo impresión */}
      <header className="hidden border-b-2 border-foreground/20 pb-6 print:block">
        <div className="flex items-start justify-between gap-6">
          <Logo size="lg" />
          <div className="text-right text-sm">
            <div className="font-bold uppercase tracking-wider text-foreground">
              Expediente clínico — Reporte de adherencia
            </div>
            <div className="mt-1 text-muted-foreground">
              Emitido: {payload ? formatReportDate(payload.generatedAt) : formatReportDate(new Date().toISOString())}
            </div>
            {session && (
              <div className="mt-2 text-foreground">
                Médico tratante: <strong>{session.name}</strong>
                {session.specialty ? ` · ${session.specialty}` : ""}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cabecera pantalla */}
      <header className="print:hidden">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-bold text-destructive">
              <AlertTriangle className="h-4 w-4" /> Avisos clínicos
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Reportes por falta de adherencia
            </h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Pacientes que no tomaron sus medicamentos según lo programado. Se actualizan las alertas
              vencidas automáticamente al consultar esta vista.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-12 rounded-2xl border-2 font-bold"
              onClick={() => void loadReports()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5" />
              )}
              Actualizar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="min-h-12 rounded-2xl border-2 font-bold"
              onClick={handlePrint}
              disabled={!payload?.reports.length}
            >
              <Printer className="h-5 w-5" />
              Exportar a PDF / Imprimir
            </Button>
          </div>
        </div>
        {payload && (
          <p className="mt-4 text-sm text-muted-foreground">
            Última sincronización: {formatReportDate(payload.generatedAt)}
            {payload.updatedToMissed > 0 && (
              <span className="ml-2 font-semibold text-destructive">
                · {payload.updatedToMissed} alerta(s) marcada(s) como omitida(s) en esta consulta
              </span>
            )}
          </p>
        )}
      </header>

      {isLoading && (
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-border bg-card print:hidden">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {error && !isLoading && (
        <Card className="rounded-3xl border-destructive/30 bg-destructive/5 print:hidden">
          <CardContent className="pt-6">
            <p className="font-semibold text-destructive">{error}</p>
            <Button type="button" variant="destructive" className="mt-4" onClick={() => void loadReports()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && payload?.reports.length === 0 && (
        <Card className="rounded-3xl border-2 border-dashed border-success/40 bg-success-soft/30 print:hidden">
          <CardHeader>
            <CardTitle className="text-xl text-success">Sin desviaciones registradas</CardTitle>
            <CardDescription className="text-base">
              No hay pacientes con dosis omitidas (estado &quot;missed&quot;) en este momento.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!isLoading && !error && payload && payload.reports.length > 0 && (
        <div className="space-y-6 print:space-y-8" id="adherence-reports">
          {payload.reports.map((report) => (
            <ClinicalReportCard key={report.patient.id} report={report} />
          ))}
        </div>
      )}

      <footer className="hidden border-t border-border pt-4 text-center text-xs text-muted-foreground print:block">
        Documento generado por Care Sync · Uso exclusivo del personal médico autorizado · Confidencial
      </footer>
    </div>
  );
}

function ClinicalReportCard({ report }: { report: PatientMissedReport }) {
  const medsGrouped = groupMissedByMedication(report.missedAlerts);

  return (
    <Card className="overflow-hidden rounded-3xl border-2 border-destructive/25 shadow-card print:break-inside-avoid print:rounded-lg print:shadow-none">
      <CardHeader className="border-b border-destructive/15 bg-destructive/5 print:bg-white print:py-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-destructive text-destructive-foreground print:h-10 print:w-10">
            <AlertTriangle className="h-6 w-6 print:h-5 print:w-5" strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl font-extrabold leading-snug md:text-2xl print:text-lg">
              Aviso Clínico: El paciente{" "}
              <span className="text-destructive">{report.patient.name}</span> presenta una desviación en
              su tratamiento.
            </CardTitle>
            <CardDescription className="mt-2 text-base print:text-sm">
              Se detectaron {report.missedCount} toma(s) no realizada(s). Se recomienda evaluar adherencia,
              contactar al paciente y considerar acciones preventivas.
              {report.patient.email ? (
                <span className="mt-1 block print:inline print:before:content-['·_']">
                  Contacto: {report.patient.email}
                </span>
              ) : null}
            </CardDescription>
          </div>
          <span className="rounded-full bg-destructive px-4 py-1.5 text-sm font-bold text-destructive-foreground print:border print:border-destructive print:bg-white print:text-destructive">
            {report.missedCount} omitida(s)
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary print:text-foreground">
            <Pill className="h-4 w-4" />
            Medicamentos omitidos y horarios de dosis perdidas
          </h3>
          <div className="space-y-4">
            {medsGrouped.map((group) => (
              <div
                key={group.medicationId}
                className="rounded-2xl border border-border bg-muted/30 p-4 print:border-foreground/20 print:bg-white"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="text-lg font-bold text-foreground print:text-base">
                      {group.medicationName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Dosis: {group.dose} · Propósito: {group.purpose}
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase text-destructive">
                    {group.times.length} dosis perdida(s)
                  </span>
                </div>
                <table className="mt-4 w-full text-left text-sm print:text-xs">
                  <thead>
                    <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-4">Fecha y hora programada</th>
                      <th className="pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.times.map((t) => (
                      <tr key={t.alertId} className="border-b border-border/60 last:border-0">
                        <td className="py-2.5 pr-4 font-semibold tabular-nums text-foreground">
                          {formatScheduledTime(t.scheduled_time)}
                        </td>
                        <td className="py-2.5 font-bold uppercase text-destructive">No tomada</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-primary-soft/50 p-4 print:border-foreground/20 print:bg-white">
          <h4 className="text-sm font-bold uppercase tracking-wider text-primary print:text-foreground">
            Recomendación clínica
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground print:text-xs">
            Verificar barreras de adherencia (olvido, efectos adversos, acceso al medicamento). Valorar
            reprogramación de cita de seguimiento o ajuste terapéutico según protocolo institucional.
          </p>
        </section>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t border-border bg-card pt-6 sm:flex-row print:hidden">
        <Link
          from="/doctor"
          to="calendar"
          className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground shadow-soft transition hover:bg-primary/90"
        >
          <Calendar className="h-5 w-5" strokeWidth={2.5} />
          Agendar Cita de Revisión
        </Link>
        <Link
          from="/doctor"
          to="prescriptions/new"
          search={{ patientId: report.patient.id }}
          className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-surface px-6 text-base font-bold text-primary transition hover:bg-primary-soft"
        >
          <Stethoscope className="h-5 w-5" strokeWidth={2.5} />
          Ajustar Tratamiento
        </Link>
      </CardFooter>

      {/* Acciones en impresión — texto estático */}
      <div className="hidden border-t border-border px-6 py-4 text-sm print:block">
        <p className="font-bold uppercase tracking-wider text-foreground">Acciones sugeridas</p>
        <ul className="mt-2 list-inside list-disc text-foreground">
          <li>Agendar cita de revisión urgente</li>
          <li>Evaluar y ajustar esquema de tratamiento</li>
        </ul>
      </div>
    </Card>
  );
}

function groupMissedByMedication(alerts: PatientMissedReport["missedAlerts"]) {
  const map = new Map<
    string,
    {
      medicationId: string;
      medicationName: string;
      purpose: string;
      dose: string;
      times: Array<{ alertId: string; scheduled_time: string }>;
    }
  >();

  for (const alert of alerts) {
    const key = alert.medication.id;
    const existing = map.get(key);
    const entry = {
      alertId: alert.id,
      scheduled_time: alert.scheduled_time,
    };
    if (existing) {
      existing.times.push(entry);
    } else {
      map.set(key, {
        medicationId: key,
        medicationName: alert.medication.name,
        purpose: alert.medication.purpose,
        dose: alert.medication.dose,
        times: [entry],
      });
    }
  }

  return Array.from(map.values()).map((g) => ({
    ...g,
    times: g.times.sort(
      (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime(),
    ),
  }));
}
