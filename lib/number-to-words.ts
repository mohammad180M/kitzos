const EN_ONES = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const EN_TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function enUnder1000(n: number): string {
  if (n === 0) return "";
  if (n < 20) return EN_ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r ? `${EN_TENS[t]}-${EN_ONES[r]}` : EN_TENS[t];
  }
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head = `${EN_ONES[h]} hundred`;
  return r ? `${head} ${enUnder1000(r)}` : head;
}

export function numberToWordsEn(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999_999) return null;
  if (n === 0) return "zero";

  const parts: string[] = [];
  const scales = [
    { value: 1_000_000_000, label: "billion" },
    { value: 1_000_000, label: "million" },
    { value: 1_000, label: "thousand" },
  ];

  let rest = n;
  for (const { value, label } of scales) {
    const chunk = Math.floor(rest / value);
    if (chunk) {
      parts.push(`${enUnder1000(chunk)} ${label}`);
      rest %= value;
    }
  }
  if (rest) parts.push(enUnder1000(rest));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

const AR_ONES = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
const AR_ONES_FEM = ["", "واحدة", "اثنتان", "ثلاث", "أربع", "خمس", "ست", "سبع", "ثمان", "تسع"];
const AR_TENS = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const AR_HUNDREDS = [
  "",
  "مائة",
  "مئتان",
  "ثلاثمائة",
  "أربعمائة",
  "خمسمائة",
  "ستمائة",
  "سبعمائة",
  "ثمانمائة",
  "تسعمائة",
];

function arAnd(parts: string[]): string {
  const filtered = parts.filter(Boolean);
  if (filtered.length === 0) return "";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} و${filtered[1]}`;
  const last = filtered.pop()!;
  return `${filtered.join("، ")} و${last}`;
}

function arUnder100(n: number, feminine = false): string {
  if (n === 0) return "";
  if (n < 10) return feminine ? AR_ONES_FEM[n] : AR_ONES[n];
  if (n === 10) return "عشرة";
  if (n < 20) {
    const unit = n % 10;
    const teens = ["", "أحد", "اثنا", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
    return `${teens[unit]} عشر`;
  }
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (u === 0) return AR_TENS[t];
  return arAnd([feminine ? AR_ONES_FEM[u] : AR_ONES[u], AR_TENS[t]]);
}

function arUnder1000(n: number, feminine = false): string {
  if (n === 0) return "";
  if (n < 100) return arUnder100(n, feminine);
  const h = Math.floor(n / 100);
  const r = n % 100;
  return arAnd([AR_HUNDREDS[h], arUnder100(r, feminine)]);
}

function arScale(n: number, singular: string, dual: string, plural: string, feminine = false): string {
  if (n === 0) return "";
  if (n === 1) return singular;
  if (n === 2) return dual;
  if (n >= 3 && n <= 10) return `${arUnder1000(n, feminine)} ${plural}`;
  return `${arUnder1000(n, feminine)} ${singular}`;
}

export function numberToWordsAr(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999_999) return null;
  if (n === 0) return "صفر";

  const parts: string[] = [];
  let rest = n;

  const billions = Math.floor(rest / 1_000_000_000);
  if (billions) {
    parts.push(arScale(billions, "مليار", "ملياران", "مليارات"));
    rest %= 1_000_000_000;
  }

  const millions = Math.floor(rest / 1_000_000);
  if (millions) {
    parts.push(arScale(millions, "مليون", "مليونان", "ملايين"));
    rest %= 1_000_000;
  }

  const thousands = Math.floor(rest / 1000);
  if (thousands) {
    if (thousands === 1) parts.push("ألف");
    else if (thousands === 2) parts.push("ألفان");
    else if (thousands >= 3 && thousands <= 10) parts.push(`${arUnder1000(thousands)} آلاف`);
    else parts.push(`${arUnder1000(thousands)} ألف`);
    rest %= 1000;
  }

  if (rest) parts.push(arUnder1000(rest));

  return arAnd(parts);
}

export function numberToWords(n: number, locale: "en" | "ar"): string | null {
  return locale === "ar" ? numberToWordsAr(n) : numberToWordsEn(n);
}
