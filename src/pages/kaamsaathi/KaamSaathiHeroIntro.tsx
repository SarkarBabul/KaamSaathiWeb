import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, IndianRupee, MapPin, Users, CheckCircle2 } from "lucide-react";
import dbSir from "../../assets/DB Sir.png";
import logoTextImg from "../../assets/Logo(Text).png";
import DriftWall, {
  type DriftWallItem,
  type DriftWallProps,
} from "../../components/reactbits/DriftWall";
import {
  introPlayback,
  introSequenceShouldRun,
  rememberHomeScroll,
} from "./heroIntroConfig";

// The React Bits Drift Wall, recoloured into KaamSaathi's warm palette and
// used strictly as an atmospheric layer behind the hero (see the JSX below).
// Camera props (tilt/turn/roll/perspective/variance/lift/fade/dim/…) match the
// official reactbits.dev preview exactly; only column count / tile size /
// speed / parallax step down on smaller screens.
type ViewportTier = "mobile" | "tablet" | "desktop";

function useViewportTier(): ViewportTier {
  const compute = (): ViewportTier => {
    if (typeof window === "undefined") return "desktop";
    if (window.matchMedia("(max-width: 479px)").matches) return "mobile";
    if (window.matchMedia("(max-width: 899px)").matches) return "tablet";
    return "desktop";
  };
  const [tier, setTier] = useState<ViewportTier>(compute);
  useEffect(() => {
    const mMobile = window.matchMedia("(max-width: 479px)");
    const mTablet = window.matchMedia("(max-width: 899px)");
    const update = () => setTier(compute());
    update();
    mMobile.addEventListener("change", update);
    mTablet.addEventListener("change", update);
    return () => {
      mMobile.removeEventListener("change", update);
      mTablet.removeEventListener("change", update);
    };
  }, []);
  return tier;
}

// A warm gradient tile: brand two-stop gradient + a soft top-left light and a
// bottom-right shadow so each tile keeps its lit, 3D feel (never a flat swatch).
function warmTile(from: string, to: string, shade: string): string {
  const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' preserveAspectRatio='none'>",
    "<defs>",
    "<linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>",
    `<stop offset='0' stop-color='${from}'/><stop offset='1' stop-color='${to}'/>`,
    "</linearGradient>",
    "<radialGradient id='l' cx='0.26' cy='0.18' r='0.9'>",
    "<stop offset='0' stop-color='#ffffff' stop-opacity='0.42'/>",
    "<stop offset='0.55' stop-color='#ffffff' stop-opacity='0'/>",
    "</radialGradient>",
    "<radialGradient id='s' cx='0.8' cy='0.92' r='0.95'>",
    `<stop offset='0' stop-color='${shade}' stop-opacity='0.4'/>`,
    `<stop offset='0.6' stop-color='${shade}' stop-opacity='0'/>`,
    "</radialGradient>",
    "</defs>",
    "<rect width='600' height='400' fill='url(#g)'/>",
    "<rect width='600' height='400' fill='url(#s)'/>",
    "<rect width='600' height='400' fill='url(#l)'/>",
    "</svg>",
  ].join("");
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const DRIFT_TILES: DriftWallItem[] = (
  [
    ["#f6e7d0", "#e6cbab", "#b98f63"],
    ["#efd9b8", "#e0b57e", "#a8703a"],
    ["#f3e3c8", "#d7b489", "#8f5f34"],
    ["#e9cba2", "#c68a4c", "#7c4a24"],
    ["#fbf2e5", "#eed9b9", "#cfa877"],
    ["#ecd3ad", "#cd9758", "#8a4f2a"],
    ["#f7ecdb", "#e4c9a2", "#c69a5f"],
    ["#e3c093", "#a86a37", "#5e3117"],
    ["#f4e2c6", "#dcae72", "#a06a35"],
    ["#efdcc0", "#c98f4c", "#7f4a26"],
    ["#f8efe1", "#ddbe93", "#b98a54"],
    ["#e7c8a0", "#b97b3f", "#6b3a1c"],
  ] as const
).map(([a, b, c]) => ({ image: warmTile(a, b, c) }));

// Camera / feel props shared across breakpoints — these are the reactbits.dev
// preview values verbatim.
const DRIFT_BASE = {
  items: DRIFT_TILES,
  interactive: false,
  radius: 14,
  tilt: 16,
  turn: -14,
  roll: 0,
  perspective: 1200,
  direction: "up",
  variance: 0.45,
  lift: 64,
  fade: 0.6,
  dim: 0.55,
  grayscale: false,
  pauseOnHover: false,
  overlayColor: "transparent",
} satisfies Partial<DriftWallProps>;

// Desktop = the exact preview values. Tablet/mobile only trim the wall's size
// and motion for readability + performance on constrained devices.
const DRIFT_TIER: Record<
  ViewportTier,
  Pick<
    DriftWallProps,
    "columns" | "tileWidth" | "tileHeight" | "gap" | "speed" | "depth" | "parallax"
  >
> = {
  desktop: { columns: 5, tileWidth: 200, tileHeight: 132, gap: 18, speed: 42, depth: 120, parallax: 0.6 },
  tablet: { columns: 4, tileWidth: 172, tileHeight: 114, gap: 16, speed: 34, depth: 104, parallax: 0.35 },
  mobile: { columns: 3, tileWidth: 146, tileHeight: 98, gap: 14, speed: 26, depth: 84, parallax: 0 },
};

// ─── Resting Hero content — the real homepage hero, always fully rendered ───
// The old horizontal split / curtain reveal that used to sit on top of this
// has been removed entirely. The entrance animation is now owned by
// KaamSaathiCinematicIntro, a decoupled full-screen overlay.
function StaticHeroContent() {
  return (
    <div className="ks-hero-inner">
      <div className="ks-hero-copy">
        <div className="ks-hero-live">
          <span className="ks-live-dot" />
          <span className="ks-tag">Workforce Management Platform</span>
        </div>
        <h1 className="ks-hero-h1">
          Manage Your&nbsp;
          <span className="ks-h1-gold">Workforce.</span>
          <span className="ks-h1-stroke">Anywhere.</span>
        </h1>
        <p className="ks-hero-sub">
          Built for Indian contractors, builders, and construction companies.
          Track attendance, process payroll, and oversee every project site —
          all from one powerful app.
        </p>
        <div className="ks-hero-acts">
          <Link to="/schedule-demo" className="ks-btn ks-btn-gold">
            Book a Free Demo
            <ArrowRight size={16} />
          </Link>
          <Link to="/features" className="ks-btn ks-btn-outline">
            Explore Features
          </Link>
        </div>
        <div className="ks-hero-trust">
          <div className="ks-avs">
            {[
              ["RK", "#7C3AED"],
              ["AS", "#0891B2"],
              ["PJ", "#059669"],
              ["VM", "#D97706"],
              ["NB", "#9d542a"],
            ].map(([initials, bg]) => (
              <span key={initials} className="ks-av" style={{ background: bg }}>
                {initials}
              </span>
            ))}
          </div>
          <p className="ks-trust-txt">
            <strong>2,400+ contractors</strong>
            <br />
            trust KaamSaathi every day
          </p>
        </div>
      </div>

      <div className="ks-hero-visual">
        <div className="ks-hero-glow" />
        <div className="ks-phone-wrap">
          <div className="ks-ph-badge ks-ph-badge--attendance">
            <span className="ks-ph-badge-ico ks-ph-badge-ico--green">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <div className="ks-ph-badge-title">248 Present Today</div>
              <div className="ks-ph-badge-sub">
                <MapPin size={10} /> Site A — Mumbai
              </div>
            </div>
          </div>
          <div className="ks-ph-badge ks-ph-badge--workers">
            <span className="ks-ph-badge-ico ks-ph-badge-ico--blue">
              <Users size={16} />
            </span>
            <div>
              <div className="ks-ph-badge-title">142 Workers Active</div>
              <div className="ks-ph-badge-sub">Across 5 sites</div>
            </div>
          </div>
          <div className="ks-ph-badge ks-ph-badge--payroll">
            <span className="ks-ph-badge-ico ks-ph-badge-ico--gold">
              <IndianRupee size={16} />
            </span>
            <div>
              <div className="ks-ph-badge-title">₹18.2L Paid</div>
              <div className="ks-ph-badge-sub">This month</div>
            </div>
          </div>
          <img
            className="ks-ph-main"
            src={dbSir}
            alt="Contractor using the KaamSaathi app to mark attendance and manage workers on site"
          />
          <div className="ks-ph-screen-patch">
            <img src={logoTextImg} alt="" className="ks-ph-screen-logo" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KaamSaathiHeroIntro() {
  const driftTier = useViewportTier();

  // Keep a running record of the home page's scroll position so the *next*
  // load's `introSequenceShouldRun()` knows whether the visitor was at the
  // very top when they reloaded. (Unchanged trigger logic — only the visual
  // it used to drive has been replaced.)
  useEffect(() => rememberHomeScroll(), []);

  // The navbar stays hidden until the intro finishes. When no intro is going
  // to run on this load (reload from mid-page, client-side nav back to home,
  // …) nothing else will reveal it, so do it here. A generous timeout is a
  // safety net in case the cinematic overlay never reports completion.
  useEffect(() => {
    if (!introSequenceShouldRun()) {
      introPlayback.finish();
      return;
    }
    const safety = window.setTimeout(() => {
      if (!introPlayback.played) introPlayback.finish();
    }, 6000);
    return () => window.clearTimeout(safety);
  }, []);

  return (
    <section className="ks-hero">
      <style>{heroExtraStyles}</style>
      <div className="ks-hero-bg">
        {/* Backmost layer: the React Bits Drift Wall (recoloured warm) as a
            perspective wall of tiles drifting up behind the hero. Sits below
            the existing grid/radial/stripe/blob decoration and every piece of
            hero content, is masked/faded by the component itself, and never
            takes pointer input — see DRIFT_BASE / DRIFT_TIER. */}
        <div className="ks-hero-driftwall">
          <DriftWall {...DRIFT_BASE} {...DRIFT_TIER[driftTier]} />
        </div>
        <div className="ks-hb-grid" />
        <div className="ks-hb-rad1" />
        <div className="ks-hb-rad2" />
        <div className="ks-hb-stripes" />
        <div className="ks-hb-blob1" />
        <div className="ks-hb-blob2" />
      </div>
      <StaticHeroContent />
    </section>
  );
}

// Only the phone-screen patch styling and the Drift Wall wrapper live here
// now. Everything curtain/split-related has been deleted.
const heroExtraStyles = `
.ks-hero-driftwall {
  position: absolute;
  inset: 0;
  z-index: 0;
  /* Decorative only: pointer-events is inherited, so every descendant (incl.
     the drift-wall tiles) is click-through and the hero content above stays
     fully interactive. The wall's own radial + top fade mask handles edge
     blending, so no extra mask here. */
  pointer-events: none;
  opacity: 0.9;
}

.ks-ph-screen-patch {
  position: absolute;
  left: 70%;
  top: 49%;
  width: 21%;
  height: 9%;
  border-radius: 15%;
  background: var(--ks-gold-pale);
  box-shadow: inset 0 0 0 1px rgba(157,84,42,.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 3;
  pointer-events: none;
}
.ks-ph-screen-logo {
  width: 78%;
  height: auto;
  display: block;
}
`;
