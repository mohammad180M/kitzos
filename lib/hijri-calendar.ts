function gregorianToJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function julianDayToGregorian(jd: number): { year: number; month: number; day: number } {
  const z = jd + 32044;
  const g = Math.floor(z / 146097);
  const dg = z % 146097;
  const c = Math.floor((Math.floor(dg / 36524) + 1) * 3 / 4);
  const dc = dg - c * 36524;
  const b = Math.floor(dc / 1461);
  const db = dc % 1461;
  const a = Math.floor((Math.floor(db / 365) + 1) * 3 / 4);
  const da = db - a * 365;
  const y = g * 400 + c * 100 + b * 4 + a;
  const m = Math.floor((da * 5 + 308) / 153) - 2;
  const d = da - Math.floor((m + 4) * 153 / 5) + 122;
  return { year: y - 4800 + Math.floor((m + 2) / 12), month: ((m + 2) % 12) + 1, day: d + 1 };
}

/** Tabular Islamic calendar (Kuwaiti algorithm) — client-side approximation. */
export function gregorianToHijri(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const jd = gregorianToJulianDay(year, month, day);
  if (jd < 0) return null;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 =
    l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const hm = Math.floor((24 * l3) / 709);
  const hd = l3 - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;

  if (hm < 1 || hm > 12 || hd < 1 || hd > 30) return null;
  return { year: hy, month: hm, day: hd };
}

export function hijriToGregorian(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } | null {
  if (month < 1 || month > 12 || day < 1 || day > 30 || year < 1) return null;

  const jd = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385;

  if (jd < 0) return null;
  return julianDayToGregorian(jd);
}

export const HIJRI_MONTHS_EN = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

export const HIJRI_MONTHS_AR = [
  "محرّم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوّال",
  "ذو القعدة",
  "ذو الحجة",
];
