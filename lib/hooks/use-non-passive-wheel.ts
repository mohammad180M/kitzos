import { useEffect, useRef, type RefObject } from "react";

/**
 * Native wheel listener with `{ passive: false }`.
 * React's `onWheel` is passive, so `preventDefault()` is ignored and the page scrolls
 * while zooming canvas-based tools.
 */
export function useNonPassiveWheel<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onWheel: (e: WheelEvent) => void,
  enabled = true
) {
  const onWheelRef = useRef(onWheel);
  onWheelRef.current = onWheel;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const listener = (e: WheelEvent) => {
      onWheelRef.current(e);
    };

    el.addEventListener("wheel", listener, { passive: false });
    return () => el.removeEventListener("wheel", listener);
  }, [ref, enabled]);
}
