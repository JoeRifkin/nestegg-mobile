import {
  ANNUAL_DEFERRAL_LIMIT,
  annualEmployeeContribution,
  employerMatch,
  projectBalance,
  upliftFromRateChange,
} from '../src/lib/projection';

const base = {
  currentBalance: 1_000_000, // $10,000
  annualSalary: 10_000_000, // $100,000
  contributionRate: 0.06,
  employerMatchCap: 0.04,
  annualReturn: 0,
  years: 1,
};

describe('employerMatch', () => {
  it('matches dollar for dollar up to the cap', () => {
    expect(employerMatch(10_000_000, 0.03, 0.04)).toBe(300_000);
    expect(employerMatch(10_000_000, 0.1, 0.04)).toBe(400_000);
  });
});

describe('annualEmployeeContribution', () => {
  it('caps at the IRS deferral limit', () => {
    expect(annualEmployeeContribution(50_000_000, 0.5)).toBe(ANNUAL_DEFERRAL_LIMIT);
  });
});

describe('projectBalance', () => {
  it('adds contributions plus match with zero return', () => {
    const pts = projectBalance(base);
    expect(pts).toHaveLength(2);
    // $10,000 + $6,000 yours + $4,000 match = $20,000
    expect(pts[1]).toBe(2_000_000);
  });

  it('compounds growth with a positive return', () => {
    const flat = projectBalance({ ...base, years: 10 });
    const growth = projectBalance({ ...base, years: 10, annualReturn: 0.06 });
    expect(growth[10]).toBeGreaterThan(flat[10]);
  });

  it('rejects invalid input', () => {
    expect(() => projectBalance({ ...base, contributionRate: 1.5 })).toThrow(RangeError);
    expect(() => projectBalance({ ...base, years: -1 })).toThrow(RangeError);
  });

  it('shows more uplift below the match cap than above it', () => {
    const belowCap = upliftFromRateChange({ ...base, contributionRate: 0.02 }, 0.03);
    const aboveCap = upliftFromRateChange({ ...base, contributionRate: 0.06 }, 0.07);
    expect(belowCap).toBe(200_000); // 1% yours + 1% match
    expect(aboveCap).toBe(100_000); // 1% yours only
  });
});
