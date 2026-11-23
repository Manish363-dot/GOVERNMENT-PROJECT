import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, User, LogOut, ArrowLeft } from 'lucide-react';
import { OfficialGovTopBar } from '@/components/OfficialGovTopBar';
import { PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const RentalNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();
  const { language, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  return (
    <OfficialGovTopBar>
      {/* 🏛️ Commercial Asset & Rental White Navbar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        {/* Uttarakhand Accent Tricolor Line */}
        <div className="uk-tricolor-line" />

        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-12">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
            {/* Brand Logo & Title on Left (Matches Safai & Main Portal) */}
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
                  <span className="font-poppins font-bold text-navy-900 text-[13px] sm:text-base xl:text-lg 2xl:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                    {isHi ? 'संपत्ति एवं किराया प्रकोष्ठ' : 'Commercial Asset & Rental Cell'}
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center justify-end gap-1 2xl:gap-2 shrink-0 ml-auto mr-3 xl:mr-4 2xl:mr-6">
              {/* Back to Main Zila Panchayat Portal */}
              <Link
                to="/"
                className="px-2.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs mr-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHi ? 'मुख्य पोर्टल' : 'Main Portal'}</span>
              </Link>
              <Link
                to="/rental"
                className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
              >
                {t.nav.home}
              </Link>
              <Link
                to="/rental/check-status"
                className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{isHi ? 'किराया स्थिति' : 'Check Rent Status'}</span>
              </Link>
              <a
                href="#notices"
                className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                <span>{t.nav.notices}</span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                  {t.common.newBadge}
                </span>
              </a>
              <a
                href="/contact"
                className="px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
              >
                {t.nav.contact}
              </a>
            </nav>

            {/* Desktop Action Buttons: Admin Login only */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2.5 shrink-0 md:ml-auto xl:ml-0 whitespace-nowrap">
                <Link
                  to="/rental/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-xs font-bold text-blue-950 hover:bg-blue-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span className="max-w-[140px] truncate">{user.name || 'Admin'}</span>
                  <span className="text-[10px] bg-navy-900 text-white font-bold px-1.5 py-0.2 rounded">
                    Dashboard
                  </span>
                </Link>
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
                  to="/rental/signin?role=admin"
                  className="inline-flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap shrink-0 transition-colors shadow-xs cursor-pointer"
                >
                  <span>{isHi ? 'विभागीय लॉगिन (Admin)' : 'Admin Login'}</span>
                </Link>
              </div>
            )}

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-md text-navy-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
            <Link
              to="/rental"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {t.nav.home}
            </Link>
            <Link
              to="/rental/check-status"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {isHi ? 'किराया स्थिति' : 'Check Rent Status'}
            </Link>
            <a
              href="#notices"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {t.nav.notices}
            </a>
            <a
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {t.nav.contact}
            </a>

            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center justify-between p-2.5 bg-slate-200/80 rounded-md text-xs font-bold text-navy-900">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                      <span className="truncate">{user.name}</span>
                    </div>
                    <span className="text-[10px] bg-navy-900 text-white px-2 py-0.5 rounded uppercase">
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
                <Link
                  to="/rental/signin?role=admin"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center bg-navy-900 hover:bg-navy-800 py-2.5 rounded-lg font-bold text-xs text-white shadow-xs"
                >
                  {isHi ? 'विभागीय लॉगिन (Admin Login)' : 'Admin Login'}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </OfficialGovTopBar>
  );
};

export default RentalNavbar;
