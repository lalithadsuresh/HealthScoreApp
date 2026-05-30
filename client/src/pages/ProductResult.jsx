import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import ScoreCircle, { scoreColor } from '../components/ScoreCircle.jsx';

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
        <ScoreCircle score={score.overallScore} label="Your 3Bite score" />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Personalized — not a universal health grade
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Category breakdown</h3>
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

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Why it scored well</h3>
        {score.whyScoredWell?.length ? (
          score.whyScoredWell.map((w, i) => (
            <p key={i} style={{ margin: '0.35rem 0' }}>
              <span className="tag tag-good">+</span> {w.text}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> ({w.goal})</span>
            </p>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No strong wins for your current weights.</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Where it lost points</h3>
        {score.whyLostPoints?.length ? (
          score.whyLostPoints.map((w, i) => (
            <p key={i} style={{ margin: '0.35rem 0' }}>
              <span className="tag tag-warn">−</span> {w.text}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> ({w.goal})</span>
            </p>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>Nothing major flagged for your goals.</p>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Nutrition (per 100g)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
          {[
            ['Calories', n.energyKcal, 'kcal'],
            ['Protein', n.protein, 'g'],
            ['Sugar', n.sugar, 'g'],
            ['Fiber', n.fiber, 'g'],
            ['Sodium', n.sodium, 'mg'],
            ['Fat', n.fat, 'g'],
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
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0 }}>
            Similar products with estimated scores for your profile
          </p>
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
              <span
                style={{
                  fontWeight: 700,
                  color: scoreColor(alt.previewScore ?? 50),
                }}
              >
                {alt.previewScore ?? '—'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
