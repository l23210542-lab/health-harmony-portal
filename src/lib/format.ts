import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

export function formatDateShort(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return `Hoy · ${format(d, "HH:mm", { locale: es })}`;
  if (isTomorrow(d)) return `Mañana · ${format(d, "HH:mm", { locale: es })}`;
  return format(d, "EEE d MMM · HH:mm", { locale: es });
}

export function formatDateCard(iso: string): { day: string; date: string; month: string } {
  const d = parseISO(iso);
  return {
    day: format(d, "EEE", { locale: es }),
    date: format(d, "d"),
    month: format(d, "MMM", { locale: es }),
  };
}

export function formatRelativeVisit(iso: string | null): string {
  if (!iso) return "Sin visitas";
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
}

export function formatMemberSince(iso: string): string {
  return format(parseISO(iso), "MMMM yyyy", { locale: es });
}

export function frequencyLabel(hours: number): string {
  if (hours === 24) return "Cada 24 horas";
  if (hours % 24 === 0) return `Cada ${hours / 24} día(s)`;
  return `Cada ${hours} horas`;
}

export function modeLabel(mode: string): "Presencial" | "Video" {
  return mode === "video" ? "Video" : "Presencial";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
