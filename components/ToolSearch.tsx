"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ToolSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  autoFocus?: boolean;
  variant?: "default" | "command";
}

const ToolSearch = forwardRef<HTMLInputElement, ToolSearchProps>(function ToolSearch(
  { value, onChange, className = "", autoFocus = false, variant = "default" },
  ref
) {
  const { t } = useLocale();
  const isCommand = variant === "command";

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted ${
          isCommand ? "h-5 w-5" : "h-5 w-5"
        }`}
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="text"
        role="searchbox"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.home.searchPlaceholder}
        className={
          isCommand
            ? "h-14 w-full rounded-lg border border-line bg-surface py-0 ps-12 pe-24 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent sm:h-16 sm:text-lg"
            : "input-field w-full py-3 ps-10 pe-10 text-base"
        }
        aria-label={t.home.searchAria}
        aria-keyshortcuts="Control+K Meta+K"
        dir="auto"
        autoFocus={autoFocus}
        autoComplete="off"
      />
      {isCommand && !value && (
        <kbd
          className="font-mono-label pointer-events-none absolute end-4 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface-2 px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted sm:inline"
          aria-hidden="true"
        >
          {t.home.searchShortcut}
        </kbd>
      )}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={`absolute top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            isCommand ? "end-4" : "end-3"
          }`}
          aria-label={t.home.clearSearch}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

export default ToolSearch;
