export interface PageRef {
  fileId: string;
  pageIndex: number;
}

export interface FilePageMeta {
  id: string;
  pageCount: number;
}

export function buildGroupedPageOrder(files: FilePageMeta[]): PageRef[] {
  const order: PageRef[] = [];
  for (const file of files) {
    for (let i = 0; i < file.pageCount; i++) {
      order.push({ fileId: file.id, pageIndex: i });
    }
  }
  return order;
}

export function pageRefsEqual(a: PageRef, b: PageRef): boolean {
  return a.fileId === b.fileId && a.pageIndex === b.pageIndex;
}

export function pageOrdersEqual(a: PageRef[], b: PageRef[]): boolean {
  return a.length === b.length && a.every((ref, i) => pageRefsEqual(ref, b[i]));
}

export function reorderPageOrder(order: PageRef[], fromIndex: number, toIndex: number): PageRef[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= order.length) {
    return order;
  }
  const next = [...order];
  const [item] = next.splice(fromIndex, 1);
  const clampedTo = Math.max(0, Math.min(toIndex, next.length));
  next.splice(clampedTo, 0, item);
  return next;
}

export function removeFileFromPageOrder(order: PageRef[], fileId: string): PageRef[] {
  return order.filter((ref) => ref.fileId !== fileId);
}

export const MERGE_FILE_COLORS = [
  "var(--cat-pdf)",
  "var(--cat-image)",
  "var(--cat-text)",
  "var(--cat-dev)",
  "var(--cat-converters)",
  "var(--cat-calculators)",
  "var(--cat-audio)",
  "var(--cat-vision)",
  "var(--cat-misc)",
] as const;

export function mergeFileColor(colorIndex: number): string {
  return MERGE_FILE_COLORS[colorIndex % MERGE_FILE_COLORS.length];
}
