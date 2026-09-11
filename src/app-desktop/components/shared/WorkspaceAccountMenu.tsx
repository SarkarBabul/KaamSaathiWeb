import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/app-desktop/auth/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface WorkspaceAccountMenuProps {
  /** "sidebar": the primary identity block at the top of the sidebar. "compact": avatar-only, for the mobile bar. */
  variant?: "sidebar" | "compact";
  /** Runs before any navigation the menu triggers (e.g. to close a mobile sheet). */
  onNavigate?: () => void;
  className?: string;
}

export function initials(name: string | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// The single account control for the authenticated workspace. Identity
// (avatar, name, role) lives here and only here; the avatar's gradient is
// the `--ks-avatar-gradient` token each workspace theme defines, so the
// component itself stays workspace-agnostic.
export function WorkspaceAccountMenu({ variant = "sidebar", onNavigate, className }: WorkspaceAccountMenuProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  // Angular's own header dropdown disables the Profile destination for the
  // Enterprise role, so the menu mirrors that rather than offering a route
  // that role can't use.
  const showProfileLink = session?.role?.toUpperCase() !== "ENTERPRISE";
  const name = session?.username ?? "Account";
  const role = session?.role ?? "";

  const handleSignOut = () => {
    onNavigate?.();
    logout();
    navigate("/auth/login", { replace: true });
  };

  const goToProfile = () => {
    onNavigate?.();
    navigate("/dashboard/profile");
  };

  const avatar = (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white ring-2 ring-white",
        "shadow-[0_0_0_1.5px_hsl(var(--accent)/0.45)]",
        variant === "sidebar" ? "h-9 w-9 text-[13px]" : "h-8 w-8 text-[12px]",
      )}
      style={{ background: "var(--ks-avatar-gradient)" }}
    >
      {initials(session?.username)}
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "sidebar" ? (
          <button
            type="button"
            aria-label={`Account menu — ${name}${role ? `, ${role}` : ""}`}
            className={cn(
              "group flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-2 text-left",
              "transition-colors hover:bg-[hsl(var(--accent)/0.06)] data-[state=open]:bg-[hsl(var(--accent)/0.08)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
              className,
            )}
          >
            {avatar}
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-semibold text-foreground">{name}</span>
              <span className="block truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {role}
              </span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Account menu — ${name}`}
            title={name}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full p-0.5 transition-colors hover:bg-black/[0.04]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
              className,
            )}
          >
            {avatar}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "sidebar" ? "start" : "end"} side="bottom" className="min-w-[210px]">
        {variant === "compact" && (
          <>
            <div className="px-2 py-1.5 leading-tight">
              <div className="truncate text-[13px] font-semibold text-foreground">{name}</div>
              <div className="truncate text-[11px] text-muted-foreground">{role}</div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {showProfileLink && (
          <DropdownMenuItem onClick={goToProfile}>
            <UserIcon className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
        )}
        {showProfileLink && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:!bg-destructive/10 focus:!text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
