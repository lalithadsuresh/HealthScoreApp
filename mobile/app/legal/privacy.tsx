import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../../src/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.updated}>Last updated: May 2026</Text>
      <Text style={styles.h1}>Privacy Policy — 3Bite</Text>
      <Text style={styles.p}>
        3Bite (&quot;we&quot;, &quot;the app&quot;) helps you scan or search food products and view
        goal-based nutrition scores. This policy describes what we collect and how we use it.
      </Text>
      <Text style={styles.h2}>Information we collect</Text>
      <Text style={styles.p}>
        • Account information: name, email, and password (stored securely as a hash on our servers).{'\n'}
        • Nutrition preferences: goals you select and importance weights (0–10).{'\n'}
        • Usage data: product barcodes and searches you perform to fetch nutrition from Open Food Facts.
      </Text>
      <Text style={styles.h2}>Camera</Text>
      <Text style={styles.p}>
        If you use barcode scanning, the app accesses your device camera locally to read barcodes. We do
        not store photos or video from your camera on our servers.
      </Text>
      <Text style={styles.h2}>How we use information</Text>
      <Text style={styles.p}>
        We use your preferences to calculate personalized, goal-based scores. We do not sell your
        personal information. Product nutrition data comes from Open Food Facts and may be sent to their
        public API when you scan or search.
      </Text>
      <Text style={styles.h2}>Data retention & deletion</Text>
      <Text style={styles.p}>
        You may delete your account at any time from Profile → Delete account. This removes your profile
        and preferences from our database.
      </Text>
      <Text style={styles.h2}>Not medical advice</Text>
      <Text style={styles.p}>
        3Bite provides informational nutrition support only. It does not provide medical advice,
        diagnosis, or treatment.
      </Text>
      <Text style={styles.h2}>Contact</Text>
      <Text style={styles.p}>
        For privacy questions, contact the app developer through the repository or support channel listed
        in the App Store listing.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, paddingBottom: 40 },
  updated: { color: colors.muted, marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: colors.text },
  h2: { fontSize: 17, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text },
  p: { fontSize: 15, lineHeight: 24, color: colors.muted },
});
