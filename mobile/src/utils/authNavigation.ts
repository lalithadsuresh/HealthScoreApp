import { router } from 'expo-router';

export type SignOutMode = 'logout' | 'delete';

/** Leave protected routes first, then clear session — avoids tabs loading flash / stuck stack. */
export async function navigateAfterSignOut(
  logout: () => Promise<void>,
  mode: SignOutMode = 'logout'
) {
  router.replace({ pathname: '/signed-out', params: { mode } });
  await logout();
  // Avoid calling `dismissAll` which can destabilize navigator state during
  // logout. Replace navigation after a short tick so the navigation tree can
  // settle — this prevents "route named 'index' not found" errors.
  try {
    setTimeout(() => {
      try {
        router.replace('/');
      } catch {
        /* ignore navigation errors in dev */
      }
    }, 50);
  } catch {
    /* ignore */
  }
}
