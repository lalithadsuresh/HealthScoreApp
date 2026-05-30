import { Router } from 'express';
import { GOAL_KEYS } from '../constants/goals.js';
import { INGREDIENT_PREF_KEYS } from '../constants/ingredientPreferences.js';
import { authRequired, loadUser } from '../middleware/auth.js';

const router = Router();

router.patch('/profile', authRequired, loadUser, async (req, res) => {
  try {
    const {
      name,
      goalWeights,
      selectedGoals,
      onboardingComplete,
      ingredientPreferences,
      primaryGoal,
      goalFocus,
      goalFocuses,
      goalFocusOther,
      personalPriorities,
      allergiesRestrictions,
    } = req.body;
    const user = req.user;

    if (name?.trim()) user.name = name.trim();

    if (selectedGoals) {
      user.selectedGoals = selectedGoals.filter((g) => GOAL_KEYS.includes(g));
    }

    if (goalWeights) {
      for (const key of GOAL_KEYS) {
        if (goalWeights[key] != null) {
          user.goalWeights[key] = Math.max(0, Math.min(10, Number(goalWeights[key]) || 0));
        }
      }
      user.markModified('goalWeights');
    }

    if (ingredientPreferences) {
      for (const key of INGREDIENT_PREF_KEYS) {
        if (ingredientPreferences[key] != null) {
          user.ingredientPreferences[key] = Boolean(ingredientPreferences[key]);
        }
      }
      user.markModified('ingredientPreferences');
    }

    if (primaryGoal != null) user.primaryGoal = primaryGoal;
    if (goalFocuses != null) {
      user.goalFocuses = Array.isArray(goalFocuses) ? goalFocuses.filter(Boolean) : [];
      user.goalFocus = user.goalFocuses[0] ?? null;
    } else if (goalFocus != null) {
      user.goalFocus = goalFocus;
      user.goalFocuses = [goalFocus];
    }
    if (goalFocusOther != null) user.goalFocusOther = String(goalFocusOther).slice(0, 120);
    if (personalPriorities) user.personalPriorities = personalPriorities;
    if (allergiesRestrictions) user.allergiesRestrictions = allergiesRestrictions;

    if (onboardingComplete != null) {
      user.onboardingComplete = Boolean(onboardingComplete);
    }

    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.delete('/account', authRequired, loadUser, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.json({ ok: true, message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
