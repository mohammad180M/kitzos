/** Parse JSON without throwing on null, empty, or malformed input. */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

/** @deprecated Prefer safeJsonParse — kept for existing call sites. */
export function parseJsonSafe(text: string): { ok: true; value: unknown } | { ok: false } {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    return { ok: false };
  }
}
