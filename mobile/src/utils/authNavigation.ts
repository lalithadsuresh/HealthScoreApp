import { router } from 'expo-router';

/** Clear session and return to unauthenticated welcome — avoids stacked auth routes freezing UI. */
export async function navigateToWelcomeAfterSignOut(logout: () => Promise<void>) {
  await logout();
  try {
    if (typeof router.dismissAll === 'function') {
      router.dismissAll();
    }
  } catch {
    /* ignore */
  }
  router.replace('/');
}
