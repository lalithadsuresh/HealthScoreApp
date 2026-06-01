import { router } from 'expo-router';

export type SignOutMode = 'logout' | 'delete';

/** Leave protected routes first, then clear session — avoids tabs loading flash / stuck stack. */
export async function navigateAfterSignOut(
  logout: () => Promise<void>,
  mode: SignOutMode = 'logout'
) {
  router.replace({ pathname: '/signed-out', params: { mode } });
  await logout();
}
