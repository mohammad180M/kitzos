"use client";

import { Search, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
}

export default function ToolSearch({
  value,
  onChange,
  className = "",
  autoFocus = false,
}: ToolSearchProps) {
  const { t } = useLocale();

  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <input
        type="text"
        role="searchbox"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.home.searchPlaceholder}
        className="input-field w-full py-3 ps-10 pe-10 text-base"
        aria-label={t.home.searchAria}
        dir="auto"
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label={t.home.clearSearch}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
