import { GOAL_FOCUS_OPTIONS, PRIMARY_GOAL_LABELS, PERSONAL_PRIORITY_LABELS } from '../constants/onboarding.js';
import { INGREDIENT_PREF_LABELS } from '../constants/ingredientPreferences.js';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreHigher(value, goodAt, poorAt) {
  if (value == null) return 50;
  if (value >= goodAt) return 100;
  if (value <= poorAt) return 0;
  return clamp(((value - poorAt) / (goodAt - poorAt)) * 100, 0, 100);
}

function scoreLower(value, goodAt, poorAt) {
  if (value == null) return 50;
  if (typeof value === "number" && Number.isNaN(value)) return 50;
  if (value <= goodAt) return 100;
  if (value >= poorAt) return 0;
  return clamp(((poorAt - value) / (poorAt - goodAt)) * 100, 0, 100);
}

/** Subscore 0–100 per focus id */
const FOCUS_SUBSCORE = {
  leanBulk: (p) => scoreHigher(p.nutriments?.protein, 18, 5),
  maxCalories: (p) => scoreHigher(p.nutriments?.energyKcal, 400, 150),
  maxProtein: (p) => scoreHigher(p.nutriments?.protein, 22, 5),
  cleanEating: (p) => scoreClean(p),
  fatLoss: (p) => scoreLower(p.nutriments?.energyKcal, 120, 400),
  fullness: (p) => scoreHigher(p.nutriments?.fiber, 7, 1),
  preserveMuscle: (p) => scoreHigher(p.nutriments?.protein, 20, 8),
  lowerCalories: (p) => scoreLower(p.nutriments?.energyKcal, 100, 350),
  balancedEnergy: (p) => scoreLower(p.nutriments?.energyKcal, 200, 400),
  bodyComposition: (p) =>
    Math.round(
      (scoreHigher(p.nutriments?.protein, 15, 5) +
        scoreLower(p.nutriments?.sugar, 8, 20) +
        scoreLower(p.nutriments?.energyKcal, 250, 450)) /
        3
    ),
  ingredientQuality: (p) => scoreClean(p),
  flexibleMaintenance: (p) =>
    Math.round((scoreClean(p) + scoreLower(p.nutriments?.sugar, 12, 25)) / 2),
  energy: (p) => scoreHigher(p.nutriments?.energyKcal ?? p.nutriments?.carbs, 45, 10),
  recovery: (p) => scoreHigher(p.nutriments?.protein, 18, 6),
  hydration: (p) => scoreLower(p.nutriments?.sodium, 300, 700),
  endurance: (p) => scoreHigher(p.nutriments?.carbs, 40, 8),
  lowerSodium: (p) => scoreLower(p.nutriments?.sodium, 250, 750),
  lowerSatFat: (p) => scoreLower(p.nutriments?.saturatedFat, 3, 12),
  moreFiber: (p) => scoreHigher(p.nutriments?.fiber, 7, 1),
  wholeFoods: (p) => scoreClean(p),
  lowerSugar: (p) => scoreLower(p.nutriments?.sugar, 6, 22),
  stableEnergy: (p) => scoreLower(p.nutriments?.sugar, 8, 25),
  lowerCarbs: (p) => scoreLower(p.nutriments?.carbs, 12, 45),
  glycemicAware: (p) =>
    Math.round(
      (scoreLower(p.nutriments?.sugar, 6, 25) + scoreLower(p.nutriments?.carbs, 15, 50)) / 2
    ),
  feelBetter: (p) => Math.round((scoreClean(p) + scoreHigher(p.nutriments?.fiber, 5, 1)) / 2),
  balancedMeals: (p) =>
    Math.round(
      (scoreHigher(p.nutriments?.protein, 12, 4) +
        scoreHigher(p.nutriments?.fiber, 5, 1) +
        scoreLower(p.nutriments?.sugar, 12, 28)) /
        3
    ),
  avoidCrashes: (p) => scoreLower(p.nutriments?.sugar, 8, 28),
};

function scoreClean(product) {
  let s = 100;
  s -= Math.min((product.additivesCount ?? 0) * 8, 35);
  if (product.novaGroup >= 4) s -= 25;
  else if (product.novaGroup >= 3) s -= 15;
  const len = (product.ingredientsText ?? '').length;
  if (len > 350) s -= 12;
  return clamp(s);
}

export const FOCUS_DRIVER_DISPLAY = {
  leanBulk: { icon: '🥩', label: 'Lean Bulk Protein' },
  maxCalories: { icon: '🔥', label: 'Calorie Density' },
  maxProtein: { icon: '🥩', label: 'High Protein' },
  cleanEating: { icon: '🌿', label: 'Clean Ingredients' },
  fatLoss: { icon: '📉', label: 'Fat Loss Fit' },
  fullness: { icon: '🥗', label: 'Fullness' },
  preserveMuscle: { icon: '💪', label: 'Muscle Preservation' },
  lowerCalories: { icon: '⬇️', label: 'Lower Calories' },
  balancedEnergy: { icon: '⚖️', label: 'Balanced Energy' },
  bodyComposition: { icon: '📊', label: 'Body Composition' },
  ingredientQuality: { icon: '🌿', label: 'Ingredient Quality' },
  flexibleMaintenance: { icon: '🔄', label: 'Flexible Balance' },
  energy: { icon: '⚡', label: 'Energy Support' },
  recovery: { icon: '💪', label: 'Recovery Fuel' },
  hydration: { icon: '🧂', label: 'Hydration Support' },
  endurance: { icon: '🏃', label: 'Endurance Fuel' },
  lowerSodium: { icon: '🧂', label: 'Lower Sodium' },
  lowerSatFat: { icon: '❤️', label: 'Lower Sat. Fat' },
  moreFiber: { icon: '🌾', label: 'Fiber Support' },
  wholeFoods: { icon: '🥬', label: 'Whole Foods' },
  lowerSugar: { icon: '🍬', label: 'Lower Sugar' },
  stableEnergy: { icon: '📈', label: 'Stable Energy' },
  lowerCarbs: { icon: '🍞', label: 'Lower Carbs' },
  glycemicAware: { icon: '🩸', label: 'Blood Sugar Balance' },
  feelBetter: { icon: '✨', label: 'Feel-Better Balance' },
  balancedMeals: { icon: '🍽️', label: 'Balanced Meals' },
  avoidCrashes: { icon: '⚡', label: 'Crash Prevention' },
};

const PRIORITY_DRIVER_DISPLAY = {
  protein: { icon: '🥩', label: 'High Protein' },
  fiber: { icon: '🌾', label: 'Fiber' },
  energy: { icon: '⚡', label: 'Energy' },
  fullness: { icon: '🥗', label: 'Fullness' },
  ingredientQuality: { icon: '🌿', label: 'Ingredient Quality' },
  lowerSugar: { icon: '🍬', label: 'Lower Sugar' },
  lowerSodium: { icon: '🧂', label: 'Lower Sodium' },
  lowerSaturatedFat: { icon: '❤️', label: 'Lower Sat. Fat' },
  higherCalories: { icon: '🔥', label: 'Higher Calories' },
  lowerCalories: { icon: '⬇️', label: 'Lower Calories' },
  recoveryFuel: { icon: '💪', label: 'Recovery Fuel' },
};

const INGREDIENT_DRIVER_DISPLAY = {
  limitSeedOils: { icon: '🌱', label: 'Seed Oil Preference' },
  avoidArtificialColors: { icon: '🎨', label: 'Artificial Colors' },
  avoidRed40: { icon: '🔴', label: 'Red 40 Preference' },
  avoidArtificialSweeteners: { icon: '🧪', label: 'Artificial Sweeteners' },
  preferMinimalIngredients: { icon: '📋', label: 'Minimal Ingredients' },
  avoidHFCS: { icon: '🌽', label: 'HFCS Preference' },
  avoidPreservatives: { icon: '🧫', label: 'Preservatives' },
  avoidHighlyProcessed: { icon: '🏭', label: 'Processed Ingredients' },
};

function subscoreToImpact(subscore) {
  if (!Number.isFinite(subscore)) return 0;
  const raw = Math.round((subscore - 50) / 4);
  return clamp(raw, -15, 15);
}

export function getUserFocusIds(user) {
  if (user.goalFocuses?.length) return user.goalFocuses.filter((f) => f && f !== 'other');
  if (user.goalFocus) return [user.goalFocus].filter((f) => f !== 'other');
  return [];
}

export function getFocusLabelsForUser(user) {
  const primary = user.primaryGoal;
  if (!primary) return [];
  const options = GOAL_FOCUS_OPTIONS[primary] ?? [];
  const ids = getUserFocusIds(user);
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? FOCUS_DRIVER_DISPLAY[id]?.label)
    .filter(Boolean);
}

export function buildVisualDrivers(product, user, ingredientAnalysis, allergyAnalysis) {
  const positive = [];
  const negative = [];
  const usedLabels = new Set();

  const addDriver = (driver, impact) => {
    if (!driver || impact === 0 || usedLabels.has(driver.label)) return;
    usedLabels.add(driver.label);
    const entry = {
      icon: driver.icon,
      label: driver.label,
      impact: Math.abs(impact),
      direction: impact > 0 ? 'positive' : 'negative',
    };
    if (impact > 0) positive.push(entry);
    else negative.push(entry);
  };

  for (const focusId of getUserFocusIds(user)) {
    const fn = FOCUS_SUBSCORE[focusId];
    const display = FOCUS_DRIVER_DISPLAY[focusId];
    if (!fn || !display) continue;
    const sub = fn(product);
    const impact = subscoreToImpact(sub);
    addDriver(display, impact);
  }

  const focusIds = new Set(getUserFocusIds(user));
  for (const priorityId of user.personalPriorities ?? []) {
    if (focusIds.has('maxProtein') && priorityId === 'protein') continue;
    if (focusIds.has('recovery') && priorityId === 'recoveryFuel') continue;
    const display = PRIORITY_DRIVER_DISPLAY[priorityId];
    if (!display) continue;
    let sub = 50;
    const n = product.nutriments ?? {};
    switch (priorityId) {
      case 'protein':
        sub = scoreHigher(n.protein, 18, 4);
        break;
      case 'fiber':
        sub = scoreHigher(n.fiber, 7, 1);
        break;
      case 'lowerSugar':
        sub = scoreLower(n.sugar, 8, 22);
        break;
      case 'lowerSodium':
        sub = scoreLower(n.sodium, 300, 700);
        break;
      case 'lowerCalories':
        sub = scoreLower(n.energyKcal, 120, 400);
        break;
      case 'higherCalories':
        sub = scoreHigher(n.energyKcal, 380, 120);
        break;
      case 'ingredientQuality':
        sub = scoreClean(product);
        break;
      case 'recoveryFuel':
        sub = scoreHigher(n.protein, 16, 5);
        break;
      default:
        break;
    }
    addDriver(display, subscoreToImpact(sub));
  }

  for (const d of ingredientAnalysis.drivers ?? []) {
    const key = d.preferenceKey;
    const display = INGREDIENT_DRIVER_DISPLAY[key] ?? {
      icon: '🏷️',
      label: INGREDIENT_PREF_LABELS[key] ?? 'Ingredient preference',
    };
    const impact = d.type === 'positive' ? 6 : -6;
    addDriver(display, impact);
  }

  for (const c of allergyAnalysis.conflicts ?? []) {
    addDriver({ icon: '⚠️', label: c.label }, -8);
  }

  const sugar = product.nutriments?.sugar;
  if (sugar != null && sugar > 12 && !usedLabels.has('High Sugar')) {
    const sugarSub = scoreLower(sugar, 8, 22);
    if (sugarSub < 50) {
      addDriver({ icon: '🍬', label: 'High Sugar' }, subscoreToImpact(sugarSub));
    }
  }

  positive.sort((a, b) => b.impact - a.impact);
  negative.sort((a, b) => b.impact - a.impact);

  return {
    positive: positive.slice(0, 8),
    negative: negative.slice(0, 8),
  };
}

export function buildScoreSummary(user, overallScore) {
  const primaryGoalLabel = PRIMARY_GOAL_LABELS[user.primaryGoal] ?? 'Your goal';
  const focusLabels = getFocusLabelsForUser(user);
  return {
    score: overallScore,
    primaryGoalLabel,
    focusLabels,
    focusLine: focusLabels.join(', '),
    primaryGoal: user.primaryGoal,
  };
}
