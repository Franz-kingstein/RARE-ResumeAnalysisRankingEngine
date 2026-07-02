// ─── useAuth ──────────────────────────────────────────────────────────────────
// Thin hook that reads from AuthContext.
// Import this in any component that needs auth state.

import { useAuthContext } from '../auth/AuthContext';

export function useAuth() {
  return useAuthContext();
}
