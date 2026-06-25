export interface AdsterraUnit {
  key: string;
  width: number;
  height: number;
}

/** 320×50 — mobile / small screens */
export const MOBILE_BANNER: AdsterraUnit = {
  key: "22be2ac6f0881ed577b6d91adc90d886",
  width: 320,
  height: 50,
};

/** 728×90 — tablet and desktop */
export const DESKTOP_BANNER: AdsterraUnit = {
  key: "be99973789442c187177a617496a5a3d",
  width: 728,
  height: 90,
};

export const ADSTERRA_INVOKE_BASE = "https://www.highperformanceformat.com";

/** Tailwind `md` breakpoint — matches site layout */
export const DESKTOP_AD_MIN_WIDTH = 768;
