"use client";

import { useMemo } from "react";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

function countWordFrequency(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  const words = text.trim().split(/\s+/).filter(Boolean);
  for (const raw of words) {
    const word = raw.toLowerCase().replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, "");
    if (!word) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
}

export default function WordFrequencyCounter() {
  const t = useTextToolLabels("wordFrequency");
  const [text, setText] = useToolDraft("input", "");

  const { rows, totalWords, uniqueWords } = useMemo(() => {
    const freq = countWordFrequency(text);
    const rows = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([word, count]) => ({ word, count }));
    const totalWords = rows.reduce((sum, r) => sum + r.count, 0);
    return { rows, totalWords, uniqueWords: rows.length };
  }, [text]);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          rows={6}
          className="input-field mt-1 w-full resize-y"
        />
      </label>

      {text.trim() ? (
        <>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {t.totalWords}: <strong className="text-gray-900 dark:text-gray-100">{totalWords}</strong>
            </span>
            <span>
              {t.uniqueWords}: <strong className="text-gray-900 dark:text-gray-100">{uniqueWords}</strong>
            </span>
          </div>

          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-2 text-start font-medium text-gray-700 dark:text-gray-300">{t.word}</th>
                    <th className="px-4 py-2 text-end font-medium text-gray-700 dark:text-gray-300">{t.count}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rows.map(({ word, count }) => (
                    <tr key={word} className="bg-white dark:bg-gray-900">
                      <td className="px-4 py-2 font-mono">{word}</td>
                      <td className="px-4 py-2 text-end font-medium text-primary-600 dark:text-primary-400">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.noWords}</p>
          )}
        </>
      ) : null}
    </div>
  );
}
