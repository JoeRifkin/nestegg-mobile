import { buildPath } from '../src/components/BalanceChart';

describe('buildPath', () => {
  it('returns empty paths for fewer than two points', () => {
    expect(buildPath([5], 100, 50)).toEqual({ line: '', area: '' });
  });
  it('starts with a move and draws one segment per extra point', () => {
    const { line, area } = buildPath([1, 2, 3], 100, 50);
    expect(line.startsWith('M')).toBe(true);
    expect(line.match(/L/g)).toHaveLength(2);
    expect(area.endsWith('Z')).toBe(true);
  });
  it('handles a flat series without dividing by zero', () => {
    expect(buildPath([7, 7, 7], 100, 50).line).not.toContain('NaN');
  });
});
