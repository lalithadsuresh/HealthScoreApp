export const GOAL_KEYS = [
  'buildMuscle',
  'loseWeight',
  'lowSugar',
  'highProtein',
  'highFiber',
  'lowSodium',
  'cleanIngredients',
  'heartHealth',
  'bloodSugarControl',
] as const;

export type GoalKey = (typeof GOAL_KEYS)[number];

export const GOAL_META: Record<
  GoalKey,
  { label: string; emoji: string; hint: string }
> = {
  buildMuscle: { label: 'Build muscle', emoji: '💪', hint: 'Prioritize protein density' },
  loseWeight: { label: 'Lose weight', emoji: '⚖️', hint: 'Favor lower calorie density' },
  lowSugar: { label: 'Low sugar', emoji: '🍬', hint: 'Penalize high sugar' },
  highProtein: { label: 'High protein', emoji: '🥩', hint: 'Reward protein per 100g' },
  highFiber: { label: 'High fiber', emoji: '🌾', hint: 'Reward fiber content' },
  lowSodium: { label: 'Low sodium', emoji: '🧂', hint: 'Penalize high sodium' },
  cleanIngredients: {
    label: 'Clean ingredients',
    emoji: '🌿',
    hint: 'Fewer additives and processing',
  },
  heartHealth: { label: 'Heart health', emoji: '❤️', hint: 'Balance fat, sodium, and fiber' },
  bloodSugarControl: {
    label: 'Blood sugar control',
    emoji: '📉',
    hint: 'Lower sugar and refined carbs',
  },
};

export const MEDICAL_DISCLAIMER =
  'This app is for informational purposes only and is not medical advice. Scores are goal-based nutrition support, not diagnoses or treatment.';
