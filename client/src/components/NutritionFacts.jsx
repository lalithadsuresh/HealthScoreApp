import { formatNutrientDisplay } from '../utils/nutrients.js';

const PRIMARY_FIELDS = [
  ['Calories', 'energyKcal', 'kcal'],
  ['Protein', 'protein', 'g'],
  ['Sugar', 'sugar', 'g'],
  ['Fiber', 'fiber', 'g'],
  ['Sodium', 'sodium', 'mg'],
];

function NutrientGrid({ nutriments, unavailableLabel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
      {PRIMARY_FIELDS.map(([label, key, unit]) => {
        const val = nutriments?.[key];
        const display =
          val == null ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{unavailableLabel(key)}</span>
          ) : (
            <strong>{formatNutrientDisplay(val, unit)}</strong>
          );
        return (
          <div key={key}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</div>
            {display}
          </div>
        );
      })}
    </div>
  );
}

function unavailableLabel(key) {
  const map = {
    sugar: 'Sugar data unavailable.',
    protein: 'Protein data unavailable.',
    energyKcal: 'Calorie data unavailable.',
    fiber: 'Fiber data unavailable.',
    sodium: 'Sodium data unavailable.',
  };
  return map[key] ?? 'Data unavailable.';
}

export default function NutritionFacts({ product, score }) {
  const basis = product.nutritionBasis ?? score?.nutritionBasis ?? '100g';
  const per100 = product.nutrientsPer100g ?? {};
  const perServing = product.nutrientsPerServing ?? product.nutriments;
  const primary = basis === 'serving' ? perServing : per100;

  return (
    <>
      {(product.nutritionBasisWarning || score?.nutritionBasisWarning) && (
        <div className="card" style={{ borderColor: '#fde68a', background: '#fffbeb', marginBottom: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>
            {score?.nutritionBasisWarning || product.nutritionBasisWarning}
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>
          {basis === 'serving'
            ? `Nutrition (per serving${product.servingLabel ? `: ${product.servingLabel}` : ''})`
            : 'Nutrition (per 100g)'}
        </h3>
        <NutrientGrid nutriments={primary} unavailableLabel={unavailableLabel} />
      </div>

      {basis === 'serving' && per100 && Object.keys(per100).length > 0 && (
        <div className="card" style={{ opacity: 0.92 }}>
          <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}>Comparison (per 100g)</h3>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Use per-100g values to compare different package sizes fairly.
          </p>
          <NutrientGrid nutriments={per100} unavailableLabel={unavailableLabel} />
        </div>
      )}
    </>
  );
}
