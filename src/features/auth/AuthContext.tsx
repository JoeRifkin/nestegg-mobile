import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * Biometric sign-in. The session token lives in the iOS Keychain / Android
 * Keystore via SecureStore, never in AsyncStorage. Face ID / Touch ID /
 * fingerprint unlocks it; devices without biometrics fall back to the
 * device passcode.
 */
const SESSION_KEY = 'nestegg.session';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: Status;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Always require a fresh unlock on cold start, even with a stored session.
    setStatus('signedOut');
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      // authenticateAsync uses Face ID / Touch ID / fingerprint when enrolled,
      // and the device passcode otherwise.
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock NestEgg',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      if (!result.success) {
        setError('Authentication was cancelled. Try again.');
        return;
      }
      // Demo token. A real app would exchange credentials with the auth server.
      await SecureStore.setItemAsync(SESSION_KEY, `demo-${Date.now()}`, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      setStatus('signedIn');
    } catch {
      setError('Biometrics are unavailable on this device.');
    }
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setStatus('signedOut');
  }, []);

  const value = useMemo(() => ({ status, error, signIn, signOut }), [status, error, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
