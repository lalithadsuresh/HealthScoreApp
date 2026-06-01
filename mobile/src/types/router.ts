/** Params for `/signed-out` — used with `router.replace({ pathname: '/signed-out', params })`. */
export type SignedOutParams = {
  mode?: 'logout' | 'delete';
};

/** Params for `/scanner` — explicit scan entry only (not cold-start restore). */
export type ScannerParams = {
  intent?: 'scan';
};
