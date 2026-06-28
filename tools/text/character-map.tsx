"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  type CharacterCategory,
  filterCharacters,
  groupByCategory,
} from "@/lib/character-symbols";
import { useTextToolLabels } from "@/lib/i18n/use-text-tool-labels";

const CATEGORY_ORDER: CharacterCategory[] = [
  "currency",
  "arrows",
  "math",
  "symbols",
  "stars",
  "checkmarks",
  "punctuation",
  "legal",
  "latin",
  "arabic",
];

export default function CharacterMap() {
  const t = useTextToolLabels("characterMap");
  const [query, setQuery] = useState("");
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const filtered = useMemo(() => filterCharacters(query), [query]);
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  const copyChar = async (char: string) => {
    try {
      await navigator.clipboard.writeText(char);
      setCopiedChar(char);
      setTimeout(() => setCopiedChar(null), 1500);
    } catch {
      // ignored
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{t.clickToCopy}</p>

      <label className="block">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.search}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="input-field mt-1 w-full"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.noResults}</p>
      ) : (
        CATEGORY_ORDER.map((category) => {
          const items = grouped[category];
          if (!items?.length) return null;
          return (
            <div key={category}>
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.categories[category]}
              </h3>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                {items.map((entry) => {
                  const isCopied = copiedChar === entry.char;
                  return (
                    <button
                      key={`${category}-${entry.char}`}
                      type="button"
                      onClick={() => void copyChar(entry.char)}
                      title={entry.tags.join(", ")}
                      className={`flex h-10 items-center justify-center rounded-lg border text-lg transition-colors ${
                        isCopied
                          ? "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                          : "border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : entry.char}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {copiedChar && (
        <p className="text-sm text-primary-600 dark:text-primary-400">
          {t.copied} <span className="font-mono">{copiedChar}</span>
        </p>
      )}
    </div>
  );
}
