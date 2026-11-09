import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { useAccount, useBalance } from '../../api/hooks';
import { BalanceChart } from '../../components/BalanceChart';
import { Card, ErrorState } from '../../components/Card';
import { useFlag } from '../../lib/featureFlags';
import { formatCents, formatChange } from '../../lib/money';
import { upliftFromRateChange } from '../../lib/projection';
import { colors, space } from '../../theme/tokens';

export function DashboardScreen() {
  const { width } = useWindowDimensions();
  const balance = useBalance();
  const account = useAccount();
  const showNudge = useFlag('contributionNudge');

  if (balance.isPending || account.isPending) {
    return <ActivityIndicator style={{ marginTop: space.xl }} accessibilityLabel="Loading balance" />;
  }
  if (balance.isError || account.isError) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ErrorState
          message="We couldn't load your balance."
          onRetry={() => {
            balance.refetch();
            account.refetch();
          }}
        />
      </ScrollView>
    );
  }

  const b = balance.data;
  const a = account.data;
  const up = b.dayChange >= 0;
  const uplift = upliftFromRateChange(
    {
      currentBalance: b.balance,
      annualSalary: a.annualSalary,
      contributionRate: a.contributionRate,
      employerMatchCap: a.employerMatchCap,
      annualReturn: 0.06,
      years: 25,
    },
    Math.min(a.contributionRate + 0.01, 0.75),
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={balance.isRefetching} onRefresh={() => balance.refetch()} />}
    >
      <Text style={styles.greeting} accessibilityRole="header">
        Hi, {a.name.split(' ')[0]}
      </Text>

      <Card title="Total balance">
        <Text style={styles.balance} accessibilityLiveRegion="polite">
          {formatCents(b.balance)}
        </Text>
        <Text style={{ color: up ? colors.positive : colors.negative }}>
          {formatChange(b.dayChange)} today
        </Text>
        <BalanceChart
          points={b.history}
          width={width - space.md * 4}
          label="Balance over the last 5 years"
        />
      </Card>

      <Card title="Your contributions">
        <Text style={styles.body}>
          You save {Math.round(a.contributionRate * 100)}% of pay. Your employer matches up to{' '}
          {Math.round(a.employerMatchCap * 100)}%.
        </Text>
      </Card>

      {showNudge && uplift > 0 ? (
        <Card title="Small change, big result" testID="nudge">
          <Text style={styles.body}>
            Raising your rate by 1% could add about {formatCents(uplift, { compact: true })} by retirement.
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.md, backgroundColor: colors.bg },
  greeting: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: space.md },
  balance: { fontSize: 36, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, color: colors.text, lineHeight: 22 },
});
