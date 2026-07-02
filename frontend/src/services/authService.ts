// ─── authService.ts ───────────────────────────────────────────────────────────
// ALL authentication business logic lives here.
// To connect a real Flask/JWT backend, replace only the implementations of
// login(), logout(), refresh(), and getCurrentUser() in this file.
// No component changes will be needed.

import type { User, LoginCredentials, AuthResult, MockCredential, Session } from '../types/user';
import { getItem, setItem, removeItem, clearAll, STORAGE_KEYS } from '../utils/storage';

// ─── Mock HR accounts ─────────────────────────────────────────────────────────

const MOCK_USERS: MockCredential[] = [
  {
    email: 'admin@rare.ai',
    password: 'Admin@123',
    user: {
      id: 'user-001',
      name: 'System Administrator',
      email: 'admin@rare.ai',
      role: 'Administrator',
      department: 'Engineering',
      designation: 'System Administrator',
      initials: 'SA',
      createdAt: '2024-01-15T08:00:00.000Z',
    },
  },
  {
    email: 'hr@rare.ai',
    password: 'Hr@123',
    user: {
      id: 'user-002',
      name: 'Alex Rivera',
      email: 'hr@rare.ai',
      role: 'HR Recruiter',
      department: 'Human Resources',
      designation: 'Lead Technical Recruiter',
      initials: 'AR',
      createdAt: '2024-03-20T09:30:00.000Z',
    },
  },
];

// ─── Session duration ─────────────────────────────────────────────────────────

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Authenticate a user against the mock credential store.
 * Replace this function body with a fetch() call to your Flask /auth/login endpoint.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  // Simulate network latency
  await new Promise(r => setTimeout(r, 900));

  const { email, password, rememberMe } = credentials;

  // Basic validation
  if (!email.trim() || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const match = MOCK_USERS.find(
    m => m.email.toLowerCase() === email.toLowerCase().trim() && m.password === password,
  );

  if (!match) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Build a session object (mirrors what a real JWT response would look like)
  const session: Session = {
    token: 'mock-token-',
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    user: match.user,
    rememberMe,
  };

  setItem<Session>(STORAGE_KEYS.SESSION, session);

  if (rememberMe) {
    setItem<string>(STORAGE_KEYS.REMEMBER_EMAIL, email.toLowerCase().trim());
  } else {
    removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
  }

  return { success: true, user: match.user };
}

/**
 * Clear the session.
 * Replace with a fetch() to your Flask /auth/logout endpoint if needed.
 */
export function logout(): void {
  clearAll();
}

/**
 * Retrieve the currently authenticated user from storage.
 * Replace with a fetch() to your Flask /auth/me endpoint for server-side validation.
 */
export function getCurrentUser(): User | null {
  const session = getItem<Session>(STORAGE_KEYS.SESSION);
  if (!session) return null;

  // Check session expiry
  if (new Date(session.expiresAt) < new Date()) {
    clearAll();
    return null;
  }

  return session.user;
}

/**
 * Retrieve a remembered email address (for Remember Me UX).
 */
export function getRememberedEmail(): string | null {
  return getItem<string>(STORAGE_KEYS.REMEMBER_EMAIL);
}

/**
 * Refresh / extend the session.
 * Replace with a fetch() to your Flask /auth/refresh endpoint.
 */
export async function refresh(): Promise<User | null> {
  const session = getItem<Session>(STORAGE_KEYS.SESSION);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    clearAll();
    return null;
  }
  // Extend expiry
  const extended: Session = {
    ...session,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  };
  setItem<Session>(STORAGE_KEYS.SESSION, extended);
  return session.user;
}
