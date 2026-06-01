import {
  computeConfidence,
  extractRawSignals,
  sortByUsEnglishPriority,
} from './productConfidence.js';
import { buildNutrientProfiles, hasMeaningfulNutrients } from './nutrients.js';

const OFF_BASE = 'https://world.openfoodfacts.org';
const USER_AGENT = '3Bite/1.0 (https://github.com/lalithadsuresh/HealthScoreApp)';

const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'serving_size',
  'serving_quantity',
  'nutrition_data_per',
  'categories',
  'categories_tags',
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
  'serving_size',
  'serving_quantity',
  'nutrition_data_per',
  'nutriments',
].join(',');

export class OpenFoodFactsError extends Error {
  constructor(message, { status, url, bodySnippet } = {}) {
    super(message);
    this.name = 'OpenFoodFactsError';
    this.status = status;
    this.url = url;
    this.bodySnippet = bodySnippet;
  }
}

function attachNutrients(product, raw, nutrimentsRaw) {
  const profiles = buildNutrientProfiles(raw, nutrimentsRaw);
  return {
    ...product,
    ...profiles,
  };
}

export function normalizeProduct(raw) {
  if (!raw || raw.status === 0) return null;

  const p = raw.product ?? raw;
  const signals = extractRawSignals(raw);
  const additives = p.additives_tags ?? [];

  const name =
    signals.nameEn ||
    (signals.englishName ? (p.product_name ?? '').trim() : '') ||
    (p.product_name_en ?? p.product_name ?? 'Unknown product');

  const ingredientsText =
    signals.ingredientsEn ||
    (signals.englishIngredients ? p.ingredients_text_en ?? p.ingredients_text ?? '' : '') ||
    '';

  let product = {
    barcode: String(p.code ?? p._id ?? '').replace(/\D/g, '') || String(p.code ?? ''),
    name: name || 'Unknown product',
    brand: p.brands ?? '',
    imageUrl: p.image_front_url ?? p.image_url ?? null,
    quantity: p.quantity ?? '',
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

  product = attachNutrients(product, raw, p.nutriments ?? {});

  product.confidence = computeConfidence({
    isUs: signals.isUs,
    englishName: signals.englishName,
    englishIngredients: signals.englishIngredients,
    hasAllergenTags: signals.hasAllergenTags,
    nutriments: product.nutriments,
  });

  return product;
}

function normalizeSearchHit(item) {
  if (!item || item.code == null) return null;

  const signals = extractRawSignals({ product: item });
  const name =
    signals.nameEn ||
    (signals.englishName ? item.product_name ?? 'Unknown' : 'Unknown');

  let product = {
    barcode: String(item.code).replace(/\D/g, '') || String(item.code),
    name,
    brand: item.brands ?? '',
    imageUrl: item.image_front_url ?? null,
    isUsSold: signals.isUs,
    hasEnglishName: signals.englishName,
    hasEnglishIngredients: signals.englishIngredients,
    allergensTags: signals.allergensTags,
  };

  product = attachNutrients(product, { product: item }, item.nutriments ?? {});

  product.confidence = computeConfidence({
    isUs: signals.isUs,
    englishName: signals.englishName,
    englishIngredients: signals.englishIngredients,
    hasAllergenTags: signals.hasAllergenTags,
    nutriments: product.nutriments,
  });

  return product;
}

async function fetchOffJson(url, { label = 'Open Food Facts', logResponse = false } = {}) {
  let res;
  try {
    res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    throw new OpenFoodFactsError(
      `Network error reaching Open Food Facts: ${err.message}`,
      { url }
    );
  }

  if (logResponse) {
    console.log('Response status:', res.status);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const bodyText = await res.text();

  if (!res.ok) {
    const snippet = bodyText.replace(/\s+/g, ' ').slice(0, 160);
    const rateLimited = res.status === 429 || res.status === 503;
    throw new OpenFoodFactsError(
      rateLimited
        ? `Open Food Facts is temporarily unavailable (HTTP ${res.status}). Wait a moment and try again.`
        : `Open Food Facts request failed (HTTP ${res.status})`,
      { status: res.status, url, bodySnippet: snippet }
    );
  }

  if (!contentType.includes('json') && !bodyText.trim().startsWith('{')) {
    const snippet = bodyText.replace(/\s+/g, ' ').slice(0, 160);
    throw new OpenFoodFactsError(
      'Open Food Facts returned an unexpected HTML response instead of JSON',
      { status: res.status, url, bodySnippet: snippet }
    );
  }

  try {
    return JSON.parse(bodyText);
  } catch (err) {
    throw new OpenFoodFactsError(`Invalid JSON from Open Food Facts: ${err.message}`, {
      status: res.status,
      url,
      bodySnippet: bodyText.slice(0, 160),
    });
  }
}

function buildSearchUrl(query, limit) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(Math.max(limit * 2, 24)),
    lc: 'en',
    fields: SEARCH_FIELDS,
  });
  return `${OFF_BASE}/cgi/search.pl?${params}`;
}

function buildSearchUrlV2(query, limit) {
  const params = new URLSearchParams({
    search_terms: query,
    page_size: String(Math.max(limit * 2, 24)),
    fields: SEARCH_FIELDS,
  });
  return `${OFF_BASE}/api/v2/search?${params}`;
}

function parseSearchResponse(data) {
  const rawProducts = Array.isArray(data?.products) ? data.products : [];
  return rawProducts
    .map(normalizeSearchHit)
    .filter((p) => p && p.barcode && p.hasEnglishName);
}

async function searchOpenFoodFacts(query, limit) {
  const trimmed = String(query ?? '').trim();
  if (trimmed.length < 2) {
    return [];
  }

  const urls = [buildSearchUrl(trimmed, limit), buildSearchUrlV2(trimmed, limit)];
  let lastError;

  for (const url of urls) {
    console.log('Search query:', trimmed);
    console.log('Open Food Facts URL:', url);

    try {
      const data = await fetchOffJson(url, { label: 'search', logResponse: true });
      console.log(
        'Response data:',
        JSON.stringify({
          count: data?.count,
          page: data?.page,
          productCount: data?.products?.length ?? 0,
        })
      );

      const products = parseSearchResponse(data);
      return sortByUsEnglishPriority(products);
    } catch (err) {
      if (err.status != null) console.log('Response status:', err.status);
      console.log('Response data:', err.bodySnippet ?? err.message);
      lastError = err;
      if (err.status === 429 || err.status === 503) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  throw lastError ?? new OpenFoodFactsError('Open Food Facts search failed with no response');
}

export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode).replace(/\D/g, '');
  if (!clean) throw new Error('Invalid barcode');

  const params = new URLSearchParams({ fields: PRODUCT_FIELDS });
  const url = `${OFF_BASE}/api/v2/product/${clean}.json?${params}`;
  const data = await fetchOffJson(url, { label: 'product' });
  const product = normalizeProduct(data);
  if (product) product.barcode = clean;
  return product;
}

export async function searchProducts(query, limit = 12) {
  const trimmed = String(query ?? '').trim();
  if (trimmed.length < 2) {
    return [];
  }

  const ranked = await searchOpenFoodFacts(trimmed, limit);
  const usable = ranked.filter((p) => p.confidence !== 'low');
  return (usable.length ? usable : ranked).slice(0, limit);
}

export async function findAlternatives(product, limit = 4) {
  const terms = [product.brand, product.name?.split(' ')[0]].filter(Boolean);
  const query = terms[0] ?? 'food';
  const results = await searchProducts(query, limit + 8);
  return results
    .filter((p) => p.barcode !== product.barcode && p.confidence !== 'low')
    .slice(0, limit);
}
