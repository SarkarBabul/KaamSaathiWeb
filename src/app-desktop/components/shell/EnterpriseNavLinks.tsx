import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ENTERPRISE_NAV_ITEMS } from "@/app-desktop/components/shell/enterpriseNavItems";

interface EnterpriseNavLinksProps {
  onNavigate?: () => void;
}

export function EnterpriseNavLinks({ onNavigate }: EnterpriseNavLinksProps) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {ENTERPRISE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
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
  );
}
