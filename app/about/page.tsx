import type { Metadata } from "next";
import Link from "next/link";
import InfoPageLayout from "@/components/InfoPageLayout";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/registry";
import { getInfoPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = getInfoPageMetadata(
  "About",
  "Learn what kitzos is — free, privacy-first online tools that run entirely in your browser.",
  "/about"
);

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About kitzos"
      description="Free tools that respect your privacy and your time."
    >
      <p>
        kitzos is a collection of free online tools for everyday tasks — merging PDFs, compressing
        images, formatting JSON, counting words, and more. Everything is built to run{" "}
        <strong>entirely in your web browser</strong>, without sending your files to our servers.
      </p>

      <h2>Why kitzos exists</h2>
      <p>
        Many online tools ask you to upload sensitive documents or create an account before you can
        do something simple. kitzos takes the opposite approach: open a tool, get the job done, and
        leave. No signup walls, no waiting for uploads, and no wondering where your data ended up.
      </p>

      <h2>Privacy and speed by design</h2>
      <p>
        When you use a kitzos tool, your PDFs, images, and text are processed on your device using
        modern browser APIs. We don&apos;t operate a backend that receives or stores that content.
        That means faster workflows for you and a smaller privacy footprint — your files stay with
        you.
      </p>
      <p>
        The site may show ads to help keep the tools free. Advertising is provided by third parties
        (such as Google AdSense) and is separate from how the tools themselves work. See our{" "}
        <a href="/privacy/">Privacy Policy</a> for details.
      </p>

      <h2>What we offer</h2>
      <p>
        Tools are organized into four categories. Each category groups related utilities so you can
        find what you need quickly:
      </p>

      <div className="space-y-6 !mt-8">
        {categories.map((category) => {
          const categoryTools = getToolsByCategory(category.id);
          return (
            <div
              key={category.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <h3 className="!pt-0 text-lg font-semibold text-gray-900 dark:text-gray-100">
                <Link
                  href={`/${category.id}/`}
                  className="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  {category.name}
                </Link>
              </h3>
              <p className="mt-1 text-sm">{category.description}</p>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {categoryTools.map((tool) => (
                  <li key={tool.slug} className="list-none">
                    <Link
                      href={`/tools/${tool.slug}/`}
                      className="text-sm text-primary-600 hover:underline dark:text-primary-400"
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

      <h2>A note on accuracy</h2>
      <p>
        We work to keep tools reliable and useful, but software has limits. Always double-check
        important output — especially for legal, medical, or financial documents. kitzos is a
        practical utility, not a certified professional service.
      </p>

      <h2>Get in touch</h2>
      <p>
        Have feedback, a bug report, or an idea for a new tool? We&apos;d like to hear from you on
        our <a href="/contact/">Contact</a> page.
      </p>
    </InfoPageLayout>
  );
}
