import { useEffect } from 'react';
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
  }, [user, loading, router]);
}

/** Call from protected layouts (e.g. tabs). Sends unauthenticated users to welcome. */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    if (!user.onboardingComplete) {
      router.replace('/(onboarding)/primary');
    }
  }, [user, loading, router]);

  const blocked = loading || !user || !user.onboardingComplete;
  return { user, loading, blocked };
}
