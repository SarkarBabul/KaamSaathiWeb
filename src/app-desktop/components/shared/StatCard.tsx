import type { LucideIcon } from "lucide-react";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { cn } from "@/lib/utils";

export type StatTone = "accent" | "positive" | "negative" | "warning" | "info" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  tone?: StatTone;
  /** The one figure a page is really about: larger value, tinted surface. */
  emphasis?: boolean;
  loading?: boolean;
  index?: number;
  className?: string;
}

const TONE_BADGE: Record<StatTone, string> = {
  accent: "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]",
  positive: "bg-emerald-50 text-emerald-600",
  negative: "bg-rose-50 text-rose-600",
  warning: "bg-amber-50 text-amber-600",
  info: "bg-sky-50 text-sky-600",
  neutral: "bg-muted text-muted-foreground",
};

const TONE_VALUE: Record<StatTone, string> = {
  accent: "text-foreground",
  positive: "text-emerald-700",
  negative: "text-rose-700",
  warning: "text-amber-700",
  info: "text-sky-700",
  neutral: "text-foreground",
};

// The workspace's KPI tile. Every metric row on every page uses this so the
// numbers read as one family; `emphasis` marks the single dominant figure.
export function StatCard({ label, value, icon: Icon, hint, tone = "neutral", emphasis, loading, index, className }: StatCardProps) {
  return (
    <GlowCard
      index={index}
      className={cn(
        "flex min-w-0 items-start justify-between gap-3 p-4 sm:p-5",
        emphasis && "border-[hsl(var(--accent)/0.25)] bg-[linear-gradient(135deg,hsl(var(--accent)/0.07),#fff_60%)]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1.5 font-bold tabular-nums leading-none",
            emphasis ? "text-[30px] sm:text-[34px]" : "text-[24px]",
            TONE_VALUE[tone],
          )}
          aria-busy={loading || undefined}
        >
          {loading ? "…" : value}
        </p>
        {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      {Icon && (
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONE_BADGE[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
    </GlowCard>
  );
}
