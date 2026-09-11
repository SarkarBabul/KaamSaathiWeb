import { createElement, useEffect, useRef, useState, type ComponentPropsWithoutRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

type FadeContentProps<T extends ElementType> = {
  as?: T;
  /** Adds a soft blur-to-sharp resolve alongside the fade. */
  blur?: boolean;
  /** ms; kept short — this is a workspace, not a marketing page. */
  duration?: number;
  /** 0–1 fraction of the element visible before it fires. */
  threshold?: number;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

// Same intent as ReactBits' FadeContent — reveal below-the-fold sections as
// the user scrolls to them — reimplemented on IntersectionObserver instead
// of GSAP + ScrollTrigger: this project has neither dependency, and a
// one-shot observer callback is cheaper than a scroll-driven tween library
// for a single opacity/blur transition. Fires once, respects
// prefers-reduced-motion (renders visible immediately), and never re-hides
// content that has already appeared.
export function FadeContent<T extends ElementType = "div">({
  as,
  blur = true,
  duration = 500,
  threshold = 0.15,
  className,
  style,
  children,
  ...rest
}: FadeContentProps<T>) {
  const ref = useRef<Element>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return createElement(
    as ?? "div",
    {
      ...rest,
      ref,
      style: {
        opacity: visible ? 1 : 0,
        filter: blur ? (visible ? "blur(0px)" : "blur(8px)") : undefined,
        transition: `opacity ${duration}ms ease-out, filter ${duration}ms ease-out`,
        willChange: "opacity, filter",
        ...(style as object),
      },
      className: cn(className),
    },
    children,
  );
}
