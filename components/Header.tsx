"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/categories";
import { getIcon } from "@/lib/icons";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-primary-600"
        >
          kitzos
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Categories">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const isActive = pathname === `/${category.id}` || pathname === `/${category.id}/`;

            return (
              <Link
                key={category.id}
                href={`/${category.id}`}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">{category.name}</span>
                <span className="md:hidden">{category.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
