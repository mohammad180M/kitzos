"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { searchTools, type Tool } from "@/lib/registry";
import ToolCard from "./ToolCard";

interface SearchBarProps {
  tools?: Tool[];
  onResultsChange?: (results: Tool[]) => void;
  placeholder?: string;
  showResults?: boolean;
  className?: string;
}

export default function SearchBar({
  tools: initialTools,
  onResultsChange,
  placeholder = "Search tools…",
  showResults = false,
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const filtered = searchTools(query);
    onResultsChange?.(filtered);
    return filtered;
  }, [query, onResultsChange]);

  const displayTools = initialTools ?? results;

  return (
    <div className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-10 pr-10 py-3 text-base"
          aria-label="Search tools"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && query && (
        <div className="mt-4">
          {displayTools.length > 0 ? (
            <p className="mb-3 text-sm text-gray-500">
              {displayTools.length} tool{displayTools.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          ) : (
            <p className="text-sm text-gray-500">No tools found for &quot;{query}&quot;</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {displayTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { searchTools };
