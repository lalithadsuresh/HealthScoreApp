import type { GoalKey } from '../constants/goals';

export type GoalWeights = Record<GoalKey, number>;

export type IngredientPreferences = Record<string, boolean>;

export interface User {
  id: string;
  name: string;
  email: string;
  goalWeights: GoalWeights;
  selectedGoals: GoalKey[];
  primaryGoal?: string | null;
  goalFocus?: string | null;
  goalFocuses?: string[];
  goalFocusOther?: string;
  personalPriorities?: string[];
  allergiesRestrictions?: string[];
  ingredientPreferences?: IngredientPreferences;
  onboardingComplete: boolean;
  createdAt?: string;
}

export interface Nutriments {
  energyKcal?: number | null;
  protein?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  carbs?: number | null;
  sugar?: number | null;
  fiber?: number | null;
  sodium?: number | null;
}

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  quantity?: string;
  nutriments: Nutriments;
  novaGroup?: number | null;
  additivesCount?: number;
  ingredientsText?: string;
  additivesTags?: string[];
  nutriScore?: string | null;
}

export interface ScoreBreakdownItem {
  goalKey: GoalKey;
  label: string;
  weight: number;
  subscore: number;
  positives: string[];
  negatives: string[];
}

export interface ScoreDriver {
  text: string;
  category?: string;
  source?: string;
  preferenceKey?: string;
  impact?: string;
}

export interface NutrientContribution {
  key: string;
  label: string;
  score: number | null;
  impact: 'positive' | 'negative' | 'neutral';
  summary: string;
  detail?: string;
}


export interface VisualDriver {
  icon: string;
  label: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface ScoreSummary {
  score: number;
  primaryGoalLabel: string;
  focusLabels: string[];
  focusLine: string;
  primaryGoal?: string;
}

export interface VisualDrivers {
  positive: VisualDriver[];
  negative: VisualDriver[];
}

export interface ProductScore {
  overallScore: number;
  breakdown: ScoreBreakdownItem[];
  whyScoredWell: { text: string; goal: string }[];
  whyLostPoints: { text: string; goal: string }[];
  whyThisScore?: {
    positiveDrivers: ScoreDriver[];
    negativeDrivers: ScoreDriver[];
    ingredientDrivers: ScoreDriver[];
  };
  nutrientContributions?: Record<string, NutrientContribution>;
  ingredientMatches?: {
    preferenceKey: string;
    label: string;
    detected: string[];
    matched: boolean;
    positive?: boolean;
  }[];
  ingredientPreferenceScore?: number | null;
  goalDisplayName?: string;
  scoreHeadline?: string;
  scoreSummary?: ScoreSummary;
  visualDrivers?: VisualDrivers;
  compatibility?: {
    conflicts: { message: string; label: string; detected?: string }[];
    warnings: string[];
  };
}

export interface SearchResult {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  nutriments?: Nutriments;
  previewScore?: number;
}
