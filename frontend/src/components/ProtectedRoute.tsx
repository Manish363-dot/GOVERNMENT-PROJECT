import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isNewGoogleUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-600 font-medium">Authenticating Official Access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If user authenticated with Google but hasn't entered passkey yet:
  if (isNewGoogleUser || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-8 max-w-md bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="w-12 h-12 bg-navy-900 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">🔒</span>
          </div>
          <h3 className="text-lg font-bold text-navy-900 mb-2">Admin Authorization Required</h3>
          <p className="text-sm text-slate-600">
            Please enter your assigned Admin Passkey in the popup to verify your official credentials.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
