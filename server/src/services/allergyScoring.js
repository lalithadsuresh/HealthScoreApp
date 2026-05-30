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

function findInText(text, patterns) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[0];
  }
  return null;
}

export function analyzeAllergiesAndRestrictions(product, userRestrictions = []) {
  const text = `${product.ingredientsText ?? ''} ${(product.additivesTags ?? []).join(' ')}`.toLowerCase();
  const warnings = [];
  const conflicts = [];
  let scorePenalty = 0;

  for (const key of userRestrictions) {
    const label = ALLERGY_RESTRICTION_LABELS[key] ?? key;

    if (DETECTORS[key]) {
      const hit = findInText(text, DETECTORS[key]);
      if (hit) {
        conflicts.push({
          restrictionKey: key,
          label,
          detected: hit,
          severity: 'allergen',
          message: `Contains ${hit}, which may conflict with your ${label} selection.`,
        });
        scorePenalty += 25;
      }
    }

    if (DIET_CONFLICTS[key]) {
      const hit = findInText(text, DIET_CONFLICTS[key]);
      if (hit) {
        conflicts.push({
          restrictionKey: key,
          label,
          detected: hit,
          severity: 'diet',
          message: `May not match your ${label} preference (found: ${hit}).`,
        });
        scorePenalty += 15;
      }
    }
  }

  if (['halal', 'kosher'].some((k) => userRestrictions.includes(k))) {
    const pork = findInText(text, [/\bpork\b/i, /\bpig\b/i, /\blard\b/i, /\bgelatin/i]);
    if (pork) {
      const label = userRestrictions.includes('halal') ? 'Halal' : 'Kosher';
      conflicts.push({
        restrictionKey: userRestrictions.includes('halal') ? 'halal' : 'kosher',
        label,
        detected: pork,
        severity: 'diet',
        message: `May not align with your ${label} preference (found: ${pork}).`,
      });
      scorePenalty += 12;
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
  };
}
