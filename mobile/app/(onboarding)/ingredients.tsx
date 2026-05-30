import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api/client';
import { Button, Disclaimer, ErrorBanner, Subtitle, Title } from '../../src/components/ui';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
  type IngredientPrefKey,
} from '../../src/constants/ingredientPreferences';
import { GOAL_KEYS, type GoalKey } from '../../src/constants/goals';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

export default function OnboardingIngredientsScreen() {
  const { goals: goalsParam, weights: weightsParam } = useLocalSearchParams<{
    goals: string;
    weights: string;
  }>();
  const selected = useMemo(
    () => (goalsParam?.split(',').filter(Boolean) as GoalKey[]) ?? [],
    [goalsParam]
  );
  const weights = useMemo(() => {
    try {
      return JSON.parse(weightsParam ?? '{}') as Record<string, number>;
    } catch {
      return {};
    }
  }, [weightsParam]);

  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(INGREDIENT_PREF_KEYS.map((k) => [k, false]))
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();
  const router = useRouter();

  const toggle = (key: IngredientPrefKey) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const finish = async () => {
    setLoading(true);
    setError('');
    try {
      const goalWeights: Record<string, number> = {};
      for (const k of GOAL_KEYS) goalWeights[k] = selected.includes(k) ? weights[k] ?? 5 : 0;
      const { user } = await api.updateProfile({
        selectedGoals: selected,
        goalWeights,
        ingredientPreferences: prefs,
        onboardingComplete: true,
      });
      updateUser(user);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Title>Ingredient preferences</Title>
      <Subtitle>Optional toggles — only affect your score when enabled.</Subtitle>
      <Disclaimer text={INGREDIENT_PREF_NOTE} />
      <ErrorBanner message={error} />
      {INGREDIENT_PREF_KEYS.map((key) => {
        const meta = INGREDIENT_PREF_META[key];
        const on = prefs[key];
        return (
          <Pressable key={key} onPress={() => toggle(key)} style={[styles.chip, on && styles.chipOn]}>
            <View style={[styles.check, on && styles.checkOn]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.chipLabel}>{meta.label}</Text>
              <Text style={styles.chipHint}>{meta.hint}</Text>
            </View>
          </Pressable>
        );
      })}
      <Button label="Start scanning" onPress={finish} loading={loading} />
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
  chipLabel: { fontSize: 16, fontWeight: '600' },
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
