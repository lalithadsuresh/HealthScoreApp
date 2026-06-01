import { GOAL_FOCUS_OPTIONS } from '../constants/onboarding.js';
import { thresholds } from './nutrients.js';

function getUserFocusIds(user) {
  if (user.goalFocuses?.length) return user.goalFocuses.filter((f) => f && f !== 'other');
  if (user.goalFocus) return [user.goalFocus].filter((f) => f !== 'other');
  return [];
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function scoreMoreIsBetter(value, lowAnchor, highAnchor) {
  if (value == null) return 50;
  if (highAnchor <= lowAnchor) return 50;
  if (value >= highAnchor) return 100;
  if (value <= lowAnchor) return 0;
  return clamp(((value - lowAnchor) / (highAnchor - lowAnchor)) * 100);
}

export function scoreLessIsBetter(value, goodLow, badHigh) {
  if (value == null) return 50;
  if (value <= goodLow) return 100;
  if (value >= badHigh) return 0;
  return clamp(((badHigh - value) / (badHigh - goodLow)) * 100);
}

const SUGAR_FOCUS_IDS = new Set([
  'lowerSugar',
  'stableEnergy',
  'avoidCrashes',
  'glycemicAware',
  'fatLoss',
  'flexibleMaintenance',
]);

const SUGAR_PRIORITIES = new Set(['lowerSugar']);

export function userCaresAboutSugar(user) {
  if (user.primaryGoal === 'bloodSugarAwareness') return true;
  if ((user.personalPriorities ?? []).some((p) => SUGAR_PRIORITIES.has(p))) return true;
  if (getUserFocusIds(user).some((id) => SUGAR_FOCUS_IDS.has(id))) return true;
  if ((user.goalWeights?.lowSugar ?? 0) >= 5 || (user.goalWeights?.bloodSugarControl ?? 0) >= 5) {
    return true;
  }
  return false;
}

export function userWantsHigherCalories(user) {
  if (user.primaryGoal === 'bulk') return true;
  const priorities = user.personalPriorities ?? [];
  if (priorities.includes('higherCalories') || priorities.includes('recoveryFuel')) return true;
  const focuses = getUserFocusIds(user);
  if (focuses.includes('maxCalories') || focuses.includes('leanBulk')) return true;
  return false;
}

export function userWantsLowerCalories(user) {
  if (user.primaryGoal === 'cut') return true;
  const priorities = user.personalPriorities ?? [];
  if (priorities.includes('lowerCalories')) return true;
  const focuses = getUserFocusIds(user);
  if (focuses.includes('fatLoss') || focuses.includes('lowerCalories')) return true;
  return false;
}

export function userCaresAboutProtein(user) {
  if (['bulk', 'cut', 'athleticPerformance'].includes(user.primaryGoal)) return true;
  const priorities = user.personalPriorities ?? [];
  if (priorities.includes('protein') || priorities.includes('recoveryFuel')) return true;
  const focuses = getUserFocusIds(user);
  if (
    focuses.some((id) =>
      ['leanBulk', 'maxProtein', 'preserveMuscle', 'recovery', 'bodyComposition'].includes(id)
    )
  ) {
    return true;
  }
  return (user.goalWeights?.highProtein ?? 0) >= 5 || (user.goalWeights?.buildMuscle ?? 0) >= 5;
}

export function userCaresAboutCleanEating(user) {
  const focuses = getUserFocusIds(user);
  if (focuses.some((id) => ['cleanEating', 'ingredientQuality', 'wholeFoods'].includes(id))) {
    return true;
  }
  if ((user.personalPriorities ?? []).includes('ingredientQuality')) return true;
  if (user.ingredientPreferences?.preferMinimalIngredients) return true;
  return (user.goalWeights?.cleanIngredients ?? 0) >= 6;
}

/** Calories: "more" = bulking, "less" = cut */
export function scoreCaloriesForIntent(product, intent) {
  const nn = product.nutriments ?? {};
  const t = thresholds(product);
  if (nn.energyKcal == null) return 50;
  if (intent === 'more') {
    const low = Math.round(t.energyKcal.good * 0.45);
    const high = Math.max(t.energyKcal.poor - 40, t.energyKcal.good + 80);
    return scoreMoreIsBetter(nn.energyKcal, low, high);
  }
  return scoreLessIsBetter(nn.energyKcal, t.energyKcal.good, t.energyKcal.poor);
}

export function scoreSugarForUser(product, user) {
  const nn = product.nutriments ?? {};
  const t = thresholds(product);
  if (nn.sugar == null) return 50;
  return scoreLessIsBetter(nn.sugar, t.sugar.good, t.sugar.poor);
}

export function shouldIncludeDriver(user, label, impact) {
  if (impact === 0) return false;
  if (impact < 0) {
    if (label === 'Higher Calories' && userWantsHigherCalories(user)) return false;
    if (label === 'High Sugar' && !userCaresAboutSugar(user)) return false;
    if (label === 'Lower Calories' && userWantsHigherCalories(user) && !userWantsLowerCalories(user)) {
      return false;
    }
  }
  if (impact > 0 && label === 'Lower Calories' && userWantsHigherCalories(user) && !userWantsLowerCalories(user)) {
    return false;
  }
  return true;
}

export function defaultGoalsForUser(user) {
  switch (user.primaryGoal) {
    case 'bulk':
      return { highProtein: 8, buildMuscle: 7 };
    case 'cut':
      return { loseWeight: 8, highProtein: 6 };
    case 'bloodSugarAwareness':
      return { bloodSugarControl: 9, lowSugar: 7 };
    case 'heartHealth':
      return { heartHealth: 9, lowSodium: 6 };
    default:
      return { highProtein: 6, highFiber: 5 };
  }
}
