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
  "arrows",
  "math",
  "currency",
  "symbols",
  "stars",
  "checkmarks",
  "punctuation",
  "shapes",
  "numbers",
  "emoji",
  "techMac",
  "techWindows",
  "techAndroid",
  "legal",
  "latin",
  "arabic",
];

type TabId = "all" | CharacterCategory;

export default function CharacterMap() {
  const t = useTextToolLabels("characterMap");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const isSearching = query.trim().length > 0;

  const filtered = useMemo(() => filterCharacters(query), [query]);

  const visible = useMemo(() => {
    if (isSearching || activeTab === "all") return filtered;
    return filtered.filter((entry) => entry.category === activeTab);
  }, [filtered, activeTab, isSearching]);

  const grouped = useMemo(() => groupByCategory(visible), [visible]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: t.allCategories },
    ...CATEGORY_ORDER.map((id) => ({ id, label: t.categories[id] })),
  ];

  const copyChar = async (char: string) => {
    try {
      await navigator.clipboard.writeText(char);
      setCopiedChar(char);
      setTimeout(() => setCopiedChar(null), 1500);
    } catch {
      // ignored
    }
  };

  const renderGrid = (category: CharacterCategory, items: typeof visible) => (
    <div key={category}>
      {(isSearching || activeTab === "all") && (
        <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.categories[category]}
        </h3>
      )}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
        {items.map((entry) => {
          const isCopied = copiedChar === entry.char;
          const isWide = entry.char.length > 2;
          return (
            <button
              key={`${category}-${entry.char}`}
              type="button"
              onClick={() => void copyChar(entry.char)}
              title={entry.tags.join(", ")}
              className={`flex min-h-10 items-center justify-center rounded-lg border px-1 transition-colors ${
                isWide ? "col-span-2 text-[10px] font-medium sm:text-xs" : "text-lg"
              } ${
                isCopied
                  ? "border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600 dark:hover:bg-gray-700"
              }`}
            >
              {isCopied ? <Check className="h-4 w-4" aria-hidden /> : entry.char}
            </button>
          );
        })}
      </div>
    </div>
  );

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

      {!isSearching && (
        <nav
          aria-label={t.categoriesNav}
          className="-mx-1 flex gap-1 overflow-x-auto pb-1 scrollbar-thin"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t.noResults}</p>
      ) : isSearching || activeTab === "all" ? (
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category];
            if (!items?.length) return null;
            return renderGrid(category, items);
          })}
        </div>
      ) : (
        renderGrid(activeTab, visible)
      )}

      {copiedChar && (
        <p className="text-sm text-primary-600 dark:text-primary-400" role="status">
          {t.copied} <span className="font-mono">{copiedChar}</span>
        </p>
      )}
    </div>
  );
}
