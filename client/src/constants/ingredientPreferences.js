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

export const INGREDIENT_PREF_META = {
  limitSeedOils: {
    label: 'Limit seed oils',
    hint: 'Flag soybean, canola, corn, and similar oils',
  },
  avoidArtificialColors: {
    label: 'Avoid artificial colors',
    hint: 'Flag color additives you prefer to skip',
  },
  avoidRed40: {
    label: 'Avoid Red 40 specifically',
    hint: 'Flag Red 40 / Allura Red when listed',
  },
  avoidArtificialSweeteners: {
    label: 'Avoid artificial sweeteners',
    hint: 'Flag aspartame, sucralose, and similar',
  },
  preferMinimalIngredients: {
    label: 'Prefer minimal ingredients',
    hint: 'Reward shorter ingredient lists',
  },
  avoidHFCS: {
    label: 'Avoid high-fructose corn syrup',
    hint: 'Flag HFCS and similar syrups',
  },
  avoidPreservatives: {
    label: 'Avoid preservatives / additives',
    hint: 'Flag common preservatives you prefer to limit',
  },
  avoidHighlyProcessed: {
    label: 'Avoid highly processed foods',
    hint: 'Flag NOVA 4 / ultra-processed items when data is available',
  },
};

export const INGREDIENT_PREF_NOTE =
  'Personal preferences only — they affect your score when enabled, not universal health rules.';
