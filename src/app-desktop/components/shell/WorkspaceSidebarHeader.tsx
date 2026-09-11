import { WorkspaceAccountMenu } from "@/app-desktop/components/shared/WorkspaceAccountMenu";
import { WorkspaceBackButton } from "@/app-desktop/components/shell/WorkspaceBackButton";

interface WorkspaceSidebarHeaderProps {
  homeRoute: string;
  onNavigate?: () => void;
}

// Top of every workspace sidebar (and the mobile nav sheet): the user's own
// identity is the primary header, with a compact back control to its left.
// The workspace name is no longer spelled out here — the accent color on
// the avatar ring, active nav item and glows already says which one this is.
export function WorkspaceSidebarHeader({ homeRoute, onNavigate }: WorkspaceSidebarHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 pb-2 pt-3">
      <WorkspaceBackButton homeRoute={homeRoute} onNavigate={onNavigate} />
      <WorkspaceAccountMenu variant="sidebar" onNavigate={onNavigate} />
    </div>
  );
}
