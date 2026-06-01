import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Subtitle, Title } from '../../src/components/ui';
import { PERSONAL_PRIORITIES, PERSONAL_PRIORITY_LABELS } from '../../src/constants/onboarding';
import { colors } from '../../src/theme';

export default function PrioritiesScreen() {
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length < 5 ? [...p, id] : p
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 3 of 5</Text>
      <Title>What matters when you choose food?</Title>
      <Subtitle>Pick up to 5 priorities.</Subtitle>
      {PERSONAL_PRIORITIES.map((id) => (
        <Pressable
          key={id}
          onPress={() => toggle(id)}
          style={[styles.chip, selected.includes(id) && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{PERSONAL_PRIORITY_LABELS[id]}</Text>
        </Pressable>
      ))}
      <Text style={styles.count}>{selected.length}/5 selected</Text>
      <Button label="Back" variant="secondary" onPress={() => router.push({ pathname: '/(onboarding)/focus', params })} />
      <Button
        label="Continue"
        disabled={!selected.length}
        onPress={() =>
          router.push({
            pathname: '/(onboarding)/ingredients',
            params: { ...params, priorities: selected.join(',') },
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
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 16, fontWeight: '500' },
  count: { color: colors.muted, marginVertical: 8 },
});
