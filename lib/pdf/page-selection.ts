/** Format 1-based page numbers as a compact range string (e.g. [1,2,4] → "1-2,4"). */
export function formatPageSelection(pages: number[]): string {
  if (pages.length === 0) return "";
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      parts.push(start === end ? `${start}` : `${start}-${end}`);
      start = end = sorted[i];
    }
  }
  parts.push(start === end ? `${start}` : `${start}-${end}`);
  return parts.join(",");
}

/** Parse a range string into 1-based page numbers; returns null if invalid. */
export function parsePageSelection(input: string, pageCount: number): Set<number> | null {
  const trimmed = input.trim();
  if (!trimmed) return new Set();

  const pages = new Set<number>();

  for (const part of trimmed.split(",")) {
    const segment = part.trim();
    if (!segment) continue;

    if (segment.includes("-")) {
      const [startStr, endStr] = segment.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start || start > pageCount) {
        return null;
      }
      for (let i = start; i <= Math.min(end, pageCount); i++) pages.add(i);
    } else {
      const page = parseInt(segment, 10);
      if (isNaN(page) || page < 1 || page > pageCount) return null;
      pages.add(page);
    }
  }

  return pages.size > 0 ? pages : new Set();
}
