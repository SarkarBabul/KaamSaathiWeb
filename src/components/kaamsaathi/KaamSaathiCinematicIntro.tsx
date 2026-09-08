import { useEffect, useState } from "react";
import logoTextImg from "@/assets/Logo(Text).png";
import {
  introPlayback,
  introSequenceShouldRun,
} from "@/pages/kaamsaathi/heroIntroConfig";

// ─────────────────────────────────────────────────────────────────────────────
// KaamSaathi cinematic intro
//
// Replaces the old horizontal split / curtain reveal completely. The real
// homepage renders underneath; this fixed overlay blurs + subdues it, brings
// the existing KaamSaathi wordmark up in the exact centre, runs a short
// branded loading bar, then dramatically scales ONLY the wordmark toward the
// viewer — the camera travels through the letters — while the blur lifts and
// the sharp homepage is revealed. Then it unmounts itself.
//
// Sequence:  BLURRED PAGE → CENTRE LOGO → LOGO ENTRANCE → LOADING BAR →
//            ZOOM INTO TEXT → PASS THROUGH TEXT → SHARP HOMEPAGE
//
// It never runs on a reload from mid-page — the gate (`introSequenceShouldRun`)
// is the same scroll-position logic the old reveal used, so "reload at the
// very top" still works and nothing else re-triggers it.
// ─────────────────────────────────────────────────────────────────────────────

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Phase = "enter" | "loading" | "zoom" | "reveal" | "done";

// milliseconds from mount → when each phase begins
const FULL: Record<Exclude<Phase, "enter">, number> = {
  loading: 600,
  zoom: 1460,
  reveal: 2150,
  done: 2980,
};
const REDUCED: Record<Exclude<Phase, "enter">, number> = {
  loading: 180,
  zoom: 560,
  reveal: 560,
  done: 1000,
};

export function KaamSaathiCinematicIntro() {
  // Both decided once, synchronously, so the overlay is on the very first
  // paint (no flash of the un-blurred page) and its timing never changes.
  const [active] = useState(() => introSequenceShouldRun());
  const [reduced] = useState(prefersReducedMotion);
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    if (!active) return;

    // Anchor to the top and freeze the page behind the veil for the intro.
    window.scrollTo(0, 0);
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const at = reduced ? REDUCED : FULL;
    const timers = [
      window.setTimeout(() => setPhase("loading"), at.loading),
      window.setTimeout(() => setPhase("zoom"), at.zoom),
      window.setTimeout(() => {
        setPhase("reveal");
        // Hand the page back: navbar fades in, page becomes interactive.
        introPlayback.finish();
        body.style.overflow = prevOverflow;
      }, at.reveal),
      window.setTimeout(() => setPhase("done"), at.done),
    ];

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      body.style.overflow = prevOverflow;
    };
  }, [active, reduced]);

  if (!active || phase === "done") return null;

  const stateClass = `is-${phase}`;

  return (
    <div
      className={`ks-cine ${stateClass}${reduced ? " is-reduced" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <style>{cineStyles}</style>

      {/* Only this stage is zoomed — the blurred homepage stays put. */}
      <div className="ks-cine-stage">
        <div className="ks-cine-glow" />
        <div className="ks-cine-mark-wrap">
          <img
            src={logoTextImg}
            alt="KaamSaathi"
            className="ks-cine-mark"
            draggable={false}
          />
          <span className="ks-cine-sweep" aria-hidden="true" />
        </div>
      </div>

      <div className="ks-cine-bar" aria-hidden="true">
        <span className="ks-cine-bar-fill" />
      </div>
    </div>
  );
}

const cineStyles = `
.ks-cine {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  overflow: hidden;
  /* subtle darken/subdue so the wordmark is the focus */
  background-color: rgba(24, 12, 2, 0.22);
  /* The blur radius is CONSTANT — never animated (animating a backdrop
     blur re-blurs the whole viewport every frame and stutters badly).
     Phase 5 reveals the page by compositor-fading the whole layer's
     opacity instead, which the GPU handles smoothly. */
  -webkit-backdrop-filter: blur(24px) saturate(0.92) brightness(0.96);
  backdrop-filter: blur(24px) saturate(0.92) brightness(0.96);
  opacity: 1;
  transform: translateZ(0);
  will-change: opacity;
  touch-action: none;
  overscroll-behavior: none;
  transition: opacity 760ms cubic-bezier(0.33, 0, 0.15, 1);
}

/* No backdrop-filter support → denser opaque veil instead of a blur. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .ks-cine { background-color: rgba(20, 9, 0, 0.9); }
}

/* PHASE 5 — the blurred veil lifts as the camera passes through the letters */
.ks-cine.is-reveal {
  opacity: 0;
  pointer-events: none;
}

/* ── The zoom stage: exact centre, only this element scales ── */
.ks-cine-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  transform-origin: center center;
  display: grid;
  place-items: center;
  /* Promoted to its own GPU layer from mount so the zoom is a pure
     compositor transform (no per-frame raster). No animated filter here —
     that was forcing a full repaint at growing size every frame. */
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* PHASE 4 — cinematic zoom: controlled start, smooth acceleration toward the
   viewer; the stage fades out mid-flight so the camera "passes through".
   transform + opacity only → runs entirely on the compositor thread. */
.ks-cine.is-zoom .ks-cine-stage,
.ks-cine.is-reveal .ks-cine-stage {
  transform: translate(-50%, -50%) scale(19);
  opacity: 0;
  transition:
    transform 1440ms cubic-bezier(0.42, 0, 0.72, 0.32),
    opacity 760ms cubic-bezier(0.4, 0, 1, 1) 540ms;
}

/* ── The wordmark (reused asset + proportions from the old reveal) ── */
.ks-cine-mark-wrap {
  position: relative;
  display: inline-block;
  line-height: 0;
}
.ks-cine-mark {
  width: clamp(150px, 27vw, 264px);
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  /* Resting state. PHASE 2's entrance is a one-shot keyframe (no fill),
     so once it finishes the mark carries no filter at all — nothing for
     the zoom to repaint. */
  opacity: 1;
  transform: scale(1);
  animation: ksCineMarkIn 680ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes ksCineMarkIn {
  0%   { opacity: 0; transform: scale(0.9);  filter: blur(10px); }
  60%  { opacity: 1; }
  100% { opacity: 1; transform: scale(1);    filter: blur(0); }
}

/* subtle one-pass light sweep across the wordmark as the loader starts */
.ks-cine-sweep {
  position: absolute;
  inset: -6% -12%;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 244, 214, 0.55) 50%,
    transparent 60%
  );
  mix-blend-mode: screen;
  transform: translateX(-115%);
}
.ks-cine.is-loading .ks-cine-sweep {
  animation: ksCineSweep 880ms cubic-bezier(0.4, 0, 0.2, 1) 40ms 1 forwards;
}
@keyframes ksCineSweep {
  0%   { opacity: 0;   transform: translateX(-115%); }
  18%  { opacity: 0.9; }
  82%  { opacity: 0.9; }
  100% { opacity: 0;   transform: translateX(115%); }
}

/* soft glow behind the mark; scales with the stage during the zoom */
.ks-cine-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(68vw, 500px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 226, 41, 0.18) 0%,
    rgba(255, 165, 31, 0.07) 42%,
    transparent 70%
  );
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
}
.ks-cine.is-enter .ks-cine-glow,
.ks-cine.is-loading .ks-cine-glow,
.ks-cine.is-zoom .ks-cine-glow,
.ks-cine.is-reveal .ks-cine-glow {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  transition:
    opacity 720ms ease,
    transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* PHASE 3 — thin branded loading bar under the wordmark */
.ks-cine-bar {
  position: absolute;
  left: 50%;
  top: 61%;
  transform: translateX(-50%);
  width: clamp(116px, 17vw, 180px);
  height: 2px;
  border-radius: 2px;
  background: rgba(255, 236, 202, 0.16);
  overflow: hidden;
  opacity: 0;
  transition: opacity 380ms ease;
}
.ks-cine.is-loading .ks-cine-bar { opacity: 1; }
.ks-cine.is-zoom .ks-cine-bar,
.ks-cine.is-reveal .ks-cine-bar {
  opacity: 0;
  transition: opacity 240ms ease;
}
.ks-cine-bar-fill {
  display: block;
  height: 100%;
  width: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffa51f, #ffe229);
  box-shadow: 0 0 10px rgba(255, 210, 120, 0.5);
  transform: scaleX(0);
  transform-origin: left center;
}
.ks-cine.is-loading .ks-cine-bar-fill {
  animation: ksCineFill 860ms cubic-bezier(0.45, 0, 0.15, 1) forwards;
}
@keyframes ksCineFill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* ── prefers-reduced-motion: no zoom, no sweep — just gentle fades ── */
.ks-cine.is-reduced .ks-cine-mark {
  animation: none;
}
.ks-cine.is-reduced .ks-cine-sweep { display: none; }
.ks-cine.is-reduced .ks-cine-stage,
.ks-cine.is-reduced.is-zoom .ks-cine-stage,
.ks-cine.is-reduced.is-reveal .ks-cine-stage {
  transform: translate(-50%, -50%) scale(1);
  transition: opacity 380ms ease;
}
.ks-cine.is-reduced.is-zoom .ks-cine-stage,
.ks-cine.is-reduced.is-reveal .ks-cine-stage { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .ks-cine-mark { animation: none; }
  .ks-cine-sweep { display: none; }
  .ks-cine-stage,
  .ks-cine.is-zoom .ks-cine-stage,
  .ks-cine.is-reveal .ks-cine-stage {
    transform: translate(-50%, -50%) scale(1);
    transition: opacity 380ms ease;
  }
  .ks-cine.is-zoom .ks-cine-stage,
  .ks-cine.is-reveal .ks-cine-stage { opacity: 0; }
  .ks-cine-glow {
    transition: opacity 320ms ease;
    transform: translate(-50%, -50%) scale(1);
  }
  .ks-cine-bar-fill { animation-duration: 200ms; }
}
`;
