import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
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

export function EnterpriseSidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-sidebar md:text-sidebar-foreground">
      <div className="flex h-16 items-center px-6 text-lg font-semibold text-sidebar-foreground">
        KaamSaathi
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
