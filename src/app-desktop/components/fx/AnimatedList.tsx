import { createElement, type ComponentPropsWithoutRef, type ElementType } from "react";
import { cn } from "@/lib/utils";
import { enterDelay } from "@/app-desktop/components/fx/GlowCard";

type AnimatedItemProps<T extends ElementType> = {
  as?: T;
  /** Position in the list — drives the capped stagger. */
  index: number;
  /** Adds the shared hover treatment (tint + 2px slide) for row-like items. */
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "index">;

// One entrance recipe for every list, ledger, table row and message in the
// workspace: keyed rows animate in once when they first mount, so a filter
// that reveals new records shows them arriving while untouched rows stay
// put. Works as a <tr> too, which is why it's polymorphic.
export function AnimatedItem<T extends ElementType = "div">({
  as,
  index,
  interactive,
  className,
  style,
  ...rest
}: AnimatedItemProps<T>) {
  return createElement(as ?? "div", {
    ...rest,
    style: { ...enterDelay(index), ...(style as object) },
    className: cn(
      "ks-enter",
      interactive &&
        "transition-[background-color,transform] duration-200 hover:bg-[hsl(var(--accent)/0.045)] motion-safe:hover:translate-x-0.5",
      className,
    ),
  });
}
