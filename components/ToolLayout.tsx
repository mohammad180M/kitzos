import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Tool } from "@/lib/registry";
import type { FaqItem, HowToStep } from "@/lib/seo";
import {
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
  generateToolBreadcrumbs,
} from "@/lib/seo";
import AdSlot from "./AdSlot";
import FaqAccordion from "./FaqAccordion";
import ToolCard from "./ToolCard";
import Footer from "./Footer";

interface ToolLayoutProps {
  tool: Tool;
  howTo: HowToStep[];
  faqs: FaqItem[];
  relatedTools: Tool[];
  children: React.ReactNode;
}

export default function ToolLayout({
  tool,
  howTo,
  faqs,
  relatedTools,
  children,
}: ToolLayoutProps) {
  const breadcrumbs = generateToolBreadcrumbs(tool);
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const softwareSchema = generateSoftwareApplicationSchema(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.url} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-gray-900" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.url.replace("https://kitzos.com", "")}
                    className="hover:text-primary-600"
                  >
                    {crumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {tool.title}
          </h1>
          <p className="mt-2 text-lg text-gray-600">{tool.description}</p>
        </header>

        <div className="card mb-8">{children}</div>

        <AdSlot className="mb-10" />

        <section className="mb-10" aria-labelledby="how-to-heading">
          <h2 id="how-to-heading" className="text-xl font-semibold text-gray-900">
            How to use
          </h2>
          <ol className="mt-4 space-y-4">
            {howTo.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mb-10">
          <FaqAccordion faqs={faqs} />
        </div>

        {relatedTools.length > 0 && (
          <section className="mb-10" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-gray-900">
              Related tools
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {relatedTools.map((related) => (
                <ToolCard key={related.slug} tool={related} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </>
  );
}
