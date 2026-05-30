export const PRIMARY_GOALS = [
  'bulk',
  'cut',
  'maintain',
  'athleticPerformance',
  'heartHealth',
  'bloodSugarAwareness',
  'generalWellness',
] as const;

export type PrimaryGoalId = (typeof PRIMARY_GOALS)[number];

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoalId, string> = {
  bulk: 'Bulk',
  cut: 'Cut',
  maintain: 'Maintain',
  athleticPerformance: 'Athletic Performance',
  heartHealth: 'Heart Health',
  bloodSugarAwareness: 'Blood Sugar Awareness',
  generalWellness: 'General Wellness',
};

export const GOAL_FOCUS_OPTIONS: Record<
  PrimaryGoalId,
  { id: string; label: string; description: string }[]
> = {
  bulk: [
    { id: 'leanBulk', label: 'Lean Bulk', description: 'Protein with moderate calories' },
    { id: 'maxCalories', label: 'Maximize Calories', description: 'Calorie density helps' },
    { id: 'maxProtein', label: 'Maximize Protein', description: 'Protein density first' },
    { id: 'cleanEating', label: 'Clean Eating', description: 'Ingredient quality while bulking' },
    { id: 'other', label: 'Other', description: 'Set priorities next' },
  ],
  cut: [
    { id: 'fatLoss', label: 'Fat Loss', description: 'Lower calories' },
    { id: 'fullness', label: 'Fullness', description: 'Fiber and volume' },
    { id: 'preserveMuscle', label: 'Preserve Muscle', description: 'Keep protein high' },
    { id: 'lowerCalories', label: 'Lower Calories', description: 'Calories main lever' },
    { id: 'cleanEating', label: 'Clean Eating', description: 'Quality while cutting' },
    { id: 'other', label: 'Other', description: 'Set priorities next' },
  ],
  maintain: [
    { id: 'balancedEnergy', label: 'Balanced energy', description: 'Steady day to day' },
    { id: 'bodyComposition', label: 'Body composition', description: 'Macro balance' },
    { id: 'ingredientQuality', label: 'Ingredient quality', description: 'Cleaner labels' },
    { id: 'cleanEating', label: 'Clean Eating', description: 'Whole-food leaning' },
    { id: 'flexibleMaintenance', label: 'Flexible maintenance', description: 'Variety with awareness' },
    { id: 'other', label: 'Other', description: 'Set priorities next' },
  ],
  athleticPerformance: [
    { id: 'energy', label: 'Energy', description: 'Training fuel' },
    { id: 'recovery', label: 'Recovery', description: 'Protein and nutrients' },
    { id: 'hydration', label: 'Hydration', description: 'Balance awareness' },
    { id: 'endurance', label: 'Endurance', description: 'Sustained fuel' },
    { id: 'other', label: 'Other', description: 'Set priorities next' },
  ],
  heartHealth: [
    { id: 'lowerSodium', label: 'Lower sodium', description: '' },
    { id: 'lowerSatFat', label: 'Lower saturated fat', description: '' },
    { id: 'moreFiber', label: 'More fiber', description: '' },
    { id: 'wholeFoods', label: 'Whole foods', description: '' },
    { id: 'other', label: 'Other', description: '' },
  ],
  bloodSugarAwareness: [
    { id: 'lowerSugar', label: 'Lower sugar', description: '' },
    { id: 'stableEnergy', label: 'Stable energy', description: '' },
    { id: 'lowerCarbs', label: 'Lower carbs', description: '' },
    { id: 'glycemicAware', label: 'Glycemic awareness', description: '' },
    { id: 'other', label: 'Other', description: '' },
  ],
  generalWellness: [
    { id: 'feelBetter', label: 'Feel better', description: '' },
    { id: 'balancedMeals', label: 'Balanced meals', description: '' },
    { id: 'ingredientQuality', label: 'Ingredient quality', description: '' },
    { id: 'avoidCrashes', label: 'Avoid crashes', description: '' },
    { id: 'cleanEating', label: 'Clean Eating', description: '' },
    { id: 'other', label: 'Other', description: '' },
  ],
};

export const PERSONAL_PRIORITIES = [
  'protein',
  'fiber',
  'energy',
  'fullness',
  'ingredientQuality',
  'lowerSugar',
  'lowerSodium',
  'lowerSaturatedFat',
  'higherCalories',
  'lowerCalories',
  'recoveryFuel',
] as const;

export const PERSONAL_PRIORITY_LABELS: Record<string, string> = {
  protein: 'Protein',
  fiber: 'Fiber',
  energy: 'Energy',
  fullness: 'Fullness',
  ingredientQuality: 'Ingredient quality',
  lowerSugar: 'Lower sugar',
  lowerSodium: 'Lower sodium',
  lowerSaturatedFat: 'Lower saturated fat',
  higherCalories: 'Higher calories',
  lowerCalories: 'Lower calories',
  recoveryFuel: 'Recovery fuel',
};

export const ALLERGY_RESTRICTION_KEYS = [
  'peanuts',
  'treeNuts',
  'dairy',
  'eggs',
  'soy',
  'wheat',
  'sesame',
  'fish',
  'shellfish',
  'glutenFree',
  'dairyFree',
  'vegan',
  'vegetarian',
  'pescatarian',
  'halal',
  'kosher',
] as const;

export const ALLERGY_RESTRICTION_LABELS: Record<string, string> = {
  peanuts: 'Peanuts',
  treeNuts: 'Tree nuts',
  dairy: 'Dairy',
  eggs: 'Eggs',
  soy: 'Soy',
  wheat: 'Wheat',
  sesame: 'Sesame',
  fish: 'Fish',
  shellfish: 'Shellfish',
  glutenFree: 'Gluten-free',
  dairyFree: 'Dairy-free',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  pescatarian: 'Pescatarian',
  halal: 'Halal',
  kosher: 'Kosher',
};
