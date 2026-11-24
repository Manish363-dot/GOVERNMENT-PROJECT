import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalAuthApi } from '../services/rentalAuth.service';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileCheck2,
  LockKeyhole,
  Search,
} from 'lucide-react';

export const AdminSignInPage: React.FC<{ initialRole?: string }> = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle mobile number input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setIdentifier(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanMobile = identifier.trim();

    if (!cleanMobile) {
      setError(
        isHi
          ? 'कृपया अपना 10-अंकीय अधिकृत मोबाइल नंबर दर्ज करें।'
          : 'Please enter your 10-digit authorized mobile number.'
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError(
        isHi
          ? 'कृपया मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!password.trim()) {
      setError(isHi ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await rentalAuthApi.adminLogin(cleanMobile, password);
      const adminData = res.data?.admin;
      if (adminData) {
        const isSuper =
          adminData.role === 'SUPER_ADMIN' ||
          adminData.mobile === '9412000001' ||
          cleanMobile === '9412000001' ||
          adminData.username === 'almora_superadmin';
        const resolvedRole: 'SUPER_ADMIN' | 'SUB_ADMIN' = isSuper ? 'SUPER_ADMIN' : 'SUB_ADMIN';
        login({
          id: adminData.id,
          name: adminData.fullName || (adminData as any).full_name || adminData.username,
          identifier: adminData.username || cleanMobile,
          mobile: adminData.mobile || cleanMobile,
          role: resolvedRole,
          adminRole: resolvedRole,
          permissions: adminData.permissions || [],
        });
      }

      setSuccess(
        isHi
          ? 'विभागीय सत्यापन सफल! रेंटल डैशबोर्ड पर ले जाया जा रहा है...'
          : 'Admin authentication successful! Redirecting to dashboard...'
      );

      setTimeout(() => {
        navigate('/rental/admin/dashboard');
      }, 700);
    } catch (err: any) {
      if (err.status === 429 || err.message?.toLowerCase().includes('too many') || err.message?.toLowerCase().includes('throttled')) {
        setError(
          isHi
            ? 'अत्यधिक लॉगिन प्रयास! सुरक्षा कारणों से आपका एक्सेस 15 मिनट के लिए सीमित किया गया है।'
            : 'Too many authentication attempts! Access temporarily throttled for 15 minutes.'
        );
      } else {
        setError(
          err.message ||
            (isHi
              ? 'लॉगिन विफल रहा। कृपया अपने अधिकृत क्रेडेंशियल जांचें।'
              : 'Login failed. Please verify your authorized credentials.')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 🏛️ Official Panoramic Top Header Banner */}
      <div className="bg-[#faf8f5] border-b border-slate-200">
        <TopBarLogos variant="public" />
      </div>

      {/* Tricolor Accent Line */}
      <div className="uk-tricolor-line" />

      {/* Floating Warning Banner (Matches SWM Portal) */}
      <div className="bg-red-600 text-white text-sm font-medium py-1.5 overflow-hidden w-full flex shadow-xs">
        <style>{`
          @keyframes scroll-text-rental {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scrolling-wrapper-rental {
            display: flex;
            white-space: nowrap;
            width: max-content;
            animation: scroll-text-rental 40s linear infinite;
          }
          .scrolling-wrapper-rental:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="scrolling-wrapper-rental">
          <span className="pr-16 font-semibold">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16 font-semibold">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16 font-semibold">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
          <span className="pr-16 font-semibold">⚠️ यह पोर्टल आम नागरिकों के लिए उपलब्ध नहीं है, इसे केवल जिला पंचायत के अधिकृत व्यवस्थापक (Admin) द्वारा एक्सेस किया जा सकता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is unavailable for public users and can only be accessed by authorized Zila Panchayat Admins.</span>
        </div>
      </div>

      {/* 🏛️ Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative">
        <div className="w-full max-w-[960px] grid lg:grid-cols-5 gap-0 items-stretch bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-300">
          
          {/* 🟦 Left Side: Context / Official Branding Sidebar */}
          <div className="hidden lg:flex flex-col justify-between bg-navy-900 text-white p-8 xl:p-10 col-span-2 relative overflow-hidden">
            {/* Background Image with Fade (Matches SWM Portal) */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 pointer-events-none"
              style={{ backgroundImage: 'url(/admin-signin-bg.jpg), url(https://i.pinimg.com/736x/41/55/5f/41555f26ec46e770872f47265b5c2e89.jpg)' }}
            />
            {/* Slight dark gradient overlay so white text stands out */}
            <div className="absolute inset-0 bg-navy-900/40 pointer-events-none z-0" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-5 shadow-md border-b-4 border-amber-500 overflow-hidden p-1">
                <img
                  src={PANCHAYATI_RAJ_LOGO_URL}
                  alt="Zila Panchayat Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold font-poppins leading-tight mb-2">
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
              </h1>
              <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                {isHi ? 'वाणिज्यिक संपत्ति एवं किराया प्रकोष्ठ' : 'Commercial Asset & Rental Cell'}
              </p>
              
              <div className="mt-6 pt-5 border-t border-white/10 text-xs text-slate-300 space-y-3">
                <div className="flex items-center gap-2">
                  <span>{isHi ? 'दुकानें व वाणिज्यिक संपत्ति प्रबंधन' : 'Shop & Asset Management'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{isHi ? 'कार्यालय काउंटर किराया वसूली' : 'Office Counter Rent Collection'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{isHi ? 'कम्प्यूटरीकृत रसीद एवं लेजर' : 'Computerized Receipts & Ledger'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📝 Right Side: Login Form */}
          <div className="p-6 sm:p-10 lg:p-12 col-span-3 flex flex-col justify-center relative bg-white">
            
            {/* Top Navigation Row: Back to Rental Portal */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/rental"
                className="text-slate-500 hover:text-[#0b1b36] flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHi ? 'रेंटल पोर्टल मुख्य पृष्ठ' : 'Back to Rental Portal'}</span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1b36] tracking-tight">
                  {isHi ? 'अधिकारी लॉगिन' : 'Admin Login'}
                </h2>
              </div>
            </div>

            {/* Alert / Error / Success Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-center gap-3 shadow-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-xs sm:text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-md flex items-center gap-3 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="text-xs sm:text-sm text-emerald-800 font-medium">{success}</p>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-identifier"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    {isHi ? 'अधिकृत व्यवस्थापक मोबाइल नंबर' : 'Authorized Admin Mobile Number'}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 select-none pointer-events-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                    <span className="text-slate-300 ml-1">|</span>
                  </div>
                  <input
                    id="login-identifier"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="987654XYZ"
                    value={identifier}
                    onChange={handleMobileChange}
                    className="w-full pl-20 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b1b36] focus:bg-white transition-all"
                    required
                  />
                  {identifier.length === 10 && /^[6-9]\d{9}$/.test(identifier) && (
                    <div className="absolute right-3 text-emerald-600 pointer-events-none flex items-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    {isHi ? 'सुरक्षा पासवर्ड' : 'Security Password'}
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      isHi ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b1b36] focus:bg-white pr-10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b1b36] transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0b1b36] hover:bg-[#152a4d] text-white h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isHi ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <span>{isHi ? 'लॉगिन' : 'Login'}</span>
                )}
              </button>
            </form>

            {/* 🟢 Helpful Citizen Notice: No Login Required to Check Rent */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-slate-700">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <span>{isHi ? 'किरायेदार सूचना:' : 'Tenant Notice:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 mb-2">
                  {isHi
                    ? 'किरायेदारों को अपना किराया, चालू माह का बकाया, रसीद एवं खाता बही (Ledger) देखने हेतु लॉगिन करने की आवश्यकता नहीं है।'
                    : 'Tenants do not need to log in to check dues, status, payment receipts, or ledger statements.'}
                </p>
                <Link
                  to="/rental/check-status"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  <span>{isHi ? 'यहाँ क्लिक करें: अपना किराया एवं रसीद जांचें' : 'Click here: Check Rent Status & Receipts'}</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 🏛️ Official Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <p>
            © {new Date().getFullYear()}{' '}
            {isHi
              ? 'उत्तराखंड सरकार। सर्वाधिकार सुरक्षित।'
              : 'Government of Uttarakhand. All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminSignInPage;
