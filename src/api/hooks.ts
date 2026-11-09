import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api as defaultApi, Account, Api } from './client';
import { useFlag } from '../lib/featureFlags';

export const queryKeys = {
  account: ['account'] as const,
  balance: ['balance'] as const,
  plan: ['plan'] as const,
};

export function useAccount(api: Api = defaultApi) {
  return useQuery({ queryKey: queryKeys.account, queryFn: api.getAccount });
}

/**
 * Balances poll every 15s while the screen is mounted (when the live flag is
 * on). TanStack Query pauses polling in the background and refetches on
 * reconnect, so a spotty mobile connection recovers on its own.
 */
export function useBalance(api: Api = defaultApi) {
  const live = useFlag('liveBalances');
  return useQuery({
    queryKey: queryKeys.balance,
    queryFn: api.getBalance,
    refetchInterval: live ? 15_000 : false,
    retry: 2,
  });
}

export function usePlanSummary(api: Api = defaultApi) {
  return useQuery({ queryKey: queryKeys.plan, queryFn: api.getPlanSummary });
}

/**
 * Optimistic update: the new rate shows immediately, and rolls back if the
 * server rejects it.
 */
export function useUpdateContributionRate(api: Api = defaultApi) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rate: number) => api.updateContributionRate(rate),
    onMutate: async (rate) => {
      await qc.cancelQueries({ queryKey: queryKeys.account });
      const previous = qc.getQueryData<Account>(queryKeys.account);
      if (previous) qc.setQueryData<Account>(queryKeys.account, { ...previous, contributionRate: rate });
      return { previous };
    },
    onError: (_err, _rate, ctx) => {
      if (ctx?.previous) qc.setQueryData(queryKeys.account, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.account }),
  });
}
