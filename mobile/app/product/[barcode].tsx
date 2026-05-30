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
import { Button, Card, ErrorBanner, LoadingCenter, Subtitle } from '../../src/components/ui';
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

  const n = product.nutriments;

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
          <ScoreCircle score={score.overallScore} label="Goal-based score" />
          
        {score.whyThisScore && (
          <>
            <Card>
              <Text style={styles.section}>Why this score?</Text>
              <Text style={styles.muted}>
                Based on your goals and any ingredient preferences you enabled.
              </Text>
            </Card>
            <Card>
              <Text style={styles.section}>Positive drivers</Text>
              {(score.whyThisScore.positiveDrivers ?? []).length ? (
                score.whyThisScore.positiveDrivers.map((d, i) => (
                  <Text key={`p-${i}`} style={styles.driver}>+ {d.text}</Text>
                ))
              ) : (
                <Text style={styles.muted}>No strong positive drivers.</Text>
              )}
            </Card>
            <Card>
              <Text style={styles.section}>Negative drivers</Text>
              {(score.whyThisScore.negativeDrivers ?? []).map((d, i) => (
                <Text key={`n-${i}`} style={styles.driver}>− {d.text}</Text>
              ))}
            </Card>
            {(score.whyThisScore.ingredientDrivers ?? []).length > 0 && (
              <Card>
                <Text style={styles.section}>Ingredient-based drivers</Text>
                {score.whyThisScore.ingredientDrivers.map((d, i) => (
                  <Text key={`i-${i}`} style={styles.driver}>
                    {d.impact === 'positive' ? '+' : '−'} {d.text}
                  </Text>
                ))}
              </Card>
            )}
          </>
        )}

        {score.nutrientContributions && (
          <Card>
            <Text style={styles.section}>Score breakdown</Text>
            {Object.values(score.nutrientContributions).map((item) =>
              item?.score != null ? (
                <View key={item.key} style={styles.breakRow}>
                  <View style={styles.breakHead}>
                    <Text style={styles.breakLabel}>{item.label}</Text>
                    <Text style={[styles.breakScore, { color: scoreColor(item.score) }]}>
                      {item.score}
                    </Text>
                  </View>
                  <View style={styles.bar}>
                    <View style={[styles.barFill, { width: `${item.score}%` }]} />
                  </View>
                  <Text style={styles.weight}>{item.summary}</Text>
                </View>
              ) : null
            )}
          </Card>
        )}

        <Subtitle>Personalized for your nutrition priorities — not medical advice.</Subtitle>
        </Card>

        <Card>
          <Text style={styles.section}>Category breakdown</Text>
          {score.breakdown.map((b) => (
            <View key={b.goalKey} style={styles.breakRow}>
              <View style={styles.breakHead}>
                <Text style={styles.breakLabel}>{b.label}</Text>
                <Text style={[styles.breakScore, { color: scoreColor(b.subscore) }]}>
                  {b.subscore}
                </Text>
              </View>
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${b.subscore}%` }]} />
              </View>
              <Text style={styles.weight}>Weight: {b.weight}/10</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.section}>Why it scored well</Text>
          {score.whyScoredWell?.length ? (
            score.whyScoredWell.map((w, i) => (
              <Text key={i} style={styles.bullet}>
                ✓ {w.text} ({w.goal})
              </Text>
            ))
          ) : (
            <Text style={styles.muted}>No strong wins for your current weights.</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.section}>Where it lost points</Text>
          {score.whyLostPoints?.length ? (
            score.whyLostPoints.map((w, i) => (
              <Text key={i} style={styles.bullet}>
                − {w.text} ({w.goal})
              </Text>
            ))
          ) : (
            <Text style={styles.muted}>Nothing major flagged for your goals.</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.section}>Nutrition (per 100g)</Text>
          <View style={styles.grid}>
            {[
              ['Calories', n.energyKcal, 'kcal'],
              ['Protein', n.protein, 'g'],
              ['Sugar', n.sugar, 'g'],
              ['Fiber', n.fiber, 'g'],
              ['Sodium', n.sodium, 'mg'],
              ['Fat', n.fat, 'g'],
            ].map(([label, val, unit]) => (
              <View key={String(label)} style={styles.gridItem}>
                <Text style={styles.gridLabel}>{label}</Text>
                <Text style={styles.gridVal}>
                  {val != null ? `${Math.round(Number(val) * 10) / 10} ${unit}` : '—'}
                </Text>
              </View>
            ))}
          </View>
        </Card>

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
  brand: { color: colors.muted, marginBottom: 8 },
  section: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  breakRow: { marginBottom: 14 },
  breakHead: { flexDirection: 'row', justifyContent: 'space-between' },
  breakLabel: { fontSize: 15 },
  breakScore: { fontWeight: '700', fontSize: 16 },
  bar: { height: 8, backgroundColor: colors.border, borderRadius: 4, marginTop: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary },
  weight: { fontSize: 12, color: colors.muted, marginTop: 4 },
  bullet: { marginBottom: 8, lineHeight: 20 },
  muted: { color: colors.muted },
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
  driver: { marginBottom: 8, lineHeight: 20 },
});

