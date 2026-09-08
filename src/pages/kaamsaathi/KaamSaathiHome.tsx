import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Star,
  WifiOff,
  Users,
  Download,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import attendanceImg from "../../assets/Attendance.png";
import attendanceReportImg from "../../assets/Attendance Report.png";
import manageSitesImg from "../../assets/Manage Sites.png";
import paymentCalculationImg from "../../assets/Payment Calculation.png";
import manageWorkersImg from "../../assets/Manage Workers.png";
import paymentReportImg from "../../assets/Payment Report.png";
import logoTextImg from "../../assets/Logo(Text).png";
import closingDashboardImg from "../../assets/Closing (Dashboard) screen.png";
import KaamSaathiHeroIntro from "./KaamSaathiHeroIntro";
import { KaamSaathiCinematicIntro } from "../../components/kaamsaathi/KaamSaathiCinematicIntro";

// Constants
const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.KaamSaathi";
const WHATSAPP_URL =
  "https://wa.me/919997394773?text=Hello!%20I%20want%20to%20know%20more%20about%20KaamSaathi%20app.";

// Data
const stats = [
  { n: 50000, suffix: "+", label: "Workers Managed Daily" },
  { n: 2400, suffix: "+", label: "Active Contractors" },
  { n: 1200, suffix: "+", label: "Project Sites" },
  { prefix: "₹", n: 500, suffix: "Cr+", label: "Payroll Processed" },
];

const features = [
  {
    tag: "Attendance",
    heading: "Mark attendance in seconds",
    body: "One tap per worker. Full-day, half-day, or absent — instantly recorded and wages calculated in real time.",
    points: [
      "Daily attendance with tap-to-mark interface",
      "Full, half-day & absent tracking",
      "Per-worker earning shown live",
      "No paper registers needed",
    ],
    img: attendanceImg,
    imgAlt: "Attendance module",
  },
  {
    tag: "Reports",
    heading: "Download reports instantly",
    body: "Weekly, monthly, or custom date ranges. Share professional attendance reports with clients in one tap.",
    points: [
      "Weekly & monthly attendance reports",
      "Per-worker attendance percentage",
      "Download & share via WhatsApp or email",
    ],
    img: attendanceReportImg,
    imgAlt: "Attendance report",
  },
  {
    tag: "Sites",
    heading: "All your sites in one place",
    body: "Create unlimited project sites, assign workers to each, and switch between them instantly.",
    points: [
      "Create & manage unlimited sites",
      "Add or edit sites anytime",
      "Site-wise workforce & attendance tracking",
    ],
    img: manageSitesImg,
    imgAlt: "Site management",
  },
  {
    tag: "Payroll",
    heading: "Automatic payment calculation",
    body: "Wages auto-calculated from attendance data. Track paid vs pending per worker and get full payment reports instantly.",
    points: [
      "Auto-calculate daily wages from attendance",
      "Record cash, bank, or UPI payments",
      "Track paid vs pending instantly",
      "Full payment reports, shareable anytime",
    ],
    img: paymentCalculationImg,
    imgAlt: "Payment calculation",
  },
];

const mobileFeatures = [
  {
    emoji: "👷",
    title: "Add & manage workers",
    desc: "Name, role, site, mobile, daily rate — all in one profile.",
    bg: "rgba(255,165,31,.12)",
  },
  {
    emoji: "📋",
    title: "Daily attendance from site",
    desc: "Mark present, absent, or half-day for all workers in 2 minutes.",
    bg: "rgba(34,197,94,.1)",
  },
  {
    emoji: "💰",
    title: "Instant payment records",
    desc: "Cash, bank, or UPI — record and track who is paid and what is pending.",
    bg: "rgba(157,84,42,.1)",
  },
  {
    emoji: "📊",
    title: "Download & share reports",
    desc: "Send reports via WhatsApp or email in one tap — anytime, anywhere.",
    bg: "rgba(255,226,41,.12)",
  },
];

const whyCards = [
  {
    n: "01",
    title: "10× Faster Attendance",
    body: "Mark 200 workers in under 2 minutes. No registers, no confusion, no missed entries ever again.",
  },
  {
    n: "02",
    title: "Zero Payroll Errors",
    body: "Wages auto-calculated from attendance — no manual math means no salary disputes at month end.",
  },
  {
    n: "03",
    title: "Payments Tracked Clearly",
    body: "Know exactly who is paid and what is pending — across every worker and every site at a glance.",
  },
  {
    n: "04",
    title: "Multiple Sites, One View",
    body: "Manage 1 site or 50 from the same app. Switch between projects and see the full picture instantly.",
  },
  {
    n: "05",
    title: "Reports in Seconds",
    body: "Download and share attendance or payment reports with clients right from your phone — in one tap.",
  },
  {
    n: "06",
    title: "Simple as WhatsApp",
    body: "No training needed. If you can use WhatsApp, you can use KaamSaathi. Simple enough for any contractor.",
  },
];

const testimonials = [
  {
    stars: 5,
    quote:
      "Before KaamSaathi I was maintaining a paper register and calculating wages manually at month end. Ab sab kuch minutes mein ho jaata hai. Mera kaam bahut easy ho gaya.",
    initials: "RK",
    name: "Ramesh Kulkarni",
    role: "Labour Contractor, Pune",
    color: "#7C3AED",
  },
  {
    stars: 5,
    quote:
      "Managing 5 sites was a nightmare before. Now I check attendance for all sites from home on my phone. Payment calculation fully automatic — no errors at all.",
    initials: "AS",
    name: "Amit Shah",
    role: "Builder & Developer, Mumbai",
    color: "#0891B2",
  },
  {
    stars: 5,
    quote:
      "Salary calculation used to take 2 full days every month. KaamSaathi does it in 20 minutes. Workers trust the system because it is transparent and they can verify it.",
    initials: "PJ",
    name: "Priya Joshi",
    role: "Project Manager, Bengaluru",
    color: "#059669",
  },
];

// Schema
const appSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KaamSaathi - Worker Attendance & Labour Management App",
  operatingSystem: "Android",
  applicationCategory: "BusinessApplication",
  description:
    "KaamSaathi is a worker attendance and labour management app for contractors, builders and construction businesses in India.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    ratingCount: "850",
  },
  downloadUrl: PLAY_URL,
  inLanguage: ["en", "hi"],
};

// Animated Counter
function Counter({
  n,
  prefix = "",
  suffix = "",
}: {
  n: number;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const dur = 1800;
        const tick = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * n));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [n]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// Reveal on scroll
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -44px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  dir = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  dir?: "up" | "left" | "right" | "scale";
  className?: string;
}) {
  const { ref, visible } = useReveal();
  const base =
    "transition-all duration-700 ease-out " +
    (visible ? "opacity-100 translate-x-0 translate-y-0 scale-100" : "opacity-0 ");
  const hidden =
    !visible
      ? dir === "up"
        ? "translate-y-8"
        : dir === "left"
        ? "-translate-x-8"
        : dir === "right"
        ? "translate-x-8"
        : "scale-95"
      : "";

  return (
    <div
      ref={ref}
      className={`${base}${hidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Main Component
export default function KaamSaathiHome() {
  return (
    <>
      <Helmet>
        <title>
          Worker Attendance & Labour Management App for Contractors |
          KaamSaathi
        </title>
        <meta
          name="description"
          content="KaamSaathi is India's easiest worker attendance & labour management app for contractors. मजदूरों की हाजरी, पेमेंट और साइट मैनेजमेंट अब मोबाइल से करें। Free download."
        />
        <meta
          name="keywords"
          content="worker attendance app, labour attendance app, labour management app, contractor attendance app, construction worker management, मजदूर हाजरी ऐप"
        />
        <meta
          property="og:title"
          content="Worker Attendance & Labour Management App | KaamSaathi"
        />
        <meta
          property="og:description"
          content="मजदूरों की हाजरी, पेमेंट और साइट मैनेजमेंट अब मोबाइल से करें। India's easiest labour attendance app."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(appSchema)}
        </script>
      </Helmet>

      {/* Cinematic entrance: blur → centre wordmark → loading → zoom through
          the letters → sharp homepage. Runs on a fresh visit or a reload at
          the very top; the old split/curtain reveal has been removed. */}
      <KaamSaathiCinematicIntro />

      <div className="ks-home" style={cssVars as React.CSSProperties /* eslint-disable-line */}>
        {/* GLOBAL STYLES injected once */}
        <style>{globalStyles}</style>

        {/* HERO: cinematic scroll-pinned intro (logo → person/phone → hero) */}
        <KaamSaathiHeroIntro />

        {/* STATS BAR */}
        <section className="ks-stats">
          <div className="ks-stats-row">
            {stats.map((s, i) => (
              <Reveal key={i} dir="up" delay={i * 100} className="ks-stat">
                <div className="ks-stat-n">
                  <Counter n={s.n} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <div className="ks-stat-lbl">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="ks-features" id="features">
          <div className="ks-container">
            <Reveal dir="up">
              <div className="ks-sec-head">
                <span className="ks-tag">Platform Features</span>
                <h2>Everything your workforce needs, unified.</h2>
                <p>
                  From daily attendance marking to end-of-month payroll -
                  KaamSaathi handles every step of workforce operations so you
                  can focus on building.
                </p>
              </div>
            </Reveal>

            <div className="ks-feat-stack">
              {features.map((f, i) => (
                <Reveal key={i} dir="up" delay={i * 80} className="ks-feat-row-wrap">
                  <div
                    className={`ks-feat-row${i % 2 === 1 ? " ks-feat-row--flip" : ""}`}
                  >
                    {/* Text */}
                    <div className="ks-feat-txt">
                      <span className="ks-tag" style={{ marginBottom: 14 }}>
                        {f.tag}
                      </span>
                      <h3 className="ks-feat-h">{f.heading}</h3>
                      <p className="ks-feat-p">{f.body}</p>
                      <ul className="ks-feat-pts">
                        {f.points.map((pt) => (
                          <li key={pt}>
                            <span className="ks-ck">✓</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Image */}
                    <div className="ks-feat-img">
                      <img src={f.img} alt={f.imgAlt} loading="lazy" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MOBILE APP */}
        <section className="ks-mobile" id="mobile">
          <div className="ks-mob-layout">
            <Reveal dir="left" className="ks-mob-phones">
              <img
                className="ks-mob-p1"
                src={manageWorkersImg}
                alt="Worker management"
                loading="lazy"
              />
              <img
                className="ks-mob-p2"
                src={paymentReportImg}
                alt="Payment report"
                loading="lazy"
              />
            </Reveal>

            <div className="ks-mob-txt">
              <Reveal dir="right">
                <span className="ks-tag" style={{ marginBottom: 16 }}>
                  Mobile App
                </span>
                <h2>Built for the site. Works on any phone.</h2>
                <p>
                  No laptop needed. Mark attendance, check payments, and manage
                  workers — directly from your Android phone on the job site.
                </p>
              </Reveal>

              <div className="ks-mob-feats">
                {mobileFeatures.map((mf, i) => (
                  <Reveal key={i} dir="up" delay={i * 80}>
                    <div className="ks-mf">
                      <div className="ks-mf-ico" style={{ background: mf.bg }}>
                        {mf.emoji}
                      </div>
                      <div>
                        <div className="ks-mf-t">{mf.title}</div>
                        <div className="ks-mf-d">{mf.desc}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal dir="up" delay={400}>
                <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className="ks-btn ks-btn-gold" style={{ width: "fit-content" }}>
                  <Download size={16} />
                  Download App
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* WHY KAAMSAATHI */}
        <section className="ks-why" id="why">
          <div className="ks-why-conic" />
          <div className="ks-container" style={{ position: "relative", zIndex: 1 }}>
            <Reveal dir="up">
              <div className="ks-sec-head">
                <span className="ks-tag ks-tag--light">Why KaamSaathi</span>
                <h2 style={{ color: "var(--ks-gold-pale)" }}>
                  Built for the ground reality
                  <br />
                  of Indian construction.
                </h2>
                <p style={{ color: "rgba(237,207,181,.58)" }}>
                  Every feature solves a real problem you face on site — built
                  for contractors, by people who understand the chaos of daily
                  labour management.
                </p>
              </div>
            </Reveal>

            <div className="ks-why-grid">
              {whyCards.map((wc, i) => (
                <Reveal key={i} dir="up" delay={i * 80}>
                  <div className="ks-wc">
                    <div className="ks-wc-n">{wc.n}</div>
                    <h3>{wc.title}</h3>
                    <p>{wc.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="ks-testi" id="customers">
          <div className="ks-container">
            <Reveal dir="up">
              <div className="ks-sec-head">
                <span className="ks-tag">Customer Stories</span>
                <h2>Trusted by contractors across India.</h2>
                <p>
                  From small subcontractors to large infrastructure firms,
                  builders of every size rely on KaamSaathi every day.
                </p>
              </div>
            </Reveal>

            <div className="ks-tg">
              {testimonials.map((t, i) => (
                <Reveal key={i} dir="up" delay={i * 100}>
                  <div className="ks-tc">
                    <div className="ks-tc-stars">{"★".repeat(t.stars)}</div>
                    <p className="ks-tc-q">{t.quote}</p>
                    <div className="ks-tc-auth">
                      <span
                        className="ks-tc-av"
                        style={{ background: t.color }}
                      >
                        {t.initials}
                      </span>
                      <div>
                        <div className="ks-tc-nm">{t.name}</div>
                        <div className="ks-tc-rl">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="ks-cta">
          <div className="ks-cta-glow" />
          <div className="ks-cta-inner">
            {/* Left */}
            <Reveal dir="left" className="ks-cta-txt">
              <img
                src={logoTextImg}
                alt="KaamSaathi"
                className="ks-cta-logo"
              />
              <div className="ks-cta-btns">
                <Link to="/schedule-demo" className="ks-btn ks-btn-gold">
                  Book a Free Demo
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ks-btn ks-btn-ghost"
                >
                  <MessageCircle size={16} />
                  Contact Sales
                </a>
              </div>
              <div className="ks-cta-trust">
                <span>
                  <ShieldCheck size={14} /> 100% Secure Data
                </span>
                <span>
                  <Star size={14} /> 4.7★ Play Store
                </span>
                <span>
                  <WifiOff size={14} /> Offline Ready
                </span>
                <span>
                  <Users size={14} /> 10,000+ Contractors
                </span>
              </div>
            </Reveal>

            {/* Right */}
            <Reveal dir="right" className="ks-cta-vis">
              <img
                className="ks-cta-phone"
                src={closingDashboardImg}
                alt="KaamSaathi app dashboard"
              />
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}

// CSS Variables
const cssVars = {
  "--ks-gold": "#ffa51f",
  "--ks-gold-bright": "#ffe229",
  "--ks-gold-pale": "#edcfb5",
  "--ks-brown": "#9d542a",
  "--ks-brown-dk": "#6b3318",
  "--ks-brown-xdk": "#3d1a08",
  "--ks-ink": "#1c0d00",
  "--ks-ink-70": "rgba(28,13,0,.7)",
  "--ks-ink-40": "rgba(28,13,0,.4)",
  "--ks-surface": "#fffef8",
  "--ks-surface-2": "#fdf5e8",
  "--ks-surface-3": "#f5e4ca",
  "--ks-border": "rgba(157,84,42,.14)",
  "--ks-border-gold": "rgba(255,165,31,.32)",
};

// All styles scoped to .ks-home
const globalStyles = `
/* Font */
@import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Belleza&display=swap');

.ks-home {
  font-family: 'Belleza', sans-serif;
  background: var(--ks-surface);
  color: var(--ks-ink);
  overflow-x: hidden;
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}
.ks-home *,
.ks-home *::before,
.ks-home *::after { box-sizing: border-box; }
.ks-home h1,.ks-home h2,.ks-home h3 {
  font-family: 'Rozha One', serif;
  font-weight: 400;
}
.ks-home a { text-decoration: none; color: inherit; }
.ks-home img { max-width: 100%; display: block; }

/* Shared */
.ks-container { max-width: 1160px; margin: 0 auto; padding: 0 32px; }

.ks-tag {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 11px;
  letter-spacing: .08em;
  text-transform: uppercase;
  background: rgba(255,165,31,.14);
  color: var(--ks-brown);
  border: 1px solid var(--ks-border-gold);
}
.ks-tag--light {
  background: rgba(255,226,41,.1);
  color: var(--ks-gold-pale);
  border-color: rgba(255,226,41,.2);
}

.ks-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: 12px;
  font-family: 'Belleza', sans-serif;
  font-size: 16px;
  cursor: pointer;
  border: none;
  letter-spacing: .025em;
  line-height: 1;
  transition: all .22s cubic-bezier(.16,1,.3,1);
  position: relative;
  overflow: hidden;
  text-decoration: none;
}
.ks-btn:focus-visible {
  outline: 2.5px solid var(--ks-gold);
  outline-offset: 3px;
}
.ks-btn-gold {
  background: linear-gradient(135deg, var(--ks-gold), #e8940f);
  color: var(--ks-brown-xdk);
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(255,165,31,.35);
}
.ks-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,165,31,.45); }
.ks-btn-outline {
  background: transparent;
  color: var(--ks-brown);
  border: 2px solid var(--ks-brown-dk);
}
.ks-btn-outline:hover { background: var(--ks-surface-2); transform: translateY(-2px); }
.ks-btn-ghost {
  background: rgba(255,255,255,.1);
  color: var(--ks-gold-pale);
  border: 1.5px solid rgba(237,207,181,.22);
}
.ks-btn-ghost:hover { background: rgba(255,255,255,.18); transform: translateY(-2px); }

.ks-sec-head {
  text-align: center;
  max-width: 700px;
  margin: 0 auto 64px;
}
.ks-sec-head h2 {
  font-size: clamp(32px,4.5vw,50px);
  line-height: 1.06;
  letter-spacing: -.025em;
  margin: 14px 0;
  color: var(--ks-brown-xdk);
}
.ks-sec-head p { font-size: 17px; color: var(--ks-ink-70); line-height: 1.7; }

/* HERO */
.ks-hero {
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
  background: var(--ks-surface);
}

.ks-hero-bg { position: absolute; inset: 0; z-index: 0; }
.ks-hb-grid {
  position: absolute; inset: 0; opacity: .05;
  background-image: linear-gradient(var(--ks-brown) 1px,transparent 1px),
    linear-gradient(90deg,var(--ks-brown) 1px,transparent 1px);
  background-size: 72px 72px;
}
.ks-hb-rad1 {
  position: absolute; top: -15%; right: -8%; width: 72%; height: 105%;
  background: radial-gradient(ellipse at 60% 40%,rgba(255,226,41,.12) 0%,rgba(255,165,31,.05) 38%,transparent 65%);
}
.ks-hb-rad2 {
  position: absolute; bottom: -18%; left: -12%; width: 52%; height: 68%;
  background: radial-gradient(ellipse,rgba(237,207,181,.17) 0%,transparent 58%);
}
.ks-hb-stripes {
  position: absolute; inset: 0; opacity: .022;
  background-image: repeating-linear-gradient(45deg,var(--ks-brown) 0,var(--ks-brown) 1px,transparent 1px,transparent 42px);
}
.ks-hb-blob1 {
  position: absolute; width: 340px; height: 340px; border-radius: 50%;
  background: radial-gradient(circle,rgba(255,226,41,.09) 0%,transparent 68%);
  top: 18%; left: 38%;
  animation: ksBlobDrift 9s ease-in-out infinite;
}
.ks-hb-blob2 {
  position: absolute; width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle,rgba(255,165,31,.1) 0%,transparent 65%);
  top: 65%; left: 8%;
  animation: ksBlobDrift 11s ease-in-out infinite 2.5s;
}
@keyframes ksBlobDrift {
  0%,100%{transform:translate(0,0) scale(1)}
  33%{transform:translate(12px,-18px) scale(1.06)}
  66%{transform:translate(-8px,10px) scale(.95)}
}

/* CHANGE 1: padding-bottom 0 so hero has no space below the image */
.ks-hero-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 24px 32px 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: end;
}
@media(max-width:900px){ .ks-hero-inner{ grid-template-columns:1fr; gap:44px; align-items: center; } }

.ks-hero-live { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.ks-live-dot {
  width: 9px; height: 9px; border-radius: 50%; background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.28);
  animation: ksLivePulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes ksLivePulse {
  0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,.28)}
  50%{box-shadow:0 0 0 8px rgba(34,197,94,.07)}
}

.ks-hero-h1 {
  font-size: clamp(40px,5.5vw,72px);
  line-height: .98;
  letter-spacing: -.025em;
  color: var(--ks-brown-xdk);
  margin-bottom: 20px;
  display: block;
}
.ks-h1-gold { color: var(--ks-gold); display: block; }
.ks-h1-stroke {
  color: var(--ks-brown);
  display: block;
}

.ks-hero-sub {
  font-size: 18px;
  color: var(--ks-ink-70);
  line-height: 1.68;
  max-width: 480px;
  margin-bottom: 32px;
}
.ks-hero-acts { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
.ks-hero-trust {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 0 40px;
  border-top: 1px solid var(--ks-border);
}
.ks-avs { display: flex; }
.ks-av {
  width: 34px; height: 34px; border-radius: 50%;
  border: 2.5px solid var(--ks-surface);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #fff;
  margin-left: -9px;
  font-family: 'Rozha One', serif;
}
.ks-av:first-child { margin-left: 0; }
.ks-trust-txt { font-size: 13px; color: var(--ks-ink-70); line-height: 1.4; }
.ks-trust-txt strong { color: var(--ks-brown); }

/* CHANGE 2: hero-visual stretches full height, image sits at bottom */
.ks-hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  align-self: stretch;
}
.ks-hero-glow {
  position: absolute;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle,rgba(255,226,41,.28) 0%,transparent 65%);
  top: 20%; right: 10%;
  animation: ksOrbPulse 4.5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ksOrbPulse {
  0%,100%{transform:scale(1);opacity:.6}
  50%{transform:scale(1.18);opacity:1}
}

/* CHANGE 3: phone-wrap anchored to bottom, sized to hide cut legs */
.ks-phone-wrap {
  position: absolute;
  bottom: -30px;
  width: 100%;
  max-width: 400px;
  left: 50%;
  transform: translateX(-50%);
}
.ks-ph-main {
  width: 100%;
  display: block;
  animation: ksFloatY 6s ease-in-out infinite;
  filter: drop-shadow(0 32px 64px rgba(157,84,42,.22));
  margin-bottom: 0;
}
@keyframes ksFloatY {
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-10px)}
}
.ks-ph-badge {
  position: absolute;
  background: #fff;
  border-radius: 13px;
  padding: 10px 14px;
  box-shadow: 0 8px 32px rgba(157,84,42,.18);
  border: 1px solid var(--ks-border);
  display: flex; align-items: center; gap: 9px;
  z-index: 4;
  animation: ksFloatY 6s ease-in-out infinite;
  transition: transform .25s cubic-bezier(.16,1,.3,1);
  white-space: nowrap;
}
.ks-ph-badge:hover { transform: translateY(-4px); }
.ks-ph-badge--attendance { top: 12%; left: -10%; animation-delay: 1.8s; }
.ks-ph-badge--workers { top: 44%; right: -14%; animation-delay: .4s; }
.ks-ph-badge--payroll { bottom: 6%; left: -6%; animation-delay: 3.2s; }
.ks-ph-badge-ico {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.ks-ph-badge-ico--green { background: rgba(34,197,94,.13); color: #15803d; }
.ks-ph-badge-ico--blue { background: rgba(8,145,178,.13); color: #0891b2; }
.ks-ph-badge-ico--gold { background: rgba(255,165,31,.16); color: var(--ks-brown); }
.ks-ph-badge-title { font-size: 12px; font-weight: 700; color: var(--ks-ink); line-height: 1.3; }
.ks-ph-badge-sub {
  font-size: 10px; color: var(--ks-ink-40);
  display: flex; align-items: center; gap: 3px;
}
@media(max-width:520px){
  .ks-ph-badge { padding: 7px 10px; gap: 7px; }
  .ks-ph-badge-ico { width: 24px; height: 24px; }
  .ks-ph-badge-title { font-size: 10.5px; }
  .ks-ph-badge-sub { font-size: 9px; }
  .ks-ph-badge--attendance { left: -4%; }
  .ks-ph-badge--workers { right: -4%; }
  .ks-ph-badge--payroll { left: -2%; }
}

/* STATS */
.ks-stats {
  background: linear-gradient(135deg,var(--ks-brown-xdk) 0%,#260c03 50%,var(--ks-brown-xdk) 100%);
  position: relative; overflow: hidden;
}
.ks-stats-row {
  max-width: 1160px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4,1fr);
}
@media(max-width:700px){ .ks-stats-row{ grid-template-columns:repeat(2,1fr); } }
.ks-stat {
  padding: 48px 28px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,.08);
}
.ks-stat:last-child { border-right: none; }
.ks-stat-n {
  font-family: 'Rozha One', serif;
  font-size: clamp(34px,4.2vw,52px);
  color: var(--ks-gold);
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -.04em;
}
.ks-stat-lbl {
  font-size: 12px;
  color: rgba(237,207,181,.6);
  letter-spacing: .06em;
  text-transform: uppercase;
}

/* FEATURES */
.ks-features {
  background: var(--ks-surface-2);
  padding: 80px 0;
  position: relative; overflow: hidden;
}
.ks-feat-stack {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  gap: 80px;
}
.ks-feat-row-wrap { width: 100%; }
.ks-feat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.ks-feat-row--flip {
  direction: rtl;
}
.ks-feat-row--flip > * { direction: ltr; }
@media(max-width:760px){
  .ks-feat-row, .ks-feat-row--flip {
    grid-template-columns: 1fr;
    direction: ltr;
    gap: 28px;
  }
}
.ks-feat-img img {
  width: 100%; height: auto;
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(157,84,42,.15), 0 4px 16px rgba(0,0,0,.08);
  transition: transform .3s cubic-bezier(.16,1,.3,1);
}
.ks-feat-img img:hover { transform: translateY(-4px); }
.ks-feat-h {
  font-size: clamp(22px,2.5vw,34px);
  line-height: 1.1;
  letter-spacing: -.025em;
  color: var(--ks-brown-xdk);
  margin-bottom: 12px;
}
.ks-feat-p { font-size: 16px; color: var(--ks-ink-70); line-height: 1.7; margin-bottom: 20px; }
.ks-feat-pts { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.ks-feat-pts li {
  font-size: 15px; color: var(--ks-ink-70);
  display: flex; align-items: flex-start; gap: 10px; line-height: 1.5;
}
.ks-ck {
  width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(135deg,rgba(255,165,31,.22),rgba(255,226,41,.13));
  color: var(--ks-brown);
  font-size: 10px; font-weight: 900;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  margin-top: 2px;
  border: 1px solid var(--ks-border-gold);
}

/* MOBILE */
.ks-mobile {
  background: var(--ks-surface);
  padding: 80px 0;
}
.ks-mob-layout {
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
@media(max-width:860px){ .ks-mob-layout{ grid-template-columns:1fr; gap:44px; } }
.ks-mob-phones {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.ks-mob-p1 {
  width: 54%; border-radius: 24px;
  box-shadow: 0 28px 70px rgba(157,84,42,.22);
  border: 3px solid rgba(255,255,255,.88);
  z-index: 2; position: relative;
  animation: ksFloatY 7s ease-in-out infinite;
  max-height: 480px; object-fit: cover; object-position: top;
}
.ks-mob-p2 {
  width: 45%; border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0,0,0,.15);
  border: 2.5px solid rgba(255,255,255,.88);
  margin-left: -26px; margin-bottom: 22px;
  z-index: 1;
  animation: ksFloatY 7s ease-in-out infinite 1.3s;
  max-height: 400px; object-fit: cover; object-position: top;
}
.ks-mob-txt h2 {
  font-size: clamp(28px,4vw,46px);
  line-height: 1.06; letter-spacing: -.025em;
  color: var(--ks-brown-xdk);
  margin: 12px 0 14px;
}
.ks-mob-txt > p { font-size: 17px; color: var(--ks-ink-70); line-height: 1.7; margin-bottom: 28px; }
.ks-mob-feats { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
.ks-mf { display: flex; align-items: flex-start; gap: 14px; }
.ks-mf-ico {
  width: 38px; height: 38px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
  border: 1px solid var(--ks-border-gold);
}
.ks-mf-t { font-size: 15px; font-weight: 700; color: var(--ks-ink); letter-spacing: -.01em; margin-bottom: 2px; }
.ks-mf-d { font-size: 13px; color: var(--ks-ink-70); }

/* WHY */
.ks-why {
  background: linear-gradient(160deg,var(--ks-brown-xdk) 0%,#1a0700 50%,var(--ks-brown-dk) 100%);
  padding: 80px 0;
  position: relative; overflow: hidden;
}
.ks-why-conic {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 1000px; height: 1000px; border-radius: 50%;
  background: conic-gradient(from 0deg,transparent 0deg,rgba(255,226,41,.025) 18deg,transparent 36deg,rgba(255,165,31,.015) 80deg,transparent 100deg,rgba(255,226,41,.025) 160deg,transparent 200deg,rgba(255,165,31,.015) 260deg,transparent 280deg,rgba(255,226,41,.025) 340deg,transparent 360deg);
  pointer-events: none;
}
.ks-why-grid {
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
  display: grid; grid-template-columns: repeat(3,1fr); gap: 18px;
}
@media(max-width:860px){ .ks-why-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:560px){ .ks-why-grid{ grid-template-columns:1fr; } }
.ks-wc {
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(237,207,181,.09);
  border-radius: 22px;
  padding: 28px;
  transition: all .3s cubic-bezier(.16,1,.3,1);
}
.ks-wc:hover {
  background: rgba(255,255,255,.085);
  border-color: rgba(255,165,31,.28);
  transform: translateY(-3px);
}
.ks-wc-n {
  font-family: 'Rozha One', serif;
  font-size: 50px;
  color: rgba(255,226,41,.13);
  line-height: 1;
  margin-bottom: 13px;
  letter-spacing: -.05em;
}
.ks-wc h3 {
  font-family: 'Rozha One', serif;
  font-size: 18px;
  color: var(--ks-gold-pale);
  margin-bottom: 9px;
  line-height: 1.2;
}
.ks-wc p { font-size: 14px; color: rgba(237,207,181,.52); line-height: 1.7; }

/* TESTIMONIALS */
.ks-testi { background: var(--ks-surface-3); padding: 80px 0; }
.ks-tg {
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
  display: grid; grid-template-columns: repeat(3,1fr); gap: 20px;
}
@media(max-width:860px){ .ks-tg{ grid-template-columns:1fr 1fr; } }
@media(max-width:560px){ .ks-tg{ grid-template-columns:1fr; } }
.ks-tc {
  background: #fff;
  border: 1px solid var(--ks-border);
  border-radius: 22px;
  padding: 28px;
  transition: all .3s cubic-bezier(.16,1,.3,1);
  position: relative; overflow: hidden;
}
.ks-tc::before {
  content: '"';
  font-family: 'Rozha One', serif;
  font-size: 110px;
  color: rgba(255,165,31,.065);
  position: absolute;
  top: -22px; left: 8px;
  line-height: 1;
  pointer-events: none;
}
.ks-tc:hover { box-shadow: 0 14px 48px rgba(157,84,42,.11); transform: translateY(-3px); }
.ks-tc-stars { color: var(--ks-gold); font-size: 13px; margin-bottom: 13px; letter-spacing: 2px; }
.ks-tc-q { font-size: 15px; color: var(--ks-ink); line-height: 1.72; margin-bottom: 22px; position: relative; z-index: 1; }
.ks-tc-auth { display: flex; align-items: center; gap: 12px; }
.ks-tc-av {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Rozha One', serif; font-size: 13px; color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,.17);
}
.ks-tc-nm { font-size: 14px; font-weight: 700; color: var(--ks-ink); }
.ks-tc-rl { font-size: 12px; color: var(--ks-ink-40); }

/* CTA */
.ks-cta {
  background: linear-gradient(150deg,var(--ks-brown-xdk) 0%,#1d0800 42%,var(--ks-brown-dk) 100%);
  padding: 80px 0;
  position: relative; overflow: hidden;
}
.ks-cta-glow {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 900px; height: 900px;
  background: radial-gradient(ellipse,rgba(255,226,41,.09) 0%,transparent 54%);
  pointer-events: none;
}
.ks-cta-inner {
  position: relative; z-index: 1;
  max-width: 1160px; margin: 0 auto; padding: 0 32px;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
@media(max-width:860px){
  .ks-cta-inner{ grid-template-columns:1fr; text-align:center; gap:44px; }
}
.ks-cta-txt {
  display: flex; flex-direction: column;
  align-items: center; gap: 24px;
}
.ks-cta-logo { max-width: 240px; height: auto; }
.ks-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.ks-cta-trust {
  display: flex; flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  font-size: 13px;
  color: rgba(237,207,181,.7);
}
.ks-cta-trust span { display: flex; align-items: center; gap: 6px; }
.ks-cta-vis { display: flex; justify-content: center; align-items: center; }
.ks-cta-phone {
  width: 67%;
  border-radius: 22px;
  box-shadow: 0 36px 90px rgba(0,0,0,.4);
  border: 3px solid rgba(255,255,255,.14);
  animation: ksFloatY 7.5s ease-in-out infinite 2.2s;
}

/* REDUCED MOTION */
@media (prefers-reduced-motion: reduce) {
  .ks-home *,
  .ks-home *::before,
  .ks-home *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;