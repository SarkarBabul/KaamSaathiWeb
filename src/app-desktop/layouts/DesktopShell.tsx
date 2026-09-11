import { Outlet } from "react-router-dom";
import { KaamSaathiNavbar } from "@/components/kaamsaathi/KaamSaathiNavbar";
import { ScrollToTop } from "@/app-desktop/components/shared/ScrollToTop";

// The "Desktop Version" entry point (from the public KaamSaathiNavbar's own
// nav link) and everything behind it — login, Employer workspace, Enterprise
// workspace, Profile — are reached from, and must keep reading as, the same
// KaamSaathi website rather than a separate application. This shell keeps
// the real public Navbar mounted as the single top-level brand/navigation
// layer above all of it; the workspace layouts nested under <Outlet/> supply
// only their own product-level navigation below it.
//
// ScrollToTop lives here (the one ancestor shared by every Desktop Version
// route) rather than inside each workspace layout, so a single mount
// resets the document scroll position for login, Enterprise, Employer and
// Profile navigation alike — see ScrollToTop.tsx for why the document
// scroll is the right (and only) thing to reset.
export function DesktopShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <KaamSaathiNavbar />
      <Outlet />
    </div>
  );
}
