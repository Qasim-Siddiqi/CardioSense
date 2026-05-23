import { createContext, useContext, useState, useEffect } from "react";

// Context 

const AuthContext = createContext(null);

const STORAGE_KEY = "cardiosense_auth";

// Provider 

/**
 * Wraps the whole app. Provides { user, login, logout, isAuthenticated }.
 * `user` shape: { token: string, role: string, fullName: string } | null
 */
export function AuthProvider({ children }) {
  // On mount, try to restore auth from localStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage in sync whenever `user` changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * Call this after a successful API login/register.
   * @param {{ token: string, role: string, fullName: string }} authData
   */
  function loginUser(authData) {
    setUser(authData);
  }

  /** Clears auth state and localStorage. */
  function logoutUser() {
    setUser(null);
  }

  const value = {
    user,                          // full auth object or null
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,       // boolean convenience flag
    role: user?.role ?? null,      // "Patient" | "Doctor" | null
    fullName: user?.fullName ?? "", // display name
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook

/**
 * Custom hook — use inside any component to access auth state.
 * Example: const { user, login, logout, isAuthenticated, role } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
