import { forwardRef, useCallback, type CSSProperties, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

export interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  /** A slow ambient sweep along the border — reserve for one "attention" card per page. */
  ambient?: boolean;
  /** Lift + accent shadow on hover, for cards that are themselves clickable. */
  lift?: boolean;
  /** Omit the standard white surface (border/radius/shadow) when composing onto another surface. */
  bare?: boolean;
  /** Entrance stagger index; each step adds 45ms (capped so long lists never crawl). */
  index?: number;
}

const STAGGER_MS = 45;
const STAGGER_CAP = 10;

export function enterDelay(index: number | undefined): CSSProperties | undefined {
  if (index === undefined) return undefined;
  return { ["--ks-delay" as string]: `${Math.min(index, STAGGER_CAP) * STAGGER_MS}ms` };
}

// Writes the pointer position into two custom properties the `.ks-glow`
// pseudo-elements read — the only JS involved in the effect.
export function useGlowPointer() {
  return useCallback((event: PointerEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--ks-gx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--ks-gy", `${event.clientY - rect.top}px`);
  }, []);
}

export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(function GlowCard(
  { ambient, lift, bare, index, className, style, onPointerMove, children, ...rest },
  ref,
) {
  const track = useGlowPointer();
  return (
    <div
      ref={ref}
      {...rest}
      onPointerMove={(e) => {
        track(e);
        onPointerMove?.(e);
      }}
      style={{ ...enterDelay(index), ...style }}
      className={cn(
        "ks-glow",
        !bare && "ks-surface",
        lift && "ks-surface--hover",
        ambient && "ks-glow--ambient",
        index !== undefined && "ks-enter",
        className,
      )}
    >
      {children}
    </div>
  );
});
