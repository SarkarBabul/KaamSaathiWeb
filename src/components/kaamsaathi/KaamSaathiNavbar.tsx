import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/Logo(without_tagline).png";
import { introPlayback, navOpacityForProgress } from "@/pages/kaamsaathi/heroIntroConfig";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Desktop Version", href: "/auth/login" },
  { name: "FAQ & Support", href: "/faq" },
  { name: "Blog", href: "/blog" },
];

const costEstimationItems = [
  { name: "Brick Estimation", href: "/cost-estimation/brick-estimation" },
];

export function KaamSaathiNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [mobileCostOpen, setMobileCostOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [introOpacity, setIntroOpacity] = useState(() => {
    if (typeof window === "undefined") return 1;
    const onHome = window.location.pathname === "/";
    if (!onHome || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return 1;
    return navOpacityForProgress(introPlayback.progress);
  });
  const costRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 44);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fades in alongside the home page's one-time hero intro reveal. Every
  // other route, and reduced-motion users, keep the navbar fully visible
  // always — it stays mounted and focusable throughout, only its opacity
  // animates. Once the reveal has played (or been skipped) the playback
  // reports progress 1 and the navbar simply stays visible.
  useEffect(() => {
    if (!isHome || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIntroOpacity(1);
      return;
    }
    setIntroOpacity(navOpacityForProgress(introPlayback.progress));
    return introPlayback.subscribe((p) => {
      setIntroOpacity(navOpacityForProgress(p));
    });
  }, [isHome]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (costRef.current && !costRef.current.contains(e.target as Node)) {
        setCostOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setCostOpen(false);
    setMobileCostOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isCostActive = costEstimationItems.some((i) => location.pathname === i.href);

  return (
    <>
      <style>{navStyles}</style>
      <nav
        className={cn("ks-nav", scrolled && "ks-nav--solid")}
        style={{ opacity: introOpacity, pointerEvents: introOpacity < 0.05 ? "none" : "auto" }}
      >
        {/* ── Main bar ── */}
        <div className="ks-nav-inner">
          {/* Logo */}
          <Link to="/" className="ks-nav-logo">
            <img src={logoImg} alt="KaamSaathi" className="ks-nav-logo-img" />
          </Link>

          {/* Desktop links */}
          <div className="ks-nav-links">
            {navigation.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-nav-link"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn("ks-nav-link", location.pathname === item.href && "ks-nav-link--active")}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Cost Estimation dropdown */}
            <div className="ks-nav-dropdown" ref={costRef}>
              <button
                onClick={() => setCostOpen(!costOpen)}
                className={cn("ks-nav-link ks-nav-dropdown-btn", isCostActive && "ks-nav-link--active")}
              >
                Cost Estimation
                <ChevronDown className={cn("ks-nav-chevron", costOpen && "ks-nav-chevron--open")} size={13} />
              </button>
              {costOpen && (
                <div className="ks-nav-dropdown-menu">
                  {costEstimationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn("ks-nav-dropdown-item", location.pathname === item.href && "ks-nav-dropdown-item--active")}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CTA button */}
            <a
              href="https://play.google.com/store/apps/details?id=com.KaamSaathi"
              target="_blank"
              rel="noopener noreferrer"
              className="ks-nav-cta"
            >
              Download App
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="ks-nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {mobileMenuOpen && (
          <div className="ks-nav-mobile">
            {navigation.map((item) =>
              item.external ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-nav-mobile-link"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn("ks-nav-mobile-link", location.pathname === item.href && "ks-nav-mobile-link--active")}
                >
                  {item.name}
                </Link>
              )
            )}

            {/* Mobile Cost Estimation */}
            <button
              onClick={() => setMobileCostOpen(!mobileCostOpen)}
              className={cn("ks-nav-mobile-link ks-nav-mobile-dropdown-btn", isCostActive && "ks-nav-mobile-link--active")}
            >
              Cost Estimation
              <ChevronDown className={cn("ks-nav-chevron", mobileCostOpen && "ks-nav-chevron--open")} size={15} />
            </button>
            {mobileCostOpen && (
              <div className="ks-nav-mobile-submenu">
                {costEstimationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn("ks-nav-mobile-link ks-nav-mobile-sub-link", location.pathname === item.href && "ks-nav-mobile-link--active")}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="ks-nav-mobile-cta-wrap">
              <a
                href="https://play.google.com/store/apps/details?id=com.KaamSaathi"
                target="_blank"
                rel="noopener noreferrer"
                className="ks-nav-cta ks-nav-cta--full"
              >
                Download App
              </a>
            </div>
          </div>
        )}

        {/* ── Support bar ── */}
        <div className="ks-nav-support">
          <a href="tel:+919997394773" className="ks-nav-support-link">
            <Phone size={14} />
            Support: +91 9997394773
          </a>
          <span className="ks-nav-support-sep">|</span>
          <Link to="/schedule-demo" className="ks-nav-support-demo">
            Schedule Demo
          </Link>
        </div>
      </nav>
    </>
  );
}

// ── Scoped styles ─────────────────────────────────────────────────────────────
const navStyles = `
.ks-nav {
  position: sticky;
  top: 0;
  /* Was 300 — raised the Desktop Version workspace's dialogs/sheets/selects
     (all shadcn/Radix overlays in this app render at z-50) above this navbar
     when it's reused as the shell for that authenticated surface, rather
     than the navbar sitting on top of every modal opened there. Nothing in
     the public site relies on a value between 50 and 300 — kept comfortably
     under 50 for that stacking, still above ordinary in-flow page content. */
  z-index: 40;
  background: rgba(255,254,248,.92);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(157,84,42,.12);
  transition: all .35s cubic-bezier(.16,1,.3,1);
  font-family: 'Belleza', sans-serif;
}
.ks-nav--solid {
  background: rgba(255,254,248,.98);
  box-shadow: 0 2px 24px rgba(157,84,42,.09);
}

.ks-nav-inner {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Logo */
.ks-nav-logo { display: flex; align-items: center; flex-shrink: 0; }
.ks-nav-logo-img {
  height: 44px;
  width: auto;
  object-fit: contain;
  transition: filter .3s;
}
.ks-nav-logo:hover .ks-nav-logo-img {
  filter: drop-shadow(0 0 10px rgba(255,165,31,.45));
}

/* Desktop nav links */
.ks-nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
}
@media(max-width:900px){ .ks-nav-links { display: none; } }

.ks-nav-link {
  padding: 7px 13px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(28,13,0,.65);
  text-decoration: none;
  transition: all .2s;
  letter-spacing: .02em;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.ks-nav-link:hover { color: #6b3318; background: rgba(157,84,42,.07); }
.ks-nav-link--active { color: #9d542a; background: rgba(255,165,31,.1); }
.ks-nav-link:focus-visible,
.ks-nav-hamburger:focus-visible {
  outline: 2.5px solid #ffa51f;
  outline-offset: 2px;
}

/* Dropdown */
.ks-nav-dropdown { position: relative; }
.ks-nav-dropdown-btn { display: flex; align-items: center; gap: 4px; }
.ks-nav-chevron { transition: transform .22s; flex-shrink: 0; }
.ks-nav-chevron--open { transform: rotate(180deg); }

.ks-nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 180px;
  background: #fffef8;
  border: 1px solid rgba(157,84,42,.16);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(157,84,42,.14);
  overflow: hidden;
  z-index: 50;
}
.ks-nav-dropdown-item {
  display: block;
  padding: 10px 16px;
  font-size: 13.5px;
  color: rgba(28,13,0,.7);
  text-decoration: none;
  transition: all .18s;
}
.ks-nav-dropdown-item:hover { background: rgba(255,165,31,.09); color: #6b3318; }
.ks-nav-dropdown-item--active { background: rgba(255,165,31,.12); color: #9d542a; }

/* CTA button */
.ks-nav-cta {
  margin-left: 8px;
  padding: 8px 18px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffa51f, #e8940f);
  color: #3d1a08;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 3px 14px rgba(255,165,31,.32);
  transition: all .22s cubic-bezier(.16,1,.3,1);
  border: none;
  cursor: pointer;
}
.ks-nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 22px rgba(255,165,31,.44); }
.ks-nav-cta:focus-visible { outline: 2.5px solid #3d1a08; outline-offset: 3px; }
.ks-nav-cta--full { display: block; text-align: center; margin-left: 0; width: 100%; }

/* Hamburger */
.ks-nav-hamburger {
  display: none;
  padding: 8px;
  border-radius: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(28,13,0,.65);
  transition: all .2s;
}
.ks-nav-hamburger:hover { background: rgba(157,84,42,.07); color: #6b3318; }
@media(max-width:900px){ .ks-nav-hamburger { display: flex; align-items: center; } }

/* Mobile menu */
.ks-nav-mobile {
  border-top: 1px solid rgba(157,84,42,.12);
  padding: 12px 16px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255,254,248,.98);
}
.ks-nav-mobile-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-radius: 9px;
  font-size: 15px;
  color: rgba(28,13,0,.65);
  text-decoration: none;
  transition: all .18s;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.ks-nav-mobile-link:hover { background: rgba(157,84,42,.07); color: #6b3318; }
.ks-nav-mobile-link--active { background: rgba(255,165,31,.1); color: #9d542a; }
.ks-nav-mobile-dropdown-btn { width: 100%; text-align: left; }
.ks-nav-mobile-submenu { padding-left: 14px; }
.ks-nav-mobile-sub-link { font-size: 14px; }
.ks-nav-mobile-cta-wrap { padding: 10px 0 8px; }

/* Support bar */
.ks-nav-support {
  background: #3d1a08;
  color: rgba(237,207,181,.85);
  padding: 7px 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  font-size: 13px;
  font-family: 'Belleza', sans-serif;
}
.ks-nav-support-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: rgba(237,207,181,.85);
  text-decoration: none;
  transition: color .2s;
}
.ks-nav-support-link:hover { color: #ffa51f; }
.ks-nav-support-sep { color: rgba(237,207,181,.3); }
.ks-nav-support-demo {
  font-weight: 500;
  color: #ffa51f;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color .2s;
}
.ks-nav-support-demo:hover { color: #ffe229; }
@media(max-width:640px){
  .ks-nav-support { justify-content: center; }
  .ks-nav-support-sep { display: none; }
}
`;
