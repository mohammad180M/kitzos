"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { devToolsExtraAr, devToolsExtraEn, type DevToolsExtraKey } from "@/lib/i18n/dev-tools-extra";

export function useDevToolsExtraLabels<K extends DevToolsExtraKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? devToolsExtraAr[key] : devToolsExtraEn[key];
}
