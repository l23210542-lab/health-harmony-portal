import { Activity } from "lucide-react";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "h-9 w-9", icon: "h-5 w-5", text: "text-lg" },
    md: { box: "h-11 w-11", icon: "h-6 w-6", text: "text-xl" },
    lg: { box: "h-14 w-14", icon: "h-8 w-8", text: "text-2xl" },
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizes.box} grid place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft`}
      >
        <Activity className={sizes.icon} strokeWidth={2.5} />
      </div>
      <div className="leading-tight">
        <div className={`${sizes.text} font-extrabold tracking-tight`}>
          Care<span className="text-primary">Sync</span>
        </div>
        <div className="text-xs font-medium text-muted-foreground">Sistema médico</div>
      </div>
    </div>
  );
}
