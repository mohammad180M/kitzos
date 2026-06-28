"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { miscToolsExtraAr, miscToolsExtraEn, type MiscToolsExtraKey } from "@/lib/i18n/misc-tools-extra";

export function useMiscToolsExtraLabels<K extends MiscToolsExtraKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? miscToolsExtraAr[key] : miscToolsExtraEn[key];
}
