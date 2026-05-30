export function formatNutrientDisplay(value, unit) {
  if (value == null) return '—';
  return `${Math.round(value * 10) / 10} ${unit}`;
}
