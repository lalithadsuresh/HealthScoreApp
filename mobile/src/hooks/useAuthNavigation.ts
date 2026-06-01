import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
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
    // Intentionally omit `router` from deps — router object may be unstable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);
}

/** Call from protected layouts (e.g. tabs). Sends unauthenticated users to welcome. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const prevUserRef = useRef(user);

  useEffect(() => {
    if (loading) {
      prevUserRef.current = user;
      return;
    }

    const prevUser = prevUserRef.current;

    // If we transitioned from authenticated -> unauthenticated, send to welcome.
    if (!user && prevUser) {
      router.replace('/');
      prevUserRef.current = user;
      return;
    }

    // If now authenticated but onboarding incomplete, send to onboarding.
    if (user && !user.onboardingComplete) {
      router.replace('/(onboarding)/primary');
    }

    prevUserRef.current = user;
    // Intentionally omit `router` from deps — router object may be unstable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
