import type { Metadata } from "next";

/** Canonical favicon paths (generated from icon-512.png in scripts/generate-assets.ts). */
export const SITE_ICON_PATHS = {
  favicon: "/favicon.ico",
  icon48: "/icon-48.png",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  apple: "/apple-touch-icon.png",
} as const;

/**
 * Site-wide icon metadata for Next.js.
 * Google Search prefers ≥48×48 PNG declared first; .ico via shortcut only.
 */
export function getSiteIconsMetadata(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: SITE_ICON_PATHS.icon48, sizes: "48x48", type: "image/png" },
      { url: SITE_ICON_PATHS.icon192, sizes: "192x192", type: "image/png" },
      { url: SITE_ICON_PATHS.icon512, sizes: "512x512", type: "image/png" },
    ],
    shortcut: SITE_ICON_PATHS.favicon,
    apple: {
      url: SITE_ICON_PATHS.apple,
      sizes: "180x180",
      type: "image/png",
    },
  };
}
