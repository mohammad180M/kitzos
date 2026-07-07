import { Shield } from "lucide-react";
import type { CategoryId } from "@/lib/categories";
import { categoryColorVar } from "@/lib/category-colors";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";

interface PrivacyBadgeProps {
  locale: Locale;
  category: CategoryId;
}

export default function PrivacyBadge({ locale, category }: PrivacyBadgeProps) {
  const t = getDictionary(locale);
  const color = categoryColorVar(category);

  return (
    <p
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-secondary"
      role="status"
    >
      <Shield className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
      <span>{t.tool.privacyBadge}</span>
    </p>
  );
}
