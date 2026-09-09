import { Outlet } from "react-router-dom";
import { EnterpriseSidebar } from "@/app-desktop/components/shell/EnterpriseSidebar";
import { EnterpriseHeader } from "@/app-desktop/components/shell/EnterpriseHeader";

export function EnterpriseLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <EnterpriseSidebar />
      <div className="flex flex-1 flex-col">
        <EnterpriseHeader />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
