import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createApi } from '../src/api/client';
import { queryKeys, useAccount, useUpdateContributionRate } from '../src/api/hooks';
import { FeatureFlagProvider } from '../src/lib/featureFlags';

const clients: QueryClient[] = [];
afterEach(() => clients.splice(0).forEach((c) => c.clear()));

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    </QueryClientProvider>
  );
  clients.push(client);
  return { client, wrapper };
}

describe('useUpdateContributionRate', () => {
  it('rolls back the optimistic update when the server rejects it', async () => {
    const api = createApi({ latencyMs: 0 });
    const { client, wrapper } = setup();
    const account = renderHook(() => useAccount(api), { wrapper });
    await waitFor(() => expect(account.result.current.isSuccess).toBe(true));
    const original = account.result.current.data!.contributionRate;

    const mutation = renderHook(() => useUpdateContributionRate(api), { wrapper });
    await act(async () => {
      await mutation.result.current.mutateAsync(0.9).catch(() => {});
    });

    expect(client.getQueryData<{ contributionRate: number }>(queryKeys.account)?.contributionRate).toBe(original);
  });
});
