import { Cents } from '../lib/money';

/**
 * Typed API contract for the demo. A real app would generate these types from
 * an OpenAPI schema shared with the backend. Here a mock server simulates
 * latency, market movement, and occasional failures so the UI's loading,
 * error, and retry states are exercised.
 */
export type Persona = 'participant' | 'admin';

export interface Account {
  id: string;
  name: string;
  persona: Persona;
  annualSalary: Cents;
  contributionRate: number;
  employerMatchCap: number;
}

export interface BalanceSnapshot {
  balance: Cents;
  /** Change since market open, as a fraction. */
  dayChange: number;
  /** Year-end balances for the history chart, oldest first. */
  history: Cents[];
  asOf: string;
}

export interface PlanSummary {
  planName: string;
  eligibleEmployees: number;
  enrolledEmployees: number;
  averageRate: number;
  pendingActions: { id: string; label: string }[];
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Mutable in-memory "server" state. */
const db = {
  account: {
    id: 'acct_demo',
    name: 'Alex Rivera',
    persona: 'participant' as Persona,
    annualSalary: 9_500_000,
    contributionRate: 0.06,
    employerMatchCap: 0.04,
  },
  balance: 4_861_237,
  openBalance: 4_840_000,
  history: [1_210_000, 1_905_500, 2_650_300, 3_402_800, 4_120_900, 4_861_237],
};

export interface ApiOptions {
  latencyMs?: number;
  /** Probability (0..1) a call fails, to exercise error states. */
  failureRate?: number;
}

export function createApi({ latencyMs = 400, failureRate = 0 }: ApiOptions = {}) {
  async function call<T>(fn: () => T): Promise<T> {
    await sleep(latencyMs);
    if (Math.random() < failureRate) throw new ApiError('Service unavailable', 503);
    return fn();
  }

  return {
    getAccount: () => call<Account>(() => ({ ...db.account })),

    getBalance: () =>
      call<BalanceSnapshot>(() => {
        // Simulate small intraday market movement on each poll.
        const drift = Math.round(db.balance * (Math.random() - 0.48) * 0.0015);
        db.balance += drift;
        return {
          balance: db.balance,
          dayChange: (db.balance - db.openBalance) / db.openBalance,
          history: [...db.history.slice(0, -1), db.balance],
          asOf: new Date().toISOString(),
        };
      }),

    updateContributionRate: (rate: number) =>
      call<Account>(() => {
        if (rate < 0 || rate > 0.75) throw new ApiError('Rate must be between 0% and 75%', 422);
        db.account.contributionRate = Math.round(rate * 100) / 100;
        return { ...db.account };
      }),

    getPlanSummary: () =>
      call<PlanSummary>(() => ({
        planName: 'Acme Co. 401(k)',
        eligibleEmployees: 48,
        enrolledEmployees: 41,
        averageRate: 0.058,
        pendingActions: [
          { id: 'a1', label: 'Approve 3 new enrollments' },
          { id: 'a2', label: 'Review Q3 payroll upload' },
        ],
      })),
  };
}

export type Api = ReturnType<typeof createApi>;
export const api = createApi();
