import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FeatureFlagProvider } from '../src/lib/featureFlags';
import { AuthProvider } from '../src/features/auth/AuthContext';

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 10_000 } } }));
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <FeatureFlagProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </FeatureFlagProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
