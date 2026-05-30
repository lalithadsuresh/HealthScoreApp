import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { GOAL_KEYS, GOAL_META } from '../constants/goals.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(user?.selectedGoals?.length ? [...user.selectedGoals] : []);
  const [weights, setWeights] = useState(() => {
    const w = {};
    for (const k of GOAL_KEYS) w[k] = user?.goalWeights?.[k] ?? 5;
    return w;
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleGoal = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const finish = async () => {
    if (selected.length === 0) {
      setError('Select at least one nutrition goal');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const activeWeights = { ...weights };
      for (const k of GOAL_KEYS) {
        if (!selected.includes(k)) activeWeights[k] = 0;
      }
      const { user: u } = await api.updateProfile({
        selectedGoals: selected,
        goalWeights: activeWeights,
        onboardingComplete: true,
      });
      updateUser(u);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page">
        <p className="page-sub" style={{ marginBottom: '0.5rem' }}>
          Step {step} of 2
        </p>
        {step === 1 ? (
          <>
            <h1 className="page-title">What matters to you?</h1>
            <p className="page-sub">Choose your nutrition priorities. You can change these anytime.</p>
            {error && <div className="alert alert-error">{error}</div>}
            {GOAL_KEYS.map((key) => {
              const meta = GOAL_META[key];
              const isOn = selected.includes(key);
              return (
                <label
                  key={key}
                  className={`goal-chip ${isOn ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isOn}
                    onChange={() => toggleGoal(key)}
                  />
                  <div>
                    <strong>
                      {meta.emoji} {meta.label}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{meta.hint}</div>
                  </div>
                </label>
              );
            })}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (selected.length === 0) {
                  setError('Select at least one goal');
                  return;
                }
                setError('');
                setStep(2);
              }}
            >
              Next: set importance
            </button>
          </>
        ) : (
          <>
            <h1 className="page-title">How important is each?</h1>
            <p className="page-sub">Slide from 0 (ignore) to 10 (essential) for your personalized score.</p>
            {error && <div className="alert alert-error">{error}</div>}
            {selected.map((key) => (
              <div key={key} className="slider-row card" style={{ padding: '1rem' }}>
                <label>
                  <span>
                    {GOAL_META[key].emoji} {GOAL_META[key].label}
                  </span>
                  <strong>{weights[key]}</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={weights[key]}
                  onChange={(e) =>
                    setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
              disabled={busy}
              onClick={finish}
            >
              {busy ? 'Saving…' : 'Start scanning'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
