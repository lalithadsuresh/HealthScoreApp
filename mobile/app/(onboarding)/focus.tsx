import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Input, Subtitle, Title } from '../../src/components/ui';
import {
  GOAL_FOCUS_OPTIONS,
  PRIMARY_GOAL_LABELS,
  type PrimaryGoalId,
} from '../../src/constants/onboarding';
import { colors } from '../../src/theme';

export default function FocusScreen() {
  const { primaryGoal } = useLocalSearchParams<{ primaryGoal: string }>();
  const pg = primaryGoal as PrimaryGoalId;
  const options = GOAL_FOCUS_OPTIONS[pg] ?? [];
  const [focus, setFocus] = useState('');
  const [other, setOther] = useState('');
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 2 of 6</Text>
      <Title>{PRIMARY_GOAL_LABELS[pg]} — what matters most?</Title>
      <Subtitle>Personalize how we score for you.</Subtitle>
      {options.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => setFocus(o.id)}
          style={[styles.chip, focus === o.id && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{o.label}</Text>
          <Text style={styles.hint}>{o.description}</Text>
        </Pressable>
      ))}
      {focus === 'other' && (
        <Input placeholder="Your focus (optional)" value={other} onChangeText={setOther} />
      )}
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Button
        label="Continue"
        disabled={!focus}
        onPress={() =>
          router.push({
            pathname: '/(onboarding)/priorities',
            params: { primaryGoal: pg, goalFocus: focus, goalFocusOther: other },
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
});
