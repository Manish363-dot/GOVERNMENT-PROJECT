import { useState } from 'react';
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
} from 'lucide-react';

export function SignUpPage() {
  const { signUp } = useAuth();
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
      const message = await signUp({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        passkey: form.passkey,
      });
      setSuccess(message || 'Account registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/signin'), 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please contact your administrator.');
    } finally {
      setLoading(false);
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
                  <Building2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Authorized access exclusively for Government of Uttarakhand officials.
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

          {/* ── Right Side: Registration Form ── */}
          <div className="p-8 sm:p-10 lg:p-14 col-span-3 flex flex-col justify-center">

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
                  Official Email ID
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="admin@uk.gov.in"
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
                    placeholder="Enter passkey issued by department head"
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
                  This passkey is provided by your Zila Panchayat administrator. Contact IT cell if not received.
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
                    Registering Account...
                  </span>
                ) : (
                  'Submit Registration Request'
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
