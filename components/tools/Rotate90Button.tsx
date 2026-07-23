"use client";

import { RotateCw } from "lucide-react";

/** Advance a quarter-turn angle: 0 → 90 → 180 → 270 → 0. */
export function nextQuarterTurn(deg: number): number {
  return (((Math.round(deg) % 360) + 360 + 90) % 360);
}

interface Rotate90ButtonProps {
  /** Current cumulative angle (0 / 90 / 180 / 270). */
  degrees: number;
  onRotate: () => void;
  /** e.g. "Rotate 90°" / "تدوير 90°" */
  label: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Single control that adds 90° per click and shows the current angle.
 * Icon stays clockwise in LTR and RTL (content rotation is absolute).
 * Angle numeral uses dir="ltr" so "90°" stays readable in Arabic UI.
 */
export default function Rotate90Button({
  degrees,
  onRotate,
  label,
  className = "",
  disabled = false,
}: Rotate90ButtonProps) {
  const shown = ((Math.round(degrees) % 360) + 360) % 360;

  return (
    <button
      type="button"
      onClick={onRotate}
      disabled={disabled}
      className={`btn-secondary inline-flex items-center gap-2 ${className}`}
      aria-label={`${label} (${shown}°)`}
    >
      <RotateCw className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
      <span className="tabular-nums font-semibold text-[var(--text)]" dir="ltr">
        {shown}°
      </span>
    </button>
  );
}
