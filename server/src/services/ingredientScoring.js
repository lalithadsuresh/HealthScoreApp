import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_LABELS,
} from '../constants/ingredientPreferences.js';

const MATCHERS = {
  limitSeedOils: {
    patterns: [
      /\bsoybean oil\b/i,
      /\bcanola oil\b/i,
      /\bcorn oil\b/i,
      /\bsunflower oil\b/i,
      /\bsafflower oil\b/i,
      /\bcottonseed oil\b/i,
      /\bgrapeseed oil\b/i,
      /\bvegetable oil\b/i,
    ],
    detectLabel: 'seed oils (e.g. soybean, canola, corn oil)',
  },
  avoidArtificialColors: {
    patterns: [
      /\bartificial color/i,
      /\bfd&c\b/i,
      /\b(red|yellow|blue|green) (no\.?|#)? ?\d/i,
      /\be1\d{2}\b/i,
      /\be1\d{3}\b/i,
      /\ballura red\b/i,
      /\btartrazine\b/i,
    ],
    detectLabel: 'artificial colors',
  },
  avoidRed40: {
    patterns: [
      /\bred\s*(no\.?|#)?\s*40\b/i,
      /\ballura red\b/i,
      /\be129\b/i,
      /\be-129\b/i,
    ],
    detectLabel: 'Red 40',
  },
  avoidArtificialSweeteners: {
    patterns: [
      /\baspartame\b/i,
      /\bsucralose\b/i,
      /\bacesulfame\b/i,
      /\bsaccharin\b/i,
      /\bneotame\b/i,
      /\badvantame\b/i,
      /\bcyclamate\b/i,
    ],
    detectLabel: 'artificial sweeteners',
  },
  avoidHFCS: {
    patterns: [
      /\bhigh[- ]fructose corn syrup\b/i,
      /\bhfcs\b/i,
      /\bglucose[- ]fructose syrup\b/i,
      /\bisoglucose\b/i,
    ],
    detectLabel: 'high-fructose corn syrup',
  },
  avoidPreservatives: {
    patterns: [
      /\bsodium benzoate\b/i,
      /\bpotassium sorbate\b/i,
      /\bcalcium propionate\b/i,
      /\bnitrite\b/i,
      /\bnitrate\b/i,
      /\bsulphite\b/i,
      /\bsulfite\b/i,
      /\bbht/i,
      /\bbha/i,
      /\btbhq\b/i,
      /\bpreservative\b/i,
    ],
    detectLabel: 'preservatives or additives',
  },
};

function normalizeIngredientsText(product) {
  const text = (product.ingredientsText ?? '').toLowerCase();
  const tags = (product.additivesTags ?? []).join(' ').toLowerCase();
  return `${text} ${tags}`.trim();
}

function countIngredients(product) {
  const raw = product.ingredientsText ?? '';
  if (!raw.trim()) return null;
  const parts = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return parts.length;
}

function findMatches(text, patterns) {
  const found = [];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) found.push(m[0]);
  }
  return [...new Set(found)];
}

export function analyzeIngredientPreferences(product, prefs) {
  const text = normalizeIngredientsText(product);
  const enabled = INGREDIENT_PREF_KEYS.filter((k) => prefs?.[k]);
  const matches = [];
  const drivers = [];
  let subscore = 100;

  for (const key of enabled) {
    if (key === 'preferMinimalIngredients') continue;

    const matcher = MATCHERS[key];
    if (!matcher) continue;

    const detected = findMatches(text, matcher.patterns);
    if (detected.length > 0) {
      const label = INGREDIENT_PREF_LABELS[key];
      matches.push({ preferenceKey: key, label, detected, matched: true });
      subscore -= 12;
      drivers.push({
        type: 'negative',
        category: 'ingredient',
        text: `You enabled "${label}" and this product contains ${detected[0]}.`,
        preferenceKey: key,
        detected,
      });
    }
  }

  if (prefs?.preferMinimalIngredients) {
    const count = countIngredients(product);
    const label = INGREDIENT_PREF_LABELS.preferMinimalIngredients;
    if (count != null) {
      if (count <= 8) {
        subscore += 10;
        matches.push({
          preferenceKey: 'preferMinimalIngredients',
          label,
          detected: [`${count} ingredients listed`],
          matched: true,
          positive: true,
        });
        drivers.push({
          type: 'positive',
          category: 'ingredient',
          text: `Shorter ingredient list (${count} items) aligns with your preference for minimal ingredients.`,
          preferenceKey: 'preferMinimalIngredients',
        });
      } else if (count >= 18) {
        subscore -= 10;
        matches.push({
          preferenceKey: 'preferMinimalIngredients',
          label,
          detected: [`${count} ingredients listed`],
          matched: true,
        });
        drivers.push({
          type: 'negative',
          category: 'ingredient',
          text: `Longer ingredient list (${count} items) is below your preference for minimal ingredients.`,
          preferenceKey: 'preferMinimalIngredients',
        });
      }
    }
  }

  subscore = Math.max(0, Math.min(100, subscore));

  return {
    subscore,
    matches,
    drivers,
    hasEnabledPrefs: enabled.length > 0,
  };
}
