import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, MIN_TOUCH, radius, space } from '../theme/tokens';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Contribution-rate control. Uses +/- buttons rather than a slider so it is
 * precise, works with VoiceOver/TalkBack "adjustable" gestures, and meets
 * minimum touch-target sizes.
 */
export function RateStepper({ value, onChange, min = 0, max = 0.25, step = 0.01 }: Props) {
  const pct = Math.round(value * 100);
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(next * 100) / 100));
    if (clamped !== value) {
      Haptics.selectionAsync().catch(() => {});
      onChange(clamped);
    }
  };

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Contribution rate"
      accessibilityValue={{ text: `${pct} percent of pay` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}
    >
      <Pressable
        testID="rate-decrement"
        style={[styles.btn, value <= min && styles.disabled]}
        onPress={() => set(value - step)}
        disabled={value <= min}
        importantForAccessibility="no"
      >
        <Text style={styles.btnText}>−</Text>
      </Pressable>
      <Text testID="rate-value" style={styles.value}>
        {pct}%
      </Text>
      <Pressable
        testID="rate-increment"
        style={[styles.btn, value >= max && styles.disabled]}
        onPress={() => set(value + step)}
        disabled={value >= max}
        importantForAccessibility="no"
      >
        <Text style={styles.btnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.lg },
  btn: {
    width: MIN_TOUCH + 12,
    height: MIN_TOUCH + 12,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.35 },
  btnText: { color: '#fff', fontSize: 28, fontWeight: '600' },
  value: { fontSize: 44, fontWeight: '700', color: colors.text, minWidth: 110, textAlign: 'center' },
});
