"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

/** Escape text for HTML element bodies and quoted attribute values. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface MetaTagFields {
  title: string;
  description: string;
  url: string;
  image: string;
}

/**
 * Build meta tags once — no duplicate `<meta name="title">`, no repeated title passes.
 * Standard SEO: one `<title>`, plus OG / Twitter copies for social platforms.
 */
export function buildMetaTags({ title, description, url, image }: MetaTagFields): string {
  const t = title.trim();
  const d = description.trim();
  const u = url.trim();
  const img = image.trim();

  if (!t && !d && !u && !img) return "";

  const et = escapeHtml(t);
  const ed = escapeHtml(d);
  const eu = escapeHtml(u);
  const ei = escapeHtml(img);

  const lines: string[] = [];

  // Document basics (each value emitted once)
  if (t) lines.push(`<title>${et}</title>`);
  if (d) lines.push(`<meta name="description" content="${ed}" />`);
  if (u) lines.push(`<link rel="canonical" href="${eu}" />`);

  // Open Graph
  lines.push(`<meta property="og:type" content="website" />`);
  if (u) lines.push(`<meta property="og:url" content="${eu}" />`);
  if (t) lines.push(`<meta property="og:title" content="${et}" />`);
  if (d) lines.push(`<meta property="og:description" content="${ed}" />`);
  if (img) lines.push(`<meta property="og:image" content="${ei}" />`);

  // Twitter Card
  lines.push(
    `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}" />`
  );
  if (t) lines.push(`<meta name="twitter:title" content="${et}" />`);
  if (d) lines.push(`<meta name="twitter:description" content="${ed}" />`);
  if (img) lines.push(`<meta name="twitter:image" content="${ei}" />`);

  return lines.join("\n");
}

export default function MetaTagGenerator() {
  const labels = useDevToolsExtraLabels("metaTagGenerator");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");

  const output = useMemo(
    () => buildMetaTags({ title, description, url, image }),
    [title, description, url, image]
  );

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels.title}</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={labels.placeholderTitle}
          className="input-field mt-1 w-full"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {labels.description}
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={labels.placeholderDescription}
          rows={3}
          className="input-field mt-1 w-full resize-y"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels.url}</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={labels.placeholderUrl}
          className="input-field ltr-input mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{labels.image}</span>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder={labels.placeholderImage}
          className="input-field ltr-input mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      {output && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels.output}
          </label>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="input-field ltr-input mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
            spellCheck={false}
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
