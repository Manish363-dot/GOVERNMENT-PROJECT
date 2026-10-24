import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '../components/TopBarLogos';
import {
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LockKeyhole,
  ArrowLeft,
  ShieldCheck,
  Building2,
  FileCheck2,
  Sparkles,
  UserCheck,
  Store,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

interface AdminSignInPageProps {
  initialRole?: 'admin' | 'user';
}

export const AdminSignInPage: React.FC<AdminSignInPageProps> = ({ initialRole = 'admin' }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect');
  const isPayRentRedirect = redirectTarget === 'quick-pay' || redirectTarget === 'pay-rent';

  // If URL has redirect=quick-pay or is /signin, default to user role
  const isUserPath = isPayRentRedirect || location.pathname.includes('/signin') || (location.pathname.includes('/login') && !location.pathname.includes('admin'));
  const [role, setRole] = useState<'admin' | 'user'>(isUserPath ? 'user' : initialRole);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update role if prop changes
  useEffect(() => {
    if (location.pathname === '/admin/login') {
      setRole('admin');
    } else if (location.pathname === '/signin' || location.pathname === '/login') {
      setRole('user');
    }
  }, [location.pathname]);

  // Pre-fill demo credentials
  const handleQuickFill = (targetRole: 'admin' | 'user') => {
    setError('');
    if (targetRole === 'admin') {
      setIdentifier('admin.rental@uk.gov.in');
      setPassword('Admin@ZilaPanchayat2026');
    } else {
      setIdentifier('shopkeeper.almora@uk.gov.in');
      setPassword('Tenant@Almora2026');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim() || !password.trim()) {
      setError(isHi ? 'कृपया पहचान आईडी एवं पासवर्ड दर्ज करें।' : 'Please enter your login ID and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (role === 'admin') {
        login({
          id: 'admin-01',
          name: isHi ? 'प्रशासनिक अधिकारी (अल्मोड़ा)' : 'Admin Officer (Almora)',
          identifier: identifier.trim(),
          role: 'admin',
        });
      } else {
        login({
          id: 'tenant-101',
          name: isHi ? 'रमेश चंद्र जोशी' : 'Ramesh Chandra Joshi',
          identifier: identifier.trim(),
          role: 'user',
          shopNo: 'SHOP-101',
          market: isHi ? 'धारानौला मुख्य बाजार' : 'Dharanaula Main Market',
        });
      }

      setSuccess(
        isHi
          ? role === 'admin'
            ? 'व्यवस्थापक प्रमाणीकरण सफल! रेंटल डैशबोर्ड पर रीडायरेक्ट किया जा रहा है...'
            : 'किरायेदार सत्यापन सफल! किराया भुगतान पोर्टल पर ले जाया जा रहा है...'
          : role === 'admin'
          ? 'Admin authentication successful! Redirecting...'
          : 'Tenant verified! Redirecting to rent payment...'
      );

      setTimeout(() => {
        if (redirectTarget === 'quick-pay' || redirectTarget === 'pay-rent') {
          navigate('/#quick-pay');
          setTimeout(() => {
            const el = document.getElementById('quick-pay');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        } else {
          navigate('/');
        }
      }, 1200);
    }, 850);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 🏛️ Official Government Top Header */}
      <header className="bg-white z-10 w-full shadow-xs">
        <TopBarLogos variant="public" />
        {/* Uttarakhand State Tricolor Accent Ribbon */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-ukgreen-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-uksaffron-600" />
        </div>
      </header>

      {/* 📢 Floating Warning Banner (Official restriction notice) */}
      <div className="bg-red-600 text-white text-xs sm:text-sm font-medium py-1.5 overflow-hidden w-full flex">
        <style>{`
          @keyframes scroll-text {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scrolling-wrapper {
            display: flex;
            white-space: nowrap;
            width: max-content;
            animation: scroll-text 42s linear infinite;
          }
          .scrolling-wrapper:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="scrolling-wrapper">
          <span className="pr-16">
            ⚠️ यह पोर्टल केवल अधिकृत व्यवस्थापक (Admin) एवं पूर्व-पंजीकृत किरायेदारों (Tenants) के लॉगिन हेतु है। नवीन खाता पंजीकरण केवल जिला पंचायत प्रशासन द्वारा किया जाता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is for authorized Admin and registered Tenants only. New account registration is managed exclusively by the Zila Panchayat Administration.
          </span>
          <span className="pr-16">
            ⚠️ यह पोर्टल केवल अधिकृत व्यवस्थापक (Admin) एवं पूर्व-पंजीकृत किरायेदारों (Tenants) के लॉगिन हेतु है। नवीन खाता पंजीकरण केवल जिला पंचायत प्रशासन द्वारा किया जाता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is for authorized Admin and registered Tenants only. New account registration is managed exclusively by the Zila Panchayat Administration.
          </span>
          <span className="pr-16">
            ⚠️ यह पोर्टल केवल अधिकृत व्यवस्थापक (Admin) एवं पूर्व-पंजीकृत किरायेदारों (Tenants) के लॉगिन हेतु है। नवीन खाता पंजीकरण केवल जिला पंचायत प्रशासन द्वारा किया जाता है। &nbsp;&nbsp;|&nbsp;&nbsp; ⚠️ This portal is restricted to authorized Admins and pre-registered Tenants only.
          </span>
        </div>
      </div>

      {/* 🏛️ Main Content Split Layout */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative">
        <div className="w-full max-w-[1020px] grid lg:grid-cols-5 gap-0 items-stretch bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-300">
          
          {/* 🟦 Left Side: Context / Official Branding Sidebar (Clean civic architectural theme) */}
          <div className="hidden lg:flex flex-col justify-between bg-[#0b1b36] text-white p-8 xl:p-10 col-span-2 relative overflow-hidden">
            {/* Background Image: High-quality civic architectural background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 pointer-events-none"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80)',
              }}
            />
            {/* Dark navy overlay to ensure text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1b36]/90 via-[#0b1b36]/80 to-[#0b1b36]/95 pointer-events-none z-0" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-5 shadow-md border-b-4 border-amber-500 overflow-hidden p-1">
                <img
                  src={PANCHAYATI_RAJ_LOGO_URL}
                  alt="Zila Panchayat Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl xl:text-2xl font-bold font-poppins leading-tight mb-2">
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Department Of Zila Panchayat Almora'}
              </h1>
              <p className="text-amber-400 font-semibold text-xs tracking-wider uppercase">
                {isHi ? 'वाणिज्यिक संपत्ति एवं किराया प्रकोष्ठ' : 'Commercial Asset & Rental Cell'}
              </p>
              
              <div className="mt-5 pt-4 border-t border-white/10 text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isHi ? 'दुकानें व वाणिज्यिक परिसर' : 'Commercial Properties & Shops'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isHi ? 'डिजिटल किराया रसीद व मांग पत्र' : 'Digital Receipts & Demand Notices'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'अधिकृत शासकीय प्रमाणीकरण' : 'Authorized Secure Authentication'}</span>
                </div>
              </div>
            </div>

            {/* Bottom info badge */}
            <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-slate-300">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-emerald-300 font-semibold text-[11px] mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'एनआईसी प्रमाणित पोर्टल' : 'Official Government System'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isHi
                  ? 'अनाधिकृत प्रवेश दंडनीय अपराध है। समस्त लॉगिन गतिविधियों का रिकॉर्ड ऑडिट ट्रेल में सुरक्षित रखा जाता है।'
                  : 'Unauthorized access is prohibited. All user and admin access logs are monitored.'}
              </p>
            </div>
          </div>

          {/* 📝 Right Side: Form (Login Only: Admin & Tenant) */}
          <div className="p-5 sm:p-10 lg:p-12 col-span-3 flex flex-col justify-center relative bg-white">
            
            {/* Top Navigation Row: Back to Home */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="text-slate-500 hover:text-[#0b1b36] flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHi ? 'मुख्य पृष्ठ पर लौटें' : 'Back to Home'}</span>
              </Link>

              {/* Secure badge */}
              <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHi ? 'सुरक्षित एसएसएल 256-बिट' : '256-Bit SSL Secure'}</span>
              </div>
            </div>

            {/* Role Switcher Tabs (Admin Login vs Tenant/User Login) */}
            <div className="mb-6">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {isHi ? 'लॉगिन प्रकार चुनें (Select Role):' : 'Select Login Role:'}
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    setError('');
                    setSuccess('');
                    setIdentifier('');
                    setPassword('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-md transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'bg-[#0b1b36] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <LockKeyhole className="w-4 h-4" />
                  <span>{isHi ? 'व्यवस्थापक (Admin)' : 'Admin Login'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('user');
                    setError('');
                    setSuccess('');
                    setIdentifier('');
                    setPassword('');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-md transition-all cursor-pointer ${
                    role === 'user'
                      ? 'bg-[#0b1b36] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>{isHi ? 'किरायेदार (Tenant / User)' : 'Tenant / User'}</span>
                </button>
              </div>
            </div>

            {/* Heading & Subheading */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                {role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                ) : (
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                )}
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1b36] uppercase tracking-wide">
                  {role === 'admin'
                    ? isHi
                      ? 'व्यवस्थापक लॉगिन'
                      : 'Admin Sign In'
                    : isHi
                    ? 'किरायेदार एवं नागरिक लॉगिन'
                    : 'Tenant / Citizen Login'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {role === 'admin'
                  ? isHi
                    ? 'जिला पंचायत अल्मोड़ा के अधिकृत अधिकारियों एवं प्रबंधकों हेतु सुरक्षित एक्सेस।'
                    : 'Restricted to authorized Zila Panchayat Almora departmental officers.'
                  : isHi
                  ? 'आवंटित दुकानों व व्यावसायिक परिसरों के पंजीकृत किरायेदारों हेतु स्वयं-सेवा लॉगिन।'
                  : 'Self-service login for registered allottees and commercial shop tenants.'}
              </p>
            </div>

            {/* Payment Redirect Notice Banner */}
            {isPayRentRedirect && !success && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-lg text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
                <CreditCard className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {isHi
                    ? 'किराया ऑनलाइन जमा करने के लिए कृपया पहले लॉगिन करें। लॉगिन के बाद आप सीधे भुगतान कर सकेंगे।'
                    : 'Please login first to proceed with online rent payment. You will be redirected back directly.'}
                </span>
              </div>
            )}

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

            {/* 🔐 LOGIN FORM (ONLY LOGIN, NO SIGNUP) */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="login-identifier"
                  className="block text-xs sm:text-sm font-semibold text-slate-700"
                >
                  {role === 'admin'
                    ? isHi
                      ? 'आधिकारिक शासकीय ईमेल आईडी'
                      : 'Official Govt Email ID'
                    : isHi
                    ? 'पंजीकृत मोबाइल नंबर / किरायेदार आईडी / ईमेल'
                    : 'Registered Mobile No. / Tenant ID / Email'}
                </label>
                <input
                  id="login-identifier"
                  type={role === 'admin' ? 'email' : 'text'}
                  placeholder={
                    role === 'admin'
                      ? 'admin.rental@uk.gov.in'
                      : isHi
                      ? 'उदा. 9876543210 या shop.almora@uk.gov.in'
                      : 'e.g. 9876543210 or shop.almora@uk.gov.in'
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b1b36] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    {isHi ? 'सुरक्षा पासवर्ड' : 'Security Password'}
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        isHi
                          ? 'पासवर्ड रीसेट करने के लिए कृपया जिला पंचायत अल्मोड़ा एनआईसी प्रकोष्ठ या हेल्पलाइन 1800-185-1850 पर संपर्क करें।'
                          : 'Please contact Zila Panchayat Almora NIC support or helpline 1800-185-1850 to reset credentials.'
                      );
                    }}
                    className="text-xs font-bold text-[#0b1b36] hover:underline"
                  >
                    {isHi ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={
                      isHi ? 'अपना निर्धारित पासवर्ड दर्ज करें' : 'Enter your assigned password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b1b36] focus:bg-white pr-10 transition-all"
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

              {/* Quick-Fill Demo Pill */}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] text-slate-400">
                  {isHi ? 'परीक्षण क्रेडेंशियल्स:' : 'Testing credentials:'}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickFill(role)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>
                    {role === 'admin'
                      ? isHi
                        ? 'एडमिन क्रेडेंशियल भरें'
                        : 'Quick Fill Admin'
                      : isHi
                      ? 'किरायेदार क्रेडेंशियल भरें'
                      : 'Quick Fill Tenant'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0b1b36] hover:bg-[#152a4d] text-white h-11 sm:h-12 rounded-md text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-md hover:shadow-lg mt-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isHi ? 'प्रमाणित किया जा रहा है...' : 'Authenticating...'}</span>
                  </>
                ) : (
                  <span>
                    {role === 'admin'
                      ? isHi
                        ? 'सुरक्षित व्यवस्थापक लॉगिन'
                        : 'Secure Admin Login'
                      : isHi
                      ? 'सुरक्षित किरायेदार लॉगिन'
                      : 'Secure Tenant Login'}
                  </span>
                )}
              </button>
            </form>

            {/* SSO / Jan Parichay Option */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400 font-semibold text-[11px]">
                  {isHi ? 'अथवा शासकीय पहचान से लॉगिन' : 'Or via Govt Identity'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(
                  isHi
                    ? 'मेरीपहचान (Jan Parichay SSO) एवं एनआईसी ईमेल आधारित सिंगल साइन-ऑन सेवा जल्द ही चालू होगी।'
                    : 'Jan Parichay National SSO single sign-on will be activated shortly.'
                );
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-300 rounded-md hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <img
                src="/assets/logos/logo1.png"
                alt="Govt of Uttarakhand"
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span>{isHi ? 'उत्तराखंड जन परिचय (SSO Login)' : 'Uttarakhand Jan Parichay SSO'}</span>
            </button>

            {/* 🛑 OFFICIAL NOTICE: SIGN UP DISABLED / REGISTRATION CONTROLLED BY ADMIN */}
            <div className="mt-6 p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-lg text-xs text-amber-950 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 text-xs mb-0.5">
                  {isHi
                    ? 'सार्वजनिक स्व-पंजीकरण बंद है (Self Sign-Up Disabled)'
                    : 'Public Self-Registration is Disabled'}
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isHi
                    ? 'दुकानदारों एवं नागरिकों का नया पंजीकरण केवल जिला पंचायत प्रशासन द्वारा किया जाएगा। यदि आपका खाता अभी पंजीकृत नहीं है, तो कृपया जिला पंचायत अल्मोड़ा कार्यालय या हेल्पलाइन 1800-185-1850 पर संपर्क करें।'
                    : 'New tenant accounts are registered exclusively by the Zila Panchayat administration upon official allotment. If you are not yet registered, please visit the Zila Panchayat Almora office or contact helpline 1800-185-1850.'}
                </p>
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
              ? 'कार्यालय जिला पंचायत अल्मोड़ा, पंचायती राज विभाग, उत्तराखंड शासन। सर्वाधिकार सुरक्षित।'
              : 'Office of Zila Panchayat Almora, Govt. of Uttarakhand. All rights reserved.'}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
            <span>•</span>
            <span>{isHi ? 'उपयोग की शर्तें' : 'Terms of Service'}</span>
            <span>•</span>
            <span>NIC Certified Portal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminSignInPage;
