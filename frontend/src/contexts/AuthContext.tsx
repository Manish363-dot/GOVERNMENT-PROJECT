import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '@/types';
import { api } from '@/services/api';
import { useGoogleLogin } from '@react-oauth/google';

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  session: { access_token: string } | null;
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
  handleGoogleSuccess: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setSession({ access_token: token });
      fetchProfile();
    } else {
      setLoading(false);
    }
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
          // Invalid token, logout
          localStorage.removeItem('access_token');
          setSession(null);
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
    const { token, profile: newProfile } = await api.post<{ token: string; profile: Profile }>('/auth/login', { email, password });
    localStorage.setItem('access_token', token);
    setSession({ access_token: token });
    setProfile(newProfile);
  }

  const googleLoginFn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Actually we need the id_token, but useGoogleLogin by default returns an access token
      // Wait, to get id_token we need flow: 'implicit' or 'auth-code'
      // By default flow='implicit' returns access_token. 
      // If we use flow='auth-code' we get code. 
      // Let's just use Google OAuth 2.0 endpoint or fetch user info.
      // But we built the backend to expect `idToken`.
    },
    onError: error => console.log('Google Login Failed', error)
  });

  // Since useGoogleLogin with default implicit flow returns access_token, getting an id_token requires a bit more setup or using @react-oauth/google's GoogleLogin component.
  // We can just use it to fetch the user profile on frontend, and then POST to backend. But wait, it's safer to use the credentialResponse from <GoogleLogin> which gives `credential` (id_token).
  // I will refactor signInWithGoogle to just trigger a state that we will handle, or just rely on a separate approach.
  // Actually, wait, useGoogleLogin with flow: 'implicit' doesn't give id_token. 
  // We can just redirect to backend for Google OAuth, or we can use the `<GoogleLogin>` component inside SignInPage.tsx!
  // For now, I'll provide a placeholder or we can use the `googleLoginFn`. Let's just make it do nothing and tell SignInPage to use <GoogleLogin> instead.

  async function signInWithGoogle() {
    // We will handle this directly in the components using @react-oauth/google <GoogleLogin />
    console.warn("Use <GoogleLogin> component from @react-oauth/google directly instead of signInWithGoogle");
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
    const { token, profile: newProfile } = await api.post<{ token: string, profile: Profile }>('/auth/google-login', { idToken: pendingGoogleToken, passkey });
    localStorage.setItem('access_token', token);
    setSession({ access_token: token });
    setProfile(newProfile);
    setIsNewGoogleUser(false);
    setPendingGoogleToken(null);
  }

  async function signOut() {
    localStorage.removeItem('access_token');
    setProfile(null);
    setSession(null);
  }

  async function resetPassword(email: string) {
    const result = await api.post<{ message: string }>('/auth/forgot-password', { email });
    if (result && result.message) return;
  }

  // A helper method to be called from the <GoogleLogin> component in SignInPage
  const handleGoogleSuccess = async (credential: string) => {
    try {
      const { token, profile: newProfile } = await api.post<{ token: string, profile: Profile }>('/auth/google-login', { idToken: credential });
      localStorage.setItem('access_token', token);
      setSession({ access_token: token });
      setProfile(newProfile);
    } catch (err: any) {
      if (err.message === 'New users must provide an admin passkey' || err.message?.includes('passkey')) {
        setPendingGoogleToken(credential);
        setIsNewGoogleUser(true);
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
