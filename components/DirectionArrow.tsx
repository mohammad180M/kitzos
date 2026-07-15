/**
 * Directional arrow for "from → to" / CTA trail markers.
 * Uses → and flips under RTL so the arrow always points toward the target
 * in reading order (never hardcode →/← inside locale strings).
 */
export default function DirectionArrow({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block translate-y-px rtl:-scale-x-100 ${className}`}
    >
      →
    </span>
  );
}

/** Noun A → Noun B with an arrow that flips in RTL. */
export function DirectionPair({
  from,
  to,
  className = "",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{from}</span>
      <DirectionArrow />
      <span>{to}</span>
    </span>
  );
}
