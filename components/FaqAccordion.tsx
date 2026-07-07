"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/seo";

interface FaqAccordionProps {
  faqs: FaqItem[];
  title?: string;
}

export default function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-xl font-semibold text-foreground">
        {title}
      </h2>

      <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question}>
              <button
                type="button"
                id={`faq-button-${index}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${index}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                hidden={!isOpen}
                className="px-5 pb-4"
              >
                <p className="text-sm leading-relaxed text-muted">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
