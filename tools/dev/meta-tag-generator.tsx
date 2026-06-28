"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useDevToolsExtraLabels } from "@/lib/i18n/use-dev-tools-extra-labels";

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export default function MetaTagGenerator() {
  const t = useDevToolsExtraLabels("metaTagGenerator");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");

  const output = useMemo(() => {
    if (!title && !description && !url && !image) return "";

    const lines: string[] = [];
    if (title) {
      lines.push(`<title>${escapeAttr(title)}</title>`);
      lines.push(`<meta name="title" content="${escapeAttr(title)}" />`);
    }
    if (description) {
      lines.push(`<meta name="description" content="${escapeAttr(description)}" />`);
    }
    if (url) {
      lines.push(`<link rel="canonical" href="${escapeAttr(url)}" />`);
      lines.push(`<meta property="og:url" content="${escapeAttr(url)}" />`);
    }
    if (title) {
      lines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`);
    }
    if (description) {
      lines.push(`<meta property="og:description" content="${escapeAttr(description)}" />`);
    }
    if (image) {
      lines.push(`<meta property="og:image" content="${escapeAttr(image)}" />`);
      lines.push(`<meta name="twitter:card" content="summary_large_image" />`);
      lines.push(`<meta name="twitter:image" content="${escapeAttr(image)}" />`);
    }
    if (title) {
      lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`);
    }
    if (description) {
      lines.push(`<meta name="twitter:description" content="${escapeAttr(description)}" />`);
    }
    lines.push(`<meta property="og:type" content="website" />`);

    return lines.join("\n");
  }, [title, description, url, image]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.title}</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.placeholderTitle}
          className="input-field mt-1 w-full"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.description}</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.placeholderDescription}
          rows={3}
          className="input-field mt-1 w-full resize-y"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.url}</span>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.placeholderUrl}
          className="input-field mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.image}</span>
        <input
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder={t.placeholderImage}
          className="input-field mt-1 w-full font-mono text-sm"
          dir="ltr"
        />
      </label>
      {output && (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.output}</label>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="input-field mt-1 w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
            dir="ltr"
            spellCheck={false}
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
