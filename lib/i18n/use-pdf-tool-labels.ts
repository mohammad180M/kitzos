"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pdfToolsAr, pdfToolsEn, type PdfToolKey } from "@/lib/i18n/pdf-tools";

export function usePdfToolLabels<K extends PdfToolKey>(key: K) {
  const { locale } = useLocale();
  const pack = locale === "ar" ? pdfToolsAr : pdfToolsEn;
  return { ...pack.shared, ...pack[key] };
}
