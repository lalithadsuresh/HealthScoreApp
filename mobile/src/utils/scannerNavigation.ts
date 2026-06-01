import { router } from 'expo-router';

/** Open scanner only via explicit user action (passes intent so cold-start restore does not stick). */
export function openScanner() {
  router.push({ pathname: '/scanner', params: { intent: 'scan' } });
}

/** @deprecated Use openScanner() — scanner should not replace the nav stack after auth. */
export function replaceWithScanner() {
  openScanner();
}

export function isExplicitScannerIntent(intent: string | string[] | undefined) {
  return intent === 'scan' || (Array.isArray(intent) && intent[0] === 'scan');
}
