import { GOAL_KEYS, DEFAULT_GOAL_WEIGHTS } from '../constants/goals.js';
import {
  GOAL_FOCUS_OPTIONS,
  PRIMARY_GOAL_LABELS,
} from '../constants/onboarding.js';

const PRIORITY_TO_GOALS = {
  protein: { highProtein: 10, buildMuscle: 6 },
  fiber: { highFiber: 10 },
  energy: { buildMuscle: 3 },
  fullness: { highFiber: 8, lowSugar: 4 },
  ingredientQuality: { cleanIngredients: 10 },
  lowerSugar: { lowSugar: 10, bloodSugarControl: 6 },
  lowerSodium: { lowSodium: 10 },
  lowerSaturatedFat: { heartHealth: 8 },
  higherCalories: { buildMuscle: 4 },
  lowerCalories: { loseWeight: 10 },
  recoveryFuel: { highProtein: 8, highFiber: 4 },
};

const FOCUS_BOOSTS = {
  leanBulk: { highProtein: 9, buildMuscle: 7, cleanIngredients: 4 },
  maxCalories: { buildMuscle: 6, loseWeight: 0, highProtein: 5 },
  maxProtein: { highProtein: 10, buildMuscle: 8 },
  cleanEating: { cleanIngredients: 10, highProtein: 5 },
  fatLoss: { loseWeight: 10, lowSugar: 6 },
  fullness: { highFiber: 9, loseWeight: 6 },
  preserveMuscle: { highProtein: 10, buildMuscle: 7, loseWeight: 5 },
  lowerCalories: { loseWeight: 10 },
  balancedEnergy: { loseWeight: 4, highProtein: 5, lowSugar: 4 },
  bodyComposition: { highProtein: 7, loseWeight: 5, lowSugar: 5 },
  ingredientQuality: { cleanIngredients: 10 },
  flexibleMaintenance: { highProtein: 5, highFiber: 5, lowSugar: 4 },
  energy: { buildMuscle: 5, bloodSugarControl: 4 },
  recovery: { highProtein: 9, highFiber: 5 },
  hydration: { lowSodium: 6 },
  endurance: { highFiber: 5, bloodSugarControl: 4 },
  lowerSodium: { lowSodium: 10, heartHealth: 8 },
  lowerSatFat: { heartHealth: 10 },
  moreFiber: { highFiber: 10, heartHealth: 6 },
  wholeFoods: { cleanIngredients: 10, heartHealth: 5 },
  lowerSugar: { lowSugar: 10, bloodSugarControl: 8 },
  stableEnergy: { lowSugar: 8, bloodSugarControl: 7 },
  lowerCarbs: { bloodSugarControl: 9, lowSugar: 6 },
  glycemicAware: { bloodSugarControl: 10, lowSugar: 8 },
  feelBetter: { highFiber: 5, cleanIngredients: 5, lowSugar: 4 },
  balancedMeals: { highProtein: 5, highFiber: 5, heartHealth: 4 },
  avoidCrashes: { lowSugar: 9, bloodSugarControl: 7 },
};

const PRIMARY_BASE = {
  bulk: { highProtein: 6, buildMuscle: 5 },
  cut: { loseWeight: 7, highProtein: 5 },
  maintain: { highProtein: 4, highFiber: 4, loseWeight: 3 },
  athleticPerformance: { highProtein: 6, highFiber: 4 },
  heartHealth: { heartHealth: 9, lowSodium: 6 },
  bloodSugarAwareness: { bloodSugarControl: 9, lowSugar: 7 },
  generalWellness: { cleanIngredients: 4, highFiber: 4, lowSugar: 4 },
};

function mergeWeights(target, source, scale = 1) {
  for (const [key, val] of Object.entries(source)) {
    if (!GOAL_KEYS.includes(key)) continue;
    target[key] = Math.min(10, (target[key] ?? 0) + val * scale);
  }
}

export function getGoalDisplayName(user) {
  const primary = user.primaryGoal;
  const focus = user.goalFocus;
  if (!primary) return 'your goals';

  const options = GOAL_FOCUS_OPTIONS[primary] ?? [];
  const focusMeta = options.find((o) => o.id === focus);
  const focusLabel = focus === 'other' && user.goalFocusOther?.trim()
    ? user.goalFocusOther.trim()
    : focusMeta?.label;

  const primaryLabel = PRIMARY_GOAL_LABELS[primary] ?? primary;
  if (focusLabel && focus !== 'other') return `${focusLabel} ${primaryLabel}`;
  if (focusLabel) return focusLabel;
  return primaryLabel;
}

export function deriveScoringProfile(user) {
  const weights = { ...DEFAULT_GOAL_WEIGHTS };

  if (user.primaryGoal && PRIMARY_BASE[user.primaryGoal]) {
    mergeWeights(weights, PRIMARY_BASE[user.primaryGoal], 1);
  }

  if (user.goalFocus && FOCUS_BOOSTS[user.goalFocus]) {
    mergeWeights(weights, FOCUS_BOOSTS[user.goalFocus], 1);
  }

  for (const p of user.personalPriorities ?? []) {
    if (PRIORITY_TO_GOALS[p]) mergeWeights(weights, PRIORITY_TO_GOALS[p], 0.85);
  }

  if (user.ingredientPreferences?.preferMinimalIngredients || user.goalFocus === 'cleanEating') {
    weights.cleanIngredients = Math.min(10, (weights.cleanIngredients ?? 0) + 4);
  }

  const selectedGoals = GOAL_KEYS.filter((k) => (weights[k] ?? 0) > 0);
  if (!selectedGoals.length) {
    return {
      selectedGoals: ['highProtein', 'lowSugar'],
      goalWeights: { ...DEFAULT_GOAL_WEIGHTS, highProtein: 6, lowSugar: 6 },
    };
  }

  for (const k of GOAL_KEYS) {
    if (!selectedGoals.includes(k)) weights[k] = 0;
  }

  return { selectedGoals, goalWeights: weights };
}
