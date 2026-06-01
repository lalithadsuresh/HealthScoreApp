import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ErrorBanner, Input, Title } from '../src/components/ui';
import { useAuth } from '../src/context/AuthContext';
import { HOME_ROUTE } from '../src/constants/routes';
import { navigateToWelcome } from '../src/utils/navigation';
import { isExplicitScannerIntent } from '../src/utils/scannerNavigation';
import { colors } from '../src/theme';

export default function ScannerScreen() {
  const { intent } = useLocalSearchParams<{ intent?: string }>();
  const { user, loading } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const scannedRef = useRef(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (loading) return;
    if (isExplicitScannerIntent(intent)) return;
    if (user?.onboardingComplete) {
      router.replace(HOME_ROUTE);
    } else if (!user) {
      navigateToWelcome(router);
    }
  }, [loading, user, intent, router]);

  if (!loading && !isExplicitScannerIntent(intent) && (user?.onboardingComplete || !user)) {
    return null;
  }

  const openProduct = useCallback(
    (code: string) => {
      const clean = code.replace(/\D/g, '');
      if (!clean) {
        setError('Enter a valid barcode number');
        return;
      }
      router.push(`/product/${clean}`);
    },
    [router]
  );

  const onBarcode = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      openProduct(data);
    },
    [openProduct]
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 16 }]}>
        <Title>Camera access</Title>
        <Text style={styles.permText}>
          3Bite needs your camera to scan product barcodes. We only use it for barcode lookup —
          not stored on our servers.
        </Text>
        <Button label="Allow camera access" onPress={requestPermission} />
        <Button label="Enter barcode manually" variant="secondary" onPress={() => {}} />
        <Card>
          <Input
            label="Barcode number"
            value={manualCode}
            onChangeText={setManualCode}
            keyboardType="number-pad"
            placeholder="e.g. 3017620422003"
          />
          <Button label="Look up product" onPress={() => openProduct(manualCode)} />
        </Card>
        <ErrorBanner message={error} />
      </View>
    );
  }

  return (
    <View style={styles.full}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={onBarcode}
      />
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
        <Button label="← Back" variant="ghost" onPress={() => router.replace(HOME_ROUTE)} />
        <Text style={styles.hint}>Align barcode within the frame</Text>
      </View>
      <View style={[styles.manual, { paddingBottom: insets.bottom + 16 }]}>
        <ErrorBanner message={error} />
        <Input
          label="Or type barcode"
          value={manualCode}
          onChangeText={setManualCode}
          keyboardType="number-pad"
        />
        <Button
          label="Look up"
          onPress={() => {
            scannedRef.current = true;
            openProduct(manualCode);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#000' },
  wrap: { flex: 1, padding: 16, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  permText: { color: colors.muted, lineHeight: 22, marginBottom: 16 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 8 },
  hint: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 120,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowRadius: 4,
  },
  manual: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
