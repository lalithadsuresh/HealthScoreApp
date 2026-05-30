const OFF_BASE = 'https://world.openfoodfacts.org';

function num(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeProduct(raw) {
  if (!raw || raw.status === 0) return null;

  const p = raw.product ?? raw;
  const nutriments = p.nutriments ?? {};
  const additives = p.additives_tags ?? [];
  const ingredientsText = p.ingredients_text ?? p.ingredients_text_en ?? '';

  return {
    barcode: p.code ?? p._id ?? '',
    name: p.product_name ?? p.product_name_en ?? 'Unknown product',
    brand: p.brands ?? '',
    imageUrl: p.image_front_url ?? p.image_url ?? null,
    quantity: p.quantity ?? '',
    nutriments: {
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
    },
    novaGroup: p.nova_group ?? null,
    additivesCount: additives.length,
    ingredientsText,
    nutriScore: p.nutriscore_grade ?? null,
  };
}

export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode).replace(/\D/g, '');
  if (!clean) throw new Error('Invalid barcode');

  const res = await fetch(`${OFF_BASE}/api/v2/product/${clean}.json`);
  if (!res.ok) throw new Error('Product lookup failed');
  const data = await res.json();
  return normalizeProduct(data);
}

export async function searchProducts(query, limit = 12) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(limit),
    fields: 'code,product_name,brands,image_front_url,nutriments',
  });

  const res = await fetch(`${OFF_BASE}/cgi/search.pl?${params}`);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  const products = (data.products ?? []).map((item) => ({
    barcode: item.code,
    name: item.product_name ?? 'Unknown',
    brand: item.brands ?? '',
    imageUrl: item.image_front_url ?? null,
    nutriments: {
      energyKcal: num(item.nutriments?.['energy-kcal_100g']),
      protein: num(item.nutriments?.proteins_100g),
      sugar: num(item.nutriments?.sugars_100g),
    },
  }));
  return products.filter((p) => p.barcode);
}

export async function findAlternatives(product, limit = 4) {
  const category = product.name?.split(' ')[0] ?? 'food';
  const results = await searchProducts(category, limit + 5);
  return results
    .filter((p) => p.barcode !== product.barcode && p.name)
    .slice(0, limit);
}
