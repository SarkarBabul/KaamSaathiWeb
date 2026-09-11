import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { WorkspaceAccountMenu } from "@/app-desktop/components/shared/WorkspaceAccountMenu";
import { WorkspaceBackButton } from "@/app-desktop/components/shell/WorkspaceBackButton";
import { WorkspaceSidebarHeader } from "@/app-desktop/components/shell/WorkspaceSidebarHeader";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface WorkspaceMobileBarProps {
  homeRoute: string;
  /** Renders the workspace's nav links; receives a callback to close the sheet after navigating. */
  renderNav: (onNavigate: () => void) => ReactNode;
  navLabel: string;
}

// Below md, where the sidebar is hidden: one compact row — nav trigger and
// back control on the left, avatar on the right — instead of a second
// branded header competing with the public Navbar above. The sheet it opens
// carries the same sidebar header (identity + back) above the nav links.
export function WorkspaceMobileBar({ homeRoute, renderNav, navLabel }: WorkspaceMobileBarProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="flex h-14 shrink-0 items-center justify-between px-4 md:hidden">
      <div className="flex items-center gap-2">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#eef0f3] bg-white text-[#4a5568] shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-colors hover:bg-[hsl(var(--accent)/0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col bg-white p-0 text-foreground">
            <SheetTitle className="sr-only">{navLabel}</SheetTitle>
            <WorkspaceSidebarHeader homeRoute={homeRoute} onNavigate={close} />
            {renderNav(close)}
          </SheetContent>
        </Sheet>
        <WorkspaceBackButton homeRoute={homeRoute} className="shadow-[0_2px_10px_rgba(0,0,0,0.05)]" />
      </div>
      <WorkspaceAccountMenu variant="compact" />
    </div>
  );
}
