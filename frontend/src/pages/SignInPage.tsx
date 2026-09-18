import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Eye, EyeOff, AlertCircle, ShieldCheck, LockKeyhole, Building2, ArrowLeft } from 'lucide-react';
import { TopBarLogos } from '@/components/TopBarLogos';

export function SignInPage() {
  const { user, profile, isNewGoogleUser, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in and not waiting for passkey
  useEffect(() => {
    if (user && profile && !isNewGoogleUser) {
      navigate('/dashboard');
    }
  }, [user, profile, isNewGoogleUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Your email is not verified yet. Please check your Gmail inbox or complete verification to continue.');
      } else {
        setError(err.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-inter">
      {/* Official Government Header */}
      <header className="bg-white z-10 w-full shadow-sm">
        <TopBarLogos variant="public" />
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-ukgreen-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-uksaffron-600" />
        </div>
      </header>

      {/* Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative">
        <div className="w-full max-w-[1000px] grid lg:grid-cols-5 gap-0 items-stretch bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-300">

          {/* Left Side: Context / Branding Sidebar */}
          <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-10 col-span-2 relative overflow-hidden">
            {/* Background Image with Fade */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 pointer-events-none"
              style={{ backgroundImage: 'url(https://i.pinimg.com/736x/41/55/5f/41555f26ec46e770872f47265b5c2e89.jpg)' }}
            ></div>
            {/* Slight dark gradient overlay so white text stands out */}
            <div className="absolute inset-0 bg-navy-900/40 pointer-events-none z-0"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-6 shadow-md border-b-4 border-amber-500 overflow-hidden p-1">
                <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold font-poppins leading-tight mb-2">
                Zila Panchayat Safai
              </h1>
              <p className="text-sm text-slate-300 font-mono tracking-wide uppercase">
                Operations &amp; Command Portal
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Secure unified dashboard for real-time district sanitation monitoring.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Authorized access for administrative officials of Uttarakhand Government.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-16">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">NIC Cloud Gateway</p>
              <p className="text-[10px] text-slate-500 mt-1">256-Bit SSL Encrypted Access</p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="p-8 sm:p-12 lg:p-14 col-span-3 flex flex-col justify-center relative">

            {/* Back Button */}
            <Link
              to="/"
              className="absolute top-6 right-6 lg:left-6 lg:right-auto text-slate-400 hover:text-navy-900 flex items-center gap-1.5 text-sm font-medium transition-colors z-10 bg-white/80 p-2 rounded-md lg:bg-transparent lg:p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            <div className="lg:hidden flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-poppins text-navy-900 leading-none">Zila Panchayat</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Command Portal</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <LockKeyhole className="w-5 h-5 text-navy-800" />
                <h2 className="text-2xl font-extrabold text-navy-900 uppercase tracking-wide">Login</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">Please authenticate to access the admin dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="font-semibold text-slate-700">Official Email ID</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="admin@uk.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="font-semibold text-slate-700">Security Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-navy-700 hover:text-navy-900 hover:underline"
                  >
                    Recover Access?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your assigned password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating Data...
                  </span>
                ) : (
                  'Secure Login'
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                try {
                  await signInWithGoogle();
                } catch (err: any) {
                  setError(err.message || 'Google sign in failed');
                }
              }}
              className="w-full h-12 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Google
            </Button>

            <p className="text-sm text-center text-slate-500 mt-8 font-medium">
              Are you a new official?{' '}
              <Link to="/signup" className="text-navy-800 font-bold hover:underline">
                Request Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} Government of Uttarakhand. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-navy-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-navy-800 transition-colors">Terms of Use</a>
            <p className="font-mono bg-slate-100 px-2 py-1 rounded text-[10px]">v2.1.0-secure</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
