/** Per-serving vs per-100g parsing, scoring basis, and display helpers. */

export const NUTRIENT_PROFILE_VERSION = 2;

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

function sodiumMg(nutriments, mode) {
  const sfx = mode === 'serving' ? '_serving' : '_100g';
  const sodium = firstNum(nutriments, [`sodium${sfx}`]);
  if (sodium != null) {
    return sodium < 10 ? sodium * 1000 : sodium;
  }
  const salt = firstNum(nutriments, [`salt${sfx}`, 'salt_100g']);
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
    `energy${sfx}`,
    plain ? 'energy-kcal' : null,
    plain ? 'energy_kcal' : null,
    plain ? 'energy' : null,
  ].filter(Boolean));

  const protein = firstNum(nutriments, [
    `proteins${sfx}`,
    `protein${sfx}`,
    `proteins_${mode}`,
    plain ? 'proteins' : null,
    plain ? 'protein' : null,
  ].filter(Boolean));

  const fat = firstNum(nutriments, [`fat${sfx}`, `fat_${mode}`, plain ? 'fat' : null].filter(Boolean));

  const saturatedFat = firstNum(nutriments, [
    `saturated-fat${sfx}`,
    `saturated_fat${sfx}`,
    `saturated-fat_${mode}`,
    plain ? 'saturated-fat' : null,
  ].filter(Boolean));

  const carbs = firstNum(nutriments, [
    `carbohydrates${sfx}`,
    `carbohydrate${sfx}`,
    `carbohydrates_${mode}`,
    plain ? 'carbohydrates' : null,
  ].filter(Boolean));

  const sugar = firstNum(nutriments, [
    `sugars${sfx}`,
    `sugar${sfx}`,
    `sugars_${mode}`,
    `sugar_${mode}`,
    plain ? 'sugars' : null,
    plain ? 'sugar' : null,
  ].filter(Boolean));

  const fiber = firstNum(nutriments, [
    `fiber${sfx}`,
    `fiber_${mode}`,
    plain ? 'fiber' : null,
  ].filter(Boolean));

  return {
    energyKcal,
    protein,
    fat,
    saturatedFat,
    carbs,
    sugar,
    fiber,
    sodium: sodiumMg(nutriments, mode),
  };
}

export function hasMeaningfulNutrients(n, { forServing = false } = {}) {
  if (!n) return false;
  const core = ['energyKcal', 'protein', 'sugar', 'carbs', 'fat'];
  if (forServing) {
    return core.some((k) => n[k] != null);
  }
  const keys = [...core, 'fiber', 'sodium'];
  return keys.some((k) => n[k] != null);
}

/** Grams (or ml≈g) in one serving/container. */
export function parseServingQuantityGrams(raw) {
  const p = raw?.product ?? raw ?? {};
  const q = num(p.serving_quantity);
  if (q != null && q > 0 && q < 5000) return q;

  const ss = String(p.serving_size ?? p.quantity ?? '');
  const ml = ss.match(/(\d+(?:\.\d+)?)\s*ml\b/i);
  if (ml) return parseFloat(ml[1]);
  const flOz = ss.match(/(\d+(?:\.\d+)?)\s*fl\.?\s*oz/i);
  if (flOz) return parseFloat(flOz[1]) * 29.5735;
  const liters = ss.match(/(\d+(?:\.\d+)?)\s*l(?:itre|iter)?\b/i);
  if (liters) return parseFloat(liters[1]) * 1000;
  const grams = ss.match(/(\d+(?:\.\d+)?)\s*g(?:ram)?s?\b/i);
  if (grams) return parseFloat(grams[1]);
  const parenG = ss.match(/\(\s*(\d+(?:\.\d+)?)\s*g\s*\)/i);
  if (parenG) return parseFloat(parenG[1]);

  return null;
}

export function deriveNutrientsPerServingFrom100g(nutrientsPer100g, servingGrams) {
  if (!nutrientsPer100g || !servingGrams || servingGrams <= 0) return null;
  const factor = servingGrams / 100;
  const out = {};
  for (const [key, value] of Object.entries(nutrientsPer100g)) {
    out[key] = value != null ? Math.round(value * factor * 100) / 100 : null;
  }
  return out;
}

function isLikelyDrink(raw) {
  const p = raw?.product ?? raw ?? {};
  const text = `${p.product_name ?? ''} ${p.quantity ?? ''} ${p.categories ?? ''}`.toLowerCase();
  const tags = (p.categories_tags ?? []).join(' ').toLowerCase();
  return (
    /\b(ml|millilitre|milliliter|fl\.?\s*oz|fluid ounce|liter|litre|\dl\b)/i.test(text) ||
    /en:beverages|en:soft-drinks|en:juices|en:waters|en:energy-drinks|en:sodas|en:sports-drinks/.test(
      tags
    )
  );
}

export function buildNutrientProfiles(raw, nutrimentsRaw = {}) {
  const p = raw?.product ?? raw ?? {};
  const nutrientsPer100g = parseNutrientsFromOff(nutrimentsRaw, '100g');

  let nutrientsPerServing = parseNutrientsFromOff(nutrimentsRaw, 'serving');
  let offServingComplete = hasMeaningfulNutrients(nutrientsPerServing, { forServing: true });

  const servingSizeLabel = (p.serving_size ?? '').trim() || null;
  const servingQuantity = parseServingQuantityGrams(raw);
  const hasServingMeta = Boolean(servingSizeLabel || servingQuantity != null);
  const drink = isLikelyDrink(raw);

  let servingDerived = false;
  if (!offServingComplete && servingQuantity != null && hasMeaningfulNutrients(nutrientsPer100g)) {
    const derived = deriveNutrientsPerServingFrom100g(nutrientsPer100g, servingQuantity);
    if (hasMeaningfulNutrients(derived, { forServing: true })) {
      nutrientsPerServing = derived;
      servingDerived = true;
    }
  }

  const servingReady = hasMeaningfulNutrients(nutrientsPerServing, { forServing: true });

  let useServing =
    servingReady &&
    (offServingComplete || servingDerived || (drink && servingQuantity != null));

  if (p.nutrition_data_per === 'serving' && servingReady) useServing = true;

  const nutritionBasis = useServing ? 'serving' : '100g';
  const primary = useServing ? nutrientsPerServing : nutrientsPer100g;
  const servingLabel =
    servingSizeLabel ||
    (servingQuantity != null ? `${servingQuantity} ml` : null) ||
    '1 serving';

  return {
    nutrientsPer100g,
    nutrientsPerServing: servingReady ? nutrientsPerServing : null,
    nutriments: primary,
    nutritionBasis,
    nutritionBasisWarning: useServing ? null : SERVING_UNAVAILABLE_WARNING,
    servingSize: servingSizeLabel,
    servingQuantity,
    servingLabel,
    isLikelyDrink: drink,
    servingDerived,
    offServingComplete,
    nutrientProfileVersion: NUTRIENT_PROFILE_VERSION,
    scoringBasisLabel: useServing
      ? 'Scored using: Per Serving'
      : 'Scored using: Per 100g (fallback)',
  };
}

export function buildNutrientDebug(product) {
  return {
    servingSize: product.servingSize ?? null,
    servingLabel: product.servingLabel ?? null,
    servingQuantity: product.servingQuantity ?? null,
    nutritionBasis: product.nutritionBasis,
    scoringSource: product.nutritionBasis === 'serving' ? 'nutrientsPerServing' : 'nutrientsPer100g',
    nutrientsPerServing: product.nutrientsPerServing ?? null,
    nutrientsPer100g: product.nutrientsPer100g ?? null,
    nutrimentsUsedForScore: product.nutriments ?? null,
    servingDerived: Boolean(product.servingDerived),
    offServingComplete: Boolean(product.offServingComplete),
  };
}

export function logNutrientDebug(product, context = 'product') {
  const debug = buildNutrientDebug(product);
  console.info(`[3bite:nutrients] ${context}`, JSON.stringify(debug, null, 2));
}

/** Legacy / stale cache — needs refetch if version missing. */
export function needsNutrientRefetch(product) {
  if (!product) return true;
  return (product.nutrientProfileVersion ?? 0) < NUTRIENT_PROFILE_VERSION;
}

export function migrateProductNutrients(product) {
  if (!product) return product;
  if ((product.nutrientProfileVersion ?? 0) >= NUTRIENT_PROFILE_VERSION) {
    return attachPrimaryNutriments(product);
  }

  const legacy = product.nutriments ?? {};
  return attachPrimaryNutriments({
    ...product,
    nutrientsPer100g: product.nutrientsPer100g ?? legacy,
    nutrientsPerServing: product.nutrientsPerServing ?? null,
    nutritionBasis: product.nutritionBasis ?? '100g',
    nutritionBasisWarning: product.nutritionBasisWarning ?? SERVING_UNAVAILABLE_WARNING,
    servingLabel: product.servingLabel ?? '100g',
    nutrientProfileVersion: 0,
  });
}

/** Ensure product.nutriments matches the basis used for scoring. */
export function attachPrimaryNutriments(product) {
  const basis = product.nutritionBasis === 'serving' ? 'serving' : '100g';
  const nutriments =
    basis === 'serving' && product.nutrientsPerServing
      ? product.nutrientsPerServing
      : product.nutrientsPer100g ?? product.nutriments ?? {};

  return {
    ...product,
    nutriments,
    scoringBasisLabel:
      product.scoringBasisLabel ??
      (basis === 'serving' ? 'Scored using: Per Serving' : 'Scored using: Per 100g (fallback)'),
  };
}

export function resolveForScoring(product) {
  return attachPrimaryNutriments(migrateProductNutrients(product));
}

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
