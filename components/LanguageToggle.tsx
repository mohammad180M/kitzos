"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LanguageToggle() {
  const { locale, toggleLocale, t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const label =
    mounted && locale === "ar" ? t.header.switchToEnglish : t.header.switchToArabic;

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      aria-label={mounted ? label : "Toggle language"}
      title={mounted ? label : undefined}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{mounted ? (locale === "ar" ? "EN" : "ع") : ""}</span>
    </button>
  );
}
