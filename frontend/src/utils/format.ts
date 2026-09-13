/** Shared currency, percent, and date formatting helpers. */

export const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const usd2 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "1,500.00" (no currency glyph) — used inside Signed amounts. */
export function decimal2(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Axis tick variant of usd0: "$3k" under 10k, "$45k" above. */
export function usdTick(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
}

const tableDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * Ledger-style date for the table: "15 Jan '24 · 08:34" (full),
 * "15 Jan '24" (date), or "15 Jan" (short/mobile).
 */
export function ledgerDate(value: Date, detail: 'full' | 'date' | 'short'): string {
  const parts = tableDate.formatToParts(value);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const base = `${get('day')} ${get('month')}`;
  if (detail === 'short') return base;
  const dated = `${base} '${get('year')}`;
  return detail === 'full' ? `${dated} · ${get('hour')}:${get('minute')}` : dated;
}

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** "2024-01" → "Jan". */
export function monthLabel(ym: string): string {
  return MONTH_SHORT[Number(ym.slice(5, 7)) - 1] ?? ym;
}
