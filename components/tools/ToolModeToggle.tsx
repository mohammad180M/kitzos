"use client";

import type { ToolMode } from "./BatchUploader";
import { useBatchLabels } from "@/lib/i18n/use-batch-labels";

interface ToolModeToggleProps {
  mode: ToolMode;
  onChange: (mode: ToolMode) => void;
}

/** Single file / Batch tab switcher for tools. */
export default function ToolModeToggle({ mode, onChange }: ToolModeToggleProps) {
  const labels = useBatchLabels();

  return (
    <div
      className="inline-flex w-full rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-1 sm:w-auto"
      role="tablist"
      aria-label={labels.batchMode}
    >
      {(
        [
          { id: "single" as const, label: labels.singleFile },
          { id: "batch" as const, label: labels.batchMode },
        ] as const
      ).map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          onClick={() => onChange(id)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
            mode === id
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
