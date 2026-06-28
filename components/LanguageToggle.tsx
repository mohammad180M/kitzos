"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getToolSlugFromPath, toolImageSessionKey } from "@/lib/hooks/use-tool-draft";
import { switchLocalePath } from "@/lib/i18n/routing";
import type { Locale } from "@/lib/i18n/types";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const nextLocale: Locale = locale === "en" ? "ar" : "en";
  const label =
    mounted && locale === "ar" ? t.header.switchToEnglish : t.header.switchToArabic;

  const handleClick = () => {
    const toolSlug = getToolSlugFromPath(pathname);
    if (toolSlug) {
      try {
        const hasImage = sessionStorage.getItem(toolImageSessionKey(toolSlug));
        if (hasImage) {
          const msg =
            locale === "ar"
              ? "تبديل اللغة سيمسح الصورة المرفوعة. هل تريد المتابعة؟"
              : "Switching language will clear the uploaded image. Continue?";
          if (!window.confirm(msg)) return;
        }
      } catch {
        // ignored
      }
    }

    setLocale(nextLocale);
    router.push(switchLocalePath(pathname, nextLocale));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      aria-label={mounted ? label : "Toggle language"}
      title={mounted ? label : undefined}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{mounted ? (locale === "ar" ? "EN" : "ع") : ""}</span>
    </button>
  );
}
