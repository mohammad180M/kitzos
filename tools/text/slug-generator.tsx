"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SlugGenerator() {
  const t = useTextToolLabels("slugGenerator");
  const [input, setInput] = useToolDraft("input", "");

  const slug = useMemo(() => slugify(input), [input]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          className="input-field mt-1 w-full"
        />
      </label>

      {input.trim() ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.result}</p>
          <p className="mt-1 font-mono text-lg font-medium text-primary-600 dark:text-primary-400" dir="ltr">
            {slug || "—"}
          </p>
          {slug && <CopyButton text={slug} className="mt-3" />}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.empty}</p>
      )}
    </div>
  );
}
