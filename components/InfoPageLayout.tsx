import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Footer from "@/components/Footer";
import type { ReactNode } from "react";

interface InfoPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function InfoPageLayout({
  title,
  description,
  children,
}: InfoPageLayoutProps) {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <li className="flex items-center gap-1">
              <Link
                href="/"
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
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
