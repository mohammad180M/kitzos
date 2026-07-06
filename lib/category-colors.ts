import type { CategoryId } from "./categories";

/** Category accent colors — consistent across chips, card spines, footer dots. */
export const CATEGORY_COLORS: Record<CategoryId, string> = {
  pdf: "var(--cat-pdf)",
  image: "var(--cat-image)",
  text: "var(--cat-text)",
  dev: "var(--cat-dev)",
  calculators: "var(--cat-calculators)",
  converters: "var(--cat-converters)",
  misc: "var(--cat-misc)",
  audio: "var(--cat-audio)",
  vision: "var(--cat-vision)",
};

export function categoryColorVar(id: CategoryId): string {
  return CATEGORY_COLORS[id];
}
