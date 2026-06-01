import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiUrl } from '../api/client.js';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'login') {
      console.log('[3Bite] login started (AuthPage)');
      console.log('[3Bite] API URL being called:', getApiUrl('/auth/login'));
    }

    try {
      if (mode === 'signup') {
        await signup(name, email, password);
        navigate('/onboarding');
      } else {
        const u = await login(email, password);
        console.log('[3Bite] response received (AuthPage)');
        navigate(u.onboardingComplete ? '/dashboard' : '/onboarding');
      }
    } catch (err) {
      console.log('[3Bite] error caught (AuthPage)', err);
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message || 'Something went wrong');
    } finally {
      console.log('[3Bite] finally reached (AuthPage)');
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page">
        <Link to="/" className="btn btn-ghost" style={{ marginLeft: '-0.5rem' }}>
          ← Back
        </Link>
        <h1 className="page-title">{mode === 'signup' ? 'Create account' : 'Welcome back'}</h1>
        <p className="page-sub">
          {mode === 'signup'
            ? 'Start building your personalized food profile.'
            : 'Sign in to continue scanning.'}
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="card">
          {mode === 'signup' && (
            <>
              <label className="label">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                required
              />
            </>
          )}
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6+ characters"
            minLength={6}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: '100%' }}
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Already have an account? Log in' : 'New here? Create account'}
        </button>
      </div>
    </div>
  );
}
