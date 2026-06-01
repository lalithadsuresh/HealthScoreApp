import { router } from 'expo-router';

/** Open scanner only via explicit user action (passes intent so cold-start restore does not stick). */
export function openScanner() {
  router.push({ pathname: '/scanner', params: { intent: 'scan' } });
}

export function replaceWithScanner() {
  router.replace({ pathname: '/scanner', params: { intent: 'scan' } });
}

export function isExplicitScannerIntent(intent: string | string[] | undefined) {
  return intent === 'scan' || (Array.isArray(intent) && intent[0] === 'scan');
}
