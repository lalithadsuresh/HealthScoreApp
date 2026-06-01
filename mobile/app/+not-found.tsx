import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../src/components/ui';
import { WELCOME_ROUTE } from '../src/constants/routes';
import { colors, spacing } from '../src/theme';

/** No auto-redirect — avoids navigation loops with auth guards. */
export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.wrap}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>That screen is not available in this build.</Text>
        <Button label="Back to welcome" onPress={() => router.replace(WELCOME_ROUTE)} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
  body: { fontSize: 16, color: colors.muted, marginBottom: 24, lineHeight: 22 },
});
