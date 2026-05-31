import { Product } from '../models/Product.js';
import { sortByUsEnglishPriority } from './productConfidence.js';
import {
  attachPrimaryNutriments,
  needsNutrientRefetch,
  NUTRIENT_PROFILE_VERSION,
} from './nutrients.js';

export async function getCachedProductByBarcode(barcode) {
  const doc = await Product.findOne({ barcode: String(barcode) });
  if (!doc) return null;
  const product = doc.toProductJSON();
  if (needsNutrientRefetch(product)) {
    return null;
  }
  return attachPrimaryNutriments(product);
}

export async function saveProductToCache(product) {
  if (!product?.barcode) return null;
  const doc = await Product.findOneAndUpdate(
    { barcode: product.barcode },
    {
      ...product,
      nutrientProfileVersion: product.nutrientProfileVersion ?? NUTRIENT_PROFILE_VERSION,
      fetchedAt: new Date(),
      source: product.source ?? 'openfoodfacts',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return attachPrimaryNutriments(doc.toProductJSON());
}

export async function searchCachedProducts(query, limit = 12) {
  const q = String(query).trim();
  if (q.length < 2) return [];

  const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const docs = await Product.find({
    $or: [{ name: regex }, { brand: regex }, { barcode: q.replace(/\D/g, '') }],
    confidence: { $in: ['high', 'medium'] },
    nutrientProfileVersion: { $gte: NUTRIENT_PROFILE_VERSION },
  })
    .sort({ isUsSold: -1, confidence: -1, fetchedAt: -1 })
    .limit(limit * 2)
    .lean();

  const products = docs.map((d) =>
    attachPrimaryNutriments({
      barcode: d.barcode,
      name: d.name,
      brand: d.brand ?? '',
      imageUrl: d.imageUrl ?? null,
      nutriments: d.nutriments,
      nutrientsPer100g: d.nutrientsPer100g ?? d.nutriments,
      nutrientsPerServing: d.nutrientsPerServing,
      nutritionBasis: d.nutritionBasis ?? '100g',
      nutritionBasisWarning: d.nutritionBasisWarning,
      servingLabel: d.servingLabel,
      scoringBasisLabel: d.scoringBasisLabel,
      confidence: d.confidence,
      isUsSold: d.isUsSold,
      hasEnglishName: d.hasEnglishName,
      hasEnglishIngredients: d.hasEnglishIngredients,
      nutrientProfileVersion: d.nutrientProfileVersion,
    })
  );

  return sortByUsEnglishPriority(products).slice(0, limit);
}
