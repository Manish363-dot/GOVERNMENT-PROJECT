import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { X, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { OfficialGovTopBar } from '@/components/OfficialGovTopBar';
import { PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const RentalNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));
  const isAdmin = Boolean(
    isAuthenticated &&
      (user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN' || user?.adminRole)
  );

  return (
    <OfficialGovTopBar>
      {/* 🏛️ Commercial Asset & Rental White Navbar (Matches SWM Navbar exactly) */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        {/* Uttarakhand Accent Tricolor Line */}
        <div className="uk-tricolor-line" />

        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-12">
          <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
            
            {/* Brand Logo & Title on Left (Matches Safai & Main Portal) */}
            <div className="flex items-center justify-start shrink-0 mr-2 xl:mr-3 2xl:mr-6">
              <Link to="/rental" className="flex items-center gap-2 sm:gap-3 group">
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
                    {isHi ? 'वाणिज्यिक परिसंपत्ति एवं किराया प्रकोष्ठ' : 'Commercial Asset & Rental Cell'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links (Exact SWM Navbar fonts, weights and sizes) */}
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
                className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{isHi ? 'मुख्य पृष्ठ' : 'Home'}</span>
              </Link>
              <Link
                to="/rental/check-status"
                className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{isHi ? 'किराया स्थिति' : 'Check Rent Status'}</span>
              </Link>
              <a
                href="#notices"
                className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{isHi ? 'सूचनाएं' : 'Notices'}</span>
              </a>
              <Link
                to="/contact"
                className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap"
              >
                <span>{isHi ? 'संपर्क' : 'Contact Us'}</span>
              </Link>
            </nav>

            {/* Desktop Action Buttons: Exactly matching SWM Navbar Button design */}
            <div className="hidden md:flex items-center justify-end gap-2.5 shrink-0 md:ml-auto xl:ml-0 whitespace-nowrap">
              {isAdmin ? (
                <>
                  <Button
                    size="sm"
                    className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0"
                    asChild
                  >
                    <Link to="/rental/admin/dashboard">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? 'विभागीय डैशबोर्ड' : 'Admin Dashboard'}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isHi ? 'लॉगआउट' : 'Logout'}</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  asChild
                >
                  <Link to="/rental/signin?role=admin">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? 'विभागीय लॉगिन' : 'Admin Login'}</span>
                  </Link>
                </Button>
              )}
            </div>

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
              {isHi ? 'मुख्य पृष्ठ' : 'Home'}
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
              {isHi ? 'सूचनाएं' : 'Notices'}
            </a>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {isHi ? 'संपर्क' : 'Contact Us'}
            </Link>

            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
              {isAdmin ? (
                <>
                  <Button
                    size="sm"
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center justify-center gap-2"
                    asChild
                  >
                    <Link to="/rental/admin/dashboard" onClick={() => setMobileOpen(false)}>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? 'विभागीय डैशबोर्ड' : 'Admin Dashboard'}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    <span>{isHi ? 'लॉगआउट करें' : 'Sign Out'}</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center justify-center gap-2"
                  asChild
                >
                  <Link to="/rental/signin?role=admin" onClick={() => setMobileOpen(false)}>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? 'विभागीय लॉगिन (Admin Login)' : 'Admin Login'}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </OfficialGovTopBar>
  );
};

export default RentalNavbar;
