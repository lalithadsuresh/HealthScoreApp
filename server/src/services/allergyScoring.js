import { ALLERGY_RESTRICTION_LABELS } from '../constants/onboarding.js';

const DETECTORS = {
  peanuts: [/\bpeanut/i, /\barachis\b/i],
  treeNuts: [
    /\balmond/i,
    /\bwalnut/i,
    /\bcashew/i,
    /\bpecan/i,
    /\bpistachio/i,
    /\bhazelnut/i,
    /\bmacadamia/i,
    /\btree nut/i,
  ],
  dairy: [/\bmilk\b/i, /\bcheese/i, /\bbutter\b/i, /\bcream\b/i, /\bwhey\b/i, /\bcasein/i, /\blactose/i],
  eggs: [/\begg\b/i, /\balbumin/i],
  soy: [/\bsoy/i, /\bsoya/i, /\btofu\b/i, /\bedamame/i],
  wheat: [/\bwheat\b/i, /\bgluten\b/i, /\bflour\b/i],
  sesame: [/\bsesame/i, /\btahini/i],
  fish: [/\bfish\b/i, /\banchov/i, /\btuna\b/i, /\bsalmon\b/i, /\bcod\b/i],
  shellfish: [/\bshellfish/i, /\bshrimp/i, /\bcrab\b/i, /\blobster/i, /\bmollusc/i],
};

const DIET_CONFLICTS = {
  vegan: [/\bmilk\b/i, /\begg\b/i, /\bmeat\b/i, /\bchicken/i, /\bbeef\b/i, /\bpork\b/i, /\bfish\b/i, /\bwhey\b/i, /\bgelatin/i, /\bhoney\b/i],
  vegetarian: [/\bmeat\b/i, /\bchicken/i, /\bbeef\b/i, /\bpork\b/i, /\bfish\b/i, /\bgelatin/i],
  pescatarian: [/\bmeat\b/i, /\bchicken/i, /\bbeef\b/i, /\bpork\b/i],
  glutenFree: [/\bwheat\b/i, /\bgluten\b/i, /\bbarley\b/i, /\brye\b/i],
  dairyFree: [/\bmilk\b/i, /\bcheese/i, /\bbutter\b/i, /\bwhey\b/i, /\bcasein/i, /\blactose/i],
};

/** Open Food Facts allergen tag → user restriction keys that may conflict */
const ALLERGEN_TAG_TO_RESTRICTIONS = {
  'en:peanuts': ['peanuts'],
  'en:nuts': ['treeNuts'],
  'en:tree-nuts': ['treeNuts'],
  'en:milk': ['dairy', 'dairyFree'],
  'en:eggs': ['eggs'],
  'en:soybeans': ['soy'],
  'en:soy': ['soy'],
  'en:wheat': ['wheat', 'glutenFree'],
  'en:gluten': ['wheat', 'glutenFree'],
  'en:sesame-seeds': ['sesame'],
  'en:fish': ['fish', 'pescatarian'],
  'en:crustaceans': ['shellfish'],
  'en:molluscs': ['shellfish'],
};

function findInText(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
}

function normalizeAllergenTag(tag) {
  return String(tag).toLowerCase().trim();
}

function restrictionsFromAllergenTags(allergensTags, userRestrictions) {
  const conflicts = [];
  const matchedKeys = new Set();

  for (const rawTag of allergensTags ?? []) {
    const tag = normalizeAllergenTag(rawTag);
    const related = ALLERGEN_TAG_TO_RESTRICTIONS[tag];
    if (!related) continue;

    for (const restrictionKey of userRestrictions) {
      if (!related.includes(restrictionKey) || matchedKeys.has(`${tag}:${restrictionKey}`)) {
        continue;
      }
      matchedKeys.add(`${tag}:${restrictionKey}`);
      const label = ALLERGY_RESTRICTION_LABELS[restrictionKey] ?? restrictionKey;
      const display = tag.replace(/^en:/, '').replace(/-/g, ' ');
      conflicts.push({
        restrictionKey,
        label,
        detected: display,
        severity: DETECTORS[restrictionKey] ? 'allergen' : 'diet',
        source: 'allergens_tags',
        message: `Listed allergen (${display}) may conflict with your ${label} selection.`,
      });
    }
  }

  return conflicts;
}

export function analyzeAllergiesAndRestrictions(product, userRestrictions = []) {
  const warnings = [];
  const conflicts = [];
  let scorePenalty = 0;
  const seen = new Set();

  const addConflict = (entry, penalty) => {
    const key = `${entry.restrictionKey}:${entry.detected}`;
    if (seen.has(key)) return;
    seen.add(key);
    conflicts.push(entry);
    scorePenalty += penalty;
  };

  const allergensTags = product.allergensTags ?? [];
  const tagConflicts = restrictionsFromAllergenTags(allergensTags, userRestrictions);
  for (const c of tagConflicts) {
    addConflict(c, c.severity === 'allergen' ? 25 : 15);
  }

  const canUseIngredientText =
    product.hasEnglishIngredients &&
    (product.ingredientsText?.trim().length ?? 0) > 8;

  if (!canUseIngredientText && allergensTags.length === 0 && userRestrictions.length > 0) {
    warnings.push(
      'Allergen matching is limited — this product lacks English ingredients and structured allergen tags.'
    );
  }

  if (canUseIngredientText) {
    const text = `${product.ingredientsText ?? ''} ${(product.additivesTags ?? []).join(' ')}`.toLowerCase();

    for (const key of userRestrictions) {
      const label = ALLERGY_RESTRICTION_LABELS[key] ?? key;
      const alreadyFromTags = conflicts.some((c) => c.restrictionKey === key && c.source === 'allergens_tags');

      if (DETECTORS[key] && !alreadyFromTags) {
        const hit = findInText(text, DETECTORS[key]);
        if (hit) {
          addConflict(
            {
              restrictionKey: key,
              label,
              detected: hit,
              severity: 'allergen',
              source: 'ingredients_text',
              message: `Contains ${hit}, which may conflict with your ${label} selection.`,
            },
            25
          );
        }
      }

      if (DIET_CONFLICTS[key]) {
        const hit = findInText(text, DIET_CONFLICTS[key]);
        if (hit) {
          addConflict(
            {
              restrictionKey: key,
              label,
              detected: hit,
              severity: 'diet',
              source: 'ingredients_text',
              message: `May not match your ${label} preference (found: ${hit}).`,
            },
            15
          );
        }
      }
    }

    if (['halal', 'kosher'].some((k) => userRestrictions.includes(k))) {
      const pork = findInText(text, [/\bpork\b/i, /\bpig\b/i, /\blard\b/i, /\bgelatin/i]);
      if (pork) {
        const label = userRestrictions.includes('halal') ? 'Halal' : 'Kosher';
        addConflict(
          {
            restrictionKey: userRestrictions.includes('halal') ? 'halal' : 'kosher',
            label,
            detected: pork,
            severity: 'diet',
            source: 'ingredients_text',
            message: `May not align with your ${label} preference (found: ${pork}).`,
          },
          12
        );
      }
    }
  }

  if (conflicts.length) {
    warnings.push(
      'Review the label — automated matching is not perfect. This is not medical advice.'
    );
  }

  return {
    conflicts,
    warnings,
    scorePenalty: Math.min(50, scorePenalty),
    hasRestrictions: userRestrictions.length > 0,
    usedAllergenTags: allergensTags.length > 0,
    usedIngredientText: canUseIngredientText,
  };
}
