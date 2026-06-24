import type { Dictionary, Locale } from "./types";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

const dictionaries: Record<Locale, Dictionary> = {
  en: en as Dictionary,
  ar: ar as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
