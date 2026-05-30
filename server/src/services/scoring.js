import { GOAL_KEYS, GOAL_LABELS } from '../constants/goals.js';
import { analyzeIngredientPreferences } from './ingredientScoring.js';
import { analyzeAllergiesAndRestrictions } from './allergyScoring.js';
import { deriveScoringProfile, getGoalDisplayName } from './profileMapper.js';
import { buildVisualDrivers, buildScoreSummary } from './focusDrivers.js';

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function scoreHigher(value, goodAt, poorAt) {
  if (value == null) return 50;
  if (value >= goodAt) return 100;
  if (value <= poorAt) return 0;
  return clamp(((value - poorAt) / (goodAt - poorAt)) * 100);
}

function scoreLower(value, goodAt, poorAt) {
  if (value == null) return 50;
  if (value <= goodAt) return 100;
  if (value >= poorAt) return 0;
  return clamp(((poorAt - value) / (poorAt - goodAt)) * 100);
}

function scoreCleanIngredients(product) {
  let score = 100;
  const additives = product.additivesCount ?? 0;
  score -= Math.min(additives * 8, 40);
  if (product.novaGroup != null) {
    const novaPenalty = { 1: 0, 2: 5, 3: 20, 4: 35 }[product.novaGroup] ?? 15;
    score -= novaPenalty;
  }
  const len = (product.ingredientsText ?? '').length;
  if (len > 400) score -= 15;
  else if (len > 200) score -= 8;
  return clamp(score);
}

function computeGoalSubscore(goalKey, product) {
  const n = product.nutriments ?? {};

  switch (goalKey) {
    case 'buildMuscle':
    case 'highProtein':
      return scoreHigher(n.protein, 20, 3);
    case 'loseWeight':
      return scoreLower(n.energyKcal, 150, 450);
    case 'lowSugar':
      return scoreLower(n.sugar, 5, 25);
    case 'highFiber':
      return scoreHigher(n.fiber, 8, 1);
    case 'lowSodium':
      return scoreLower(n.sodium, 200, 800);
    case 'cleanIngredients':
      return scoreCleanIngredients(product);
    case 'heartHealth': {
      const sat = scoreLower(n.saturatedFat, 2, 10);
      const sodium = scoreLower(n.sodium, 200, 800);
      const fiber = scoreHigher(n.fiber, 6, 1);
      return Math.round((sat + sodium + fiber) / 3);
    }
    case 'bloodSugarControl': {
      const sugar = scoreLower(n.sugar, 5, 30);
      const carbs = scoreLower(n.carbs, 15, 60);
      return Math.round((sugar + carbs) / 2);
    }
    default:
      return 50;
  }
}

function explainSubscore(goalKey, subscore, product) {
  const n = product.nutriments ?? {};
  const label = GOAL_LABELS[goalKey];
  const positives = [];
  const negatives = [];

  const add = (condition, good, bad) => {
    if (condition) positives.push(good);
    else negatives.push(bad);
  };

  switch (goalKey) {
    case 'buildMuscle':
    case 'highProtein':
      add(
        n.protein != null && n.protein >= 15,
        `High protein (${n.protein}g/100g) matched your ${label} priority.`,
        `Protein is relatively low for your ${label} setting.`
      );
      break;
    case 'loseWeight':
      add(
        n.energyKcal != null && n.energyKcal <= 200,
        `Calories per 100g are relatively low for your ${label} priority.`,
        `Calorie density is higher than ideal for your ${label} setting.`
      );
      break;
    case 'lowSugar':
      add(
        n.sugar != null && n.sugar <= 8,
        `Sugar is within a range that fits your ${label} preference.`,
        `Sugar is above what you prefer for ${label}.`
      );
      break;
    case 'highFiber':
      add(
        n.fiber != null && n.fiber >= 5,
        `Fiber content supports your ${label} priority.`,
        `Fiber is low relative to your ${label} setting.`
      );
      break;
    case 'lowSodium':
      add(
        n.sodium != null && n.sodium <= 400,
        `Sodium is moderate for your ${label} preference.`,
        `Sodium is high for your ${label} setting.`
      );
      break;
    case 'cleanIngredients':
      if ((product.additivesCount ?? 0) <= 2) {
        positives.push(`Fewer additives aligns with your ${label} preference.`);
      } else {
        negatives.push(`More additives than you prefer for ${label}.`);
      }
      break;
    case 'heartHealth':
      if (n.saturatedFat != null && n.saturatedFat <= 5) {
        positives.push(`Saturated fat is moderate for your ${label} priority.`);
      } else {
        negatives.push(`Saturated fat is high for your ${label} setting.`);
      }
      if (n.sodium != null && n.sodium > 500) {
        negatives.push(`Sodium is high for your ${label} setting.`);
      }
      break;
    case 'bloodSugarControl':
      if (n.sugar != null && n.sugar <= 10) {
        positives.push(`Sugar level fits your ${label} preference.`);
      } else {
        negatives.push(`Sugar is above your ${label} preference.`);
      }
      break;
    default:
      break;
  }

  if (subscore >= 70 && positives.length === 0) {
    positives.push(`Aligns with your ${label} priority.`);
  }
  if (subscore < 50 && negatives.length === 0) {
    negatives.push(`Below your ${label} preference.`);
  }

  return { label, positives, negatives, subscore };
}

function impactFromSubscore(subscore) {
  if (subscore >= 65) return 'positive';
  if (subscore <= 45) return 'negative';
  return 'neutral';
}

function buildNutrientContributions(product, breakdown, ingredientAnalysis, activeGoals) {
  const n = product.nutriments ?? {};
  const byGoal = Object.fromEntries(breakdown.map((b) => [b.goalKey, b]));

  const avgForGoals = (keys) => {
    const items = keys.filter((k) => activeGoals.includes(k) && byGoal[k]);
    if (!items.length) return null;
    return Math.round(items.reduce((s, k) => s + byGoal[k].subscore, 0) / items.length);
  };

  const proteinScore = avgForGoals(['buildMuscle', 'highProtein']);
  const calorieScore = avgForGoals(['loseWeight']);
  const sugarScore = avgForGoals(['lowSugar', 'bloodSugarControl']);
  const fiberScore = avgForGoals(['highFiber', 'heartHealth']);
  const sodiumScore = avgForGoals(['lowSodium', 'heartHealth']);
  const satFatScore = byGoal.heartHealth ? byGoal.heartHealth.subscore : null;

  const cleanScore = byGoal.cleanIngredients?.subscore ?? null;
  const ingredientQualityScore =
    cleanScore != null && ingredientAnalysis.hasEnabledPrefs
      ? Math.round((cleanScore + ingredientAnalysis.subscore) / 2)
      : cleanScore ?? (ingredientAnalysis.hasEnabledPrefs ? ingredientAnalysis.subscore : null);

  const mk = (key, label, score, detail) => {
    if (score == null) {
      return {
        key,
        label,
        score: null,
        impact: 'neutral',
        summary: 'Not weighted in your current goals or preferences.',
        detail,
      };
    }
    return {
      key,
      label,
      score,
      impact: impactFromSubscore(score),
      summary: detail,
      detail,
    };
  };

  return {
    protein: mk(
      'protein',
      'Protein',
      proteinScore,
      proteinScore != null
        ? `Protein per 100g: ${n.protein ?? '—'}g`
        : 'Enable a protein-related goal to weight protein.'
    ),
    calories: mk(
      'calories',
      'Calories',
      calorieScore,
      calorieScore != null ? `Energy per 100g: ${n.energyKcal ?? '—'} kcal` : 'Enable Lose weight to weight calories.'
    ),
    fiber: mk(
      'fiber',
      'Fiber',
      fiberScore,
      fiberScore != null ? `Fiber per 100g: ${n.fiber ?? '—'}g` : 'Enable a fiber-related goal to weight fiber.'
    ),
    sugar: mk(
      'sugar',
      'Sugar',
      sugarScore,
      sugarScore != null ? `Sugar per 100g: ${n.sugar ?? '—'}g` : 'Enable a sugar-related goal to weight sugar.'
    ),
    sodium: mk(
      'sodium',
      'Sodium',
      sodiumScore,
      sodiumScore != null ? `Sodium per 100g: ${n.sodium ?? '—'}mg` : 'Enable a sodium-related goal to weight sodium.'
    ),
    saturatedFat: mk(
      'saturatedFat',
      'Saturated fat',
      satFatScore,
      satFatScore != null
        ? `Saturated fat per 100g: ${n.saturatedFat ?? '—'}g`
        : 'Enable Heart health to weight saturated fat.'
    ),
    ingredientQuality: mk(
      'ingredientQuality',
      'Ingredient quality',
      ingredientQualityScore,
      ingredientQualityScore != null
        ? 'Based on your clean-ingredient goals and optional ingredient preferences.'
        : 'Turn on Clean ingredients or an ingredient preference to weight this.'
    ),
  };
}

export function scoreProduct(product, user) {
  const derived = user.primaryGoal
    ? deriveScoringProfile(user)
    : {
        selectedGoals: user.selectedGoals?.length
          ? user.selectedGoals.filter((g) => GOAL_KEYS.includes(g))
          : GOAL_KEYS.filter((g) => (user.goalWeights?.[g] ?? 0) > 0),
        goalWeights: user.goalWeights ?? {},
      };

  const weights = derived.goalWeights ?? {};
  const goalsToScore = derived.selectedGoals?.length
    ? derived.selectedGoals
    : ['highProtein', 'lowSugar'];

  const goalDisplayName = getGoalDisplayName(user);

  const breakdown = [];
  let weightedSum = 0;
  let weightTotal = 0;

  for (const goalKey of goalsToScore) {
    const w = Math.max(weights[goalKey] ?? 0, 1);
    const subscore = computeGoalSubscore(goalKey, product);
    const explanation = explainSubscore(goalKey, subscore, product);

    breakdown.push({
      goalKey,
      label: GOAL_LABELS[goalKey],
      weight: weights[goalKey] ?? 0,
      subscore: Math.round(subscore),
      positives: explanation.positives,
      negatives: explanation.negatives,
    });

    weightedSum += subscore * w;
    weightTotal += w;
  }

  const goalOnlyScore = Math.round(weightedSum / weightTotal);

  const ingredientAnalysis = analyzeIngredientPreferences(
    product,
    user.ingredientPreferences ?? {}
  );

  const allergyAnalysis = analyzeAllergiesAndRestrictions(
    product,
    user.allergiesRestrictions ?? []
  );

  let overallScore = goalOnlyScore;
  if (ingredientAnalysis.hasEnabledPrefs) {
    const ingWeight = 6;
    overallScore = Math.round(
      (goalOnlyScore * weightTotal + ingredientAnalysis.subscore * ingWeight) /
        (weightTotal + ingWeight)
    );
  }

  if (allergyAnalysis.scorePenalty > 0) {
    overallScore = Math.max(0, overallScore - allergyAnalysis.scorePenalty);
  }

  const nutrientContributions = buildNutrientContributions(
    product,
    breakdown,
    ingredientAnalysis,
    goalsToScore
  );

  const positiveDrivers = [];
  const negativeDrivers = [];
  const ingredientDrivers = [];

  for (const b of breakdown) {
    for (const t of b.positives) {
      positiveDrivers.push({ text: t, category: 'goal', source: b.label });
    }
    for (const t of b.negatives) {
      negativeDrivers.push({
        text: t.startsWith('Lost') ? t : `Lost points because ${t.charAt(0).toLowerCase()}${t.slice(1)}`,
        category: 'goal',
        source: b.label,
      });
    }
  }

  for (const c of allergyAnalysis.conflicts) {
    negativeDrivers.push({
      text: c.message,
      category: 'compatibility',
      source: c.label,
    });
  }

  for (const d of ingredientAnalysis.drivers) {
    const entry = { text: d.text, category: 'ingredient', preferenceKey: d.preferenceKey };
    if (d.type === 'positive') {
      positiveDrivers.push(entry);
      ingredientDrivers.push({ ...entry, impact: 'positive' });
    } else {
      negativeDrivers.push(entry);
      ingredientDrivers.push({ ...entry, impact: 'negative' });
    }
  }

  const visualDrivers = buildVisualDrivers(
    product,
    user,
    ingredientAnalysis,
    allergyAnalysis
  );
  const scoreSummary = buildScoreSummary(user, clamp(overallScore));

  const topWins = positiveDrivers.slice(0, 4);
  const topLosses = negativeDrivers.slice(0, 4);

  return {
    overallScore: clamp(overallScore),
    goalOnlyScore,
    breakdown,
    ingredientMatches: ingredientAnalysis.matches,
    ingredientPreferenceScore: ingredientAnalysis.hasEnabledPrefs
      ? ingredientAnalysis.subscore
      : null,
    nutrientContributions,
    whyThisScore: {
      positiveDrivers: topWins,
      negativeDrivers: topLosses,
      ingredientDrivers: ingredientDrivers.slice(0, 6),
    },
    whyScoredWell: topWins.filter((d) => d.category !== 'ingredient').slice(0, 3),
    whyLostPoints: topLosses.slice(0, 4),
    goalDisplayName,
    scoreHeadline: `${scoreSummary.score}/100 for your ${scoreSummary.primaryGoalLabel} goal`,
    scoreSummary,
    visualDrivers,
    compatibility: {
      conflicts: allergyAnalysis.conflicts,
      warnings: allergyAnalysis.warnings,
    },
  };
}
