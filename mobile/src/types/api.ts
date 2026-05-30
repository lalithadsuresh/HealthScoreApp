import type { GoalKey } from '../constants/goals';

export type GoalWeights = Record<GoalKey, number>;

export interface User {
  id: string;
  name: string;
  email: string;
  goalWeights: GoalWeights;
  selectedGoals: GoalKey[];
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

export interface ProductScore {
  overallScore: number;
  breakdown: ScoreBreakdownItem[];
  whyScoredWell: { text: string; goal: string }[];
  whyLostPoints: { text: string; goal: string }[];
}

export interface SearchResult {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string | null;
  nutriments?: Nutriments;
  previewScore?: number;
}
