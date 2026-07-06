/** Ads must not run on localhost — avoids console errors and invalid ad requests in dev. */
export function shouldShowAds(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
}

export const ADSTERRA_BASE = "https://www.highperformanceformat.com";

export const AD_SLOTS = {
  /** 728×90 — desktop tool pages */
  leaderboard: {
    key: "be99973789442c187177a617496a5a3d",
    width: 728,
    height: 90,
  },
  /** 300×100 — mobile tool pages */
  mobileBanner: {
    key: "ce00b16f9b4abbe952a8f483da743b02",
    width: 300,
    height: 100,
  },
} as const;
