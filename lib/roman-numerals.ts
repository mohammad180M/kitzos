const ROMAN_MAP: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function intToRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let num = n;
  let out = "";
  for (const [value, symbol] of ROMAN_MAP) {
    while (num >= value) {
      out += symbol;
      num -= value;
    }
  }
  return out;
}

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

export function romanToInt(input: string): number | null {
  const s = input.trim().toUpperCase().replace(/[^IVXLCDM]/g, "");
  if (!s) return null;

  let total = 0;
  let prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const val = ROMAN_VALUES[s[i]];
    if (!val) return null;
    if (val < prev) total -= val;
    else total += val;
    prev = val;
  }

  const roundTrip = intToRoman(total);
  if (roundTrip !== s) return null;
  return total;
}
