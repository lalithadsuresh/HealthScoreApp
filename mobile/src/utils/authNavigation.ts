import { router } from 'expo-router';

/** Clear session and return to welcome. Navigation only here — layouts must not <Redirect />. */
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
