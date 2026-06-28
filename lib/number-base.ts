const BASE_LABELS: Record<number, string> = {
  2: "Binary",
  8: "Octal",
  10: "Decimal",
  16: "Hexadecimal",
};

export function getBaseLabel(base: number): string {
  return BASE_LABELS[base] ?? `Base ${base}`;
}

export function convertBase(value: string, fromBase: number, toBase: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) return null;

  try {
    const decimal = parseInt(trimmed, fromBase);
    if (!Number.isFinite(decimal)) return null;
    if (decimal < 0) return null;
    return decimal.toString(toBase).toUpperCase();
  } catch {
    return null;
  }
}

export function isValidForBase(value: string, base: number): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return convertBase(trimmed, base, 10) !== null;
}
