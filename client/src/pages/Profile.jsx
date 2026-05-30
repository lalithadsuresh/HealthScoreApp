import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { GOAL_KEYS, GOAL_META } from '../constants/goals.js';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
} from '../constants/ingredientPreferences.js';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [selected, setSelected] = useState(user?.selectedGoals ?? []);
  const [weights, setWeights] = useState(() => {
    const w = {};
    for (const k of GOAL_KEYS) w[k] = user?.goalWeights?.[k] ?? 0;
    return w;
  });
  const [ingredientPrefs, setIngredientPrefs] = useState(() => {
    const p = Object.fromEntries(INGREDIENT_PREF_KEYS.map((k) => [k, false]));
    if (user?.ingredientPreferences) {
      for (const k of INGREDIENT_PREF_KEYS) p[k] = Boolean(user.ingredientPreferences[k]);
    }
    return p;
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleGoal = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const togglePref = (key) => {
    setIngredientPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const save = async () => {
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const activeWeights = { ...weights };
      for (const k of GOAL_KEYS) {
        if (!selected.includes(k)) activeWeights[k] = 0;
      }
      const { user: u } = await api.updateProfile({
        name,
        selectedGoals: selected,
        goalWeights: activeWeights,
        ingredientPreferences: ingredientPrefs,
      });
      updateUser(u);
      setMsg('Profile saved');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppLayout>
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">{user?.email}</p>

      {msg && (
        <div className="alert" style={{ background: '#dcfce7', color: '#15803d' }}>
          {msg}
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <label className="label">Display name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <h3>Goals & weights</h3>
      {GOAL_KEYS.map((key) => {
        const on = selected.includes(key);
        return (
          <div key={key} className="card" style={{ padding: '1rem' }}>
            <label className="goal-chip" style={{ margin: 0, border: 'none', padding: 0 }}>
              <input type="checkbox" checked={on} onChange={() => toggleGoal(key)} />
              <span>
                {GOAL_META[key].emoji} {GOAL_META[key].label}
              </span>
            </label>
            {on && (
              <div className="slider-row" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                <label>
                  <span>Importance</span>
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
            )}
          </div>
        );
      })}

      <h3>Ingredient preferences</h3>
      <p className="page-sub" style={{ marginTop: 0 }}>
        {INGREDIENT_PREF_NOTE}
      </p>
      {INGREDIENT_PREF_KEYS.map((key) => {
        const meta = INGREDIENT_PREF_META[key];
        const on = ingredientPrefs[key];
        return (
          <label key={key} className={`goal-chip ${on ? 'selected' : ''}`}>
            <input type="checkbox" checked={on} onChange={() => togglePref(key)} />
            <div>
              <strong>{meta.label}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{meta.hint}</div>
            </div>
          </label>
        );
      })}

      <button type="button" className="btn btn-primary" disabled={busy} onClick={save}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
      <button type="button" className="btn btn-secondary" style={{ marginTop: '0.75rem' }} onClick={handleLogout}>
        Log out
      </button>
    </AppLayout>
  );
}
