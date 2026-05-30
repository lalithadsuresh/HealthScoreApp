/** Per-serving vs per-100g parsing, scoring basis, and display helpers. */

export const SERVING_UNAVAILABLE_WARNING =
  'Serving size was unavailable, so this score uses per-100g nutrition data.';

function num(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function firstNum(nutriments, keys) {
  for (const key of keys) {
    if (!key) continue;
    const v = num(nutriments[key]);
    if (v !== null) return v;
  }
  return null;
}

function sodiumMg(nutriments, suffix) {
  const s100 = suffix === '_serving' ? '' : '_100g';
  const sodium = firstNum(nutriments, [
    `sodium${suffix}`,
    `sodium${s100}`,
    suffix === '_serving' ? 'sodium' : null,
  ].filter(Boolean));
  if (sodium != null) {
    return sodium < 10 ? sodium * 1000 : sodium;
  }
  const salt = firstNum(nutriments, [`salt${suffix}`, `salt${s100}`]);
  if (salt != null) return salt * 400;
  return null;
}

/**
 * Parse OFF nutriments for one basis.
 * @param {'100g' | 'serving'} mode
 */
export function parseNutrientsFromOff(nutriments = {}, mode = '100g') {
  const sfx = mode === 'serving' ? '_serving' : '_100g';
  const plain = mode === 'serving';

  const energyKcal = firstNum(nutriments, [
    `energy-kcal${sfx}`,
    `energy_kcal${sfx}`,
    plain ? 'energy-kcal' : null,
    plain ? 'energy' : null,
  ].filter(Boolean));

  const protein = firstNum(nutriments, [
    `proteins${sfx}`,
    `protein${sfx}`,
    plain ? 'proteins' : null,
  ].filter(Boolean));

  const fat = firstNum(nutriments, [`fat${sfx}`, plain ? 'fat' : null].filter(Boolean));
  const saturatedFat = firstNum(nutriments, [
    `saturated-fat${sfx}`,
    `saturated_fat${sfx}`,
    plain ? 'saturated-fat' : null,
  ].filter(Boolean));

  const carbs = firstNum(nutriments, [
    `carbohydrates${sfx}`,
    `carbohydrate${sfx}`,
    plain ? 'carbohydrates' : null,
  ].filter(Boolean));

  const sugar = firstNum(nutriments, [
    `sugars${sfx}`,
    `sugar${sfx}`,
    plain ? 'sugars' : null,
    plain ? 'sugar' : null,
  ].filter(Boolean));

  const fiber = firstNum(nutriments, [`fiber${sfx}`, plain ? 'fiber' : null].filter(Boolean));

  return {
    energyKcal,
    protein,
    fat,
    saturatedFat,
    carbs,
    sugar,
    fiber,
    sodium: sodiumMg(nutriments, sfx),
  };
}

export function hasMeaningfulNutrients(n) {
  if (!n) return false;
  const keys = ['energyKcal', 'protein', 'sugar', 'fiber', 'sodium', 'carbs', 'fat'];
  return keys.some((k) => n[k] != null);
}

function isLikelyDrink(raw) {
  const p = raw?.product ?? raw ?? {};
  const text = `${p.product_name ?? ''} ${p.quantity ?? ''} ${p.categories ?? ''}`.toLowerCase();
  const tags = (p.categories_tags ?? []).join(' ').toLowerCase();
  return (
    /\b(ml|millilitre|milliliter|fl\.?\s*oz|fluid ounce|liter|litre|\dl\b)/i.test(text) ||
    /en:beverages|en:soft-drinks|en:juices|en:waters|en:energy-drinks|en:sodas/.test(tags)
  );
}

export function buildNutrientProfiles(raw, nutrimentsRaw = {}) {
  const p = raw?.product ?? raw ?? {};
  const nutrientsPer100g = parseNutrientsFromOff(nutrimentsRaw, '100g');
  const nutrientsPerServing = parseNutrientsFromOff(nutrimentsRaw, 'serving');

  const servingSizeLabel = (p.serving_size ?? '').trim() || null;
  const servingQuantity = num(p.serving_quantity);
  const servingHasNutrients = hasMeaningfulNutrients(nutrientsPerServing);
  const hasServingMeta = Boolean(servingSizeLabel || servingQuantity != null);
  const drink = isLikelyDrink(raw);

  let useServing =
    servingHasNutrients ||
    (hasServingMeta && (nutrientsPerServing.sugar != null || nutrientsPerServing.energyKcal != null));

  if (drink && servingHasNutrients) useServing = true;
  if (p.nutrition_data_per === 'serving' && servingHasNutrients) useServing = true;

  const nutritionBasis = useServing ? 'serving' : '100g';
  const primary = useServing ? nutrientsPerServing : nutrientsPer100g;
  const servingLabel =
    servingSizeLabel ||
    (servingQuantity != null ? `${servingQuantity} g` : null) ||
    '1 serving';

  return {
    nutrientsPer100g,
    nutrientsPerServing: servingHasNutrients ? nutrientsPerServing : null,
    nutriments: primary,
    nutritionBasis,
    nutritionBasisWarning: useServing ? null : SERVING_UNAVAILABLE_WARNING,
    servingSize: servingSizeLabel,
    servingQuantity,
    servingLabel,
    isLikelyDrink: drink,
  };
}

/** Legacy products cached with only `nutriments`. */
export function migrateProductNutrients(product) {
  if (product.nutrientsPer100g || product.nutritionBasis) return product;

  const legacy = product.nutriments ?? {};
  return {
    ...product,
    nutrientsPer100g: legacy,
    nutrientsPerServing: null,
    nutriments: legacy,
    nutritionBasis: '100g',
    nutritionBasisWarning: SERVING_UNAVAILABLE_WARNING,
    servingLabel: '100g',
  };
}

export function resolveForScoring(product) {
  const p = migrateProductNutrients(product);
  return {
    ...p,
    nutriments: p.nutriments ?? p.nutrientsPer100g ?? {},
  };
}

/** Scoring thresholds differ by basis (per serving vs per 100g). */
export const SCORE_THRESHOLDS = {
  serving: {
    protein: { good: 12, poor: 3 },
    energyKcal: { good: 180, poor: 450 },
    sugar: { good: 8, poor: 28 },
    fiber: { good: 4, poor: 1 },
    sodium: { good: 200, poor: 650 },
    carbs: { good: 20, poor: 55 },
    saturatedFat: { good: 3, poor: 10 },
  },
  '100g': {
    protein: { good: 18, poor: 4 },
    energyKcal: { good: 120, poor: 400 },
    sugar: { good: 6, poor: 22 },
    fiber: { good: 5, poor: 1 },
    sodium: { good: 300, poor: 700 },
    carbs: { good: 12, poor: 45 },
    saturatedFat: { good: 3, poor: 12 },
  },
};

export function thresholds(product) {
  const basis = product.nutritionBasis === 'serving' ? 'serving' : '100g';
  return SCORE_THRESHOLDS[basis];
}

export function formatNutrientValue(key, value, product) {
  if (value == null) {
    const labels = {
      sugar: 'Sugar data unavailable.',
      protein: 'Protein data unavailable.',
      energyKcal: 'Calorie data unavailable.',
      fiber: 'Fiber data unavailable.',
      sodium: 'Sodium data unavailable.',
      carbs: 'Carb data unavailable.',
      saturatedFat: 'Saturated fat data unavailable.',
    };
    return labels[key] ?? 'Nutrient data unavailable.';
  }

  const basis = product.nutritionBasis === 'serving' ? 'serving' : '100g';
  const per = basis === 'serving' ? 'per serving' : 'per 100g';

  switch (key) {
    case 'energyKcal':
      return `Calories ${per}: ${Math.round(value * 10) / 10} kcal`;
    case 'protein':
      return `Protein ${per}: ${Math.round(value * 10) / 10}g`;
    case 'sugar':
      return `Sugar ${per}: ${Math.round(value * 10) / 10}g`;
    case 'fiber':
      return `Fiber ${per}: ${Math.round(value * 10) / 10}g`;
    case 'sodium':
      return `Sodium ${per}: ${Math.round(value * 10) / 10}mg`;
    case 'saturatedFat':
      return `Saturated fat ${per}: ${Math.round(value * 10) / 10}g`;
    case 'carbs':
      return `Carbs ${per}: ${Math.round(value * 10) / 10}g`;
    default:
      return `${key} ${per}: ${value}`;
  }
}

export function formatNutrientDisplay(value, unit) {
  if (value == null) return '—';
  return `${Math.round(value * 10) / 10} ${unit}`;
}
