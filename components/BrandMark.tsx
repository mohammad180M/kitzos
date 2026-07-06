/** 4×4px amber indicator — micro-brand mark for wordmarks and section headers. */
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1 w-1 shrink-0 bg-accent ${className}`}
      aria-hidden="true"
    />
  );
}
