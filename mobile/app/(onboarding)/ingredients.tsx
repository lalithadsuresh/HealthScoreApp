import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { api } from '../../src/api/client';
import { Button, Disclaimer, Subtitle, Title } from '../../src/components/ui';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
} from '../../src/constants/ingredientPreferences';
import { HOME_ROUTE } from '../../src/constants/routes';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';
import { openScanner } from '../../src/utils/scannerNavigation';

export default function OnboardingIngredientsScreen() {
  const params = useLocalSearchParams();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(INGREDIENT_PREF_KEYS.map((k) => [k, false]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { updateUser } = useAuth();
  const router = useRouter();

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const completeOnboarding = async (goScanner: boolean) => {
    setLoading(true);
    setError('');
    try {
      const priorities = String(params.priorities ?? '').split(',').filter(Boolean);
      const ingredientPreferences = Object.fromEntries(
        INGREDIENT_PREF_KEYS.map((k) => [k, Boolean(prefs[k])])
      );
      const goalFocuses = String(params.goalFocuses ?? params.goalFocus ?? '')
        .split(',')
        .filter(Boolean);
      const { user } = await api.updateProfile({
        primaryGoal: String(params.primaryGoal),
        goalFocuses,
        goalFocus: goalFocuses[0] ?? null,
        personalPriorities: priorities,
        ingredientPreferences,
        onboardingComplete: true,
      });
      updateUser(user);
      if (typeof router.dismissAll === 'function') {
        router.dismissAll();
      }
      if (goScanner) {
        openScanner();
      } else {
        router.replace(HOME_ROUTE);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 5 of 5</Text>
      <Title>Ingredients to limit</Title>
      <Subtitle>Optional personal preferences.</Subtitle>
      <Disclaimer text={INGREDIENT_PREF_NOTE} />
      {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
      {INGREDIENT_PREF_KEYS.map((key) => (
        <Pressable
          key={key}
          onPress={() => toggle(key)}
          style={[styles.chip, prefs[key] && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{INGREDIENT_PREF_META[key].label}</Text>
          <Text style={styles.hint}>{INGREDIENT_PREF_META[key].hint}</Text>
        </Pressable>
      ))}
      <Button label="Back" variant="secondary" onPress={() => router.push({ pathname: '/(onboarding)/priorities', params })} />
      <Button
        label="Continue to home"
        variant="secondary"
        onPress={() => completeOnboarding(false)}
        loading={loading}
      />
      <Button label="Start scanning" onPress={() => completeOnboarding(true)} loading={loading} />
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
    marginBottom: 10,
    backgroundColor: colors.card,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, color: colors.muted, marginTop: 4 },
});
