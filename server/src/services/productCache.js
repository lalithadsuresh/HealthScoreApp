import { Product } from '../models/Product.js';
import { sortByUsEnglishPriority } from './productConfidence.js';
import { migrateProductNutrients } from './nutrients.js';

export async function getCachedProductByBarcode(barcode) {
  const doc = await Product.findOne({ barcode: String(barcode) });
  return doc ? migrateProductNutrients(doc.toProductJSON()) : null;
}

export async function saveProductToCache(product) {
  if (!product?.barcode) return null;
  const doc = await Product.findOneAndUpdate(
    { barcode: product.barcode },
    {
      ...product,
      fetchedAt: new Date(),
      source: product.source ?? 'openfoodfacts',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc.toProductJSON();
}

export async function searchCachedProducts(query, limit = 12) {
  const q = String(query).trim();
  if (q.length < 2) return [];

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const docs = await Product.find({
    $or: [{ name: regex }, { brand: regex }, { barcode: q.replace(/\D/g, '') }],
    confidence: { $in: ['high', 'medium'] },
  })
    .sort({ isUsSold: -1, confidence: -1, fetchedAt: -1 })
    .limit(limit * 2)
    .lean();

  const products = docs.map((d) => ({
    barcode: d.barcode,
    name: d.name,
    brand: d.brand ?? '',
    imageUrl: d.imageUrl ?? null,
    nutriments: d.nutriments ?? {},
    confidence: d.confidence,
    isUsSold: d.isUsSold,
    hasEnglishName: d.hasEnglishName,
    hasEnglishIngredients: d.hasEnglishIngredients,
  }));

  return sortByUsEnglishPriority(products).slice(0, limit);
}
