import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import {
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
import { useAuth } from '../context/AuthContext.jsx';

const STEPS = 5;
const MEDICAL_NOTE =
  'This app is for informational purposes only and is not medical advice. Scores reflect what you told us matters — not a universal “healthy” label.';

function Progress({ step }) {
  return (
    <p className="page-sub" style={{ marginBottom: '0.5rem' }}>
      Step {step} of {STEPS} · Your nutrition story
    </p>
  );
}

function ChoiceList({ options, selected, onSelect, multi = false }) {
  return options.map((opt) => {
    const isOn = multi ? selected.includes(opt.id) : selected === opt.id;
    return (
      <button
        key={opt.id}
        type="button"
        className={`goal-chip ${isOn ? 'selected' : ''}`}
        style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
        onClick={() => onSelect(opt.id)}
      >
        <div>
          <strong>{opt.label}</strong>
          {opt.description && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {opt.description}
            </div>
          )}
        </div>
      </button>
    );
  });
}

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [primaryGoal, setPrimaryGoal] = useState(user?.primaryGoal ?? '');
  const [goalFocuses, setGoalFocuses] = useState(() =>
    user?.goalFocuses?.length
      ? [...user.goalFocuses]
      : user?.goalFocus
        ? [user.goalFocus]
        : []
  );
  
  const [priorities, setPriorities] = useState(user?.personalPriorities ?? []);
  const [ingredientPrefs, setIngredientPrefs] = useState(() =>
    Object.fromEntries(
      INGREDIENT_PREF_KEYS.map((k) => [k, Boolean(user?.ingredientPreferences?.[k])])
    )
  );

  const focusOptions = useMemo(() => {
    if (!primaryGoal) return [];
    return (GOAL_FOCUS_OPTIONS[primaryGoal] ?? []).map((o) => ({
      id: o.id,
      label: o.label,
      description: o.description,
    }));
  }, [primaryGoal]);

  const priorityOptions = useMemo(
    () =>
      PERSONAL_PRIORITIES.map((id) => ({
        id,
        label: PERSONAL_PRIORITY_LABELS[id],
        description: '',
      })),
    []
  );

  const toggleMulti = (list, setList, id, max = 5) => {
    setList((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  };

  const toggleFocus = (id) => {
    setGoalFocuses((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      const { user: u } = await api.updateProfile({
        primaryGoal,
        goalFocuses,
        goalFocus: goalFocuses[0] ?? null,
        personalPriorities: priorities,
        ingredientPreferences: ingredientPrefs,
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
        <Progress step={step} />
        {step === 1 && (
          <>
            <h1 className="page-title">What are you working toward right now?</h1>
            <p className="page-sub">
              3Bite scores food for <em>your</em> definition of what works — not a one-size-fits-all
              health grade.
            </p>
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>{MEDICAL_NOTE}</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <ChoiceList
              options={PRIMARY_GOALS.map((id) => ({
                id,
                label: PRIMARY_GOAL_LABELS[id],
                description:
                  id === 'bulk'
                    ? 'Build mass with calories and protein in mind'
                    : id === 'cut'
                      ? 'Lean out with calorie and macro awareness'
                      : id === 'maintain'
                        ? 'Stay steady without extreme rules'
                        : '',
              }))}
              selected={primaryGoal}
              onSelect={(id) => {
                setPrimaryGoal(id);
                setGoalFocuses([]);
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!primaryGoal}
              onClick={() => {
                setError('');
                setStep(2);
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="page-title">Let&apos;s personalize your {PRIMARY_GOAL_LABELS[primaryGoal]} plan</h1>
            <p className="page-sub">Select all that apply (up to 4). These shape your score breakdown.</p>
            {error && <div className="alert alert-error">{error}</div>}
            <ChoiceList
              options={focusOptions.filter((o) => o.id !== 'other')}
              selected={goalFocuses}
              multi
              onSelect={toggleFocus}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Selected: {goalFocuses.length}/4
            </p>
            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={goalFocuses.length === 0}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="page-title">What matters most when you choose food?</h1>
            <p className="page-sub">Pick up to 5 priorities. These fine-tune your score.</p>
            {error && <div className="alert alert-error">{error}</div>}
            <ChoiceList
              options={priorityOptions}
              selected={priorities}
              multi
              onSelect={(id) => toggleMulti(priorities, setPriorities, id, 5)}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Selected: {priorities.length}/5
            </p>
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={priorities.length === 0}
              onClick={() => setStep(4)}
            >
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="page-title">Ingredients you prefer to limit</h1>
            <p className="page-sub">Optional — only affects your score when toggled on.</p>
            <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#92400e' }}>{INGREDIENT_PREF_NOTE}</p>
            </div>
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
            <button type="button" className="btn btn-secondary" onClick={() => setStep(3)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(5)}>
              Continue
            </button>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="page-title">You&apos;re ready to scan</h1>
            <p className="page-sub">
              We&apos;ll score products for your{' '}
              <strong>
                {PRIMARY_GOAL_LABELS[primaryGoal]}
                {goalFocuses.length
                  ? ` · ${goalFocuses.map((id) => focusOptions.find((f) => f.id === id)?.label).filter(Boolean).join(', ')}`
                  : ''}
              </strong>{' '}
              journey.
            </p>
            <div className="card">
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Priorities:</strong>{' '}
                {priorities.map((p) => PERSONAL_PRIORITY_LABELS[p]).join(', ')}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Ingredient prefs:{' '}
                {INGREDIENT_PREF_KEYS.filter((k) => ingredientPrefs[k]).length
                  ? INGREDIENT_PREF_KEYS.filter((k) => ingredientPrefs[k])
                      .map((k) => INGREDIENT_PREF_META[k].label)
                      .join(', ')
                  : 'None selected'}
              </p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <button type="button" className="btn btn-secondary" onClick={() => setStep(4)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" disabled={busy} onClick={finish}>
              {busy ? 'Saving…' : 'Start scanning'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
