import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from './AuthContext';
import { colors, MIN_TOUCH, radius, space } from '../../theme/tokens';

export function SignInScreen() {
  const { signIn, error } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.logo} accessibilityRole="header">
        NestEgg
      </Text>
      <Text style={styles.tag}>Your retirement, in your pocket.</Text>
      <Pressable accessibilityRole="button" onPress={signIn} style={styles.btn}>
        <Text style={styles.btnText}>Unlock with Face ID</Text>
      </Pressable>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: space.lg, backgroundColor: colors.bg },
  logo: { fontSize: 40, fontWeight: '800', color: colors.primary, textAlign: 'center' },
  tag: { fontSize: 17, color: colors.textMuted, textAlign: 'center', marginBottom: space.xl },
  btn: {
    minHeight: MIN_TOUCH,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  error: { color: colors.negative, textAlign: 'center', marginTop: space.md },
});
