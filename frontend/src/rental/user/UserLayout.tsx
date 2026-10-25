import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RentalUserNavbar } from './RentalUserNavbar';
import { rentalAuthApi, DesignatedOfficerProfile } from '../services/rentalAuth.service';
import { PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

interface UserLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export const UserLayout: React.FC<UserLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [officer, setOfficer] = useState<DesignatedOfficerProfile | null>(null);
  const [showOfficerModal, setShowOfficerModal] = useState(false);

  useEffect(() => {
    rentalAuthApi.getDesignatedOfficer().then((res) => {
      if (res.data) setOfficer(res.data);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/rental/signin');
  };

  const navItems = [
    {
      to: '/rental/user/dashboard',
      label: isHi ? 'डैशबोर्ड' : 'Dashboard',
      icon: LayoutDashboard,
      badge: isHi ? 'लाइव' : 'Live',
    },
    {
      to: '/rental/user/bills',
      label: isHi ? 'किराया बिल एवं भुगतान' : 'My Bills & Pay',
      icon: FileText,
      badge: isHi ? 'भुगतान' : 'Pay',
    },
    {
      to: '/rental/user/receipts',
      label: isHi ? 'भुगतान रसीदें' : 'Payment Receipts',
      icon: Receipt,
    },
    {
      to: '/rental/user/notices',
      label: isHi ? 'सूचना एवं परिपत्र' : 'Notices & Circulars',
      icon: Bell,
    },
    {
      to: '/rental/user/profile',
      label: isHi ? 'प्रोफ़ाइल एवं दस्तावेज' : 'Profile & Documents',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef1f6] flex flex-col font-sans text-slate-800 relative">
      {/* ───────────────────────────────────────────────────────────────────────
          1. FULL WIDTH OFFICIAL GOVERNMENT TOPBAR & HEADER (TENANT PORTAL)
      ──────────────────────────────────────────────────────────────────────── */}
      <RentalUserNavbar
        showMobileToggle={true}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenOfficerModal={() => setShowOfficerModal(true)}
      />

      {/* ───────────────────────────────────────────────────────────────────────
          2. BELOW HEADER: SIDEBAR (LEFT) + MAIN WORKSPACE (RIGHT)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0 relative">
        {/* MOBILE SIDEBAR BACKDROP */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ───────────────────────────────────────────────────────────────────────
            STICKY TENANT SIDEBAR (Matches Admin Portal Architecture)
            1. Logo + ZILA PANCHAYAT ALMORA TENANT'S PORTAL
            2. Section: TENANT SERVICES
            3. Bottom: Tenant Name, Mobile / Code (No Avatar/Image) + Logout
        ──────────────────────────────────────────────────────────────────────── */}
        <aside
          className={`fixed md:sticky top-0 md:top-[34px] left-0 z-40 md:z-20 h-screen md:h-[calc(100vh-34px)] w-64 bg-[#0b1b36] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top Header & Navigation Links */}
          <div className="flex flex-col min-h-0">
            {/* 1. Official Crest + Zila Panchayat Almora TENANT'S PORTAL */}
            <div className="p-4 border-b border-slate-800/90 bg-[#071326] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo2.png"
                  alt="Zila Panchayat Almora Crest"
                  className="w-10 h-10 object-contain drop-shadow-md shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('PANCHAYATI_RAJ_LOGO_URL')) {
                      target.src = PANCHAYATI_RAJ_LOGO_URL;
                    }
                  }}
                />
                <div className="leading-tight">
                  <div className="text-[12px] font-black tracking-wide text-white uppercase font-poppins">
                    {isHi ? 'जिला पंचायत अल्मोड़ा' : 'ZILA PANCHAYAT ALMORA'}
                  </div>
                  <div className="text-[11px] font-extrabold text-amber-400 tracking-wider uppercase mt-0.5">
                    TENANT'S PORTAL
                  </div>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Directly: TENANT SERVICES */}
            <div className="px-4 pt-4 pb-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {isHi ? 'किरायेदार सेवाएं' : 'TENANT SERVICES'}
            </div>

            {/* Navigation Links */}
            <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin scrollbar-thumb-slate-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-slate-800 text-amber-300 border border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* Officer Support Quick Link */}
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setShowOfficerModal(true);
                }}
                className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{isHi ? 'नामित अधिकारी सहायता' : 'Officer Support'}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Sec 9
                </span>
              </button>
            </nav>
          </div>

          {/* 3. Bottom of Sidebar: Tenant Name, Mobile & User Code (NO IMAGE) + Logout Button */}
          <div className="p-3.5 border-t border-slate-800/90 bg-[#071326] space-y-3 mt-auto">
            {/* Tenant Details: Name, Mobile, User Code (Clean text, no image/avatar box) */}
            <div className="px-2 py-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">
                  {user?.name || (isHi ? 'किरायेदार' : 'Tenant User')}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-extrabold text-emerald-300 uppercase tracking-wider">
                    ACTIVE
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                <span>{user?.mobile || user?.identifier || 'Registered Tenant'}</span>
              </div>
              <div className="text-[10px] font-mono text-amber-300/80 mt-0.5 truncate">
                {user?.userCode || (user?.shopNo ? `Shop: ${user.shopNo}` : user?.identifier)}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/70 text-red-300 hover:text-white border border-red-900/60 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>{isHi ? 'सत्र समाप्त करें (लॉगआउट)' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* ───────────────────────────────────────────────────────────────────────
            MAIN VIEWPORT (Page Content + Header Strip + Sub-Footer)
        ──────────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumbs & Section Title Header Strip */}
          <div className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                <NavLink
                  to="/rental/user/dashboard"
                  className="hover:text-navy-900 transition font-medium"
                >
                  {isHi ? 'किरायेदार पोर्टल' : 'Tenant Portal'}
                </NavLink>
                {breadcrumbs && breadcrumbs.length > 0 ? (
                  breadcrumbs.map((b, idx) => (
                    <React.Fragment key={idx}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {b.to ? (
                        <NavLink to={b.to} className="hover:text-navy-900 transition font-medium">
                          {b.label}
                        </NavLink>
                      ) : (
                        <span className="text-slate-800 font-semibold">{b.label}</span>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800 font-semibold">{title}</span>
                  </>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-navy-950 tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>

            {/* Right Action: Officer Help Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOfficerModal(true)}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? 'नामित अधिकारी सहायता' : 'Designated Officer'}</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="p-4 sm:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
            {children}
          </main>

          {/* Official Government Footer with State Tricolor Ribbon */}
          <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="h-1 bg-gradient-to-r from-ukgreen-600 via-amber-500 to-navy-900" />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-2">
                <img src="/logo2.png" alt="Logo" className="w-4 h-4 object-contain" />
                <span className="font-bold text-slate-700">
                  {isHi
                    ? 'कार्यालय जिला पंचायत अल्मोड़ा • वाणिज्यिक परिसंपत्ति एवं किराया पोर्टल'
                    : 'Office of Zila Panchayat Almora • Commercial Asset & Rental Management Cell'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isHi
                  ? 'उत्तराखण्ड शासन • पंचायती राज विभाग'
                  : 'Government of Uttarakhand • Department of Panchayati Raj'}
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Modal: Section 9 Designated Officer Contact Card */}
      {showOfficerModal && officer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>{isHi ? 'नामित अधिकारी संपर्क विवरण' : 'Designated Officer Contact Details'}</span>
              </h3>
              <button
                onClick={() => setShowOfficerModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-xs text-emerald-950 space-y-2.5">
              <div className="font-black text-sm text-emerald-950">{officer.full_name}</div>
              <div className="text-emerald-800 font-semibold">
                {officer.designation} • {officer.department}
              </div>
              <div className="pt-2 border-t border-emerald-200/70 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-mono font-bold text-slate-900">{officer.office_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-medium text-slate-800">{officer.official_email}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Office:</strong> {officer.office_address}
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Working Hours:</strong> {officer.working_hours}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isHi
                ? 'उत्तराखण्ड पंचायती राज अधिनियम एवं म्युनिसिपल नियमों के तहत, व्यक्तिगत क्रेडेंशियल्स, आधार या लीज एग्रीमेंट में संशोधन केवल नामित अधिकारी के भौतिक सत्यापन के उपरांत ही संभव है।'
                : 'Under Uttarakhand Panchayati Raj rules and commercial bylaws, modifications to tenant credentials or lease assignments require physical verification by the designated officer.'}
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowOfficerModal(false)}
                className="px-5 py-2.5 text-xs font-bold bg-navy-950 hover:bg-navy-900 text-white rounded-xl transition cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
