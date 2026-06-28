"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { converterToolsAr, converterToolsEn, type ConverterToolKey } from "@/lib/i18n/converter-tools";

export function useConverterToolLabels<K extends ConverterToolKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? converterToolsAr[key] : converterToolsEn[key];
}
