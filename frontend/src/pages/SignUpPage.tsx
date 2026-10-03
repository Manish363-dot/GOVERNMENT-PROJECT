import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  UserPlus,
  Mail,
  Loader2,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export function SignUpPage() {
  const { user, profile, isNewGoogleUser, signUp, verifyOtp, resendOtp, handleGoogleSuccess } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

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
      setError(isHi ? 'पासवर्ड मेल नहीं खाते। कृपया पुनः दर्ज करें।' : 'Passwords do not match. Please re-enter.');
      return;
    }
    if (form.password.length < 6) {
      setError(isHi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters long.');
      return;
    }
    if (!form.passkey.trim()) {
      setError(isHi ? 'पंजीकरण के लिए एडमिन पासकी अनिवार्य है।' : 'Admin Passkey is mandatory for registration.');
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
        setSuccess(isHi ? `सत्यापन कोड ${form.email} को भेजा गया है। कृपया अपना इनबॉक्स जांचें।` : `Verification code sent to ${form.email}. Please check your inbox.`);
        setResendCooldown(60);
      } else {
        setSuccess(res.message || (isHi ? 'खाता सफलतापूर्वक पंजीकृत हो गया!' : 'Account registered successfully!'));
        setTimeout(() => navigate('/signin'), 2000);
      }
    } catch (err: any) {
      setError(err.message || (isHi ? 'पंजीकरण विफल रहा। कृपया अपना विवरण जांचें।' : 'Registration failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      setError(isHi ? 'कृपया पूरा 6 अंकों का कोड दर्ज करें' : 'Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setVerifyingOtp(true);
    try {
      const message = await verifyOtp(form.email, otp.trim());
      setSuccess(message || (isHi ? 'खाता सफलतापूर्वक सत्यापित और सक्रिय हो गया! लॉगिन पर रीडायरेक्ट कर रहे हैं...' : 'Account verified and activated successfully! Redirecting to login...'));
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err: any) {
      setError(err.message || (isHi ? 'अमान्य या समाप्त हो चुका सत्यापन कोड' : 'Invalid or expired verification code'));
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
      setSuccess(message || (isHi ? 'आपके ईमेल पर एक नया सत्यापन कोड भेजा गया है।' : 'A new verification code has been sent to your email.'));
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || (isHi ? 'कोड पुनः भेजने में विफल' : 'Failed to resend code'));
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

      {/* Floating Warning Banner */}
      <div className="bg-red-600 text-white text-sm font-medium py-1.5 overflow-hidden w-full flex">
        <style>{`
          @keyframes scroll-text {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scrolling-wrapper {
            display: flex;
            white-space: nowrap;
            width: max-content;
            animation: scroll-text 40s linear infinite;
          }
          .scrolling-wrapper:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="scrolling-wrapper">
          <span className="pr-16">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
        </div>
      </div>

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
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-6 shadow-md border-b-4 border-amber-500 overflow-hidden p-1">
                <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold font-poppins leading-tight mb-1">
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Department Of Zila Panchayat Almora'}
              </h1>
  
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <UserPlus className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isHi ? 'केवल अधिकृत जिला पंचायत प्रशासनिक कर्मचारियों के लिए नया आधिकारिक पंजीकरण।' : 'New official registration for authorized Zila Panchayat administrative staff only.'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isHi ? 'एक व्यवस्थापक पासकी आवश्यक है — पंजीकरण से पहले विभाग प्रमुख द्वारा जारी की जाती है।' : 'An Admin Passkey is required — issued by the department head before registration.'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isHi ? 'अनिवार्य ईमेल सत्यापन सुनिश्चित करता है कि केवल वास्तविक, पंजीकृत आधिकारिक मेलबॉक्स ही स्वीकृत हैं।' : 'Mandatory Email Verification ensures only genuine, registered official mailboxes are approved.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom badge */}
            <div className="relative z-10 pt-12">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{isHi ? 'NIC क्लाउड गेटवे' : 'NIC Cloud Gateway'}</p>
              <p className="text-[10px] text-slate-500 mt-1">{isHi ? '256-बिट SSL एन्क्रिप्टेड · उत्तराखंड सरकार' : '256-Bit SSL Encrypted · Govt. of Uttarakhand'}</p>
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
              <span className="hidden sm:inline">{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
            </Link>

            {/* Mobile header */}
            <div className="lg:hidden flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-poppins text-navy-900 leading-none">{isHi ? 'जिला पंचायत' : 'Zila Panchayat'}</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{isHi ? 'पंजीकरण पोर्टल' : 'Registration Portal'}</p>
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
                      {isHi ? 'अपना ईमेल सत्यापित करें' : 'Verify Your Email'}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2">
                    {isHi ? 'हमने एक 6-अंकीय सत्यापन कोड भेजा है: ' : 'We sent a 6-digit verification code to '}
                    <strong className="text-navy-900 font-semibold">{form.email}</strong>. 
                    {isHi ? ' कृपया पुष्टि करने के लिए नीचे कोड दर्ज करें।' : ' Please enter the code below to confirm.'}
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
                      {isHi ? '6-अंकीय सत्यापन कोड' : '6-Digit Verification Code'}
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
                    <p className="text-xs text-slate-500">{isHi ? 'कोड 15 मिनट के लिए वैध है।' : 'Code is valid for 15 minutes.'}</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-2"
                    disabled={verifyingOtp || otp.length !== 6}
                  >
                    {verifyingOtp ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isHi ? 'कोड सत्यापित किया जा रहा है...' : 'Verifying Code...'}
                      </span>
                    ) : (
                      isHi ? 'सत्यापित करें और आधिकारिक खाता सक्रिय करें' : 'Verify & Activate Official Account'
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
                    {isHi ? 'विवरण संपादित करें' : 'Edit Details'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp || resendCooldown > 0}
                    className="flex items-center gap-1.5 text-navy-800 hover:underline font-bold disabled:text-slate-400 disabled:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                    {resendCooldown > 0 
                      ? (isHi ? `कोड पुनः भेजें (${resendCooldown}s)` : `Resend Code (${resendCooldown}s)`)
                      : (isHi ? 'कोड पुनः भेजें' : 'Resend Code')}
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
                      {isHi ? 'नया आधिकारिक पंजीकरण' : 'New Official Registration'}
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {isHi ? 'प्रशासनिक पहुंच का अनुरोध करने के लिए नीचे दिया गया फॉर्म भरें।' : 'Complete the form below to request administrative access.'}
                  </p>
                  {/* Tricolor accent line */}
                  <div className="flex mt-3 h-[3px] w-20 rounded overflow-hidden">
                    <div className="flex-1 bg-ukgreen-600" />
                    <div className="flex-1 bg-white border-y border-slate-200" />
                    <div className="flex-1 bg-uksaffron-600" />
                  </div>
                </div>

                <div className="flex justify-center w-full mb-8">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleSuccess(credentialResponse.credential, true).catch(err => {
                          setError(err.message);
                        });
                      }
                    }}
                    onError={() => {
                      setError(isHi ? 'Google साइन अप विफल' : 'Google Sign Up failed');
                    }}
                    text="signup_with"
                  />
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500 font-medium">
                      {isHi ? 'या ईमेल से पंजीकरण करें' : 'Or register with email'}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-full-name" className="font-semibold text-slate-700">
                      {isHi ? 'पूरा नाम (आधिकारिक रिकॉर्ड के अनुसार)' : 'Full Name (as per official records)'}
                    </Label>
                    <Input
                      id="signup-full-name"
                      placeholder={isHi ? 'उदा. राजेश कुमार शर्मा' : 'e.g. Rajesh Kumar Sharma'}
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="bg-slate-50 border-slate-300 focus-visible:ring-navy-800 h-11"
                      required
                    />
                  </div>

                  {/* Official Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="font-semibold text-slate-700">
                      {isHi ? 'आधिकारिक ईमेल आईडी (वैध जीमेल या सरकारी आईडी)' : 'Official Email ID (Valid Gmail or Gov ID)'}
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
                        {isHi ? 'पासवर्ड सेट करें' : 'Set Password'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isHi ? 'न्यूनतम 6 अक्षर' : 'Min. 6 characters'}
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
                        {isHi ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isHi ? 'पासवर्ड फिर से दर्ज करें' : 'Re-enter password'}
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
                      {isHi ? 'व्यवस्थापक पासकी' : 'Admin Passkey'}
                      <span className="ml-1 text-xs font-normal text-slate-400">{isHi ? '(अनिवार्य)' : '(Mandatory)'}</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-passkey"
                        type={showPasskey ? 'text' : 'password'}
                        placeholder={isHi ? 'विभाग प्रमुख द्वारा जारी पासकी दर्ज करें' : 'Enter passkey issued by department head'}
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
                      {isHi ? 'यह पासकी आपके जिला पंचायत व्यवस्थापक द्वारा प्रदान की जाती है।' : 'This passkey is provided by your Zila Panchayat administrator.'}
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
                        {isHi ? 'प्रमाण-पत्र सत्यापित किए जा रहे हैं...' : 'Validating Credentials...'}
                      </span>
                    ) : (
                      isHi ? 'सत्यापन कोड का अनुरोध करें' : 'Request Verification Code'
                    )}
                  </Button>
                </form>

                <p className="text-sm text-center text-slate-500 mt-6 font-medium">
                  {isHi ? 'क्या आपके पास पहले से खाता है?' : 'Already have an account?'}
                  {' '}
                  <Link to="/signin" className="text-navy-800 font-bold hover:underline">
                    {isHi ? 'अधिकृत लॉगिन' : 'Authorized Login'}
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
          <p>© {new Date().getFullYear()} {isHi ? 'उत्तराखंड सरकार। सर्वाधिकार सुरक्षित।' : 'Government of Uttarakhand. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
