import { Router } from 'express';
import { GOAL_KEYS } from '../constants/goals.js';
import { authRequired, loadUser } from '../middleware/auth.js';

const router = Router();

router.patch('/profile', authRequired, loadUser, async (req, res) => {
  try {
    const { name, goalWeights, selectedGoals, onboardingComplete } = req.body;
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

export default router;
