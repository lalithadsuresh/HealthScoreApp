import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api/client';
import { Button, Card, Disclaimer, ErrorBanner, Input, Subtitle, Title } from '../../src/components/ui';
import { MEDICAL_DISCLAIMER } from '../../src/constants/goals';
import {
  ALLERGY_RESTRICTION_KEYS,
  ALLERGY_RESTRICTION_LABELS,
  GOAL_FOCUS_OPTIONS,
  PERSONAL_PRIORITIES,
  PERSONAL_PRIORITY_LABELS,
  PRIMARY_GOAL_LABELS,
  PRIMARY_GOALS,
  type PrimaryGoalId,
} from '../../src/constants/onboarding';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
} from '../../src/constants/ingredientPreferences';
import { useAuth } from '../../src/context/AuthContext';
import { navigateToWelcomeAfterSignOut } from '../../src/utils/authNavigation';
import { colors } from '../../src/theme';

function toggle(list: string[], id: string, max: number) {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= max) return list;
  return [...list, id];
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoalId | ''>('');
  const [goalFocuses, setGoalFocuses] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [ingredientPrefs, setIngredientPrefs] = useState<Record<string, boolean>>({});
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setPrimaryGoal((user.primaryGoal as PrimaryGoalId) ?? '');
    setGoalFocuses(
      user.goalFocuses?.length ? [...user.goalFocuses] : user.goalFocus ? [user.goalFocus] : []
    );
    setPriorities(user.personalPriorities ?? []);
    setIngredientPrefs(
      Object.fromEntries(INGREDIENT_PREF_KEYS.map((k) => [k, Boolean(user.ingredientPreferences?.[k])]))
    );
    setRestrictions(user.allergiesRestrictions ?? []);
  }, [user]);

  const focusOptions = useMemo(
    () => (primaryGoal ? (GOAL_FOCUS_OPTIONS[primaryGoal] ?? []).filter((o) => o.id !== 'other') : []),
    [primaryGoal]
  );

  const save = async () => {
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const { user: u } = await api.updateProfile({
        name: name.trim(),
        primaryGoal: primaryGoal || undefined,
        goalFocuses,
        goalFocus: goalFocuses[0] ?? null,
        personalPriorities: priorities,
        ingredientPreferences: ingredientPrefs,
        allergiesRestrictions: restrictions,
      });
      updateUser(u);
      setMsg('Profile saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setAuthBusy(true);
    setError('');
    try {
      await navigateToWelcomeAfterSignOut(logout);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log out');
      setAuthBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile and nutrition preferences. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setAuthBusy(true);
            setError('');
            try {
              await api.deleteAccount();
              await navigateToWelcomeAfterSignOut(logout);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not delete account');
              setAuthBusy(false);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Title>Profile</Title>
      <Subtitle>{user.email}</Subtitle>
      <Text style={styles.sub}>Your saved onboarding personalization</Text>
      <Disclaimer text={MEDICAL_DISCLAIMER} />
      {msg ? <Text style={styles.success}>{msg}</Text> : null}
      <ErrorBanner message={error} />

      <Card>
        <Input label="Display name" value={name} onChangeText={setName} />
      </Card>

      <Text style={styles.section}>Primary goal</Text>
      {PRIMARY_GOALS.map((id) => (
        <Pressable
          key={id}
          onPress={() => {
            setPrimaryGoal(id);
            setGoalFocuses([]);
          }}
          style={[styles.chip, primaryGoal === id && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{PRIMARY_GOAL_LABELS[id]}</Text>
        </Pressable>
      ))}

      {primaryGoal && focusOptions.length > 0 && (
        <>
          <Text style={styles.section}>Goal focus ({goalFocuses.length}/4)</Text>
          {focusOptions.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => setGoalFocuses((p) => toggle(p, o.id, 4))}
              style={[styles.chip, goalFocuses.includes(o.id) && styles.chipOn]}
            >
              <Text style={styles.chipLabel}>{o.label}</Text>
            </Pressable>
          ))}
        </>
      )}

      <Text style={styles.section}>Personal priorities</Text>
      {PERSONAL_PRIORITIES.map((id) => (
        <Pressable
          key={id}
          onPress={() => setPriorities((p) => toggle(p, id, 6))}
          style={[styles.chip, priorities.includes(id) && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{PERSONAL_PRIORITY_LABELS[id]}</Text>
        </Pressable>
      ))}

      <Text style={styles.section}>Ingredient preferences</Text>
      <Disclaimer text={INGREDIENT_PREF_NOTE} />
      {INGREDIENT_PREF_KEYS.map((key) => {
        const meta = INGREDIENT_PREF_META[key];
        const on = ingredientPrefs[key];
        return (
          <Pressable
            key={key}
            onPress={() => setIngredientPrefs((p) => ({ ...p, [key]: !p[key] }))}
            style={[styles.chip, on && styles.chipOn]}
          >
            <Text style={styles.chipLabel}>{meta.label}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.section}>Allergies & restrictions</Text>
      {ALLERGY_RESTRICTION_KEYS.map((id) => (
        <Pressable
          key={id}
          onPress={() => setRestrictions((p) => toggle(p, id, 20))}
          style={[styles.chip, restrictions.includes(id) && styles.chipOn]}
        >
          <Text style={styles.chipLabel}>{ALLERGY_RESTRICTION_LABELS[id]}</Text>
        </Pressable>
      ))}

      <Button label="Save changes" onPress={save} loading={busy} disabled={authBusy} />
      <Button label="Privacy policy" variant="secondary" onPress={() => router.push('/legal/privacy')} />
      <Button label="Terms of use" variant="secondary" onPress={() => router.push('/legal/terms')} />
      <Button
        label={authBusy ? 'Signing out…' : 'Log out'}
        variant="ghost"
        onPress={handleLogout}
        disabled={authBusy}
      />
      <Button label="Delete account" variant="danger" onPress={confirmDelete} disabled={authBusy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  sub: { color: colors.muted, marginBottom: 8 },
  success: { color: colors.success, marginBottom: 8 },
  chip: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  chipLabel: { fontSize: 16, fontWeight: '500' },
});
