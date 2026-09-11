import { EnterpriseNavLinks } from "@/app-desktop/components/shell/EnterpriseNavLinks";
import { ENTERPRISE_HOME } from "@/app-desktop/components/shell/EnterpriseSidebar";
import { WorkspaceMobileBar } from "@/app-desktop/components/shell/WorkspaceMobileBar";

export function EnterpriseMobileBar() {
  return (
    <WorkspaceMobileBar
      homeRoute={ENTERPRISE_HOME}
      navLabel="Enterprise navigation"
      renderNav={(onNavigate) => <EnterpriseNavLinks onNavigate={onNavigate} />}
    />
  );
}
