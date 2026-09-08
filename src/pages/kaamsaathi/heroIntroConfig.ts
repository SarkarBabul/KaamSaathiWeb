// Shared between KaamSaathiCinematicIntro (which owns the one-time entrance
// animation), KaamSaathiHeroIntro (the resting hero + scroll-position memory)
// and KaamSaathiNavbar (which fades in as the intro finishes but lives in a
// different part of the tree). Keeping the playback state and the "should the
// intro run?" decision in one place keeps all three in sync without wiring up
// React context for a couple of values.

function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  if (inMax === inMin) return v < inMin ? outMin : outMax;
  const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

// The navbar is hidden while the intro is on screen, then fades in as the
// playback progress crosses this window (the cinematic intro jumps progress
// straight to 1 when it reveals the page, so this mostly gates the fade).
const NAV_REVEAL: [number, number] = [0.3, 0.5];

export function navOpacityForProgress(p: number) {
  return mapRange(p, NAV_REVEAL[0], NAV_REVEAL[1], 0, 1);
}

// ── One-time intro playback state ─────────────────────────────────────────
// `progress` runs 0 → 1 across the intro. `played` latches true once the
// intro has finished or been skipped; it only resets when this module is
// re-evaluated, i.e. on a real page reload — never on client-side navigation
// back to the home route.
type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let progress = 0;
let played = false;

// ── "Was the visitor at the top?" across a reload ─────────────────────────
// The reveal must only play on a load that lands at the very top of the home
// page. `scrollY` can't answer that on a reload — the browser restores the
// previous scroll position asynchronously, and often late, because the page
// only reaches its full height once lazily-loaded images arrive. So instead
// the home page continuously records its own scroll position while it's
// open, and this load reads back the value the *previous* page left behind.
const SCROLL_MEMORY_KEY = "ks:homeScrollY";

// ── Fresh visit vs. reload ───────────────────────────────────────────────
// Frozen once, at module load. A brand-new open of the site (typed URL,
// external link, new tab) always gets the cinematic intro. A reload gets it
// only when the visitor was at the very top of the home page.
const navType: string = (() => {
  try {
    const entry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    return entry?.type ?? "navigate";
  } catch {
    return "navigate";
  }
})();

// Only a true first navigation counts as a fresh visit; "reload" and
// "back_forward" fall through to the scroll-position logic below.
const isFreshVisit: boolean = navType === "navigate";

// Frozen once, at module evaluation (i.e. once per real page load, before
// React mounts and before anything on this page can move or overwrite the
// stored value): was the page that unloaded before us scrolled down?
export const landedBelowTop: boolean = (() => {
  try {
    const raw = sessionStorage.getItem(SCROLL_MEMORY_KEY);
    return raw != null && Number(raw) > 4;
  } catch {
    return false;
  }
})();

export function rememberHomeScroll() {
  const write = () => {
    try {
      sessionStorage.setItem(SCROLL_MEMORY_KEY, String(window.scrollY));
    } catch {
      /* storage unavailable (private mode, disabled) — ignore */
    }
  };
  // While the page is still loading the browser may not have restored the
  // reload scroll position yet, so a save here would overwrite the value
  // this same load still needs to read. Unload events bypass that guard —
  // by then it's this page's own position that matters.
  const save = () => {
    if (document.readyState === "complete") write();
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      save();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", write);
  window.addEventListener("beforeunload", write);
  window.addEventListener("visibilitychange", save);
  const heartbeat = window.setInterval(save, 1000);
  return () => {
    window.clearInterval(heartbeat);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", write);
    window.removeEventListener("beforeunload", write);
    window.removeEventListener("visibilitychange", save);
  };
}

export const introPlayback = {
  get progress() {
    return progress;
  },
  get played() {
    return played;
  },
  set(next: number) {
    progress = next;
    listeners.forEach((fn) => fn(next));
  },
  finish() {
    progress = 1;
    played = true;
    listeners.forEach((fn) => fn(1));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

// True on the loads that get the cinematic intro:
//   • a fresh visit (typed URL / external link / new tab), OR
//   • a reload / restore that lands at the very top of the home page.
// A reload from further down the page, and every client-side navigation
// after the intro has already played this page-load, get nothing.
//
// This is the ONLY trigger gate — the visual (KaamSaathiCinematicIntro) is
// completely decoupled from it, so the "reload at the very top" behaviour is
// preserved even though the old split/curtain visual is gone.
export function introSequenceShouldRun(): boolean {
  if (introPlayback.played) return false;
  if (typeof window === "undefined") return false;
  if (isFreshVisit) return true;
  return !landedBelowTop && window.scrollY <= 4;
}
