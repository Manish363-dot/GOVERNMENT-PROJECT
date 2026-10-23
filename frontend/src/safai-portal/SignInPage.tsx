import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertCircle, LockKeyhole, ArrowLeft } from 'lucide-react';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

export function SignInPage() {
  const { user, profile, isNewGoogleUser, signIn, handleGoogleSuccess } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

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
        setError(isHi ? 'आपका ईमेल अभी सत्यापित नहीं है। कृपया अपना जीमेल इनबॉक्स जांचें।' : 'Your email is not verified yet. Please check your Gmail inbox or complete verification to continue.');
      } else {
        setError(err.message || (isHi ? 'अमान्य ईमेल या पासवर्ड' : 'Invalid email or password'));
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
                <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold font-poppins leading-tight mb-2">
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Department Of Zila Panchayat Almora'}
              </h1>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="p-5 sm:p-12 lg:p-14 col-span-3 flex flex-col justify-center relative">

            {/* Back Button */}
            <Link
              to="/"
              className="absolute top-6 right-6 lg:left-6 lg:right-auto text-slate-400 hover:text-navy-900 flex items-center gap-1.5 text-sm font-medium transition-colors z-10 bg-white/80 p-2 rounded-md lg:bg-transparent lg:p-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
            </Link>

            <div className="lg:hidden flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
              <div className="w-10 h-10 bg-navy-900 rounded-lg flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-poppins text-navy-900 leading-none">{isHi ? 'जिला पंचायत' : 'Zila Panchayat'}</h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{isHi ? 'कमांड पोर्टल' : 'Command Portal'}</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <LockKeyhole className="w-5 h-5 text-navy-800" />
                <h2 className="text-2xl font-extrabold text-navy-900 uppercase tracking-wide">{isHi ? 'लॉगिन' : 'Login'}</h2>
              </div>
              <p className="text-sm text-slate-500 font-medium">{isHi ? 'व्यवस्थापक डैशबोर्ड तक पहुँचने के लिए कृपया प्रमाणित करें।' : 'Please authenticate to access the admin dashboard.'}</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center gap-3 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="signin-email" className="font-semibold text-slate-700">{isHi ? 'आधिकारिक ईमेल आईडी' : 'Official Email ID'}</Label>
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
                  <Label htmlFor="signin-password" className="font-semibold text-slate-700">{isHi ? 'सुरक्षा पासवर्ड' : 'Security Password'}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-navy-700 hover:text-navy-900 hover:underline"
                  >
                    {isHi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isHi ? 'अपना निर्धारित पासवर्ड दर्ज करें' : 'Enter your assigned password'}
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
                    {isHi ? 'प्रमाणित किया जा रहा है...' : 'Authenticating Data...'}
                  </span>
                ) : (
                  isHi ? 'सुरक्षित लॉगिन' : 'Secure Login'
                )}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-medium">{isHi ? 'या इसके साथ जारी रखें' : 'Or continue with'}</span>
              </div>
            </div>

              <>
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleSuccess(credentialResponse.credential).catch(err => {
                          setError(err.message);
                        });
                      }
                    }}
                    onError={() => {
                      setError(isHi ? 'Google साइन इन विफल' : 'Google Sign In failed');
                    }}
                  />
                </div>

                <p className="text-sm text-center text-slate-500 mt-8 font-medium">
                  {isHi ? 'क्या आप एक नए अधिकारी हैं?' : 'Are you a new official?'}
                  {' '}
                  <Link to="/signup" className="text-navy-800 font-bold hover:underline">
                    {isHi ? 'खाता अनुरोध करें' : 'Request Account'}
                  </Link>
                </p>
              </>
          </div>
        </div>
      </main>

      {/* Official Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© {new Date().getFullYear()} {isHi ? 'उत्तराखंड सरकार। सर्वाधिकार सुरक्षित।' : 'Government of Uttarakhand. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
