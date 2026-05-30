import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../../src/api/client';
import { Button, Card, Disclaimer, ErrorBanner, Input, Subtitle, Title } from '../../src/components/ui';
import { WeightStepper } from '../../src/components/WeightStepper';
import { GOAL_KEYS, GOAL_META, MEDICAL_DISCLAIMER, type GoalKey } from '../../src/constants/goals';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [selected, setSelected] = useState<GoalKey[]>(user?.selectedGoals ?? []);
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const k of GOAL_KEYS) w[k] = user?.goalWeights?.[k] ?? 0;
    return w;
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggle = (key: GoalKey) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const save = async () => {
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const goalWeights: Record<string, number> = {};
      for (const k of GOAL_KEYS) goalWeights[k] = selected.includes(k) ? weights[k] ?? 0 : 0;
      const { user: u } = await api.updateProfile({ name: name.trim(), selectedGoals: selected, goalWeights });
      updateUser(u);
      setMsg('Profile saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
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
            try {
              await api.deleteAccount();
              await logout();
              router.replace('/');
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Title>Profile</Title>
      <Subtitle>{user?.email}</Subtitle>
      <Disclaimer text={MEDICAL_DISCLAIMER} />
      {msg ? <Text style={styles.success}>{msg}</Text> : null}
      <ErrorBanner message={error} />

      <Card>
        <Input label="Display name" value={name} onChangeText={setName} />
      </Card>

      <Text style={styles.section}>Goals & importance</Text>
      {GOAL_KEYS.map((key) => {
        const on = selected.includes(key);
        return (
          <Card key={key}>
            <Pressable onPress={() => toggle(key)} style={styles.goalRow}>
              <View style={[styles.check, on && styles.checkOn]} />
              <Text style={styles.goalLabel}>
                {GOAL_META[key].emoji} {GOAL_META[key].label}
              </Text>
            </Pressable>
            {on && (
              <WeightStepper
                value={weights[key] ?? 0}
                onChange={(v) => setWeights((w) => ({ ...w, [key]: v }))}
              />
            )}
          </Card>
        );
      })}

      <Button label="Save changes" onPress={save} loading={busy} />
      <Button label="Privacy policy" variant="secondary" onPress={() => router.push('/legal/privacy')} />
      <Button label="Terms of use" variant="secondary" onPress={() => router.push('/legal/terms')} />
      <Button label="Log out" variant="ghost" onPress={async () => { await logout(); router.replace('/'); }} />
      <Button label="Delete account" variant="danger" onPress={confirmDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  success: { color: colors.success, marginBottom: 8 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  goalLabel: { fontSize: 16, fontWeight: '500' },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
