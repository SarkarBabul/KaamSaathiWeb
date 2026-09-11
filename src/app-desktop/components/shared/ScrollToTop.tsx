import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Scroll-container audit: DesktopShell, EnterpriseLayout and EmployerLayout
// are all plain block-flow divs — none of them, nor <main>, nor the sidebar
// nav wrapper (its own `overflow-y-auto` only scrolls the nav LIST, never
// the page) declare `overflow` or a fixed height anywhere in index.css or
// their Tailwind classes. That means the browser's own document/window
// scroll position is the one and only scroll position for every Desktop
// Version route, on both desktop and mobile — there is no nested
// scrollable shell container to target instead.
//
// React Router does not reset that position on navigation the way a full
// page load does, so without this, clicking a sidebar item while scrolled
// down on the previous page opens the new page already scrolled down.
// Mounted once at the top of DesktopShell (the shared ancestor of every
// Desktop Version route — login, Enterprise, Employer, Profile) rather
// than per-page, so no individual page needs its own `window.scrollTo()`.
//
// Keyed on pathname only (not the full location, so query-string-only
// changes — e.g. a filter — do not yank the scroll position), and fires in
// a layout effect so the reset lands before the new route's first paint.
export function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
