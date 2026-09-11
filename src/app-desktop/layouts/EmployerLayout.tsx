import { Outlet } from "react-router-dom";
import { EmployerSidebar } from "@/app-desktop/components/shell/EmployerSidebar";
import { EmployerMobileBar } from "@/app-desktop/components/shell/EmployerMobileBar";
import { RouteTransition } from "@/app-desktop/components/shared/RouteTransition";

// The sidebar (desktop) / EmployerMobileBar (mobile) are the only
// persistent chrome below the public Navbar. Both carry the workspace's
// single account control and back button in their header (see
// WorkspaceSidebarHeader), so no horizontal band sits between the public
// navbar and the page. Sidebar, mobile bar, and the shared background all
// sit OUTSIDE the <Outlet/>'s per-route <Suspense> boundary (declared at
// each route in App.tsx) — only the page content inside <main> suspends/
// transitions when navigating between employer pages.
export function EmployerLayout() {
  return (
    <div className="employer-theme ks-field-bg flex flex-1">
      <EmployerSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <EmployerMobileBar />
        <main className="flex-1 p-4 pt-6 md:p-8">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  );
}

// Default export so App.tsx can lazy-load this layout (and everything it
// pulls in — the sidebar, header, and framer-motion's active-nav-indicator
// animation) out of the main bundle. Before this, EmployerLayout/
// EnterpriseLayout were the only pieces of the whole Employer/Enterprise
// surface NOT already code-split — every public-site visitor was
// downloading the entire admin workspace shell on first load regardless of
// whether they ever sign in.
export default EmployerLayout;
