"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { useCommonLabels } from "@/lib/i18n/use-common-labels";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";
import { useUnsavedWork } from "@/lib/unsaved-work";

export default function MarkdownToHtml() {
  const labels = useCommonLabels();
  const t = useTextToolLabels("markdownToHtml");
  const [markdown, setMarkdown] = useState("# Hello\n\nWrite **Markdown** here.");
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  useUnsavedWork(markdown.trim().length > 0);

  useEffect(() => {
    let cancelled = false;

    async function convert() {
      if (!markdown.trim()) {
        if (!cancelled) setHtml("");
        return;
      }

      const [{ marked }, { default: DOMPurify }] = await Promise.all([
        import("marked"),
        import("dompurify"),
      ]);

      marked.setOptions({ gfm: true, breaks: true });
      const raw = marked.parse(markdown) as string;
      if (!cancelled) setHtml(DOMPurify.sanitize(raw));
    }

    convert();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  const copyHtml = async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="md-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.markdown}
          </label>
          <textarea
            id="md-input"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={14}
            className="input-field ltr-input mt-1 resize-y font-mono text-sm"
            spellCheck={false}
            placeholder={t.placeholder}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.htmlPreview}</label>
          <div
            className="mt-1 max-h-[22rem] min-h-[22rem] overflow-auto rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 [&_a]:text-primary-600 dark:[&_a]:text-primary-400 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 dark:[&_code]:bg-gray-700 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{
              __html: html || `<p class='text-gray-400 dark:text-gray-500'>${t.previewEmpty}</p>`,
            }}
          />
        </div>
      </div>

      <button type="button" onClick={copyHtml} disabled={!html} className="btn-secondary">
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {labels.copied}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {t.copyHtml}
          </>
        )}
      </button>
    </div>
  );
}
