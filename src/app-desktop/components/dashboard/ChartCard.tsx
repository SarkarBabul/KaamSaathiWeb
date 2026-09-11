import type { ReactNode } from "react";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
}

// Matches the Angular source's `.card` pattern used across every dashboard
// panel — consistent title/subtitle spacing and an optional header-right
// slot — on the workspace's shared glow surface.
export function ChartCard({ title, subtitle, action, children, className, index }: ChartCardProps) {
  return (
    <GlowCard index={index} className={cn("min-w-0 p-6", className)}>
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold text-[#1c2836]">{title}</h3>
        {action}
      </div>
      {subtitle && <p className="mb-3.5 text-xs text-[#9aa5b1]">{subtitle}</p>}
      {children}
    </GlowCard>
  );
}
