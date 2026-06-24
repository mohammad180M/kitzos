"use client";

import Link from "next/link";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedCategory, getLocalizedTool } from "@/lib/i18n/localized-data";

export default function Footer() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <Link href="/" className="text-lg font-bold text-gray-900 dark:text-gray-100">
            kitzos
          </Link>
          <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">{t.footer.tagline}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);
            const { name } = getLocalizedCategory(category, locale);

            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <Link
                    href={`/${category.id}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {name}
                  </Link>
                </h3>
                <ul className="mt-3 space-y-2">
                  {categoryTools.map((tool) => {
                    const { title } = getLocalizedTool(tool, locale);
                    return (
                      <li key={tool.slug}>
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        >
                          {title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t.footer.company}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about/"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {t.footer.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact/"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
            <h3 className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t.footer.legal}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/privacy/"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms/"
                  className="text-sm text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  {t.footer.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-400 dark:border-gray-800 dark:text-gray-500 sm:flex-row">
          <p>
            © {year} kitzos.com — {t.footer.copyright}
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link href="/privacy/" className="hover:text-primary-600 dark:hover:text-primary-400">
              {t.footer.privacyShort}
            </Link>
            <Link href="/terms/" className="hover:text-primary-600 dark:hover:text-primary-400">
              {t.footer.termsShort}
            </Link>
            <Link href="/about/" className="hover:text-primary-600 dark:hover:text-primary-400">
              {t.footer.about}
            </Link>
            <Link href="/contact/" className="hover:text-primary-600 dark:hover:text-primary-400">
              {t.footer.contact}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
