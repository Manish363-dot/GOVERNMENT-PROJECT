import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/types';
import { api } from '@/services/api';

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  loading: boolean;
  isNewGoogleUser: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: { full_name: string; email: string; password: string; passkey: string }) => Promise<{ message: string; email: string; requiresOtp: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  resendOtp: (email: string) => Promise<string>;
  completeGoogleSignup: (passkey: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  handleGoogleSuccess: (credential: string, isSignUp?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  let activeFetchPromise: Promise<void> | null = null;

  async function fetchProfile() {
    if (activeFetchPromise) return activeFetchPromise;

    activeFetchPromise = (async () => {
      try {
        const { profile } = await api.get<{ profile: Profile }>('/auth/profile');
        setProfile(profile);
        setIsNewGoogleUser(false); 
      } catch (err: any) {
        if (err.message?.includes('404') || err.message?.includes('Profile not found')) {
          setIsNewGoogleUser(true);
        } else {
          console.error('Failed to fetch profile:', err);
          // Invalid or missing token, clear profile
          setProfile(null);
        }
      } finally {
        activeFetchPromise = null;
        setLoading(false);
      }
    })();

    return activeFetchPromise;
  }

  async function signIn(email: string, password: string) {
    const { profile: newProfile } = await api.post<{ profile: Profile }>('/auth/login', { email, password });
    setProfile(newProfile);
  }


  async function signUp(data: { full_name: string; email: string; password: string; passkey: string }) {
    const result = await api.post<{ message: string; email: string; requiresOtp: boolean }>('/auth/signup', data);
    return result;
  }

  async function verifyOtp(email: string, otp: string): Promise<string> {
    const result = await api.post<{ message: string; verified: boolean; profile?: Profile; token?: string }>('/auth/verify-otp', { email, otp });
    return result.message;
  }

  async function resendOtp(email: string): Promise<string> {
    const result = await api.post<{ message: string; sent: boolean }>('/auth/resend-otp', { email });
    return result.message;
  }

  async function completeGoogleSignup(passkey: string) {
    if (!pendingGoogleToken) throw new Error("No pending google token");
    const { profile: newProfile } = await api.post<{ profile: Profile }>('/auth/google-login', { idToken: pendingGoogleToken, passkey });
    setProfile(newProfile);
    setIsNewGoogleUser(false);
    setPendingGoogleToken(null);
  }

  async function signOut() {
    await api.post('/auth/logout', {});
    setProfile(null);
    setIsNewGoogleUser(false);
    setPendingGoogleToken(null);
  }

  async function resetPassword(email: string) {
    const result = await api.post<{ message: string }>('/auth/forgot-password', { email });
    if (result && result.message) return;
  }

  const handleGoogleSuccess = async (credential: string, isSignUp: boolean = false) => {
    try {
      const { profile: newProfile } = await api.post<{ profile: Profile }>('/auth/google-login', { idToken: credential });
      setProfile(newProfile);
    } catch (err: any) {
      if (err.message === 'New users must provide an admin passkey' || err.message?.includes('passkey')) {
        if (isSignUp) {
          setPendingGoogleToken(credential);
          setIsNewGoogleUser(true);
        } else {
          throw new Error('Account not found. Only registered emails are allowed to login.');
        }
      } else {
        throw err;
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        profile,
        loading,
        isNewGoogleUser,
        signIn,
        signUp,
        verifyOtp,
        resendOtp,
        completeGoogleSignup,
        signOut,
        resetPassword,
        handleGoogleSuccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
