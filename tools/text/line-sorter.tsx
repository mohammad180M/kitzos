"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/CopyButton";
import { useToolDraft } from "@/lib/hooks/use-tool-draft";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

type SortMode = "asc" | "desc" | "random";

function sortLines(lines: string[], mode: SortMode): string[] {
  const copy = [...lines];
  switch (mode) {
    case "asc":
      return copy.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    case "desc":
      return copy.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: "base" }));
    case "random":
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
  }
}

export default function LineSorter() {
  const t = useTextToolLabels("lineSorter");
  const [input, setInput] = useToolDraft("input", "");
  const [mode, setMode] = useState<SortMode>("asc");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  const output = useMemo(() => {
    let lines = input.split("\n");
    if (removeDuplicates) {
      const seen = new Set<string>();
      lines = lines.filter((line) => {
        if (seen.has(line)) return false;
        seen.add(line);
        return true;
      });
    }
    return sortLines(lines, mode).join("\n");
  }, [input, mode, removeDuplicates, mode === "random" ? shuffleKey : 0]);

  const lineCount = input ? input.split("\n").length : 0;

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.input}</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          rows={8}
          className="input-field mt-1 w-full resize-y font-mono text-sm"
        />
      </label>

      <div className="flex flex-wrap gap-1 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-800">
        {(
          [
            { value: "asc" as const, label: t.sortAsc },
            { value: "desc" as const, label: t.sortDesc },
            { value: "random" as const, label: t.sortRandom },
          ] as const
        ).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              if (value === "random") setShuffleKey((k) => k + 1);
            }}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === value
                ? "bg-primary-600 text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={removeDuplicates}
          onChange={(e) => setRemoveDuplicates(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        {t.removeDuplicates}
      </label>

      {input && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.result}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.lineCount}: {lineCount}
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="input-field w-full resize-y font-mono text-sm bg-gray-50 dark:bg-gray-800/50"
          />
          <CopyButton text={output} className="mt-2" />
        </div>
      )}
    </div>
  );
}
