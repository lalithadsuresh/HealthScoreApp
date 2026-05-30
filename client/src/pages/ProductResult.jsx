import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import ScoreCircle, { scoreColor } from '../components/ScoreCircle.jsx';

function DriverList({ title, items, variant }) {
  if (!items?.length) {
    return (
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nothing notable in this category.</p>
    );
  }
  return (
    <>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {items.map((w, i) => (
        <p key={i} style={{ margin: '0.35rem 0', lineHeight: 1.45 }}>
          <span className={variant === 'good' ? 'tag tag-good' : 'tag tag-warn'}>
            {variant === 'good' ? '+' : '−'}
          </span>{' '}
          {w.text}
        </p>
      ))}
    </>
  );
}

function ContributionRow({ item }) {
  if (item.score == null) return null;
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
        <span>{item.label}</span>
        <strong style={{ color: scoreColor(item.score) }}>{item.score}</strong>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${item.score}%` }} />
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.summary}</div>
    </div>
  );
}

export default function ProductResult() {
  const { barcode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getProduct(barcode);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  if (loading) {
    return (
      <AppLayout showNav={false}>
        <div className="spinner" />
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout showNav={false}>
        <div className="alert alert-error">{error || 'Not found'}</div>
        <Link to="/scan" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>
          Try again
        </Link>
      </AppLayout>
    );
  }

  const { product, score, alternatives } = data;
  const n = product.nutriments ?? {};
  const why = score.whyThisScore ?? {};
  const contrib = score.nutrientContributions ?? {};

  return (
    <AppLayout showNav={false}>
      <Link to="/scan" className="btn btn-ghost">
        ← Scan another
      </Link>

      <div className="card" style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ maxHeight: 120, objectFit: 'contain', marginBottom: '0.75rem' }}
          />
        )}
        <h1 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem' }}>{product.name}</h1>
        {product.brand && (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.brand}</p>
        )}
        <p style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--primary-dark)' }}>
          {score.scoreHeadline ?? `${score.overallScore}/100 for your goals`}
        </p>
        <ScoreCircle score={score.overallScore} label="Your personalized score" />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Based on your nutrition goals and optional ingredient preferences
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Why this score?</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          Your number reflects nutrition macros from your goals plus any ingredient preferences you turned on.
          This is preference-based support, not medical advice.
        </p>
      </div>

      <div className="card">
        <DriverList
          title="Positive score drivers"
          items={why.positiveDrivers}
          variant="good"
        />
      </div>

      <div className="card">
        <DriverList
          title="Negative score drivers"
          items={why.negativeDrivers}
          variant="warn"
        />
      </div>

      {score.compatibility?.conflicts?.length > 0 && (
        <div className="card" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
          <h3 style={{ marginTop: 0 }}>Compatibility notes</h3>
          {score.compatibility.warnings?.map((w, i) => (
            <p key={`w-${i}`} style={{ fontSize: '0.85rem', color: '#991b1b' }}>{w}</p>
          ))}
          {score.compatibility.conflicts.map((c, i) => (
            <p key={`c-${i}`} style={{ margin: '0.35rem 0', lineHeight: 1.45 }}>⚠ {c.message}</p>
          ))}
        </div>
      )}

      {why.ingredientDrivers?.length > 0 && (
        <div className="card">
          <DriverList
            title="Ingredient-based drivers"
            items={why.ingredientDrivers}
            variant="warn"
          />
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Score breakdown</h3>
        <ContributionRow item={contrib.protein} />
        <ContributionRow item={contrib.calories} />
        <ContributionRow item={contrib.fiber} />
        <ContributionRow item={contrib.sugar} />
        <ContributionRow item={contrib.sodium} />
        <ContributionRow item={contrib.saturatedFat} />
        <ContributionRow item={contrib.ingredientQuality} />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Goals breakdown</h3>
        {score.breakdown.map((b) => (
          <div key={b.goalKey} style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>{b.label}</span>
              <strong style={{ color: scoreColor(b.subscore) }}>{b.subscore}</strong>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${b.subscore}%` }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Weight: {b.weight}/10
            </div>
          </div>
        ))}
      </div>

      {product.ingredientsText && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ingredients</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
            {product.ingredientsText}
          </p>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Nutrition (per 100g)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
          {[
            ['Calories', n.energyKcal, 'kcal'],
            ['Protein', n.protein, 'g'],
            ['Sugar', n.sugar, 'g'],
            ['Fiber', n.fiber, 'g'],
            ['Sodium', n.sodium, 'mg'],
            ['Sat. fat', n.saturatedFat, 'g'],
          ].map(([label, val, unit]) => (
            <div key={label}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{label}</div>
              <strong>{val != null ? `${Math.round(val * 10) / 10} ${unit}` : '—'}</strong>
            </div>
          ))}
        </div>
      </div>

      {alternatives?.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Alternatives to consider</h3>
          {alternatives.map((alt) => (
            <Link
              key={alt.barcode}
              to={`/product/${alt.barcode}`}
              className="product-row"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {alt.imageUrl ? (
                <img src={alt.imageUrl} alt="" />
              ) : (
                <div style={{ width: 52, height: 52, background: '#f1f5f9', borderRadius: 8 }} />
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem' }}>{alt.name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{alt.brand}</div>
              </div>
              <span style={{ fontWeight: 700, color: scoreColor(alt.previewScore ?? 50) }}>
                {alt.previewScore ?? '—'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
