import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { api } from '@/services/api';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isNewGoogleUser: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (data: { full_name: string; email: string; password: string; passkey: string }) => Promise<{ message: string; email: string; requiresOtp: boolean }>;
  verifyOtp: (email: string, otp: string) => Promise<string>;
  resendOtp: (email: string) => Promise<string>;
  completeGoogleSignup: (passkey: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        localStorage.setItem('access_token', session.access_token);
        fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.access_token) {
          localStorage.setItem('access_token', session.access_token);
          fetchProfile();
        } else {
          localStorage.removeItem('access_token');
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile() {
    try {
      const { profile } = await api.get<{ profile: Profile }>('/auth/profile');
      setProfile(profile);
      setIsNewGoogleUser(false); // They have a profile, not new
    } catch (err: any) {
      if (err.message?.includes('404') || err.message?.includes('Profile not found')) {
        // Only happens for new Google OAuth users who haven't entered passkey yet
        setIsNewGoogleUser(true);
      } else {
        console.error('Failed to fetch profile:', err);
      }
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function signInWithGoogle() {
    sessionStorage.setItem('oauth_in_progress', 'true');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      sessionStorage.removeItem('oauth_in_progress');
      throw new Error(error.message);
    }
  }

  async function signUp(data: { full_name: string; email: string; password: string; passkey: string }) {
    // Signup goes through our backend (which verifies passkey & initiates OTP)
    const result = await api.post<{ message: string; email: string; requiresOtp: boolean }>('/auth/signup', data);
    return result;
  }

  async function verifyOtp(email: string, otp: string): Promise<string> {
    const result = await api.post<{ message: string; verified: boolean }>('/auth/verify-otp', { email, otp });
    return result.message;
  }

  async function resendOtp(email: string): Promise<string> {
    const result = await api.post<{ message: string; sent: boolean }>('/auth/resend-otp', { email });
    return result.message;
  }

  async function completeGoogleSignup(passkey: string) {
    await api.post('/auth/google-callback', { passkey });
    sessionStorage.removeItem('oauth_in_progress');
    // After success, fetch profile again to clear the 'new user' state
    await fetchProfile();
  }

  async function signOut() {
    await supabase.auth.signOut();
    localStorage.removeItem('access_token');
    setUser(null);
    setProfile(null);
    setSession(null);
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    if (error) throw new Error(error.message);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isNewGoogleUser,
        signIn,
        signInWithGoogle,
        signUp,
        verifyOtp,
        resendOtp,
        completeGoogleSignup,
        signOut,
        resetPassword,
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
