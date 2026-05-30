import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type { Product, ProductScore, SearchResult, User } from '../types/api';

const TOKEN_KEY = '3bite_token';

function getApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3001`;
  }

  return 'http://localhost:3001';
}

export const API_BASE = getApiBase();

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data as { error?: string }).error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  signup: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  me: () => request<{ user: User }>('/auth/me'),
  updateProfile: (body: Partial<{
    name: string;
    goalWeights: Record<string, number>;
    selectedGoals: string[];
    ingredientPreferences: Record<string, boolean>;
    primaryGoal: string;
    goalFocus: string;
    goalFocusOther: string;
    personalPriorities: string[];
    allergiesRestrictions: string[];
    onboardingComplete: boolean;
  }>) =>
    request<{ user: User }>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  deleteAccount: () =>
    request<{ ok: boolean }>('/user/account', { method: 'DELETE' }),
  searchProducts: (q: string) =>
    request<{ results: SearchResult[] }>(`/products/search?q=${encodeURIComponent(q)}`),
  getProduct: (barcode: string) =>
    request<{ product: Product; score: ProductScore; alternatives: SearchResult[] }>(
      `/products/barcode/${encodeURIComponent(barcode)}`
    ),
};
