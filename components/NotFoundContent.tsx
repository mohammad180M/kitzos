"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import Footer from "@/components/Footer";

export default function NotFoundContent() {
  const { t } = useLocale();

  return (
    <>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
          {t.common.pageNotFound}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t.common.notFound}
        </h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">{t.common.notFoundDescription}</p>
        <Link href="/" className="btn-primary mt-8">
          {t.common.backHome}
        </Link>
      </div>
      <Footer />
    </>
  );
}
