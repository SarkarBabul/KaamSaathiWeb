import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Parent route for a child page (e.g. Record Payment → Attendance). Renders a compact chevron beside the title. */
  backTo?: string;
  backLabel?: string;
  trailing?: React.ReactNode;
}

// Matches the Angular source's `.page-heading` pattern at the top of every
// workspace page: uppercase eyebrow, display-serif title (`--ks-display-font`,
// the public site's own heading face) with a small accent mark echoing the
// active nav item, and a trailing slot for the date / contextual actions.
// Identity lives in the sidebar header, so this row owns the full width.
// `backTo` is page-hierarchy navigation (child → parent), distinct from the
// sidebar's workspace-level back control.
export function PageHeader({ eyebrow, title, subtitle, backTo, backLabel, trailing }: PageHeaderProps) {
  return (
    <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 items-end gap-2">
        {backTo && (
          <Link
            to={backTo}
            aria-label={backLabel ?? "Back"}
            title={backLabel ?? "Back"}
            className="group mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[hsl(var(--accent)/0.08)] hover:text-[hsl(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          >
            <ChevronLeft className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" />
          </Link>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
          )}
          <div className="mt-1 flex items-center gap-2.5">
            <span aria-hidden="true" className="h-6 w-[3px] shrink-0 rounded-full bg-[hsl(var(--accent))]" />
            <h1 className="text-[28px] font-bold leading-tight text-foreground" style={{ fontFamily: "var(--ks-display-font)" }}>
              {title}
            </h1>
          </div>
          {subtitle && <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {trailing && <div className="flex shrink-0 items-center text-sm text-muted-foreground">{trailing}</div>}
    </div>
  );
}
