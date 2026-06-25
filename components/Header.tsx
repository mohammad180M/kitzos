"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/routing";
import CategoryMenu from "@/components/CategoryMenu";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";

export default function Header() {
  const { locale } = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={localizedPath(locale, "/")}
          className="text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-primary-600 dark:text-gray-100 dark:hover:text-primary-400"
        >
          kitzos
        </Link>

        <div className="flex items-center gap-2">
          <CategoryMenu />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
