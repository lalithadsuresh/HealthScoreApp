export const INGREDIENT_PREF_KEYS = [
  'limitSeedOils',
  'avoidArtificialColors',
  'avoidRed40',
  'avoidArtificialSweeteners',
  'preferMinimalIngredients',
  'avoidHFCS',
  'avoidPreservatives',
];

export const INGREDIENT_PREF_META = {
  limitSeedOils: {
    label: 'Limit seed oils',
    hint: 'Prefer to limit soybean, canola, corn, and similar oils',
  },
  avoidArtificialColors: {
    label: 'Avoid artificial colors',
    hint: 'Flag FD&C and similar color additives you want to skip',
  },
  avoidRed40: {
    label: 'Avoid Red 40 specifically',
    hint: 'Flag Red 40 / Allura Red if listed',
  },
  avoidArtificialSweeteners: {
    label: 'Avoid artificial sweeteners',
    hint: 'Flag aspartame, sucralose, and similar sweeteners',
  },
  preferMinimalIngredients: {
    label: 'Prefer minimal ingredients',
    hint: 'Reward shorter ingredient lists when enabled',
  },
  avoidHFCS: {
    label: 'Avoid high-fructose corn syrup',
    hint: 'Flag HFCS and similar syrups',
  },
  avoidPreservatives: {
    label: 'Avoid preservatives / additives',
    hint: 'Flag common preservatives you prefer to limit',
  },
};

export const INGREDIENT_PREF_NOTE =
  'These are your personal preferences — not universal health rules. They only affect your score when enabled.';
