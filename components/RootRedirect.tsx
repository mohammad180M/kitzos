"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/i18n/types";
import { getDefaultLocaleFromBrowser } from "@/lib/i18n/routing";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    let target: Locale = DEFAULT_LOCALE;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored === "ar" || stored === "en") {
        target = stored;
      } else {
        target = getDefaultLocaleFromBrowser();
      }
    } catch {
      target = getDefaultLocaleFromBrowser();
    }
    router.replace(`/${target}/`);
  }, [router]);

  return null;
}
