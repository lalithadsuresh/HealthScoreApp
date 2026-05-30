import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Disclaimer, ErrorBanner, Subtitle, Title } from '../../src/components/ui';
import { GOAL_KEYS, GOAL_META, MEDICAL_DISCLAIMER, type GoalKey } from '../../src/constants/goals';
import { colors, spacing } from '../../src/theme';

export default function OnboardingGoalsScreen() {
  const [selected, setSelected] = useState<GoalKey[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const toggle = (key: GoalKey) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const next = () => {
    if (selected.length === 0) {
      setError('Select at least one nutrition goal');
      return;
    }
    router.push({
      pathname: '/(onboarding)/sliders',
      params: { goals: selected.join(',') },
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Title>Your nutrition goals</Title>
      <Subtitle>Choose what matters. We&apos;ll weight your goal-based score — not a universal health grade.</Subtitle>
      <Disclaimer text={MEDICAL_DISCLAIMER} />
      <ErrorBanner message={error} />
      {GOAL_KEYS.map((key) => {
        const meta = GOAL_META[key];
        const on = selected.includes(key);
        return (
          <Pressable
            key={key}
            onPress={() => toggle(key)}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={styles.chipEmoji}>{meta.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.chipLabel}>{meta.label}</Text>
              <Text style={styles.chipHint}>{meta.hint}</Text>
            </View>
            <View style={[styles.check, on && styles.checkOn]} />
          </Pressable>
        );
      })}
      <Button label="Next: set importance" onPress={next} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 10,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipEmoji: { fontSize: 24 },
  chipLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  chipHint: { fontSize: 13, color: colors.muted, marginTop: 2 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
