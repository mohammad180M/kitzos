"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

const DIACRITICS_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

function removeDiacritics(text: string): string {
  return text.replace(DIACRITICS_RE, "");
}

export default function ArabicDiacriticsRemover() {
  const t = useTextToolLabels("arabicDiacritics");
  const [input, setInput] = useToolDraft("input", "");

  const output = useMemo(() => removeDiacritics(input), [input]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t.hint}</p>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={6}
          className="input-field mt-1 w-full resize-y"
          dir="rtl"
        />
      </label>

      {input && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="input-field mt-1 w-full resize-y bg-gray-50 dark:bg-gray-800/50"
            dir="rtl"
          />
          <CopyButton text={output} className="mt-2" disabled={!output} />
        </div>
      )}
    </div>
  );
}
