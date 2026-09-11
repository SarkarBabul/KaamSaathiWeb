import { NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EMPLOYER_NAV_GROUPS } from "@/app-desktop/components/shell/employerNavItems";

interface EmployerNavLinksProps {
  onNavigate?: () => void;
}

const ACTIVE_GRADIENT = "linear-gradient(135deg, #2ba85b, #1c7a3d)";

// Signature interaction: the active item's fill is one shared framer-motion
// element (`layoutId`) that physically glides between nav items — and
// between groups — on navigation, rather than just appearing/disappearing.
// framer-motion is an existing, code-split project dependency (only loaded
// once a user actually enters the workspace — see EmployerLayout/App.tsx),
// so this costs nothing on the public site. `useReducedMotion` swaps the
// spring for an instant snap.
export function EmployerNavLinks({ onNavigate }: EmployerNavLinksProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3" aria-label="Employer navigation">
      {EMPLOYER_NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
            {group.label}
          </span>
          {group.items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard/employer/home"}
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
                      layoutId="employer-nav-active"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-2xl shadow-[0_6px_16px_-4px_rgba(43,168,91,0.45)]"
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
                </>
              )}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
