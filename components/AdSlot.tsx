interface AdSlotProps {
  className?: string;
  format?: "horizontal" | "rectangle";
}

export default function AdSlot({
  className = "",
  format = "horizontal",
}: AdSlotProps) {
  const heightClass =
    format === "rectangle" ? "min-h-[250px]" : "min-h-[90px]";

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 ${heightClass} ${className}`}
      role="complementary"
      aria-label="Advertisement"
      data-ad-slot="placeholder"
    >
      <span className="text-xs font-medium uppercase tracking-wider text-gray-300 dark:text-gray-600">
        ad
      </span>
    </div>
  );
}
