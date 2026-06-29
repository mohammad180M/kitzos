export const ADSENSE_CLIENT = "ca-pub-2890911389961532";

/** AdSense must not run on localhost — avoids console errors and invalid ad requests in dev. */
export function shouldShowAds(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
}

export const AD_SLOTS = {
  /** 728×90 Leaderboard — desktop tool pages */
  leaderboard: "1502747956",
  /** 320×100 — mobile tool pages */
  mobileBanner: "3114325793",
} as const;
