import { EmployerNavLinks } from "@/app-desktop/components/shell/EmployerNavLinks";
import { WorkspaceSidebarHeader } from "@/app-desktop/components/shell/WorkspaceSidebarHeader";

export const EMPLOYER_HOME = "/dashboard/employer/home";

// Employer/Admin workspace sidebar. The Angular source has no persistent
// shell for this surface (employer/home is an 8-card grid), so this is new
// structure for the React surface built around the same real destinations.
// Floats as its own rounded card over the shared "Field Blueprint"
// background; the header is the signed-in user (WorkspaceSidebarHeader).
export function EmployerSidebar() {
  return (
    <aside className="hidden shrink-0 md:m-3 md:mr-0 md:flex md:w-[250px] md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-[#eef0f3] md:bg-white md:shadow-[0_8px_28px_-8px_rgba(28,20,10,0.12)]">
      <WorkspaceSidebarHeader homeRoute={EMPLOYER_HOME} />
      <EmployerNavLinks />
    </aside>
  );
}
