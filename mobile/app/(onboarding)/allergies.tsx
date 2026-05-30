import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../src/api/client';
import { Button, Subtitle, Title } from '../../src/components/ui';
import { ALLERGY_RESTRICTION_KEYS, ALLERGY_RESTRICTION_LABELS } from '../../src/constants/onboarding';
import { INGREDIENT_PREF_KEYS } from '../../src/constants/ingredientPreferences';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

export default function AllergiesScreen() {
  const params = useLocalSearchParams();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const router = useRouter();

  const toggle = (id: string) => {
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      const priorities = String(params.priorities ?? '').split(',').filter(Boolean);
      const ingredientPreferences: Record<string, boolean> = {};
      for (const k of INGREDIENT_PREF_KEYS) {
        ingredientPreferences[k] = params[k] === '1';
      }
      const { user } = await api.updateProfile({
        primaryGoal: String(params.primaryGoal),
        goalFocus: String(params.goalFocus),
        goalFocusOther: String(params.goalFocusOther ?? ''),
        personalPriorities: priorities,
        ingredientPreferences,
        allergiesRestrictions: selected,
        onboardingComplete: true,
      });
      updateUser(user);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 5 of 6</Text>
      <Title>Allergies & restrictions</Title>
      <Subtitle>We flag possible label conflicts — always verify packaging.</Subtitle>
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {ALLERGY_RESTRICTION_KEYS.map((id) => (
        <Pressable
          key={id}
          onPress={() => toggle(id)}
          style={[styles.chip, selected.includes(id) && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{ALLERGY_RESTRICTION_LABELS[id]}</Text>
        </Pressable>
      ))}
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Button label="Start scanning" onPress={finish} loading={loading} />
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
});
