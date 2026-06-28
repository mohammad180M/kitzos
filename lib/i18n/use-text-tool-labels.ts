"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { textToolsAr, textToolsEn, type TextToolKey } from "@/lib/i18n/text-tools";

export function useTextToolLabels<K extends TextToolKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? textToolsAr[key] : textToolsEn[key];
}
