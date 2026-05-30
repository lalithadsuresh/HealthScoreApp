const US_COUNTRY_TAG = 'en:united-states';

const KEY_NUTRIENT_KEYS = ['energyKcal', 'protein', 'sugar', 'fiber', 'sodium', 'carbs', 'fat'];

export function isLatinHeavy(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;
  const latin = (trimmed.match(/[A-Za-z0-9\s,.\-()%/&']/g) ?? []).length;
  return latin / trimmed.length >= 0.82;
}

export function extractRawSignals(raw) {
  const p = raw?.product ?? raw ?? {};
  const countriesTags = p.countries_tags ?? [];
  const countries = String(p.countries ?? '');
  const isUs =
    countriesTags.includes(US_COUNTRY_TAG) ||
    /\bUnited States\b/i.test(countries) ||
    (p.countries_hierarchy ?? []).includes(US_COUNTRY_TAG);

  const nameEn = (p.product_name_en ?? '').trim();
  const nameDefault = (p.product_name ?? '').trim();
  const englishName = nameEn.length > 1 || isLatinHeavy(nameEn || nameDefault);

  const ingredientsEn = (p.ingredients_text_en ?? '').trim();
  const ingredientsDefault = (p.ingredients_text ?? '').trim();
  const englishIngredients =
    ingredientsEn.length > 8 || (ingredientsDefault.length > 8 && isLatinHeavy(ingredientsEn || ingredientsDefault));

  const allergensTags = (p.allergens_tags ?? p.allergens_hierarchy ?? []).filter(Boolean);
  const hasAllergenTags = allergensTags.length > 0;

  return {
    countriesTags,
    isUs,
    englishName,
    englishIngredients,
    allergensTags,
    hasAllergenTags,
    nameEn: nameEn || null,
    ingredientsEn: ingredientsEn || null,
  };
}

export function hasCompleteNutrition(nutriments) {
  if (!nutriments) return false;
  const hasEnergy = nutriments.energyKcal != null;
  const hasProtein = nutriments.protein != null;
  const secondary = ['sugar', 'fiber', 'sodium', 'carbs', 'fat'].filter(
    (k) => nutriments[k] != null
  ).length;
  return hasEnergy && hasProtein && secondary >= 2;
}

/** @returns {'high' | 'medium' | 'low'} */
export function computeConfidence({ isUs, englishName, englishIngredients, hasAllergenTags, nutriments }) {
  const completeNutrition = hasCompleteNutrition(nutriments);

  if (!englishName || !completeNutrition) return 'low';
  if (!englishIngredients && !hasAllergenTags) return 'medium';
  if (isUs && englishName && completeNutrition && (englishIngredients || hasAllergenTags)) {
    return 'high';
  }
  if (englishName && completeNutrition) return 'medium';
  return 'low';
}

export function canConfidentlyScore(confidence) {
  return confidence === 'high' || confidence === 'medium';
}

export const CONFIDENCE_MESSAGES = {
  medium:
    'Some product data may be incomplete. Your score is based on available English nutrition facts.',
  low: 'We could not confidently analyze this product because it may not have complete English/U.S. product data.',
};

/** Higher rank = better placement in search results */
export function rankProduct(product) {
  let rank = 0;
  if (product.isUsSold) rank += 1_000_000;
  if (product.hasEnglishName) rank += 100_000;
  if (product.hasEnglishIngredients) rank += 10_000;
  if (product.allergensTags?.length) rank += 5_000;
  if (hasCompleteNutrition(product.nutriments)) rank += 1_000;
  if (product.imageUrl) rank += 100;
  if (product.confidence === 'high') rank += 50;
  if (product.confidence === 'medium') rank += 20;
  return rank;
}

export function sortByUsEnglishPriority(products) {
  return [...products].sort((a, b) => rankProduct(b) - rankProduct(a));
}

export function attachConfidence(product, rawSignals = null) {
  const signals = rawSignals ?? {
    isUs: product.isUsSold,
    englishName: product.hasEnglishName,
    englishIngredients: product.hasEnglishIngredients,
    hasAllergenTags: (product.allergensTags ?? []).length > 0,
  };
  const confidence = computeConfidence({
    isUs: signals.isUs,
    englishName: signals.englishName,
    englishIngredients: signals.englishIngredients,
    hasAllergenTags: signals.hasAllergenTags,
    nutriments: product.nutriments,
  });
  return { ...product, confidence };
}
