type ThemeName = "light" | "dark";

function getMaxRevealRadius(x: number, y: number): number {
  return Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
}

function setRevealOrigin(x: number, y: number): void {
  const root = document.documentElement;
  root.style.setProperty("--theme-transition-x", `${x}px`);
  root.style.setProperty("--theme-transition-y", `${y}px`);
  root.style.setProperty("--theme-transition-r", `${getMaxRevealRadius(x, y)}px`);
}

function clearRevealOrigin(): void {
  const root = document.documentElement;
  root.style.removeProperty("--theme-transition-x");
  root.style.removeProperty("--theme-transition-y");
  root.style.removeProperty("--theme-transition-r");
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Switch theme with a circular View Transition reveal from the click point.
 * Falls back to an instant switch when unsupported or reduced motion is preferred.
 */
export function toggleThemeWithTransition(
  setTheme: (theme: ThemeName) => void,
  nextTheme: ThemeName,
  clickX: number,
  clickY: number
): void {
  const applyTheme = () => setTheme(nextTheme);

  if (prefersReducedMotion() || typeof document.startViewTransition !== "function") {
    applyTheme();
    return;
  }

  setRevealOrigin(clickX, clickY);

  const transition = document.startViewTransition(() => {
    applyTheme();
  });

  void transition.finished.finally(clearRevealOrigin);
}
