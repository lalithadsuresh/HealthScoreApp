import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';

/** Imperative redirects — avoids <Redirect /> re-render loops in nested layouts. */
export function useAuthNavigation() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user?.onboardingComplete) {
      router.replace('/(tabs)');
    } else if (user) {
      router.replace('/(onboarding)/primary');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading]);
}

/** Call from protected layouts (e.g. tabs). Sends unauthenticated users to welcome. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const didRedirectRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    const onSignedOut = segments[0] === 'signed-out';
    if (onSignedOut) return;

    if (!user) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        router.replace('/');
      }
      return;
    }

    didRedirectRef.current = false;

    if (!user.onboardingComplete) {
      router.replace('/(onboarding)/primary');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [user, loading, segments.join('/')]);

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
