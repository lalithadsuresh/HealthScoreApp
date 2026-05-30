import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from '../../src/api/client';
import { ScoreCircle } from '../../src/components/ScoreCircle';
import { DriverChips, ScoreSummaryCard } from '../../src/components/ScoreBreakdown';
import { NutritionFacts } from '../../src/components/NutritionFacts';
import { Button, Card, ErrorBanner, LoadingCenter } from '../../src/components/ui';
import type { Product, ProductScore, SearchResult } from '../../src/types/api';
import { colors, scoreColor } from '../../src/theme';

export default function ProductResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [score, setScore] = useState<ProductScore | null>(null);
  const [alternatives, setAlternatives] = useState<SearchResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getProduct(String(barcode));
        if (!cancelled) {
          setProduct(data.product);
          setScore(data.score);
          setAlternatives(data.alternatives ?? []);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Could not load this product. Try another barcode or check your network.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  if (loading) return <LoadingCenter />;

  if (error || !product || !score) {
    return (
      <View style={styles.wrap}>
        <Stack.Screen options={{ title: 'Product', headerShown: true }} />
        <ErrorBanner message={error || 'Product not found'} />
        <Button label="Try again" onPress={() => router.back()} />
      </View>
    );
  }

  const summary = score.scoreSummary;
  const drivers = score.visualDrivers ?? { positive: [], negative: [] };
  const showScore = score.confidentScore !== false && score.overallScore != null;
  const dataWarning = score.dataWarning;

  return (
    <>
      <Stack.Screen options={{ title: product.name.slice(0, 24), headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ alignItems: 'center' }}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.heroImg} resizeMode="contain" />
          ) : null}
          <Text style={styles.productName}>{product.name}</Text>
          {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
          {showScore ? (
            <ScoreCircle score={score.overallScore!} label="Your score" />
          ) : (
            <Text style={styles.muted}>Personalized score unavailable</Text>
          )}
        </Card>

        {(dataWarning || score.nutritionBasisWarning) ? (
          <Card style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
            {score.nutritionBasisWarning ? (
              <Text style={styles.bullet}>{score.nutritionBasisWarning}</Text>
            ) : null}
            {dataWarning ? <Text style={styles.bullet}>{dataWarning}</Text> : null}
          </Card>
        ) : null}

        {showScore ? (
        <ScoreSummaryCard summary={summary} score={score.overallScore!} />
        ) : null}

        {showScore ? (
        <>
        <DriverChips title="Positive Drivers" drivers={drivers.positive} variant="positive" />
        <DriverChips title="Negative Drivers" drivers={drivers.negative} variant="negative" />
        </>
        ) : null}

        {score.compatibility?.conflicts?.length ? (
          <Card style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
            <Text style={styles.section}>Compatibility</Text>
            {score.compatibility.conflicts.map((c, i) => (
              <Text key={i} style={styles.bullet}>
                ⚠ {c.message}
              </Text>
            ))}
          </Card>
        ) : null}

        {product.ingredientsText ? (
          <Card>
            <Text style={styles.section}>Ingredients</Text>
            <Text style={styles.muted}>{product.ingredientsText}</Text>
          </Card>
        ) : null}
        <NutritionFacts product={product} />

        {alternatives.length > 0 && (
          <Card>
            <Text style={styles.section}>Alternatives to consider</Text>
            {alternatives.map((alt) => (
              <Pressable
                key={alt.barcode}
                style={styles.altRow}
                onPress={() => router.push(`/product/${alt.barcode}`)}
              >
                <Text style={styles.altName} numberOfLines={2}>
                  {alt.name}
                </Text>
                {alt.previewScore != null && (
                  <Text style={[styles.altScore, { color: scoreColor(alt.previewScore) }]}>
                    {alt.previewScore}
                  </Text>
                )}
              </Pressable>
            ))}
          </Card>
        )}

        <Button label="Scan another product" onPress={() => router.push('/scanner')} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  heroImg: { width: 120, height: 120, marginBottom: 8 },
  productName: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  brand: { color: colors.muted, marginBottom: 8, textAlign: 'center' },
  section: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  bullet: { marginBottom: 8, lineHeight: 20, fontSize: 14 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: '50%', marginBottom: 12 },
  gridLabel: { fontSize: 12, color: colors.muted },
  gridVal: { fontWeight: '600' },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  altName: { flex: 1, paddingRight: 8 },
  altScore: { fontWeight: '700', fontSize: 18 },
});
