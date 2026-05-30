import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../../src/theme';

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.updated}>Last updated: May 2026</Text>
      <Text style={styles.h1}>Terms of Use — 3Bite</Text>
      <Text style={styles.p}>
        By using 3Bite, you agree to these terms. If you do not agree, do not use the app.
      </Text>
      <Text style={styles.h2}>Service description</Text>
      <Text style={styles.p}>
        3Bite offers goal-based nutrition scoring and product lookup for informational purposes. Scores
        reflect your selected priorities — they are not universal health ratings and are not medical
        advice.
      </Text>
      <Text style={styles.h2}>Accuracy</Text>
      <Text style={styles.p}>
        Nutrition data is sourced from third parties (including Open Food Facts) and may be incomplete or
        outdated. Always verify labels if you have allergies or dietary requirements.
      </Text>
      <Text style={styles.h2}>Your account</Text>
      <Text style={styles.p}>
        You are responsible for keeping your login credentials secure. You must provide accurate
        registration information.
      </Text>
      <Text style={styles.h2}>Acceptable use</Text>
      <Text style={styles.p}>
        Do not misuse the API, attempt unauthorized access, or use the app in violation of applicable law.
      </Text>
      <Text style={styles.h2}>Disclaimer</Text>
      <Text style={styles.p}>
        THE APP IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES. WE ARE NOT LIABLE FOR DECISIONS YOU MAKE
        BASED ON SCORES OR NUTRITION DATA. CONSULT A QUALIFIED PROFESSIONAL FOR MEDICAL OR DIETARY GUIDANCE.
      </Text>
      <Text style={styles.h2}>Changes</Text>
      <Text style={styles.p}>
        We may update these terms. Continued use after changes constitutes acceptance.
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
