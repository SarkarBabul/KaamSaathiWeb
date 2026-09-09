import { EnterpriseNavLinks } from "@/app-desktop/components/shell/EnterpriseNavLinks";

export function EnterpriseSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 text-lg font-semibold text-sidebar-foreground">
        KaamSaathi
      </div>
      <EnterpriseNavLinks />
    </aside>
  );
}
