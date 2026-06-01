import type { Href } from 'expo-router';

/** Unauthenticated landing — `app/(welcome)/index.tsx` */
export const WELCOME_ROUTE = '/(welcome)' satisfies Href;

/** Authenticated home tab */
export const HOME_ROUTE = '/(tabs)/index' satisfies Href;

export const ONBOARDING_PRIMARY_ROUTE = '/(onboarding)/primary' satisfies Href;

export const SIGNED_OUT_ROUTE = '/signed-out' satisfies Href;
