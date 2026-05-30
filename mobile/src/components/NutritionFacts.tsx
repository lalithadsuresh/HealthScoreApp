import { StyleSheet, Text, View } from 'react-native';
import { Card } from './ui';
import { colors } from '../theme';
import type { Nutriments, Product } from '../types/api';

const FIELDS: [string, keyof Nutriments, string][] = [
  ['Calories', 'energyKcal', 'kcal'],
  ['Protein', 'protein', 'g'],
  ['Sugar', 'sugar', 'g'],
  ['Fiber', 'fiber', 'g'],
  ['Sodium', 'sodium', 'mg'],
];

function unavailable(key: keyof Nutriments) {
  const map: Partial<Record<keyof Nutriments, string>> = {
    sugar: 'Sugar data unavailable.',
    protein: 'Protein data unavailable.',
    energyKcal: 'Calorie data unavailable.',
    fiber: 'Fiber data unavailable.',
    sodium: 'Sodium data unavailable.',
  };
  return map[key] ?? 'Data unavailable.';
}

function formatVal(value: number | null | undefined, unit: string) {
  if (value == null) return '—';
  return `${Math.round(value * 10) / 10} ${unit}`;
}

function Grid({ nutriments }: { nutriments: Nutriments }) {
  return (
    <View style={styles.grid}>
      {FIELDS.map(([label, key, unit]) => {
        const val = nutriments[key];
        return (
          <View key={key} style={styles.cell}>
            <Text style={styles.label}>{label}</Text>
            {val == null ? (
              <Text style={styles.unavail}>{unavailable(key)}</Text>
            ) : (
              <Text style={styles.val}>{formatVal(val as number, unit)}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function NutritionFacts({ product }: { product: Product }) {
  const basis = product.nutritionBasis ?? '100g';
  const per100 = product.nutrientsPer100g ?? product.nutriments ?? {};
  const title =
    basis === 'serving'
      ? `Nutrition (per serving${product.servingLabel ? `: ${product.servingLabel}` : ''})`
      : 'Nutrition (per 100g)';

  return (
    <>
      {product.nutritionBasisWarning ? (
        <Card style={{ borderColor: '#fde68a', backgroundColor: '#fffbeb' }}>
          <Text style={styles.warn}>{product.nutritionBasisWarning}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.section}>{title}</Text>
        <Grid nutriments={product.nutriments ?? per100} />
      </Card>

      {basis === 'serving' && product.nutrientsPerServing ? (
        <Card>
          <Text style={styles.sectionSmall}>Comparison (per 100g)</Text>
          <Text style={styles.hint}>Compare different package sizes fairly.</Text>
          <Grid nutriments={per100} />
        </Card>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 17, fontWeight: '600', marginBottom: 12 },
  sectionSmall: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  hint: { fontSize: 13, color: colors.muted, marginBottom: 10 },
  warn: { fontSize: 14, color: '#92400e', lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%', marginBottom: 12 },
  label: { fontSize: 12, color: colors.muted },
  val: { fontWeight: '600' },
  unavail: { fontSize: 12, color: colors.muted },
});
