// ─── User Types ───────────────────────────────────────────────────────────────
// Database-ready interfaces, independent of UI components.
// Swap authService.ts to connect a real backend with no component changes.

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  /** Initials for avatar rendering */
  initials: string;
  /** ISO-8601 timestamp */
  createdAt: string;
}

export type UserRole = 'Administrator' | 'HR Recruiter' | 'Viewer';

export interface Role {
  id: string;
  name: UserRole;
  permissions: Permission[];
}

export type Permission =
  | 'view_candidates'
  | 'run_analysis'
  | 'manage_templates'
  | 'view_analytics'
  | 'manage_users'
  | 'view_history'
  | 'export_data';

export interface Session {
  /** JWT token — populated when real backend is connected */
  token: string;
  /** ISO-8601 expiry */
  expiresAt: string;
  user: User;
  rememberMe: boolean;
}

// ─── Auth form types ──────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// ─── Mock-only type (never sent to a real backend) ────────────────────────────

export interface MockCredential {
  email: string;
  password: string;
  user: User;
}
