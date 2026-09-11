import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ENTERPRISE_NAV_GROUPS } from "@/app-desktop/components/shell/enterpriseNavItems";

interface EnterpriseNavLinksProps {
  onNavigate?: () => void;
}

const ACTIVE_GRADIENT = "linear-gradient(135deg, oklch(72% .18 55), oklch(60% .22 30))";

// Matches the Angular source's aside-bar component exactly for item order,
// labels, and the orange gradient (oklch(72% .18 55) -> oklch(60% .22 30))
// on the active item — now grouped (see enterpriseNavItems.ts) and with the
// active fill as one shared framer-motion element (`layoutId`, same
// technique as EmployerNavLinks) that glides between items on navigation.
// `useReducedMotion` swaps the spring for an instant snap.
export function EnterpriseNavLinks({ onNavigate }: EnterpriseNavLinksProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3" aria-label="Enterprise navigation">
      {ENTERPRISE_NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
            {group.label}
          </span>
          {group.items.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-2.5 rounded-2xl px-3.5 py-[11px] text-sm font-medium transition-colors duration-200",
                  isActive ? "text-white" : "text-[#4a5568] hover:bg-[#f7f8fa]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="enterprise-nav-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl shadow-[0_6px_16px_-4px_rgba(245,121,58,0.5)]"
                      style={{ background: ACTIVE_GRADIENT }}
                      transition={
                        prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 36 }
                      }
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200",
                      !isActive && "group-hover:-translate-y-0.5 group-hover:scale-110",
                    )}
                  >
                    <Icon className="h-[15px] w-[15px]" />
                  </span>
                  <span className="relative z-10 min-w-0 flex-1 transition-transform duration-200 group-hover:translate-x-0.5">
                    {label}
                  </span>
                  {badge && (
                    <span className="relative z-10 shrink-0 rounded-full bg-[#fff2e5] px-2 py-0.5 text-[10px] font-bold text-[#f5793a]">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
