export const INGREDIENT_PREF_KEYS = [
  'limitSeedOils',
  'avoidArtificialColors',
  'avoidRed40',
  'avoidArtificialSweeteners',
  'preferMinimalIngredients',
  'avoidHFCS',
  'avoidPreservatives',
  'avoidHighlyProcessed',
];

export const INGREDIENT_PREF_LABELS = {
  limitSeedOils: 'Limit seed oils',
  avoidArtificialColors: 'Avoid artificial colors',
  avoidRed40: 'Avoid Red 40 specifically',
  avoidArtificialSweeteners: 'Avoid artificial sweeteners',
  preferMinimalIngredients: 'Prefer minimal ingredients',
  avoidHFCS: 'Avoid high-fructose corn syrup',
  avoidPreservatives: 'Avoid preservatives / additives',
  avoidHighlyProcessed: 'Avoid highly processed foods',
};

export const DEFAULT_INGREDIENT_PREFERENCES = Object.fromEntries(
  INGREDIENT_PREF_KEYS.map((k) => [k, false])
);
