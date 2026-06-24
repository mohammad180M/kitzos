export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "kitzos-lang";

export interface Dictionary {
  common: {
    home: string;
    new: string;
    copy: string;
    copied: string;
    download: string;
    clear: string;
    generate: string;
    search: string;
    viewAll: string;
    ad: string;
    notFound: string;
    notFoundDescription: string;
    pageNotFound: string;
    backHome: string;
  };
  header: {
    categoriesAria: string;
    switchToArabic: string;
    switchToEnglish: string;
  };
  home: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchAria: string;
    clearSearch: string;
    noResults: string;
  };
  tool: {
    howToUse: string;
    relatedTools: string;
    faq: string;
    breadcrumbAria: string;
  };
  footer: {
    tagline: string;
    company: string;
    legal: string;
    about: string;
    contact: string;
    privacy: string;
    privacyShort: string;
    terms: string;
    termsShort: string;
    copyright: string;
  };
  legal: {
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
    aboutTitle: string;
    aboutDescription: string;
    contactTitle: string;
    contactDescription: string;
    lastUpdated: string;
  };
}
