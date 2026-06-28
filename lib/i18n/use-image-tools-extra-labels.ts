"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  imageToolsExtraAr,
  imageToolsExtraEn,
  type ImageToolsExtraKey,
} from "@/lib/i18n/image-tools-extra";

export function useImageToolsExtraLabels<K extends ImageToolsExtraKey>(key: K) {
  const { locale } = useLocale();
  return locale === "ar" ? imageToolsExtraAr[key] : imageToolsExtraEn[key];
}

export function useImageToolsSharedLabels() {
  const { locale } = useLocale();
  return locale === "ar" ? imageToolsExtraAr.shared : imageToolsExtraEn.shared;
}
