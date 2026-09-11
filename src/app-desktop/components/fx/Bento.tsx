import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { GlowCard, type GlowCardProps } from "@/app-desktop/components/fx/GlowCard";

// 12-column composition grid. Spans collapse 12 → 6 → 1 so an asymmetric
// desktop layout becomes a balanced two-up on tablets and a clean stack on
// phones without per-page media queries.
export function BentoGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn("grid grid-cols-1 gap-4 sm:grid-cols-6 xl:grid-cols-12", className)} />;
}

export type BentoSpan = "hero" | "wide" | "half" | "half-tall" | "third" | "quarter" | "full";

// Full class strings so Tailwind's scanner sees every variant. Exported so a
// component that can't be a direct BentoGrid child (e.g. StatCard, which is
// its own GlowCard and would double-wrap if nested in a bare BentoCard) can
// still take a grid span via its own `className` instead of duplicating
// these breakpoints.
export const BENTO_SPAN_CLASS: Record<BentoSpan, string> = {
  hero: "sm:col-span-6 xl:col-span-8 xl:row-span-2",
  wide: "sm:col-span-6 xl:col-span-8",
  half: "sm:col-span-3 xl:col-span-6",
  "half-tall": "sm:col-span-3 xl:col-span-6 xl:row-span-2",
  third: "sm:col-span-3 xl:col-span-4",
  quarter: "sm:col-span-3 xl:col-span-3",
  full: "sm:col-span-6 xl:col-span-12",
};

export interface BentoCardProps extends GlowCardProps {
  span?: BentoSpan;
}

export function BentoCard({ span = "quarter", className, ...rest }: BentoCardProps) {
  return <GlowCard {...rest} className={cn("min-w-0", BENTO_SPAN_CLASS[span], className)} />;
}
