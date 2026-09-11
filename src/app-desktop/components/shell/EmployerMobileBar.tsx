import { EmployerNavLinks } from "@/app-desktop/components/shell/EmployerNavLinks";
import { EMPLOYER_HOME } from "@/app-desktop/components/shell/EmployerSidebar";
import { WorkspaceMobileBar } from "@/app-desktop/components/shell/WorkspaceMobileBar";

export function EmployerMobileBar() {
  return (
    <WorkspaceMobileBar
      homeRoute={EMPLOYER_HOME}
      navLabel="Employer navigation"
      renderNav={(onNavigate) => <EmployerNavLinks onNavigate={onNavigate} />}
    />
  );
}
