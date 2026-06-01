/** Prevents tab auth guards from fighting signed-out navigation during logout/delete. */
let signingOut = false;

export function beginSignOut() {
  signingOut = true;
}

export function endSignOut() {
  signingOut = false;
}

export function isSigningOut() {
  return signingOut;
}
