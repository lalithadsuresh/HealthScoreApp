import {
  computeConfidence,
  extractRawSignals,
  sortByUsEnglishPriority,
} from './productConfidence.js';

const OFF_BASE = 'https://world.openfoodfacts.org';

const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'image_front_url',
  'image_url',
  'ingredients_text',
  'ingredients_text_en',
  'allergens_tags',
  'countries_tags',
  'countries',
  'countries_hierarchy',
  'additives_tags',
  'nova_group',
  'nutriments',
  'nutriscore_grade',
].join(',');

const SEARCH_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'image_front_url',
  'ingredients_text',
  'ingredients_text_en',
  'allergens_tags',
  'countries_tags',
  'countries',
  'nutriments',
].join(',');

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function parseNutriments(nutriments = {}) {
  return {
    energyKcal: num(nutriments['energy-kcal_100g'] ?? nutriments.energy_kcal_100g),
    protein: num(nutriments.proteins_100g),
    fat: num(nutriments.fat_100g),
    saturatedFat: num(nutriments['saturated-fat_100g']),
    carbs: num(nutriments.carbohydrates_100g),
    sugar: num(nutriments.sugars_100g),
    fiber: num(nutriments.fiber_100g),
    sodium: num(nutriments.sodium_100g)
      ? num(nutriments.sodium_100g) * 1000
      : num(nutriments.salt_100g)
        ? num(nutriments.salt_100g) * 400
        : null,
  };
}

export function normalizeProduct(raw) {
  if (!raw || raw.status === 0) return null;

  const p = raw.product ?? raw;
  const signals = extractRawSignals(raw);
  const nutriments = parseNutriments(p.nutriments ?? {});
  const additives = p.additives_tags ?? [];

  const name =
    signals.nameEn ||
    (signals.englishName ? (p.product_name ?? '').trim() : '') ||
    (p.product_name_en ?? p.product_name ?? 'Unknown product');

  const ingredientsText =
    signals.ingredientsEn ||
    (signals.englishIngredients ? p.ingredients_text_en ?? p.ingredients_text ?? '' : '') ||
    '';

  const product = {
    barcode: String(p.code ?? p._id ?? '').replace(/\D/g, '') || String(p.code ?? ''),
    name: name || 'Unknown product',
    brand: p.brands ?? '',
    imageUrl: p.image_front_url ?? p.image_url ?? null,
    quantity: p.quantity ?? '',
    nutriments,
    novaGroup: p.nova_group ?? null,
    additivesCount: additives.length,
    additivesTags: additives,
    ingredientsText,
    ingredientsTextEn: signals.ingredientsEn ?? '',
    allergensTags: signals.allergensTags,
    countriesTags: signals.countriesTags,
    isUsSold: signals.isUs,
    hasEnglishName: signals.englishName,
    hasEnglishIngredients: signals.englishIngredients,
    nutriScore: p.nutriscore_grade ?? null,
    source: 'openfoodfacts',
  };

  product.confidence = computeConfidence({
    isUs: signals.isUs,
    englishName: signals.englishName,
    englishIngredients: signals.englishIngredients,
    hasAllergenTags: signals.hasAllergenTags,
    nutriments,
  });

  return product;
}

function normalizeSearchHit(item) {
  const signals = extractRawSignals({ product: item });
  const nutriments = parseNutriments(item.nutriments ?? {});
  const name =
    signals.nameEn ||
    (signals.englishName ? item.product_name ?? 'Unknown' : 'Unknown');

  const product = {
    barcode: item.code,
    name,
    brand: item.brands ?? '',
    imageUrl: item.image_front_url ?? null,
    nutriments,
    isUsSold: signals.isUs,
    hasEnglishName: signals.englishName,
    hasEnglishIngredients: signals.englishIngredients,
    allergensTags: signals.allergensTags,
    confidence: computeConfidence({
      isUs: signals.isUs,
      englishName: signals.englishName,
      englishIngredients: signals.englishIngredients,
      hasAllergenTags: signals.hasAllergenTags,
      nutriments,
    }),
  };

  return product;
}

export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode).replace(/\D/g, '');
  if (!clean) throw new Error('Invalid barcode');

  const params = new URLSearchParams({ fields: PRODUCT_FIELDS });
  const res = await fetch(`${OFF_BASE}/api/v2/product/${clean}.json?${params}`);
  if (!res.ok) throw new Error('Product lookup failed');
  const data = await res.json();
  const product = normalizeProduct(data);
  if (product) product.barcode = clean;
  return product;
}

async function searchOpenFoodFacts(query, limit, { usOnly = true } = {}) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(Math.max(limit * 2, 24)),
    lc: 'en',
    fields: SEARCH_FIELDS,
  });

  if (usOnly) {
    params.set('tagtype_0', 'countries');
    params.set('tag_contains_0', 'contains');
    params.set('tag_0', 'en:united-states');
  }

  const res = await fetch(`${OFF_BASE}/cgi/search.pl?${params}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();

  const products = (data.products ?? [])
    .map(normalizeSearchHit)
    .filter((p) => p.barcode && p.hasEnglishName);

  return sortByUsEnglishPriority(products);
}

export async function searchProducts(query, limit = 12, options = {}) {
  const usOnly = options.usOnly !== false;
  let ranked = await searchOpenFoodFacts(query, limit, { usOnly });

  if (usOnly && ranked.filter((p) => p.confidence !== 'low').length < Math.min(3, limit)) {
    const broader = await searchOpenFoodFacts(query, limit, { usOnly: false });
    const seen = new Set(ranked.map((p) => p.barcode));
    for (const p of broader) {
      if (!seen.has(p.barcode)) {
        ranked.push(p);
        seen.add(p.barcode);
      }
    }
    ranked = sortByUsEnglishPriority(ranked);
  }

  const usable = ranked.filter((p) => p.confidence !== 'low');
  return (usable.length ? usable : ranked).slice(0, limit);
}

export async function findAlternatives(product, limit = 4) {
  const terms = [product.brand, product.name?.split(' ')[0]].filter(Boolean);
  const query = terms[0] ?? 'food';
  const results = await searchProducts(query, limit + 8, { usOnly: true });
  return results
    .filter((p) => p.barcode !== product.barcode && p.confidence !== 'low')
    .slice(0, limit);
}
