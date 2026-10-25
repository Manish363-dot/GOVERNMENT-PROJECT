import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { RentalAdminNavbar } from './RentalAdminNavbar';
import { PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import {
  LayoutDashboard,
  Building,
  Users,
  Shield,
  FileText,
  Bell,
  LogOut,
  UserPlus,
  ChevronRight,
  BarChart3,
  Receipt,
  ExternalLink,
  X,
  Phone,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
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

  const handleLogout = () => {
    logout();
    navigate('/rental/admin/login');
  };

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001' ||
    user?.identifier === 'almora_superadmin';

  const navItems = [
    {
      to: '/rental/admin/dashboard',
      label: isHi ? 'डैशबोर्ड' : 'Dashboard',
      icon: LayoutDashboard,
      badge: isHi ? 'लाइव' : 'Live',
    },
    {
      to: '/rental/admin/tenants',
      label: isHi ? 'किरायेदार (Users)' : 'Tenants & Users',
      icon: Users,
    },
    ...(isSuperAdmin
      ? [
          {
            to: '/rental/admin/subadmins',
            label: isHi ? 'उप-प्रशासक (Sub-Admins)' : 'Sub-Admins',
            icon: Shield,
            superAdminOnly: true,
            badge: 'Admin',
          },
        ]
      : []),
    {
      to: '/rental/admin/properties',
      label: isHi ? 'दुकानें व संपत्तियां' : 'Properties & Shops',
      icon: Building,
    },
    {
      to: '/rental/admin/records',
      label: isHi ? 'वित्तीय रिकॉर्ड्स व ऑडिट' : 'Records & Audit',
      icon: BarChart3,
      badge: 'GST',
    },
    {
      to: '/rental/admin/billing',
      label: isHi ? 'मासिक बिलिंग एवं मांग' : 'Monthly Billing',
      icon: FileText,
    },
    {
      to: '/rental/admin/notices',
      label: isHi ? 'सूचना एवं परिपत्र' : 'Notices & Circulars',
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen bg-[#eef1f6] flex flex-col font-sans text-slate-800 relative">
      {/* ───────────────────────────────────────────────────────────────────────
          1. FULL WIDTH OFFICIAL GOVERNMENT TOPBAR & HEADER
          Takes 100% width edge-to-edge across the entire screen
      ──────────────────────────────────────────────────────────────────────── */}
      <RentalAdminNavbar
        showMobileToggle={true}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
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
            STICKY ADMINISTRATIVE SIDEBAR (Fixed in place / Non-scrolling)
            1. Logo + ZILA PANCHAYAT ALMORA ADMIN'S PORTAL
            2. Directly: ADMINISTRATION MODULES
            3. Bottom: Admin Name, Mobile Number (No Avatar/Image) + Logout Button
        ──────────────────────────────────────────────────────────────────────── */}
        <aside
          className={`fixed md:sticky top-0 md:top-[34px] left-0 z-40 md:z-20 h-screen md:h-[calc(100vh-34px)] w-64 bg-[#0b1b36] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top Header & Navigation Links */}
          <div className="flex flex-col min-h-0">
            {/* 1. Official Crest + Zila Panchayat Almora ADMIN'S PORTAL */}
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
                    ADMIN'S PORTAL
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

            {/* 2. Directly: ADMINISTRATION MODULES */}
            <div className="px-4 pt-4 pb-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
              {isHi ? 'प्रशासनिक अनुभाग' : 'ADMINISTRATION MODULES'}
            </div>

            {/* Navigation Links */}
            <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-thin scrollbar-thumb-slate-800">
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
            </nav>
          </div>

          {/* 3. Bottom of Sidebar: Admin Name, Mobile Number (NO IMAGE) + Logout Button */}
          <div className="p-3.5 border-t border-slate-800/90 bg-[#071326] space-y-3 mt-auto">
            {/* Admin Details: Name & Mobile Number (Clean text, no image/avatar box) */}
            <div className="px-2 py-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-bold text-white truncate">
                  {user?.name || (isSuperAdmin ? (isHi ? 'मुख्य प्रशासनिक अधिकारी' : 'Super Administrator') : (isHi ? 'प्रशासक' : 'Administrator'))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider">
                    {isSuperAdmin ? 'SUPER ADMIN' : 'SUB ADMIN'}
                  </span>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                <span>{user?.mobile || user?.identifier || (isSuperAdmin ? '9412000001' : (isHi ? 'सक्रिय सत्र' : 'Active Session'))}</span>
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
            MAIN VIEWPORT (Page Content + Sub-Footer)
        ──────────────────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

        {/* Breadcrumbs & Section Title Header Strip */}
        <div className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
              <NavLink
                to="/rental/admin/dashboard"
                className="font-semibold text-slate-700 hover:text-amber-600 transition"
              >
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
              </NavLink>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-600 font-medium">
                {isHi ? 'वाणिज्यिक किराया प्रशासन' : 'Rental Admin'}
              </span>
              {breadcrumbs?.map((b, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  {b.to ? (
                    <NavLink to={b.to} className="hover:text-amber-600 font-medium">
                      {b.label}
                    </NavLink>
                  ) : (
                    <span className="text-slate-900 font-bold">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#0b1b36] tracking-tight">
              {title}
            </h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Quick Action Shortcut */}
          <div className="flex items-center gap-2">
            <NavLink
              to="/rental/admin/register-tenant"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b1b36] hover:bg-slate-800 text-amber-400 rounded-lg text-xs font-bold transition shadow-xs border border-amber-500/30"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? '+ नया किरायेदार जोड़ें' : '+ Add Tenant'}</span>
            </NavLink>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Sub-Footer from design.md */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              {isHi
                ? 'कार्यालय जिला पंचायत अल्मोड़ा — वाणिज्यिक किराया नियंत्रण एवं राजस्व पोर्टल (उत्तराखंड शासन)'
                : 'Office of Zila Panchayat Almora — Commercial Rental Management & Revenue System (Govt. of Uttarakhand)'}
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            {isHi ? 'अधिकृत शासकीय प्रशासन' : 'Official Administration'} • 2026
          </div>
        </footer>
      </div>
    </div>
  </div>
  );
};

export default AdminLayout;
