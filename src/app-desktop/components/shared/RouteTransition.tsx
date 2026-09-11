import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

// Keyed by pathname so ONLY this wrapper (the page-content area inside a
// workspace layout's <main>) remounts and replays its entrance animation on
// navigation — the persistent shell (KaamSaathiNavbar, workspace sidebar,
// workspace header) sits outside this component entirely and never
// remounts. Pairs with each route's own per-route <Suspense> (see App.tsx):
// that Suspense's fallback/resolved-child swap happens inside the same
// pathname key, so it does not replay this animation a second time.
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="ks-route-transition">
      {children}
    </div>
  );
}
