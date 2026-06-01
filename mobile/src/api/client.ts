import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Product, ProductScore, SearchResult, User } from '../types/api';

const TOKEN_KEY = '3bite_token';
const REQUEST_TIMEOUT_MS = 15000;

function getApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3001`;
    }
    // Android emulator reaches the host machine at 10.0.2.2
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
    // iOS simulator can use localhost; physical iPhone cannot
    if (Platform.OS === 'ios') {
      return 'http://localhost:3001';
    }
  }

  if (Platform.OS !== 'web') {
    console.warn(
      '[3Bite] Set EXPO_PUBLIC_API_URL to your computer LAN IP (e.g. http://192.168.1.10:3001). ' +
        'localhost only works in the iOS simulator, not on a physical phone.'
    );
  }

  return 'http://localhost:3001';
}

export const API_BASE = getApiBase();

if (__DEV__) {
  console.log('[3Bite] API base URL:', API_BASE);
  if (
    Platform.OS !== 'web' &&
    (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1'))
  ) {
    console.warn(
      '[3Bite] API base is localhost — use EXPO_PUBLIC_API_URL with your Mac LAN IP for Expo Go on a physical device.'
    );
  }
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export function getApiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}

function normalizeFetchError(err: unknown): Error {
  if (err instanceof Error && err.name === 'AbortError') {
    return new Error('Could not connect to server.');
  }
  if (err instanceof TypeError) {
    return new Error('Could not connect to server.');
  }
  if (err instanceof Error) return err;
  return new Error('Request failed');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = (data as { error?: string }).error || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data as T;
  } catch (err) {
    throw normalizeFetchError(err);
  } finally {
    clearTimeout(timeoutId);
  }
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
    goalFocus?: string | null;
    goalFocuses?: string[];
    goalFocusOther?: string;
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
  searchProducts: (q: string, signal?: AbortSignal) =>
    request<{ results: SearchResult[] }>(
      `/products/search?q=${encodeURIComponent(q)}`,
      { signal }
    ),
  getProduct: (barcode: string) =>
    request<{ product: Product; score: ProductScore; alternatives: SearchResult[] }>(
      `/products/barcode/${encodeURIComponent(barcode)}`
    ),
};

export { REQUEST_TIMEOUT_MS };
