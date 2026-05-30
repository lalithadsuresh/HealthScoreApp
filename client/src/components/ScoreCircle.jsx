export function scoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export default function ScoreCircle({ score, label = 'Your score' }) {
  const color = scoreColor(score);
  return (
    <div
      className="score-circle"
      style={{
        '--score-pct': score,
        '--score-color': color,
      }}
    >
      <div className="score-circle-inner">
        <div className="score-circle-value">{score}</div>
        <div className="score-circle-label">{label}</div>
      </div>
    </div>
  );
}
