"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

function replaceAll(text: string, find: string, replacement: string, useRegex: boolean): { result: string; count: number; error: boolean } {
  if (!find) return { result: text, count: 0, error: false };
  try {
    if (useRegex) {
      const re = new RegExp(find, "g");
      const matches = text.match(re);
      return { result: text.replace(re, replacement), count: matches?.length ?? 0, error: false };
    }
    const parts = text.split(find);
    return { result: parts.join(replacement), count: parts.length - 1, error: false };
  } catch {
    return { result: text, count: 0, error: true };
  }
}

export default function FindAndReplace() {
  const t = useTextToolLabels("findAndReplace");
  const [input, setInput] = useToolDraft("input", "");
  const [find, setFind] = useToolDraft("find", "");
  const [replacement, setReplacement] = useToolDraft("replace", "");
  const [useRegex, setUseRegex] = useState(false);

  const { result, count, error } = useMemo(
    () => replaceAll(input, find, replacement, useRegex),
    [input, find, replacement, useRegex]
  );

  const applyReplace = () => {
    if (!find || error) return;
    setInput(result);
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={6}
          className="input-field mt-1 w-full resize-y"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.find}</span>
          <input
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder={t.findPlaceholder}
            className="input-field mt-1 w-full font-mono"
            dir="ltr"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.replace}</span>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder={t.replacePlaceholder}
            className="input-field mt-1 w-full font-mono"
            dir="ltr"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={useRegex}
          onChange={(e) => setUseRegex(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        {t.useRegex}
      </label>

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{t.invalidRegex}</p>
      ) : find && input ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={applyReplace} disabled={!find || count === 0} className="btn-secondary">
              {t.replaceAll}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.matches}: <strong className="text-gray-900 dark:text-gray-100">{count}</strong>
            </span>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
            <textarea
              value={result}
              readOnly
              rows={6}
              className="input-field mt-1 w-full resize-y bg-gray-50 dark:bg-gray-800/50"
            />
            <CopyButton text={result} className="mt-2" />
          </div>
        </>
      ) : null}
    </div>
  );
}
