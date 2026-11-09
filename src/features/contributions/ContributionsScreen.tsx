import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAccount, useBalance, useUpdateContributionRate } from '../../api/hooks';
import { Card } from '../../components/Card';
import { RateStepper } from '../../components/RateStepper';
import { formatCents } from '../../lib/money';
import { annualEmployeeContribution, employerMatch, projectBalance } from '../../lib/projection';
import { colors, MIN_TOUCH, radius, space } from '../../theme/tokens';

export function ContributionsScreen() {
  const account = useAccount();
  const balance = useBalance();
  const update = useUpdateContributionRate();
  const [draft, setDraft] = useState<number | null>(null);

  useEffect(() => {
    if (account.data && draft === null) setDraft(account.data.contributionRate);
  }, [account.data, draft]);

  const preview = useMemo(() => {
    if (!account.data || !balance.data || draft === null) return null;
    const a = account.data;
    const points = projectBalance({
      currentBalance: balance.data.balance,
      annualSalary: a.annualSalary,
      contributionRate: draft,
      employerMatchCap: a.employerMatchCap,
      annualReturn: 0.06,
      years: 25,
    });
    return {
      yours: annualEmployeeContribution(a.annualSalary, draft),
      match: employerMatch(a.annualSalary, draft, a.employerMatchCap),
      atRetirement: points[points.length - 1],
      missingMatch: draft < a.employerMatchCap,
    };
  }, [account.data, balance.data, draft]);

  if (!account.data || draft === null || !preview) {
    return <ActivityIndicator style={{ marginTop: space.xl }} accessibilityLabel="Loading" />;
  }

  const dirty = draft !== account.data.contributionRate;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card title="Contribution rate">
        <RateStepper value={draft} onChange={setDraft} />
        {preview.missingMatch ? (
          <Text style={styles.warn} testID="match-warning">
            You're leaving free money on the table. Contribute at least{' '}
            {Math.round(account.data.employerMatchCap * 100)}% to get the full match.
          </Text>
        ) : null}
      </Card>

      <Card title="Each year">
        <Row label="You contribute" value={formatCents(preview.yours)} />
        <Row label="Employer match" value={formatCents(preview.match)} />
      </Card>

      <Card title="Estimated at retirement (25 yrs, 6% return)">
        <Text style={styles.big}>{formatCents(preview.atRetirement, { compact: true })}</Text>
        <Text style={styles.footnote}>Estimate only. Not investment advice.</Text>
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !dirty || update.isPending }}
        disabled={!dirty || update.isPending}
        onPress={() => update.mutate(draft)}
        style={[styles.save, (!dirty || update.isPending) && { opacity: 0.4 }]}
      >
        <Text style={styles.saveText}>{update.isPending ? 'Saving…' : 'Save new rate'}</Text>
      </Pressable>
      {update.isError ? <Text style={styles.error}>{update.error.message}</Text> : null}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.row}>
      {label}: <Text style={{ fontWeight: '700' }}>{value}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.md, backgroundColor: colors.bg },
  warn: { marginTop: space.md, color: colors.negative, fontSize: 15, lineHeight: 21 },
  row: { fontSize: 16, color: colors.text, marginBottom: space.xs },
  big: { fontSize: 32, fontWeight: '700', color: colors.text },
  footnote: { fontSize: 12, color: colors.textMuted, marginTop: space.xs },
  save: {
    minHeight: MIN_TOUCH,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
  },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  error: { color: colors.negative, marginTop: space.sm, textAlign: 'center' },
});
