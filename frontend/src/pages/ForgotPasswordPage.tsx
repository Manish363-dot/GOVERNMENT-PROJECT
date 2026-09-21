import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react';

type Step = 'ENTER_EMAIL' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('ENTER_EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // OTP Countdown
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setStep('VERIFY_OTP');
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<{ resetToken: string }>('/auth/verify-reset-otp', { email, otp });
      setResetToken(res.resetToken);
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, resetToken, newPassword });
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Password requirements validation
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasNonAlphas = /\W/.test(newPassword);
  const isLengthValid = newPassword.length >= 8;
  const isPasswordValid = hasUpperCase && hasLowerCase && hasNumbers && hasNonAlphas && isLengthValid;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0f1c]">
      {/* Premium Abstract Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 px-4 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-white/10 p-3 rounded-2xl shadow-xl mb-4 ring-1 ring-white/20 backdrop-blur-md">
            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-12 h-12 object-contain filter drop-shadow-md" />
          </div>
          <h1 className="font-poppins font-bold text-white text-3xl tracking-tight text-center">Zila Panchayat</h1>
          <p className="text-blue-200/70 text-sm mt-1 font-medium tracking-wide uppercase">Command Portal</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border-0 rounded-2xl overflow-hidden bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 transition-all duration-300">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#15803d] via-white to-[#ea580c]" />
          
          <CardHeader className="text-center pb-4 pt-8">
            <CardTitle className="text-2xl font-bold text-slate-800">
              {step === 'ENTER_EMAIL' && 'Forgot Password?'}
              {step === 'VERIFY_OTP' && 'Verify Your Email'}
              {step === 'NEW_PASSWORD' && 'Create New Password'}
              {step === 'SUCCESS' && 'Password Reset Successfully!'}
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm max-w-[280px] mx-auto mt-2">
              {step === 'ENTER_EMAIL' && "Enter your registered email address and we'll send you a verification OTP."}
              {step === 'VERIFY_OTP' && "We've sent a 6-digit OTP to your email inbox."}
              {step === 'NEW_PASSWORD' && "Your new password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters."}
              {step === 'SUCCESS' && "Your password has been updated successfully. You can now log in."}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-3.5 bg-red-50/80 border border-red-100 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {step === 'ENTER_EMAIL' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-slate-700 font-semibold">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl px-4"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
                <div className="text-center mt-6">
                  <Link to="/signin" className="inline-flex items-center gap-2 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === 'VERIFY_OTP' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp" className="text-slate-700 font-semibold">6-Digit OTP</Label>
                  <Input
                    id="reset-otp"
                    type="text"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                  disabled={loading || otp.length < 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <div className="text-center mt-6">
                  {timeLeft > 0 ? (
                    <p className="text-sm text-slate-400 font-medium">Resend OTP in <span className="text-slate-700">{timeLeft}s</span></p>
                  ) : (
                    <button type="button" onClick={handleResendOtp} className="text-sm text-primary font-semibold hover:text-primary-700 transition-colors">
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            {step === 'NEW_PASSWORD' && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2 relative">
                  <Label htmlFor="new-password" className="text-slate-700 font-semibold">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="h-12 pr-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="confirm-password" className="text-slate-700 font-semibold">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 pr-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                  <div className="text-[13px] space-y-2 text-slate-500 font-medium">
                    <p className={`flex items-center gap-2 transition-colors ${isLengthValid ? 'text-emerald-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLengthValid ? 'bg-emerald-500' : 'bg-slate-300'}`} /> At least 8 characters
                    </p>
                    <p className={`flex items-center gap-2 transition-colors ${hasUpperCase ? 'text-emerald-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasUpperCase ? 'bg-emerald-500' : 'bg-slate-300'}`} /> One uppercase letter
                    </p>
                    <p className={`flex items-center gap-2 transition-colors ${hasLowerCase ? 'text-emerald-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasLowerCase ? 'bg-emerald-500' : 'bg-slate-300'}`} /> One lowercase letter
                    </p>
                    <p className={`flex items-center gap-2 transition-colors ${hasNumbers ? 'text-emerald-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasNumbers ? 'bg-emerald-500' : 'bg-slate-300'}`} /> One number
                    </p>
                    <p className={`flex items-center gap-2 transition-colors ${hasNonAlphas ? 'text-emerald-600' : ''}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${hasNonAlphas ? 'bg-emerald-500' : 'bg-slate-300'}`} /> One special character
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 mt-6 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" 
                  disabled={loading || !isPasswordValid || newPassword !== confirmPassword}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {step === 'SUCCESS' && (
              <div className="text-center space-y-6 py-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02]" 
                  onClick={() => navigate('/signin')}
                >
                  Go to Login
                </Button>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
