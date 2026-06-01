import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { HOME_ROUTE, ONBOARDING_PRIMARY_ROUTE, WELCOME_ROUTE } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { isSigningOut } from '../utils/signOutGuard';

function isWelcomeRoute(segments: string[]) {
  const root = segments[0];
  return !root || root === 'index' || root === '(welcome)';
}

/** Imperative redirects — avoids <Redirect /> re-render loops in nested layouts. */
export function useAuthNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || isSigningOut()) return;
    if (!isWelcomeRoute(segments)) return;

    if (user?.onboardingComplete) {
      router.replace(HOME_ROUTE);
    } else if (user) {
      router.replace(ONBOARDING_PRIMARY_ROUTE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading, segments.join('/')]);
}

/** Call from protected layouts (e.g. tabs). Sends unauthenticated users to welcome. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading || isSigningOut()) return;

    const root = segments[0];
    if (root === 'signed-out') return;

    if (!user) {
      router.replace(WELCOME_ROUTE);
      return;
    }

    if (!user.onboardingComplete) {
      router.replace(ONBOARDING_PRIMARY_ROUTE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading, segments.join('/')]);

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
