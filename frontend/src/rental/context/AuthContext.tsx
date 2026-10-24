import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  name: string;
  identifier: string;
  mobile?: string;
  role: 'admin' | 'user';
  shopNo?: string;
  market?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  requireAuth: (callback?: () => void, redirectTarget?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'zp_rental_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const login = (userData: UserProfile) => {
    setUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (e) {
      console.error('Failed to save auth to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove auth from localStorage', e);
    }
  };

  /**
   * Helper to check if logged in.
   * If logged in, calls callback and returns true.
   * If not logged in, redirects to /rental/signin?redirect=... and returns false.
   */
  const requireAuth = (callback?: () => void, redirectTarget = 'quick-pay'): boolean => {
    if (user) {
      if (callback) callback();
      return true;
    }

    // Not authenticated -> redirect to login with return target
    navigate(`/rental/signin?redirect=${encodeURIComponent(redirectTarget)}`);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
