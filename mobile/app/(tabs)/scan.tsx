import { useRouter } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Card, Subtitle, Title } from '../../src/components/ui';
import { colors } from '../../src/theme';
import { openScanner } from '../../src/utils/scannerNavigation';

export default function ScanHubScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Title>Find a product</Title>
      <Subtitle>Barcode scan uses your camera. Name search updates as you type.</Subtitle>
      <Card>
        <Text style={styles.emoji}>📷</Text>
        <Text style={styles.cardTitle}>Barcode scanner</Text>
        <Text style={styles.cardBody}>We&apos;ll ask for camera permission before scanning.</Text>
        <Button label="Open camera scanner" onPress={() => openScanner()} />
      </Card>
      <Card>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.cardTitle}>Search by name</Text>
        <Text style={styles.cardBody}>Look up products when you don&apos;t have a barcode handy.</Text>
        <Button label="Open Search" variant="secondary" onPress={() => router.push('/search')} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: colors.bg },
  emoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  cardBody: { color: colors.muted, marginBottom: 12, lineHeight: 20 },
});
