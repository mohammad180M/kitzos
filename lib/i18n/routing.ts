import { DEFAULT_LOCALE, LOCALES, type Locale } from "./types";

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Build a locale-prefixed path (trailing slash preserved). */
export function localizedPath(locale: Locale, path: string): string {
  if (path === "/" || path === "") {
    return `/${locale}/`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `/${locale}${withSlash}`;
}

export function parseLocaleFromPath(pathname: string): {
  locale: Locale;
  path: string;
} | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const maybeLocale = segments[0];
  if (!isValidLocale(maybeLocale)) return null;

  const rest = segments.slice(1);
  if (rest.length === 0) {
    return { locale: maybeLocale, path: "/" };
  }

  const path = `/${rest.join("/")}/`;
  return { locale: maybeLocale, path };
}

export function switchLocalePath(pathname: string, newLocale: Locale): string {
  const parsed = parseLocaleFromPath(pathname);
  if (!parsed) {
    return localizedPath(newLocale, "/");
  }
  return localizedPath(newLocale, parsed.path);
}

export function getDefaultLocaleFromBrowser(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  try {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    if (langs.some((l) => l.toLowerCase().startsWith("ar"))) {
      return "ar";
    }
  } catch {
    // ignored
  }
  return DEFAULT_LOCALE;
}
