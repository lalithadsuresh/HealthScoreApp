import type { Href } from 'expo-router';

/** Unauthenticated landing — `app/index.tsx` */
export const WELCOME_ROUTE = '/' satisfies Href;

/** Authenticated home tab */
export const HOME_ROUTE = '/(tabs)/index' satisfies Href;

export const ONBOARDING_PRIMARY_ROUTE = '/(onboarding)/primary' satisfies Href;

export const SIGNED_OUT_ROUTE = '/signed-out' satisfies Href;

export function normalizePath(pathname: string): string {
  const trimmed = (pathname || '/').split('?')[0];
  if (trimmed === '/' || trimmed === '') return '/';
  return trimmed.endsWith('/') && trimmed.length > 1 ? trimmed.slice(0, -1) : trimmed;
}

export function isWelcomePath(pathname: string): boolean {
  const p = normalizePath(pathname);
  return p === '/' || p === '/index';
}

export function isSameRoute(pathname: string, target: string): boolean {
  return normalizePath(pathname) === normalizePath(target);
}
