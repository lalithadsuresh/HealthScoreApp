import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import AppLayout from '../components/AppLayout.jsx';
import ScoreCircle, { scoreColor } from '../components/ScoreCircle.jsx';
import { DriverChips, ScoreSummaryCard } from '../components/ScoreBreakdown.jsx';
import NutritionFacts from '../components/NutritionFacts.jsx';
import ScoringBasisBadge from '../components/ScoringBasisBadge.jsx';

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
        if (!cancelled) {
          setData(res);
          if (res?.score?.nutrientDebug) {
            console.info('[3bite] nutrient debug', res.score.nutrientDebug);
            console.info('[3bite] scoring basis', res.product?.nutritionBasis, res.score?.scoringBasisLabel);
          }
        }
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
  const summary = score.scoreSummary;
  const drivers = score.visualDrivers ?? { positive: [], negative: [] };
  const showScore = score.confidentScore !== false && score.overallScore != null;
  const dataWarning = score.dataWarning;

  return (
    <AppLayout showNav={false}>
      <Link to="/scan" className="btn btn-ghost">
        ← Scan another
      </Link>

      <div className="card" style={{ textAlign: 'center', paddingTop: '1rem' }}>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ maxHeight: 100, objectFit: 'contain', marginBottom: '0.5rem' }}
          />
        )}
        <h1 style={{ fontSize: '1.15rem', margin: '0 0 0.25rem' }}>{product.name}</h1>
        {product.confidence && (
          <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Data confidence: {product.confidence}
            {product.isUsSold ? ' · U.S.' : ''}
          </p>
        )}
        <ScoringBasisBadge
          label={score.scoringBasisLabel ?? product.scoringBasisLabel}
          basis={product.nutritionBasis ?? score.nutritionBasis}
        />
        {product.brand && (
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{product.brand}</p>
        )}
        {showScore ? (
          <ScoreCircle score={score.overallScore} label="Your score" />
        ) : (
          <p style={{ margin: '1rem 0', color: 'var(--text-muted)', fontWeight: 600 }}>
            Personalized score unavailable
          </p>
        )}
      </div>

      {(dataWarning || score.nutritionBasisWarning) && (
        <div className="card" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
          {score.nutritionBasisWarning && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#92400e' }}>
              {score.nutritionBasisWarning}
            </p>
          )}
          {dataWarning && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>{dataWarning}</p>
          )}
        </div>
      )}

      {showScore && <ScoreSummaryCard summary={summary} score={score.overallScore} />}

      {showScore && (
        <>
          <DriverChips title="Positive Drivers" drivers={drivers.positive} variant="positive" />
          <DriverChips title="Negative Drivers" drivers={drivers.negative} variant="negative" />
        </>
      )}

      {product.ingredientsText && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Ingredients</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
            {product.ingredientsText}
          </p>
        </div>
      )}

      <NutritionFacts product={product} score={score} />

      {alternatives?.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Alternatives</h3>
          {alternatives.map((alt) => (
            <Link
              key={alt.barcode}
              to={`/product/${alt.barcode}`}
              className="product-row"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.9rem' }}>{alt.name}</strong>
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
