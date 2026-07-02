// ─── Type-safe localStorage wrappers ─────────────────────────────────────────
// All persistence goes through here. Swap implementation to sessionStorage
// or cookies without touching any component.

const PREFIX = 'rare_';

export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Silently ignore quota errors in demo mode
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // noop
  }
}

export function clearAll(): void {
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // noop
  }
}

// ─── Well-known storage keys ─────────────────────────────────────────────────

export const STORAGE_KEYS = {
  SESSION: 'session',
  REMEMBER_EMAIL: 'remember_email',
  SETTINGS: 'settings',
} as const;
