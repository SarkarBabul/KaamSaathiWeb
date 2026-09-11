import { ChevronLeft } from "lucide-react";
import { useWorkspaceBack } from "@/app-desktop/hooks/useWorkspaceBack";
import { cn } from "@/lib/utils";

interface WorkspaceBackButtonProps {
  homeRoute: string;
  onNavigate?: () => void;
  className?: string;
}

// Compact, icon-first workspace-level back control — sits immediately left
// of the account block in the sidebar header and in the mobile bar.
export function WorkspaceBackButton({ homeRoute, onNavigate, className }: WorkspaceBackButtonProps) {
  const back = useWorkspaceBack(homeRoute);
  return (
    <button
      type="button"
      aria-label={back.label}
      title={back.label}
      onClick={() => {
        onNavigate?.();
        back.go();
      }}
      className={cn(
        "group flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#eef0f3] bg-white text-[#4a5568]",
        "transition-[background-color,border-color,color,box-shadow] duration-200",
        "hover:border-[hsl(var(--accent)/0.4)] hover:bg-[hsl(var(--accent)/0.06)] hover:text-[hsl(var(--accent))]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover:-translate-x-0.5" />
    </button>
  );
}
