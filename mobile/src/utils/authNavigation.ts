import { router } from 'expo-router';
import type { SignedOutParams } from '../types/router';
import { beginSignOut, endSignOut } from './signOutGuard';

export type SignOutMode = 'logout' | 'delete';

/** Reset stack, show signed-out screen, then clear session. */
export async function navigateAfterSignOut(
  logout: () => Promise<void>,
  mode: SignOutMode = 'logout'
) {
  beginSignOut();
  try {
    // Avoid dismissAll() — it can destabilize navigator state.
    // Replace directly to signed-out screen.
    router.replace({ pathname: '/signed-out', params: { mode } satisfies SignedOutParams });
    await logout();
  } finally {
    endSignOut();
  }
}
