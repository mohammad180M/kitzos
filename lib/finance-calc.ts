export type CompoundFrequency = "annual" | "semiannual" | "quarterly" | "monthly" | "daily";

const COMPOUND_PER_YEAR: Record<CompoundFrequency, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export function compoundInterest(
  principal: number,
  annualRatePercent: number,
  years: number,
  frequency: CompoundFrequency
): { finalAmount: number; interestEarned: number } | null {
  if (principal <= 0 || years <= 0 || annualRatePercent < 0) return null;
  const n = COMPOUND_PER_YEAR[frequency];
  const r = annualRatePercent / 100;
  const finalAmount = principal * Math.pow(1 + r / n, n * years);
  return { finalAmount, interestEarned: finalAmount - principal };
}

export function mortgagePayment(principal: number, annualRatePercent: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function buildAmortizationSchedule(
  principal: number,
  annualRatePercent: number,
  months: number,
  maxRows = 360
): AmortizationRow[] {
  const payment = mortgagePayment(principal, annualRatePercent, months);
  if (payment <= 0) return [];

  const r = annualRatePercent / 100 / 12;
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= months && month <= maxRows; month++) {
    const interest = r === 0 ? 0 : balance * r;
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    rows.push({ month, payment, principal: principalPaid, interest, balance });
  }

  return rows;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyRatio(w: number, h: number): { w: number; h: number } {
  const g = gcd(w, h);
  return { w: Math.round(w / g), h: Math.round(h / g) };
}
