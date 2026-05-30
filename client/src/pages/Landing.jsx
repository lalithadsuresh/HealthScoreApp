import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="spinner" />
      </div>
    );
  }

  if (user?.onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (user) return <Navigate to="/onboarding" replace />;

  return (
    <div className="app-shell">
      <div className="hero-gradient">
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85 }}>Personalized nutrition</p>
        <h1>3Bite</h1>
        <p>Scan food. Score it <em>your</em> way — not everyone else&apos;s.</p>
      </div>
      <div className="page" style={{ paddingTop: 0 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Your goals, your score</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Pick what matters — muscle, sugar, fiber, clean labels — then scan any barcode for a
            0–100 score built around <strong>you</strong>.
          </p>
        </div>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <li>9 nutrition priorities with custom weights</li>
          <li>Barcode scan or product search</li>
          <li>Breakdown, wins, losses & alternatives</li>
        </ul>
        <Link to="/auth" className="btn btn-primary" style={{ textDecoration: 'none', marginTop: '1rem' }}>
          Get started
        </Link>
        <Link
          to="/auth"
          className="btn btn-secondary"
          style={{ textDecoration: 'none', marginTop: '0.75rem' }}
        >
          I have an account
        </Link>
      </div>
    </div>
  );
}
