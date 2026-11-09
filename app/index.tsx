import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/features/auth/AuthContext';
import { SignInScreen } from '../src/features/auth/SignInScreen';

export default function Index() {
  const { status } = useAuth();
  if (status === 'loading') return <ActivityIndicator style={{ flex: 1 }} />;
  if (status === 'signedOut') return <SignInScreen />;
  return <Redirect href="/(tabs)" />;
}
