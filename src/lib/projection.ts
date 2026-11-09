import { Cents } from './money';

export interface ProjectionInput {
  currentBalance: Cents;
  annualSalary: Cents;
  /** Employee contribution as a fraction of salary, e.g. 0.06 for 6%. */
  contributionRate: number;
  /** Employer matches 100% of contributions up to this fraction of salary. */
  employerMatchCap: number;
  /** Expected annual return, e.g. 0.06. */
  annualReturn: number;
  years: number;
}

/** IRS 402(g) elective deferral limit used for the demo. */
export const ANNUAL_DEFERRAL_LIMIT: Cents = 2_350_000;

export function employerMatch(salary: Cents, rate: number, cap: number): Cents {
  return Math.round(salary * Math.min(rate, cap));
}

export function annualEmployeeContribution(salary: Cents, rate: number): Cents {
  return Math.min(Math.round(salary * rate), ANNUAL_DEFERRAL_LIMIT);
}

/**
 * Projects a balance year by year with monthly contributions and monthly
 * compounding. Returns one point per year (index 0 = today).
 */
export function projectBalance(input: ProjectionInput): Cents[] {
  const { currentBalance, annualSalary, contributionRate, employerMatchCap, annualReturn, years } = input;
  if (contributionRate < 0 || contributionRate > 1) throw new RangeError('contributionRate must be 0..1');
  if (years < 0) throw new RangeError('years must be >= 0');

  const monthlyRate = annualReturn / 12;
  const yearlyIn =
    annualEmployeeContribution(annualSalary, contributionRate) +
    employerMatch(annualSalary, contributionRate, employerMatchCap);
  const monthlyIn = yearlyIn / 12;

  const points: Cents[] = [currentBalance];
  let balance = currentBalance;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyIn;
    }
    points.push(Math.round(balance));
  }
  return points;
}

/** Extra dollars at retirement from raising the rate, for the "nudge" card. */
export function upliftFromRateChange(input: ProjectionInput, newRate: number): Cents {
  const base = projectBalance(input);
  const next = projectBalance({ ...input, contributionRate: newRate });
  return next[next.length - 1] - base[base.length - 1];
}
