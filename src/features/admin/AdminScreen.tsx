import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { usePlanSummary } from '../../api/hooks';
import { Card, ErrorState } from '../../components/Card';
import { colors, space } from '../../theme/tokens';

/** Plan-administrator persona: participation at a glance plus to-dos. */
export function AdminScreen() {
  const plan = usePlanSummary();

  if (plan.isPending) return <ActivityIndicator style={{ marginTop: space.xl }} accessibilityLabel="Loading plan" />;
  if (plan.isError) return <ErrorState message="We couldn't load your plan." onRetry={() => plan.refetch()} />;

  const p = plan.data;
  const participation = Math.round((p.enrolledEmployees / p.eligibleEmployees) * 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.h1} accessibilityRole="header">
        {p.planName}
      </Text>
      <Card title="Participation">
        <Text style={styles.big}>{participation}%</Text>
        <Text style={styles.body}>
          {p.enrolledEmployees} of {p.eligibleEmployees} eligible employees enrolled. Average rate{' '}
          {(p.averageRate * 100).toFixed(1)}%.
        </Text>
      </Card>
      <Card title="Needs your attention">
        {p.pendingActions.map((a) => (
          <Text key={a.id} style={styles.item}>
            • {a.label}
          </Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.md, backgroundColor: colors.bg },
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: space.md },
  big: { fontSize: 36, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
  item: { fontSize: 16, color: colors.text, marginBottom: space.xs },
});
