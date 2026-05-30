import { GOAL_KEYS, GOAL_LABELS } from '../constants/goals.js';

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

/** Higher raw value is better → map to 0–100 */
function scoreHigher(value, goodAt, poorAt) {
  if (value == null) return 50;
  if (value >= goodAt) return 100;
  if (value <= poorAt) return 0;
  return clamp(((value - poorAt) / (goodAt - poorAt)) * 100);
}

/** Lower raw value is better → map to 0–100 */
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
      add(n.protein >= 15, `Strong protein (${n.protein ?? '?'}g/100g)`, 'Low protein for your muscle goals');
      break;
    case 'loseWeight':
      add(n.energyKcal != null && n.energyKcal <= 200, 'Relatively low calories per 100g', 'Higher calorie density');
      break;
    case 'lowSugar':
      add(n.sugar != null && n.sugar <= 8, 'Lower sugar content', 'Sugar is relatively high');
      break;
    case 'highFiber':
      add(n.fiber >= 5, 'Good fiber content', 'Low fiber');
      break;
    case 'lowSodium':
      add(n.sodium != null && n.sodium <= 400, 'Moderate sodium', 'High sodium');
      break;
    case 'cleanIngredients':
      if ((product.additivesCount ?? 0) <= 2) positives.push('Few additives');
      else negatives.push('Several additives detected');
      if (product.novaGroup === 1 || product.novaGroup === 2) positives.push('Less processed (NOVA 1–2)');
      else if (product.novaGroup >= 3) negatives.push('More ultra-processed');
      break;
    case 'heartHealth':
      if (n.saturatedFat != null && n.saturatedFat <= 5) positives.push('Lower saturated fat');
      else negatives.push('Saturated fat could be lower');
      break;
    case 'bloodSugarControl':
      if (n.sugar != null && n.sugar <= 10) positives.push('Sugar-friendly for blood sugar goals');
      else negatives.push('Sugar/carbs may spike blood sugar');
      break;
    default:
      break;
  }

  if (subscore >= 70 && positives.length === 0) positives.push(`Aligns well with ${label}`);
  if (subscore < 50 && negatives.length === 0) negatives.push(`Does not strongly match ${label}`);

  return { label, positives, negatives, subscore };
}

export function scoreProduct(product, user) {
  const weights = user.goalWeights ?? {};
  const selected = user.selectedGoals?.length
    ? user.selectedGoals.filter((g) => GOAL_KEYS.includes(g))
    : GOAL_KEYS.filter((g) => (weights[g] ?? 0) > 0);

  const activeGoals = selected.length
    ? selected
    : GOAL_KEYS.filter((g) => (weights[g] ?? 0) > 0);

  const goalsToScore = activeGoals.length ? activeGoals : ['highProtein', 'lowSugar'];

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

  const overallScore = Math.round(weightedSum / weightTotal);

  const allPositives = [];
  const allNegatives = [];
  for (const b of breakdown) {
    allPositives.push(...b.positives.map((t) => ({ text: t, goal: b.label })));
    allNegatives.push(...b.negatives.map((t) => ({ text: t, goal: b.label })));
  }

  const topWins = breakdown
    .filter((b) => b.subscore >= 65)
    .sort((a, b) => b.subscore - a.subscore)
    .slice(0, 3)
    .flatMap((b) => b.positives.slice(0, 1).map((t) => ({ text: t, goal: b.label })));

  const topLosses = breakdown
    .filter((b) => b.subscore < 55)
    .sort((a, b) => a.subscore - b.subscore)
    .slice(0, 3)
    .flatMap((b) => b.negatives.slice(0, 1).map((t) => ({ text: t, goal: b.label })));

  return {
    overallScore: clamp(overallScore),
    breakdown,
    whyScoredWell: topWins.length ? topWins : allPositives.slice(0, 4),
    whyLostPoints: topLosses.length ? topLosses : allNegatives.slice(0, 4),
  };
}
