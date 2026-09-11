import {
  LayoutDashboard,
  UserPlus,
  CalendarCheck,
  Building2,
  CreditCard,
  FileBarChart,
  Receipt,
  Bot,
  type LucideIcon,
} from "lucide-react";

export interface EmployerNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface EmployerNavGroup {
  label: string;
  items: EmployerNavItem[];
}

// Same 8 real destinations confirmed against the Angular source's
// dashboard.routes.ts ('employer' children, data.roles: ['admin']) and
// home.component.html's module grid, now organized into the information
// architecture that's actually there rather than one flat list — a
// day-to-day workforce loop, an operations loop, and the two standalone
// business/intelligence destinations. Profile isn't repeated here: it's
// reached from the account menu in the sidebar header (see
// WorkspaceAccountMenu).
export const EMPLOYER_NAV_GROUPS: EmployerNavGroup[] = [
  {
    label: "Workforce",
    items: [
      { to: "/dashboard/employer/home", label: "Dashboard", icon: LayoutDashboard },
      { to: "/dashboard/employer/employee-management", label: "Add Employee", icon: UserPlus },
      { to: "/dashboard/employer/attendance", label: "Attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/dashboard/employer/site-management", label: "Site", icon: Building2 },
      { to: "/dashboard/employer/reports", label: "Reports", icon: FileBarChart },
      { to: "/dashboard/employer/expense-tracker", label: "Expense Tracker", icon: Receipt },
    ],
  },
  {
    label: "Business",
    items: [{ to: "/dashboard/employer/plan", label: "Pricing", icon: CreditCard }],
  },
  {
    label: "Intelligence",
    items: [{ to: "/dashboard/employer/ai-chat", label: "AI Beta", icon: Bot }],
  },
];
