import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Languages, X, User, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from './TopBarLogos';

export const RentalNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const isHi = language === 'hi';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP PANORAMIC HEADER BANNER (Direct TopBarLogos Component) */}
      {/* ============================================================ */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isScrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        }`}
      >
        <div className="overflow-hidden bg-[#faf8f5]">
          <TopBarLogos variant="public" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OFFICIAL GOVERNMENT STRIP (Sticky Deep Navy Strip)        */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 flex flex-col shadow-xs">
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            {/* Left: Gov Authority badge & subtitle */}
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {t.nav.govBadgeHi}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {t.nav.govSubtitle}
              </span>
            </div>

            {/* Right: Helpline & Exact Language Switcher Button */}
            <div className="flex items-center gap-4 text-slate-300">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>
                  {isHi ? 'हेल्पलाइन: ' : 'Helpline: '}
                  <strong className="text-white font-mono">1800-185-1850</strong>
                </span>
              </div>

              {/* Exact Safai Language Switcher Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                title={isHi ? 'Switch to English' : 'हिंदी में बदलें'}
                className="h-7 px-2.5 text-[11px] font-bold gap-1.5 border border-slate-700 bg-[#152a4d] text-amber-300 hover:bg-[#1e3a6a] hover:text-amber-200 transition-colors shadow-xs rounded flex items-center cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. MAIN NAVBAR (White Background, Sticky with Tricolor Line) */}
        {/* ============================================================ */}
        <div className="bg-white border-b border-slate-200 shadow-xs">
          {/* Uttarakhand Accent Tricolor Line */}
          <div className="uk-tricolor-line" />

          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-12">
            <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
              {/* Brand Logo & Title on Left (Matches Safai Portal) */}
              <div className="flex items-center justify-start shrink-0 mr-2 xl:mr-3 2xl:mr-6">
                <a href="#home" className="flex items-center gap-2 sm:gap-3 group">
                  <img
                    src={PANCHAYATI_RAJ_LOGO_URL}
                    alt="Zila Panchayat Logo"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/logos/logo2.png';
                    }}
                    className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs shrink-0"
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-poppins font-bold text-[#0b1b36] text-[13px] sm:text-base xl:text-lg 2xl:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                      {isHi ? 'संपत्ति एवं किराया प्रकोष्ठ' : 'Commercial Asset & Rental Cell'}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-normal leading-tight hidden sm:block">
                      {isHi ? 'जिला पंचायत अल्मोड़ा • उत्तराखण्ड शासन' : 'Zila Panchayat Almora • Govt. of Uttarakhand'}
                    </span>
                  </div>
                </a>
              </div>

              {/* Desktop Navigation Links (Aligned to PRD Section 5) */}
              <nav className="hidden xl:flex items-center justify-end gap-0.5 2xl:gap-1 shrink-0 ml-auto mr-3 xl:mr-4 2xl:mr-6">
                <a
                  href="#home"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.home}
                </a>
                <a
                  href="#services-hub"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {isHi ? 'नागरिक सेवाएं' : 'Services'}
                </a>
                <a
                  href="#about"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.about}
                </a>
                <a
                  href="#properties"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.properties}
                </a>
                <a
                  href="#notices"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <span>{t.nav.notices}</span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    {t.common.newBadge}
                  </span>
                </a>
                <a
                  href="#documents"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.documents}
                </a>
                <a
                  href="#feedback"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.feedback}
                </a>
                <a
                  href="#contact"
                  className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t.nav.contact}
                </a>
              </nav>

              {/* Desktop Action Buttons */}
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center gap-2.5 shrink-0 md:ml-auto xl:ml-0 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-xs font-bold text-[#0b1b36]">
                    <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                    <span className="max-w-[140px] truncate">{user.name}</span>
                    {user.role === 'admin' ? (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                        Admin
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                        {user.shopNo || 'Tenant'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isHi ? 'लॉगआउट' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-end gap-2.5 shrink-0 md:ml-auto xl:ml-0 whitespace-nowrap">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center justify-center border border-slate-300 text-[#0b1b36] hover:bg-slate-50 font-bold px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors shadow-xs cursor-pointer"
                  >
                    {t.nav.adminSignIn}
                  </Link>
                  <Link
                    to="/signin"
                    className="inline-flex items-center justify-center bg-[#0b1b36] hover:bg-[#152a4d] text-white shadow-xs font-bold px-4 py-2 rounded-md text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    {t.nav.login}
                  </Link>
                </div>
              )}

              {/* Mobile/Tablet Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-md text-[#0b1b36] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6 text-slate-800" />
                ) : (
                  <div className="flex flex-col gap-[4px] w-6 h-6 justify-center items-center">
                    <span className="w-6 h-[2.5px] bg-[#FF9933] rounded-full" />
                    <span className="w-6 h-[2.5px] bg-slate-300 rounded-full" />
                    <span className="w-6 h-[2.5px] bg-[#138808] rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="xl:hidden bg-slate-50 border-t border-slate-200 px-4 pb-4 pt-2 space-y-1">
              <a
                href="#home"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.home}
              </a>
              <a
                href="#services-hub"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {isHi ? 'नागरिक सेवाएं' : 'Services'}
              </a>
              <a
                href="#about"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.about}
              </a>
              <a
                href="#properties"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.properties}
              </a>
              <a
                href="#notices"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.notices}
              </a>
              <a
                href="#documents"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.documents}
              </a>
              <a
                href="#feedback"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.feedback}
              </a>
              <a
                href="#contact"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-[#0b1b36] hover:bg-slate-200 rounded-md"
              >
                {t.nav.contact}
              </a>

              <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center justify-between p-2.5 bg-slate-200/80 rounded-md text-xs font-bold text-[#0b1b36]">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="truncate">{user.name}</span>
                      </div>
                      <span className="text-[10px] bg-[#0b1b36] text-white px-2 py-0.5 rounded uppercase">
                        {user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="w-full text-center bg-rose-600 hover:bg-rose-700 py-2 rounded-md font-bold text-xs text-white shadow-xs"
                    >
                      {isHi ? 'लॉगआउट करें' : 'Sign Out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center border border-slate-300 py-2 rounded-md font-bold text-xs text-[#0b1b36] bg-white hover:bg-slate-50 shadow-xs"
                    >
                      {t.nav.adminSignIn}
                    </Link>
                    <Link
                      to="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center bg-[#0b1b36] hover:bg-[#152a4d] py-2 rounded-md font-bold text-xs text-white shadow-xs"
                    >
                      {t.nav.login}
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
