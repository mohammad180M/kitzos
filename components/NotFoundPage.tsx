"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import NotFoundContent from "@/components/NotFoundContent";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { LangHtmlAttributes } from "@/lib/i18n/LangHtmlAttributes";
import { parseLocaleFromPath } from "@/lib/i18n/routing";
import { DEFAULT_LOCALE } from "@/lib/i18n/types";

export default function NotFoundPage() {
  const pathname = usePathname();
  const parsed = parseLocaleFromPath(pathname);
  const locale = parsed?.locale ?? DEFAULT_LOCALE;

  return (
    <LocaleProvider initialLocale={locale}>
      <LangHtmlAttributes />
      <Header />
      <main className="flex-1">
        <NotFoundContent />
      </main>
    </LocaleProvider>
  );
}
