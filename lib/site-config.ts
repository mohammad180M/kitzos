/**
 * Site-wide placeholders — search the project for these values and replace before publishing.
 */
export const CONTACT_EMAIL = "contact@kitzos.com";

/** @replace Set to the date you last revised the legal pages (e.g. "June 24, 2026"). */
export const LEGAL_LAST_UPDATED = "June 28, 2026";

export const INFO_PAGES = [
  { path: "/privacy", title: "Privacy Policy" },
  { path: "/terms", title: "Terms of Service" },
  { path: "/about", title: "About" },
  { path: "/contact", title: "Contact" },
] as const;
