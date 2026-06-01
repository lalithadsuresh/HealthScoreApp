import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Subtitle, Title } from '../../src/components/ui';
import { GOAL_META } from '../../src/constants/goals';
import type { GoalKey } from '../../src/constants/goals';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';
import { openScanner } from '../../src/utils/scannerNavigation';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const first = user?.name?.split(' ')[0] ?? 'there';
  const goals = (user?.selectedGoals ?? []).slice(0, 4) as GoalKey[];

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Title>{`Hey, ${first} 👋`}</Title>
      <Subtitle>Your goal-based lens is ready. Scan or search a product for your personalized score.</Subtitle>

      <Card>
        <Text style={styles.scanTitle}>Scan or search</Text>
        <Text style={styles.scanBody}>Use your camera for barcodes, or search by product name.</Text>
        <Button label="Open scanner" onPress={() => openScanner()} />
        <Button label="Open Search" variant="secondary" onPress={() => router.push('/search')} />
      </Card>

      <Card>
        <Text style={styles.section}>Active priorities</Text>
        {goals.length === 0 ? (
          <Text style={styles.muted}>Update goals in Profile</Text>
        ) : (
          goals.map((k) => (
            <Text key={k} style={styles.tag}>
              {GOAL_META[k].emoji} {GOAL_META[k].label}
            </Text>
          ))
        )}
      </Card>

      <Card style={{ backgroundColor: colors.primaryLight }}>
        <Text style={styles.section}>Goal-based scoring</Text>
        <Text style={styles.muted}>
          Scores reflect your nutrition priorities — informational support, not medical advice.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scanTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  scanBody: { color: colors.muted, marginBottom: 12, lineHeight: 20 },
  section: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  muted: { color: colors.muted, lineHeight: 20 },
  tag: { fontSize: 15, marginBottom: 6, color: colors.primaryDark },
});
