import Link from "next/link";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-8">
          <Link href="/" className="text-lg font-bold text-gray-900">
            kitzos
          </Link>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Free online tools that run in your browser. No signup, no uploads to
            our servers — your files stay private.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const categoryTools = getToolsByCategory(category.id);

            return (
              <div key={category.id}>
                <h3 className="text-sm font-semibold text-gray-900">
                  <Link
                    href={`/${category.id}`}
                    className="hover:text-primary-600"
                  >
                    {category.name}
                  </Link>
                </h3>
                <ul className="mt-3 space-y-2">
                  {categoryTools.map((tool) => (
                    <li key={tool.slug}>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                      >
                        {tool.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          © {year} kitzos.com — Free online tools
        </div>
      </div>
    </footer>
  );
}
