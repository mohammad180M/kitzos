"use client";

import { Link2, Unlink2 } from "lucide-react";

interface AspectRatioConnectorProps {
  connected: boolean;
  onToggle: () => void;
  lockedLabel: string;
  unlockedLabel: string;
}

/**
 * Toggle that links/unlinks width & height (aspect lock).
 * Clear icon + color change so locked vs unlocked is obvious.
 */
export default function AspectRatioConnector({
  connected,
  onToggle,
  lockedLabel,
  unlockedLabel,
}: AspectRatioConnectorProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={connected}
      aria-label={connected ? lockedLabel : unlockedLabel}
      title={connected ? lockedLabel : unlockedLabel}
      className={[
        "group flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        "motion-reduce:transition-none",
        connected
          ? "border-[var(--cat-image)]/40 bg-[var(--cat-image)]/10 text-[var(--cat-image)] hover:bg-[var(--cat-image)]/15"
          : "border-[var(--line)] bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]",
      ].join(" ")}
    >
      {connected ? (
        <Link2 className="h-4 w-4 transition-transform duration-150 group-active:scale-90" aria-hidden="true" />
      ) : (
        <Unlink2 className="h-4 w-4 transition-transform duration-150 group-active:scale-90" aria-hidden="true" />
      )}
    </button>
  );
}
