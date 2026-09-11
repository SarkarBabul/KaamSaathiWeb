import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

// Shared across every workspace page's "nothing here yet" moment — one
// branded treatment (accent-tinted icon badge, matching the sidebar/
// PageHeader's own accent) rather than each page inventing its own, plus an
// optional `icon`/`action` so a page can put a module-appropriate icon
// (e.g. a person for Employee Management, a calendar for Attendance) and a
// real call-to-action button in without duplicating the surrounding markup.
export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}
