import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import {
  HOME_ROUTE,
  ONBOARDING_PRIMARY_ROUTE,
  WELCOME_ROUTE,
  isSameRoute,
  isWelcomePath,
} from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { isSigningOut } from '../utils/signOutGuard';

function logNav(scope: string, payload: Record<string, unknown>) {
  if (__DEV__) console.log(`[${scope}]`, payload);
}

/** Redirect signed-in users away from `/` — runs only while the index screen is focused. */
export function useAuthNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const pendingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      pendingRef.current = false;

      if (loading || isSigningOut()) return;
      if (!isWelcomePath(pathname)) return;

      let target: typeof HOME_ROUTE | typeof ONBOARDING_PRIMARY_ROUTE | null = null;
      if (user?.onboardingComplete) target = HOME_ROUTE;
      else if (user) target = ONBOARDING_PRIMARY_ROUTE;

      if (!target || isSameRoute(pathname, target) || pendingRef.current) return;

      pendingRef.current = true;
      logNav('useAuthNavigation', {
        pathname,
        segments: segments.join('/'),
        authLoading: loading,
        hasUser: Boolean(user),
        redirectTarget: target,
      });
      router.replace(target);
    }, [user, loading, pathname, segments, router])
  );
}

/** Enforce auth only while the tabs navigator is focused. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const pendingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      pendingRef.current = false;

      if (loading || isSigningOut()) return;
      if (segments[0] !== '(tabs)') return;

      let target: typeof WELCOME_ROUTE | typeof ONBOARDING_PRIMARY_ROUTE | null = null;
      if (!user) target = WELCOME_ROUTE;
      else if (!user.onboardingComplete) target = ONBOARDING_PRIMARY_ROUTE;

      if (!target || isSameRoute(pathname, target) || pendingRef.current) return;

      pendingRef.current = true;
      logNav('useRequireAuth', {
        pathname,
        segments: segments.join('/'),
        authLoading: loading,
        hasUser: Boolean(user),
        redirectTarget: target,
      });
      router.replace(target);
    }, [user, loading, pathname, segments, router])
  );

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
