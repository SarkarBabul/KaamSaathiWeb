import { EnterpriseNavLinks } from "@/app-desktop/components/shell/EnterpriseNavLinks";
import { WorkspaceSidebarHeader } from "@/app-desktop/components/shell/WorkspaceSidebarHeader";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";

export const ENTERPRISE_HOME = "/enterprise/dashboard";

// Floats as its own rounded, shadowed card over the workspace's shared
// "Field Blueprint" background — the same treatment as EmployerSidebar, so
// both workspaces read as one design system with different accents. The
// header is the signed-in user (see WorkspaceSidebarHeader); the plan card
// below the nav is the Angular aside-bar's own, kept as-is.
export function EnterpriseSidebar() {
  return (
    <aside className="hidden shrink-0 md:m-3 md:mr-0 md:flex md:w-[250px] md:flex-col md:overflow-hidden md:rounded-3xl md:border md:border-[#eef0f3] md:bg-white md:shadow-[0_8px_28px_-8px_rgba(28,20,10,0.12)]">
      <WorkspaceSidebarHeader homeRoute={ENTERPRISE_HOME} />
      <EnterpriseNavLinks />
      <GlowCard
        bare
        className="mx-3 mb-3 flex flex-col rounded-2xl bg-gradient-to-br from-[oklch(72%_.18_55)] to-[oklch(60%_.22_30)] p-4 text-white"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">Enterprise Plan</span>
        <p className="mb-3 mt-1 text-[13px] font-semibold">06 sites · Unlimited users</p>
        <button
          type="button"
          className="w-full cursor-not-allowed rounded-lg bg-white py-2 text-xs font-bold text-[#ff5722] opacity-90"
          disabled
          title="Not implemented in the live Angular app (no click handler)"
        >
          Manage subscription
        </button>
      </GlowCard>
    </aside>
  );
}
