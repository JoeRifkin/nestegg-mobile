import React, { createContext, useContext, useMemo } from 'react';

/**
 * Feature flags gate unfinished or staged work so it can ship dark and be
 * rolled out gradually. In production these would come from a remote config
 * service; the demo uses static defaults that tests can override.
 */
export interface FeatureFlags {
  /** Plan-admin persona tab. */
  adminView: boolean;
  /** "Raise your rate" nudge card on the dashboard. */
  contributionNudge: boolean;
  /** Live balance polling (vs. fetch on focus only). */
  liveBalances: boolean;
}

export const DEFAULT_FLAGS: FeatureFlags = {
  adminView: true,
  contributionNudge: true,
  liveBalances: true,
};

const FlagContext = createContext<FeatureFlags>(DEFAULT_FLAGS);

export function FeatureFlagProvider({
  overrides,
  children,
}: {
  overrides?: Partial<FeatureFlags>;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ ...DEFAULT_FLAGS, ...overrides }), [overrides]);
  return <FlagContext.Provider value={value}>{children}</FlagContext.Provider>;
}

export function useFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] {
  return useContext(FlagContext)[key];
}
