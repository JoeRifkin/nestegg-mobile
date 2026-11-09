import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../src/features/auth/AuthContext';
import { useFlag } from '../../src/lib/featureFlags';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  const { status } = useAuth();
  const adminView = useFlag('adminView');
  if (status !== 'signedIn') return <Redirect href="/" />;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="contribute" options={{ title: 'Contribute' }} />
      <Tabs.Screen name="admin" options={{ title: 'Plan admin', href: adminView ? undefined : null }} />
    </Tabs>
  );
}
