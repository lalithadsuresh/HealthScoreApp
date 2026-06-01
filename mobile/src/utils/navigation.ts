import type { Router } from 'expo-router';
import { WELCOME_ROUTE, isSameRoute, isWelcomePath } from '../constants/routes';

/** Go to public welcome (`/`). Skips navigation if already there. */
export function navigateToWelcome(
  router: Pick<Router, 'replace'>,
  currentPathname?: string
) {
  if (currentPathname && isWelcomePath(currentPathname)) return;
  router.replace(WELCOME_ROUTE);
}

/** @deprecated alias — prefer navigateToWelcome */
export function replaceToRoot(router: Pick<Router, 'replace'>, currentPathname?: string) {
  navigateToWelcome(router, currentPathname);
}

export function replaceIfNeeded(
  router: Pick<Router, 'replace'>,
  pathname: string,
  target: string
) {
  if (isSameRoute(pathname, target)) return;
  router.replace(target as Parameters<Router['replace']>[0]);
}
