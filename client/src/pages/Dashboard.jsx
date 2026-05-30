import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { GOAL_META } from '../constants/goals.js';

export default function Dashboard() {
  const { user } = useAuth();
  const topGoals = (user?.selectedGoals ?? [])
    .slice(0, 4)
    .map((k) => GOAL_META[k])
    .filter(Boolean);

  return (
    <AppLayout>
      <h1 className="page-title">Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
      <p className="page-sub">Your nutrition lens is tuned. Scan something to see your score.</p>

      <Link to="/scan" className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
        <strong style={{ fontSize: '1.1rem' }}>Scan or search a product</strong>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Barcode camera, manual code, or name search
        </p>
      </Link>

      <div className="card">
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Your active priorities</h3>
        {topGoals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            <Link to="/profile">Update your goals</Link>
          </p>
        ) : (
          topGoals.map((g) => (
            <span key={g.label} className="tag">
              {g.emoji} {g.label}
            </span>
          ))
        )}
        {(user?.selectedGoals?.length ?? 0) > 4 && (
          <span className="tag">+{user.selectedGoals.length - 4} more</span>
        )}
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #ecfdf5, #fff)' }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>How scoring works</h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Every product gets a <strong>personal</strong> 0–100 score — weighted by your sliders, not a
          one-size-fits-all health grade.
        </p>
      </div>
    </AppLayout>
  );
}
