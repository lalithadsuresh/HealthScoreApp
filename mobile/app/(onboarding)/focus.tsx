import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Subtitle, Title } from '../../src/components/ui';
import {
  GOAL_FOCUS_OPTIONS,
  PRIMARY_GOAL_LABELS,
  type PrimaryGoalId,
} from '../../src/constants/onboarding';
import { colors } from '../../src/theme';

export default function FocusScreen() {
  const { primaryGoal } = useLocalSearchParams<{ primaryGoal: string }>();
  const pg = primaryGoal as PrimaryGoalId;
  const options = useMemo(
    () => (GOAL_FOCUS_OPTIONS[pg] ?? []).filter((o) => o.id !== 'other'),
    [pg]
  );
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length < 4 ? [...p, id] : p
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 2 of 6</Text>
      <Title>{PRIMARY_GOAL_LABELS[pg]} — your focus</Title>
      <Subtitle>Select all that apply (up to 4). These appear on your scan results.</Subtitle>
      {options.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => toggle(o.id)}
          style={[styles.chip, selected.includes(o.id) && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{o.label}</Text>
          {o.description ? <Text style={styles.hint}>{o.description}</Text> : null}
        </Pressable>
      ))}
      <Text style={styles.count}>{selected.length}/4 selected</Text>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Button
        label="Continue"
        disabled={!selected.length}
        onPress={() =>
          router.push({
            pathname: '/(onboarding)/priorities',
            params: { primaryGoal: pg, goalFocuses: selected.join(',') },
          })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  step: { color: colors.muted, marginBottom: 8 },
  chip: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, color: colors.muted, marginTop: 4 },
  count: { color: colors.muted, marginVertical: 8 },
});
