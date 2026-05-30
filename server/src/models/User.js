import mongoose from 'mongoose';
import { DEFAULT_GOAL_WEIGHTS, GOAL_KEYS } from '../constants/goals.js';
import {
  DEFAULT_INGREDIENT_PREFERENCES,
  INGREDIENT_PREF_KEYS,
} from '../constants/ingredientPreferences.js';

const goalWeightsSchema = new mongoose.Schema(
  Object.fromEntries(GOAL_KEYS.map((key) => [key, { type: Number, default: 0, min: 0, max: 10 }])),
  { _id: false }
);

const ingredientPrefsSchema = new mongoose.Schema(
  Object.fromEntries(INGREDIENT_PREF_KEYS.map((key) => [key, { type: Boolean, default: false }])),
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    goalWeights: { type: goalWeightsSchema, default: () => ({ ...DEFAULT_GOAL_WEIGHTS }) },
    selectedGoals: { type: [String], default: [] },
    ingredientPreferences: {
      type: ingredientPrefsSchema,
      default: () => ({ ...DEFAULT_INGREDIENT_PREFERENCES }),
    },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    goalWeights: this.goalWeights,
    selectedGoals: this.selectedGoals,
    onboardingComplete: this.onboardingComplete,
    ingredientPreferences: this.ingredientPreferences,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
