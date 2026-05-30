import { scoreColor } from './ScoreCircle.jsx';

export function ScoreSummaryCard({ summary, score }) {
  if (!summary) return null;
  const s = score ?? summary.score;
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(s), lineHeight: 1.1 }}>
        Score: {s}/100
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
        <div>
          <strong>Goal:</strong> {summary.primaryGoalLabel}
        </div>
        {summary.focusLine ? (
          <div>
            <strong>Focus:</strong> {summary.focusLine}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DriverChips({ title, drivers, variant }) {
  if (!drivers?.length) return null;
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: '0.75rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {drivers.map((d, i) => (
          <div
            key={`${d.label}-${i}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 12,
              background: variant === 'positive' ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${variant === 'positive' ? '#a7f3d0' : '#fecaca'}`,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {d.icon} {d.label}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: variant === 'positive' ? '#15803d' : '#b91c1c',
              }}
            >
              {variant === 'positive' ? '+' : '−'}
              {d.impact}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
