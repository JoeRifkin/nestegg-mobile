/**
 * Money is stored as integer cents everywhere in the app to avoid
 * floating-point drift in balances (0.1 + 0.2 !== 0.3).
 */
export type Cents = number;

export function toCents(dollars: number): Cents {
  return Math.round(dollars * 100);
}

export function formatCents(cents: Cents, opts: { compact?: boolean } = {}): string {
  const dollars = cents / 100;
  if (opts.compact && Math.abs(dollars) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(dollars);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dollars);
}

/** Signed percent string, e.g. "+4.2%" or "-1.0%". */
export function formatChange(fraction: number): string {
  const pct = (fraction * 100).toFixed(1);
  return fraction >= 0 ? `+${pct}%` : `${pct}%`;
}
