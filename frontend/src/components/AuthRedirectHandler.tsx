import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function AuthRedirectHandler() {
  const { user, profile, isNewGoogleUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // Check if OAuth callback happened (hash or query params present, or flag in sessionStorage)
    const hasOAuthHash = window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token');
    const hasOAuthCode = window.location.search.includes('code=');
    const hasOAuthFlag = sessionStorage.getItem('oauth_in_progress') === 'true';

    const isOAuthReturn = hasOAuthHash || hasOAuthCode || hasOAuthFlag;

    // If user is fully authenticated and not a new Google user awaiting passkey:
    if (user && profile && !isNewGoogleUser) {
      if (isOAuthReturn || location.pathname === '/signin' || location.pathname === '/signup') {
        sessionStorage.removeItem('oauth_in_progress');
        // Clean URL hash if it has tokens so URL looks clean
        if (hasOAuthHash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, isNewGoogleUser, loading, navigate, location.pathname]);

  return null;
}
