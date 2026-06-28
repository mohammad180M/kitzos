"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { calcToolsAr, calcToolsEn, type CalcToolKey } from "@/lib/i18n/calc-tools";

export function useCalcToolLabels<K extends CalcToolKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? calcToolsAr[key] : calcToolsEn[key];
}
