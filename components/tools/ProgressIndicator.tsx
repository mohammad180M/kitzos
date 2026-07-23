"use client";

import { Loader2 } from "lucide-react";

export interface ProgressIndicatorProps {
  /** Short status text, e.g. "Compressing…" or "Converting your file…" */
  label: string;
  /**
   * Determinate progress 0–100. Omit (or pass `undefined`) for indeterminate mode
   * when exact progress is unknown.
   */
  value?: number;
  className?: string;
  /** When false, renders nothing (convenient for conditional mounting). Default true. */
  active?: boolean;
}

/**
 * Shared processing progress UI for tools.
 * - Indeterminate: pulsing bar + spinner + label
 * - Determinate: filled bar + label with percentage
 */
export default function ProgressIndicator({
  label,
  value,
  className = "",
  active = true,
}: ProgressIndicatorProps) {
  if (!active) return null;

  const determinate = typeof value === "number" && Number.isFinite(value);
  const pct = determinate ? Math.min(100, Math.max(0, Math.round(value))) : 0;

  return (
    <div
      className={`space-y-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      {...(determinate
        ? {
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            "aria-valuenow": pct,
          }
        : {})}
    >
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
        {determinate ? (
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200 ease-out"
            style={{ width: `${pct}%` }}
          />
        ) : (
          <div className="h-full w-full animate-pulse rounded-full bg-[var(--accent)]/50" />
        )}
      </div>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-[var(--muted)]">
        {!determinate && (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--accent)]" aria-hidden="true" />
        )}
        <span>
          {label}
          {determinate ? ` ${pct}%` : ""}
        </span>
      </p>
    </div>
  );
}
