"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { audioToolsAr, audioToolsEn, type AudioToolKey } from "@/lib/i18n/audio-tools";

export function useAudioToolLabels<K extends AudioToolKey>(key: K) {
  const { locale } = useLocale();
  const pack = locale === "ar" ? audioToolsAr : audioToolsEn;
  return { ...pack.shared, ...pack[key] };
}
