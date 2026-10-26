import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export interface UserProfile {
  id: string;
  name: string;
  identifier: string;
  mobile?: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN' | 'admin' | 'user';
  adminRole?: 'SUPER_ADMIN' | 'SUB_ADMIN';
  permissions?: string[];
  shopNo?: string;
  market?: string;
  userCode?: string;
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

const normalizeUserData = (userData: UserProfile): UserProfile => {
  const isSuper =
    userData.mobile === '9412000001' ||
    userData.identifier === '9412000001' ||
    userData.identifier === 'almora_superadmin' ||
    userData.role === 'SUPER_ADMIN' ||
    userData.adminRole === 'SUPER_ADMIN';

  return {
    ...userData,
    role: isSuper ? 'SUPER_ADMIN' : userData.role,
    adminRole: isSuper ? 'SUPER_ADMIN' : userData.adminRole,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return normalizeUserData(parsed);
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // 1. Listen for storage changes across tabs & dispatch events
  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setUser(normalizeUserData(parsed));
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('storage', syncUser);
    window.addEventListener('rental-auth-change', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('rental-auth-change', syncUser);
    };
  }, []);

  // 2. Validate current session with backend /rental/auth/admin/me
  useEffect(() => {
    const verifySessionWithBackend = async () => {
      try {
        const res = await api.get<{
          success: boolean;
          data: {
            admin?: {
              id: string;
              username: string;
              fullName: string;
              role: 'SUPER_ADMIN' | 'SUB_ADMIN';
              mobile: string;
              email?: string;
              permissions: string[];
            };
          };
        }>('/rental/auth/admin/me');

        if (res && res.data && res.data.admin) {
          const adm = res.data.admin;
          const isSuper =
            adm.role === 'SUPER_ADMIN' ||
            adm.mobile === '9412000001' ||
            adm.username === 'almora_superadmin';
          const resolvedRole: 'SUPER_ADMIN' | 'SUB_ADMIN' = isSuper ? 'SUPER_ADMIN' : 'SUB_ADMIN';

          const backendUser: UserProfile = {
            id: adm.id,
            name: adm.fullName || adm.username,
            identifier: adm.username || adm.mobile,
            mobile: adm.mobile,
            role: resolvedRole,
            adminRole: resolvedRole,
            permissions: adm.permissions || [],
          };

          setUser(backendUser);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(backendUser));
          } catch {}
        }
      } catch {
        // Not logged in or session expired
      }
    };

    verifySessionWithBackend();
  }, []);

  const login = (userData: UserProfile) => {
    const normalized = normalizeUserData(userData);
    setUser(normalized);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      window.dispatchEvent(new Event('rental-auth-change'));
    } catch (e) {
      console.error('Failed to save auth to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('rental-auth-change'));
    } catch (e) {
      console.error('Failed to remove auth from localStorage', e);
    }
  };

  const requireAuth = (callback?: () => void, redirectTarget = 'quick-pay'): boolean => {
    if (user) {
      if (callback) callback();
      return true;
    }
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
    let localUser: UserProfile | null = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        localUser = normalizeUserData(JSON.parse(saved));
      }
    } catch {}

    return {
      user: localUser,
      isAuthenticated: !!localUser,
      login: (userData: UserProfile) => {
        const normalized = normalizeUserData(userData);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          window.dispatchEvent(new Event('rental-auth-change'));
        } catch {}
      },
      logout: () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
          window.dispatchEvent(new Event('rental-auth-change'));
        } catch {}
      },
      requireAuth: () => !!localUser,
    };
  }
  return context;
};
