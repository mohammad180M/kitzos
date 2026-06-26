"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { generateBreadcrumbSchema, generateInfoBreadcrumbs } from "@/lib/seo";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { localizedPath } from "@/lib/i18n/routing";
import JsonLd from "./JsonLd";
import Footer from "./Footer";

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  pagePath: string;
  children: ReactNode;
}

export default function InfoPageLayout({
  title,
  description,
  pagePath,
  children,
}: InfoPageLayoutProps) {
  const { locale, t } = useLocale();
  const breadcrumbSchema = generateBreadcrumbSchema(
    generateInfoBreadcrumbs(locale, title, pagePath)
  );

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label={t.tool.breadcrumbAria} className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center gap-1">
              <Link
                href={localizedPath(locale, "/")}
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                {t.common.home}
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span className="font-medium text-gray-900 dark:text-gray-100" aria-current="page">
                {title}
              </span>
            </li>
          </ol>
        </nav>

        <header className="mb-10 border-b border-gray-200 pb-8 dark:border-gray-800">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </header>

        <article className="info-prose">{children}</article>
      </div>
      <Footer />
    </>
  );
}
