import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Disclaimer, LoadingCenter } from '../src/components/ui';
import { MEDICAL_DISCLAIMER } from '../src/constants/goals';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing } from '../src/theme';

export default function WelcomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingCenter />;
  if (user?.onboardingComplete) return <Redirect href="/(tabs)" />;
  if (user) return <Redirect href="/(onboarding)/primary" />;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.badge}>Personalized nutrition</Text>
        <Text style={styles.logo}>3Bite</Text>
        <Text style={styles.tagline}>
          Scan food. Get a goal-based score — built for your priorities, not a one-size-fits-all
          grade.
        </Text>
      </View>

      <Disclaimer text={MEDICAL_DISCLAIMER} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nutrition support, your way</Text>
        <Text style={styles.cardBody}>
          Pick goals like protein, low sugar, or clean ingredients. Scan a barcode and see a
          personalized 0–100 score with clear explanations.
        </Text>
      </View>

      <Button label="Get started" onPress={() => router.push('/(auth)/signup')} />
      <Button label="I have an account" variant="secondary" onPress={() => router.push('/(auth)/login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  badge: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginBottom: 8 },
  logo: { fontSize: 42, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  tagline: { color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 24, marginTop: 8 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 8, color: colors.text },
  cardBody: { fontSize: 15, color: colors.muted, lineHeight: 22 },
});
