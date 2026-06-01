import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/ui';
import { colors, spacing } from '../src/theme';

export default function SignedOutScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const deleted = mode === 'delete';

  const goWelcome = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
      <Pressable
        onPress={goWelcome}
        style={styles.close}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        <Ionicons name="close" size={28} color={colors.text} />
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.emoji}>{deleted ? '✓' : '👋'}</Text>
        <Text style={styles.title}>{deleted ? 'Account deleted' : 'Logged out!'}</Text>
        <Text style={styles.body}>
          {deleted
            ? 'Your profile and preferences have been removed. You can create a new account anytime.'
            : 'You have been signed out. Sign in again anytime to restore your personalized scores.'}
        </Text>
        <Button label="Continue" onPress={goWelcome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.md },
  close: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted, textAlign: 'center', marginBottom: 28 },
});
