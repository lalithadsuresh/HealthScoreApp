import type { Router } from 'expo-router';
import { WELCOME_ROUTE } from '../constants/routes';

/** Reset to the public welcome screen (safe after logout / delete). */
export function navigateToWelcome(router: Pick<Router, 'replace' | 'dismissAll'>) {
  if (typeof router.dismissAll === 'function') {
    router.dismissAll();
  }
  router.replace(WELCOME_ROUTE);
}
