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
];

export const GOAL_LABELS = {
  buildMuscle: 'Build muscle',
  loseWeight: 'Lose weight',
  lowSugar: 'Low sugar',
  highProtein: 'High protein',
  highFiber: 'High fiber',
  lowSodium: 'Low sodium',
  cleanIngredients: 'Clean ingredients',
  heartHealth: 'Heart health',
  bloodSugarControl: 'Blood sugar control',
};

export const DEFAULT_GOAL_WEIGHTS = Object.fromEntries(
  GOAL_KEYS.map((k) => [k, 0])
);
