import mongoose from 'mongoose';

const nutrimentsSchema = new mongoose.Schema(
  {
    energyKcal: { type: Number, default: null },
    protein: { type: Number, default: null },
    fat: { type: Number, default: null },
    saturatedFat: { type: Number, default: null },
    carbs: { type: Number, default: null },
    sugar: { type: Number, default: null },
    fiber: { type: Number, default: null },
    sodium: { type: Number, default: null },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    quantity: { type: String, default: '' },
    nutriments: { type: nutrimentsSchema, default: () => ({}) },
    nutrientsPer100g: { type: nutrimentsSchema, default: () => ({}) },
    nutrientsPerServing: { type: nutrimentsSchema, default: null },
    nutritionBasis: { type: String, enum: ['serving', '100g'], default: '100g' },
    nutritionBasisWarning: { type: String, default: null },
    servingSize: { type: String, default: null },
    servingQuantity: { type: Number, default: null },
    servingLabel: { type: String, default: null },
    isLikelyDrink: { type: Boolean, default: false },
    novaGroup: { type: Number, default: null },
    additivesCount: { type: Number, default: 0 },
    additivesTags: { type: [String], default: [] },
    ingredientsText: { type: String, default: '' },
    ingredientsTextEn: { type: String, default: '' },
    allergensTags: { type: [String], default: [] },
    countriesTags: { type: [String], default: [] },
    isUsSold: { type: Boolean, default: false },
    hasEnglishName: { type: Boolean, default: false },
    hasEnglishIngredients: { type: Boolean, default: false },
    confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'low' },
    nutriScore: { type: String, default: null },
    source: { type: String, default: 'openfoodfacts' },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text' });
productSchema.index({ confidence: 1, isUsSold: 1 });

productSchema.methods.toProductJSON = function toProductJSON() {
  return {
    barcode: this.barcode,
    name: this.name,
    brand: this.brand,
    imageUrl: this.imageUrl,
    quantity: this.quantity,
    nutriments: this.nutriments,
    nutrientsPer100g: this.nutrientsPer100g ?? this.nutriments,
    nutrientsPerServing: this.nutrientsPerServing,
    nutritionBasis: this.nutritionBasis ?? '100g',
    nutritionBasisWarning: this.nutritionBasisWarning,
    servingSize: this.servingSize,
    servingQuantity: this.servingQuantity,
    servingLabel: this.servingLabel,
    isLikelyDrink: this.isLikelyDrink,
    novaGroup: this.novaGroup,
    additivesCount: this.additivesCount,
    additivesTags: this.additivesTags,
    ingredientsText: this.ingredientsText,
    ingredientsTextEn: this.ingredientsTextEn,
    allergensTags: this.allergensTags,
    countriesTags: this.countriesTags,
    isUsSold: this.isUsSold,
    hasEnglishName: this.hasEnglishName,
    hasEnglishIngredients: this.hasEnglishIngredients,
    confidence: this.confidence,
    nutriScore: this.nutriScore,
  };
};

export const Product = mongoose.model('Product', productSchema);
