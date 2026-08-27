/**
 * src/context/AuthContext.jsx — Global Authentication State
 *
 * Provides:
 *  - user object (id, name, email, role, department, etc.)
 *  - isAuthenticated boolean
 *  - login(token, user) — saves to localStorage, updates state
 *  - logout() — clears localStorage, redirects to /login
 *  - isLoading — true while checking for existing session on app start
 *
 * Usage in any component:
 *   const { user, isAuthenticated, logout } = useAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // checking localStorage on mount

  // On app start, restore session from localStorage if it exists
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('cc_token');
      const savedUser = localStorage.getItem('cc_user');

      if (savedToken && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      // If JSON parsing fails, clear corrupted data
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Call this after a successful login API response.
   * @param {string} token  JWT from the backend
   * @param {object} userData  User object from the backend
   */
  const login = (token, userData) => {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Call this on logout or when a 401 is received.
   */
  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  /**
   * Refresh user data in context (e.g. after profile update).
   * @param {object} updatedUser
   */
  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('cc_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — components use this instead of useContext(AuthContext)
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}

export default AuthContext;
