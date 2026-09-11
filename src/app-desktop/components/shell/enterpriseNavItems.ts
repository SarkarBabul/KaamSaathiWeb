import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Wallet,
  Receipt,
  FileBarChart,
  Bot,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";

export interface EnterpriseNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export interface EnterpriseNavGroup {
  label: string;
  items: EnterpriseNavItem[];
}

// Same order and the "New" badge on AI Dashboard as the Angular source's
// aside-bar.component.html — no navigation item was added, removed, or
// renamed — now organized into groups instead of one flat list, mirroring
// the same information-architecture pass done for Employer. "Settings" is
// kept as its own top-level destination rather than folded into the
// account footer: it's workspace-wide configuration, not a personal
// account setting (Angular's own header dropdown, for comparison, disables
// "Profile" for this role entirely — there is no personal profile view to
// fold in here).
export const ENTERPRISE_NAV_GROUPS: EnterpriseNavGroup[] = [
  {
    label: "Workforce",
    items: [
      { to: "/enterprise/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/enterprise/user-management", label: "User Management", icon: Users },
      { to: "/enterprise/attendance", label: "Attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/enterprise/site-management", label: "Site Management", icon: Building2 },
      { to: "/enterprise/payments", label: "Payments", icon: Wallet },
      { to: "/enterprise/expense-tracker", label: "Expense Tracker", icon: Receipt },
      { to: "/enterprise/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "Intelligence",
    items: [{ to: "/enterprise/ai-dashboard", label: "AI Dashboard", icon: Bot, badge: "New" }],
  },
  {
    label: "Workspace",
    items: [{ to: "/enterprise/settings", label: "Settings", icon: SettingsIcon }],
  },
];
