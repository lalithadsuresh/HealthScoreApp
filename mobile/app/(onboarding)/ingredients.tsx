import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Disclaimer, Subtitle, Title } from '../../src/components/ui';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
} from '../../src/constants/ingredientPreferences';
import { colors } from '../../src/theme';

export default function OnboardingIngredientsScreen() {
  const params = useLocalSearchParams();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(INGREDIENT_PREF_KEYS.map((k) => [k, false]))
  );
  const router = useRouter();

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <ScrollView contentContainerStyle={styles.pad}>
      <Text style={styles.step}>Step 4 of 6</Text>
      <Title>Ingredients to limit</Title>
      <Subtitle>Optional personal preferences.</Subtitle>
      <Disclaimer text={INGREDIENT_PREF_NOTE} />
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
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Button
        label="Continue"
        onPress={() => {
          const next: Record<string, string> = { ...params } as Record<string, string>;
          for (const k of INGREDIENT_PREF_KEYS) next[k] = prefs[k] ? '1' : '0';
          router.push({ pathname: '/(onboarding)/allergies', params: next });
        }}
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
    marginBottom: 10,
    backgroundColor: colors.card,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, color: colors.muted, marginTop: 4 },
});
