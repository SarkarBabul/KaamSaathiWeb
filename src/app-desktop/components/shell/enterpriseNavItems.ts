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
}

export const ENTERPRISE_NAV_ITEMS: EnterpriseNavItem[] = [
  { to: "/enterprise/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/enterprise/user-management", label: "User Management", icon: Users },
  { to: "/enterprise/site-management", label: "Site Management", icon: Building2 },
  { to: "/enterprise/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/enterprise/payments", label: "Payments", icon: Wallet },
  { to: "/enterprise/expense-tracker", label: "Expense Tracker", icon: Receipt },
  { to: "/enterprise/reports", label: "Reports", icon: FileBarChart },
  { to: "/enterprise/ai-dashboard", label: "AI Dashboard", icon: Bot },
  { to: "/enterprise/settings", label: "Settings", icon: SettingsIcon },
];
