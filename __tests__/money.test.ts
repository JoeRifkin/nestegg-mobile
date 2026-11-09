import { formatCents, formatChange, toCents } from '../src/lib/money';

describe('money', () => {
  it('converts dollars to integer cents', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
  });
  it('formats currency', () => {
    expect(formatCents(4_861_237)).toBe('$48,612.37');
  });
  it('formats signed change', () => {
    expect(formatChange(0.042)).toBe('+4.2%');
    expect(formatChange(-0.01)).toBe('-1.0%');
  });
});
