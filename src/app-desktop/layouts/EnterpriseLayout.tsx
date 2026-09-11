import { Outlet } from "react-router-dom";
import { EnterpriseSidebar } from "@/app-desktop/components/shell/EnterpriseSidebar";
import { EnterpriseMobileBar } from "@/app-desktop/components/shell/EnterpriseMobileBar";
import { RouteTransition } from "@/app-desktop/components/shared/RouteTransition";

// The sidebar (desktop) / EnterpriseMobileBar (mobile) are the only
// persistent chrome below the public Navbar. Both carry the workspace's
// single account control and back button in their header (see
// WorkspaceSidebarHeader), so no horizontal band sits between the public
// navbar and the page. Sidebar, mobile bar, and the shared background all
// sit OUTSIDE the <Outlet/>'s per-route <Suspense> boundary (declared at
// each route in App.tsx) — only the page content inside <main> suspends/
// transitions between enterprise pages.
export function EnterpriseLayout() {
  return (
    <div className="enterprise-theme ks-field-bg flex flex-1">
      <EnterpriseSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <EnterpriseMobileBar />
        <main className="flex-1 p-4 pt-6 md:p-8">
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </main>
      </div>
    </div>
  );
}

// Default export so App.tsx can lazy-load this layout — see EmployerLayout's
// identical note.
export default EnterpriseLayout;
