/** Params for `/signed-out` — used with `router.replace({ pathname: '/signed-out', params })`. */
export type SignedOutParams = {
  mode?: 'logout' | 'delete';
};
