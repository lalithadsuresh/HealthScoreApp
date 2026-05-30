import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorBanner, Subtitle, Title } from '../../src/components/ui';
import { WeightStepper } from '../../src/components/WeightStepper';
import { GOAL_KEYS, GOAL_META, type GoalKey } from '../../src/constants/goals';
import { colors } from '../../src/theme';

export default function OnboardingSlidersScreen() {
  const { goals: goalsParam } = useLocalSearchParams<{ goals: string }>();
  const selected = useMemo(
    () => (goalsParam?.split(',').filter(Boolean) as GoalKey[]) ?? [],
    [goalsParam]
  );
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const k of selected) w[k] = 6;
    return w;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      const goalWeights: Record<string, number> = {};
      for (const k of GOAL_KEYS) goalWeights[k] = selected.includes(k) ? weights[k] ?? 5 : 0;
      router.push({
        pathname: '/(onboarding)/ingredients',
        params: { goals: selected.join(','), weights: JSON.stringify(
          Object.fromEntries(selected.map((k) => [k, Math.round(weights[k] ?? 5)]))
        ) },
      });
      return;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Title>How important is each?</Title>
      <Subtitle>0 = ignore, 10 = essential for your goal-based score.</Subtitle>
      <ErrorBanner message={error} />
      {selected.map((key) => (
        <View key={key} style={styles.row}>
          <Text style={styles.rowLabel}>
            {GOAL_META[key].emoji} {GOAL_META[key].label}
          </Text>
          <WeightStepper
            value={weights[key] ?? 0}
            onChange={(v) => setWeights((w) => ({ ...w, [key]: v }))}
          />
        </View>
      ))}
      <Button label="Next: ingredient preferences" onPress={finish} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
});
