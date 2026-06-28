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
 * Order matters: Google Search prefers ≥48×48 PNG declared first.
 */
export function getSiteIconsMetadata(): NonNullable<Metadata["icons"]> {
  return {
    icon: [
      { url: SITE_ICON_PATHS.icon48, sizes: "48x48", type: "image/png" },
      { url: SITE_ICON_PATHS.icon192, sizes: "192x192", type: "image/png" },
      { url: SITE_ICON_PATHS.icon512, sizes: "512x512", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: SITE_ICON_PATHS.favicon, sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: SITE_ICON_PATHS.favicon,
    apple: {
      url: SITE_ICON_PATHS.apple,
      sizes: "180x180",
      type: "image/png",
    },
  };
}
