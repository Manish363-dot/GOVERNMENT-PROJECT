import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, ShieldCheck, EyeOff, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function GooglePasskeyModal() {
  const { isNewGoogleUser, completeGoogleSignup, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [passkey, setPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isNewGoogleUser) return null;

  const handleCancel = async () => {
    sessionStorage.removeItem('oauth_in_progress');
    await signOut();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError('Admin Passkey is required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await completeGoogleSignup(passkey);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid admin passkey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-navy-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Admin Authorization Required</h3>
              <p className="text-sm text-slate-300 mt-0.5">Finalize your Google Sign-in</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <p className="text-sm text-slate-600 mb-6">
            You successfully authenticated with Google. Because this administrative portal is restricted to authorized Zila Panchayat staff, please enter your assigned <strong>Admin Passkey</strong> (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-navy-900">ADMIN1234</code>) to activate your account.
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="google-passkey" className="font-semibold text-slate-700 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-navy-700" />
                Admin Passkey
              </Label>
              <div className="relative">
                <Input
                  id="google-passkey"
                  type={showPasskey ? 'text' : 'password'}
                  placeholder="Enter passkey (ADMIN1234)"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-12 pr-10 text-lg tracking-wide"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700 transition-colors"
                >
                  {showPasskey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying Passkey...
                  </span>
                ) : (
                  'Verify & Open Admin Dashboard'
                )}
              </Button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:underline transition-colors text-center"
              >
                Cancel &amp; Sign Out
              </button>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-ukgreen-600" />
            256-Bit Encrypted Secure Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
