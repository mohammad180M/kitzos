/**
 * Master switch for on-page ad slots.
 * Set NEXT_PUBLIC_ADS_ENABLED=true to render AdSlot (still no network until a provider is wired).
 * Defaults to false — no layout space, no scripts, no requests.
 */
export const ADS_ENABLED =
  process.env.NEXT_PUBLIC_ADS_ENABLED === "true" ||
  process.env.NEXT_PUBLIC_ADS_ENABLED === "1";
