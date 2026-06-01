import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import {
  ALLERGY_RESTRICTION_KEYS,
  ALLERGY_RESTRICTION_LABELS,
  GOAL_FOCUS_OPTIONS,
  PERSONAL_PRIORITIES,
  PERSONAL_PRIORITY_LABELS,
  PRIMARY_GOAL_LABELS,
  PRIMARY_GOALS,
} from '../constants/onboarding.js';
import {
  INGREDIENT_PREF_KEYS,
  INGREDIENT_PREF_META,
  INGREDIENT_PREF_NOTE,
} from '../constants/ingredientPreferences.js';
import AppLayout from '../components/AppLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function toggleInList(list, setList, id, max = 20) {
  setList((prev) => {
    if (prev.includes(id)) return prev.filter((x) => x !== id);
    if (prev.length >= max) return prev;
    return [...prev, id];
  });
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [goalFocuses, setGoalFocuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [ingredientPrefs, setIngredientPrefs] = useState({});

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setPrimaryGoal(user.primaryGoal ?? '');
    setGoalFocuses(
      user.goalFocuses?.length
        ? [...user.goalFocuses]
        : user.goalFocus
          ? [user.goalFocus]
          : []
    );
    setPriorities(user.personalPriorities ?? []);
    setIngredientPrefs(
      Object.fromEntries(
        INGREDIENT_PREF_KEYS.map((k) => [k, Boolean(user.ingredientPreferences?.[k])])
      )
    );
  }, [user]);

  const focusOptions = useMemo(() => {
    if (!primaryGoal) return [];
    return (GOAL_FOCUS_OPTIONS[primaryGoal] ?? []).filter((o) => o.id !== 'other');
  }, [primaryGoal]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const { user: u } = await api.updateProfile({
        name: name.trim(),
        primaryGoal: primaryGoal || null,
        goalFocuses,
        goalFocus: goalFocuses[0] ?? null,
        personalPriorities: priorities,
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

  const handleLogout = async () => {
    setAuthBusy(true);
    setError('');
    try {
      await logout();
      navigate('/auth', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not log out');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return;
    setAuthBusy(true);
    setError('');
    try {
      await api.deleteAccount();
      await logout();
      navigate('/auth', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not delete account');
    } finally {
      setAuthBusy(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">{user.email}</p>
      <p className="page-sub" style={{ marginTop: 0 }}>
        Your saved personalization from onboarding — edit anytime.
      </p>

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

      <h3>Primary goal</h3>
      {PRIMARY_GOALS.map((id) => (
        <button
          key={id}
          type="button"
          className={`goal-chip ${primaryGoal === id ? 'selected' : ''}`}
          style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => {
            setPrimaryGoal(id);
            setGoalFocuses([]);
          }}
        >
          <strong>{PRIMARY_GOAL_LABELS[id]}</strong>
        </button>
      ))}

      {primaryGoal && focusOptions.length > 0 && (
        <>
          <h3>Goal focus</h3>
          <p className="page-sub" style={{ marginTop: 0 }}>
            Select up to 4 ({goalFocuses.length}/4)
          </p>
          {focusOptions.map((opt) => (
            <label key={opt.id} className={`goal-chip ${goalFocuses.includes(opt.id) ? 'selected' : ''}`}>
              <input
                type="checkbox"
                checked={goalFocuses.includes(opt.id)}
                onChange={() => toggleInList(goalFocuses, setGoalFocuses, opt.id, 4)}
              />
              <div>
                <strong>{opt.label}</strong>
                {opt.description && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{opt.description}</div>
                )}
              </div>
            </label>
          ))}
        </>
      )}

      <h3>Personal priorities</h3>
      {PERSONAL_PRIORITIES.map((id) => (
        <label key={id} className={`goal-chip ${priorities.includes(id) ? 'selected' : ''}`}>
          <input
            type="checkbox"
            checked={priorities.includes(id)}
            onChange={() => toggleInList(priorities, setPriorities, id, 6)}
          />
          <strong>{PERSONAL_PRIORITY_LABELS[id]}</strong>
        </label>
      ))}

      <h3>Ingredient preferences</h3>
      <p className="page-sub" style={{ marginTop: 0 }}>
        {INGREDIENT_PREF_NOTE}
      </p>
      {INGREDIENT_PREF_KEYS.map((key) => {
        const meta = INGREDIENT_PREF_META[key];
        const on = ingredientPrefs[key];
        return (
          <label key={key} className={`goal-chip ${on ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={on}
              onChange={() => setIngredientPrefs((p) => ({ ...p, [key]: !p[key] }))}
            />
            <div>
              <strong>{meta.label}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{meta.hint}</div>
            </div>
          </label>
        );
      })}


      <button type="button" className="btn btn-primary" disabled={busy || authBusy} onClick={save}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>

      <button
        type="button"
        className="btn btn-secondary"
        style={{ marginTop: '0.75rem' }}
        disabled={authBusy}
        onClick={handleLogout}
      >
        {authBusy ? 'Signing out…' : 'Log out'}
      </button>

      <button
        type="button"
        className="btn btn-ghost"
        style={{ marginTop: '0.5rem', color: '#b91c1c' }}
        disabled={authBusy}
        onClick={handleDeleteAccount}
      >
        Delete account
      </button>
    </AppLayout>
  );
}
