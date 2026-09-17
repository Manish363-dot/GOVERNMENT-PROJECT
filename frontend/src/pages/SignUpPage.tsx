import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TopBarLogos } from '@/components/TopBarLogos';
import {
  Truck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  KeyRound,
  UserPlus,
  Mail,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export function SignUpPage() {
  const { user, profile, isNewGoogleUser, signUp, verifyOtp, resendOtp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    passkey: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Verification state
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect to dashboard if already logged in and not waiting for passkey
  useEffect(() => {
    if (user && profile && !isNewGoogleUser) {
      navigate('/dashboard');
    }
  }, [user, profile, isNewGoogleUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!form.passkey.trim()) {
      setError('Admin Passkey is mandatory for registration.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        passkey: form.passkey,
      });

      if (res.requiresOtp) {
        setOtpStep(true);
        setSuccess(`Verification code sent to ${form.email}. Please check your inbox.`);
        setResendCooldown(60);
      } else {
        setSuccess(res.message || 'Account registered successfully!');
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setVerifyingOtp(true);
    try {
      const message = await verifyOtp(form.email, otp.trim());
      setSuccess(message || 'Account verified and activated successfully! Redirecting to login...');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setError('');
    setResendingOtp(true);
    try {
      const message = await resendOtp(form.email);
      setSuccess(message || 'A new verification code has been sent to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-inter">
      {/* ── Official Government Header ── */}
      <header className="bg-white z-10 w-full shadow-sm">
        <TopBarLogos variant="public" />
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-ukgreen-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-uksaffron-600" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-[1060px] grid lg:grid-cols-5 gap-0 items-stretch bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-300">

          {/* ── Left Side: Branding Sidebar ── */}
          <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-10 col-span-2 relative overflow-hidden">
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 pointer-events-none"
              style={{ backgroundImage: 'url(https://i.pinimg.com/736x/41/55/5f/41555f26ec46e770872f47265b5c2e89.jpg)' }}
            />
            <div className="absolute inset-0 bg-navy-900/50 pointer-events-none z-0" />

            {/* Top brand block */}
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-6 shadow-md border-b-4 border-amber-500">
                <Truck className="w-8 h-8 text-navy-900" />
              </div>
              <h1 className="text-2xl font-bold font-poppins leading-tight mb-1">
                Zila Panchayat Safai
              </h1>
              <p className="text-sm text-slate-300 font-mono tracking-wide uppercase">
                Official Registration Portal
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    New official registration for authorized Zila Panchayat administrative staff only.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    An Admin Passkey is required — issued by the department head before registration.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Mandatory Email Verification ensures only genuine, registered Google / official mailboxes are approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom badge */}
            <div className="relative z-10 pt-12">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">NIC Cloud Gateway</p>
              <p className="text-[10px] text-slate-500 mt-1">256-Bit SSL Encrypted · Govt. of Uttarakhand</p>
            </div>
          </div>

          {/* ── Right Side: Registration / OTP Form ── */}
          <div className="p-8 sm:p-10 lg:p-14 col-span-3 flex flex-col justify-center relative">

            {/* Back Button */}
            <Link 
              to="/" 
              className="absolute top-6 right-6 lg:left-6 lg:right-auto text-slate-400 hover:text-navy-900 flex items-center gap-1.5 text-sm font-medium transition-colors z-10 bg-white/80 p-2 rounded-md lg:bg-transparent lg:p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>

            {/* Mobile header */}
            <div className="lg:hidden flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center shadow-md">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-poppins text-navy-900 leading-none">Zila Panchayat</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Registration Portal</p>
              </div>
            </div>

            {/* Error / Success alerts */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-5 p-4 bg-green-50 border-l-4 border-green-600 rounded-r-md flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-green-700 flex-shrink-0" />
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}

            {/* ── STEP 2: OTP VERIFICATION VIEW ── */}
            {otpStep ? (
              <div className="space-y-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-6 h-6 text-navy-800" />
                    <h2 className="text-2xl font-extrabold text-navy-900 uppercase tracking-wide">
                      Verify Your Gmail
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    We sent a 6-digit verification code to <strong className="text-navy-900 font-semibold">{form.email}</strong>. Please enter the code below to confirm this is your real, active mailbox.
                  </p>
                  <div className="flex mt-3 h-[3px] w-20 rounded overflow-hidden">
                    <div className="flex-1 bg-ukgreen-600" />
                    <div className="flex-1 bg-white border-y border-slate-200" />
                    <div className="flex-1 bg-uksaffron-600" />
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-otp" className="font-semibold text-slate-700 text-xs uppercase tracking-wider block">
                      6-Digit Verification Code
                    </Label>
                    <Input
                      id="signup-otp"
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-14 text-center text-3xl font-mono tracking-[0.4em] font-bold"
                      autoFocus
                      required
                    />
                    <p className="text-xs text-slate-500">Code is valid for 15 minutes.</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-2"
                    disabled={verifyingOtp || otp.length !== 6}
                  >
                    {verifyingOtp ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Code...
                      </span>
                    ) : (
                      'Verify & Activate Official Account'
                    )}
                  </Button>
                </form>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-navy-900 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp || resendCooldown > 0}
                    className="flex items-center gap-1.5 text-navy-800 hover:underline font-bold disabled:text-slate-400 disabled:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── STEP 1: REGISTRATION FORM ── */
              <div>
                {/* Page title */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <UserPlus className="w-5 h-5 text-navy-800" />
                    <h2 className="text-2xl font-extrabold text-navy-900 uppercase tracking-wide">
                      New Official Registration
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Complete the form below to request administrative access.
                  </p>
                  {/* Tricolor accent line */}
                  <div className="flex mt-3 h-[3px] w-20 rounded overflow-hidden">
                    <div className="flex-1 bg-ukgreen-600" />
                    <div className="flex-1 bg-white border-y border-slate-200" />
                    <div className="flex-1 bg-uksaffron-600" />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      setError(err.message || 'Google sign up failed');
                    }
                  }}
                  className="w-full h-12 mb-8 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
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
                  Sign up with Google
                </Button>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-medium">Or register with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-full-name" className="font-semibold text-slate-700">
                      Full Name (as per official records)
                    </Label>
                    <Input
                      id="signup-full-name"
                      placeholder="e.g. Rajesh Kumar Sharma"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11"
                      required
                    />
                  </div>

                  {/* Official Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="font-semibold text-slate-700">
                      Official Email ID (Valid Gmail or Gov ID)
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="admin@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11"
                      required
                    />
                  </div>

                  {/* Password row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="font-semibold text-slate-700">
                        Set Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-confirm" className="font-semibold text-slate-700">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={form.confirmPassword}
                          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                  </div>

                  {/* Admin Passkey */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-passkey" className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-navy-700" />
                      Admin Passkey
                      <span className="ml-1 text-xs font-normal text-slate-400">(Mandatory)</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-passkey"
                        type={showPasskey ? 'text' : 'password'}
                        placeholder="Enter passkey issued by department head (ADMIN1234)"
                        value={form.passkey}
                        onChange={(e) => setForm({ ...form, passkey: e.target.value })}
                        className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasskey(!showPasskey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy-700 transition-colors"
                      >
                        {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-ukgreen-600" />
                      This passkey is provided by your Zila Panchayat administrator.
                    </p>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Validating Credentials...
                      </span>
                    ) : (
                      'Request Verification Code'
                    )}
                  </Button>
                </form>

                <p className="text-sm text-center text-slate-500 mt-6 font-medium">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-navy-800 font-bold hover:underline">
                    Authorized Login
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Official Footer ── */}
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
