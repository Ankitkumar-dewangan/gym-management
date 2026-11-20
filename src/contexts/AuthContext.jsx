import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { PREVIEW_USERS } from '../constants/mockPreviewData';
import { ROLES } from '../constants/roles';

const AuthContext = createContext(null);

const STORAGE_KEY = 'GymPilot_preview_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignore storage parsing errors
    }
    return null;
  });

  const signInWithPreviewRole = useCallback((role = ROLES.GYM_OWNER, overrides = {}) => {
    const template = PREVIEW_USERS[role] || PREVIEW_USERS.gym_owner;
    const nextUser = {
      ...template,
      ...overrides,
    };
    setUser(nextUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } catch {
      // Ignore storage errors
    }
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signInWithPreviewRole,
      signOut,
    }),
    [user, signInWithPreviewRole, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
