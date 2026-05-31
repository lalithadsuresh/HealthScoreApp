export default function ScoringBasisBadge({ label, basis }) {
  if (!label && !basis) return null;
  const text =
    label ??
    (basis === 'serving' ? 'Scored using: Per Serving' : 'Scored using: Per 100g (fallback)');
  const isServing = basis === 'serving' || text.includes('Per Serving');

  return (
    <div
      style={{
        display: 'inline-block',
        margin: '0.5rem 0',
        padding: '0.35rem 0.65rem',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 600,
        background: isServing ? '#ecfdf5' : '#fffbeb',
        color: isServing ? '#166534' : '#92400e',
        border: `1px solid ${isServing ? '#a7f3d0' : '#fde68a'}`,
      }}
    >
      {text}
    </div>
  );
}
