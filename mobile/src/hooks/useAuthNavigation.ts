import { useEffect } from 'react';
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

/** Redirect signed-in users away from the welcome screen (index only). */
export function useAuthNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    if (loading || isSigningOut()) return;
    if (!isWelcomePath(pathname)) return;

    let target: typeof HOME_ROUTE | typeof ONBOARDING_PRIMARY_ROUTE | null = null;
    if (user?.onboardingComplete) target = HOME_ROUTE;
    else if (user) target = ONBOARDING_PRIMARY_ROUTE;

    if (!target || isSameRoute(pathname, target)) return;

    if (__DEV__) {
      console.log('[useAuthNavigation]', {
        pathname,
        segments: segments.join('/'),
        authLoading: loading,
        hasUser: Boolean(user),
        redirectTarget: target,
      });
    }

    router.replace(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading, pathname, segments.join('/')]);
}

/** Enforce auth only while the tabs navigator is the active stack route. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    if (loading || isSigningOut()) return;
    if (segments[0] !== '(tabs)') return;

    let target: typeof WELCOME_ROUTE | typeof ONBOARDING_PRIMARY_ROUTE | null = null;
    if (!user) target = WELCOME_ROUTE;
    else if (!user.onboardingComplete) target = ONBOARDING_PRIMARY_ROUTE;

    if (!target || isSameRoute(pathname, target)) return;

    if (__DEV__) {
      console.log('[useRequireAuth]', {
        pathname,
        segments: segments.join('/'),
        authLoading: loading,
        hasUser: Boolean(user),
        redirectTarget: target,
      });
    }

    router.replace(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading, pathname, segments.join('/')]);

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
