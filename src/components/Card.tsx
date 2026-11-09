import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { colors, radius, space } from '../theme/tokens';

export function Card({ title, children, style, ...rest }: ViewProps & { title?: string }) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <Text style={{ color: colors.negative, marginBottom: space.sm }}>{message}</Text>
      <Text accessibilityRole="button" onPress={onRetry} style={{ color: colors.primary, fontWeight: '600' }}>
        Try again
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: space.sm },
});
