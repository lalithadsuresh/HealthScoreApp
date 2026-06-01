import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Disclaimer, ErrorBanner, Subtitle, Title } from '../../src/components/ui';
import { PRIMARY_GOALS, PRIMARY_GOAL_LABELS } from '../../src/constants/onboarding';
import { colors } from '../../src/theme';

const MEDICAL =
  'For informational purposes only — not medical advice. Your score reflects what you define as “good for you.”';

export default function PrimaryGoalScreen() {
  const [selected, setSelected] = useState('');
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 1 of 5</Text>
      <Title>What are you working toward?</Title>
      <Subtitle>We score food for your goals — not universal “healthy.”</Subtitle>
      <Disclaimer text={MEDICAL} />
      {PRIMARY_GOALS.map((id) => (
        <Pressable
          key={id}
          onPress={() => setSelected(id)}
          style={[styles.chip, selected === id && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{PRIMARY_GOAL_LABELS[id]}</Text>
        </Pressable>
      ))}
      <Button
        label="Continue"
        disabled={!selected}
        onPress={() =>
          router.push({ pathname: '/(onboarding)/focus', params: { primaryGoal: selected } })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  step: { color: colors.muted, marginBottom: 8 },
  chip: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 17, fontWeight: '600' },
});
