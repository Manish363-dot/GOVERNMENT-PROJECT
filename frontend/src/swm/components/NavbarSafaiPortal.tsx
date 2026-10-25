import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ShieldCheck, PhoneCall, ChevronDown, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const NavbarSafaiPortal = React.memo(() => {
  const { user, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileBylawsOpen, setMobileBylawsOpen] = useState(false);
  const [mobileComplaintOpen, setMobileComplaintOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dropdown states & timeout refs
  const [bylawsDropdownOpen, setBylawsDropdownOpen] = useState(false);
  const bylawsDropdownRef = useRef<HTMLDivElement>(null);
  const bylawsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [complaintDropdownOpen, setComplaintDropdownOpen] = useState(false);
  const complaintDropdownRef = useRef<HTMLDivElement>(null);
  const complaintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBylawsMouseEnter = () => {
    if (bylawsTimeoutRef.current) clearTimeout(bylawsTimeoutRef.current);
    setBylawsDropdownOpen(true);
  };
  const handleBylawsMouseLeave = () => {
    bylawsTimeoutRef.current = setTimeout(() => setBylawsDropdownOpen(false), 160);
  };

  const handleComplaintMouseEnter = () => {
    if (complaintTimeoutRef.current) clearTimeout(complaintTimeoutRef.current);
    setComplaintDropdownOpen(true);
  };
  const handleComplaintMouseLeave = () => {
    complaintTimeoutRef.current = setTimeout(() => setComplaintDropdownOpen(false), 160);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bylawsDropdownRef.current && !bylawsDropdownRef.current.contains(target)) {
        setBylawsDropdownOpen(false);
      }
      if (complaintDropdownRef.current && !complaintDropdownRef.current.contains(target)) {
        setComplaintDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (bylawsTimeoutRef.current) clearTimeout(bylawsTimeoutRef.current);
      if (complaintTimeoutRef.current) clearTimeout(complaintTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Top Bar - Non-Sticky (Smoothly hides on scroll) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isScrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
        <div className="overflow-hidden bg-[#faf8f5]">
          <TopBarLogos variant="public" />
        </div>
      </div>

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 flex flex-col">
        {/* Official Government Strip */}
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-ukgreen-900/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                {t('nav.govBadgeHi', 'उत्तराखण्ड शासन')}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {isHi ? 'ठोस अपशिष्ट प्रबंधन एवं नागरिक शिकायत निवारण प्रकोष्ठ' : 'Solid Waste Management & Grievance Cell'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>{t('nav.helpline', 'टोल फ्री हेल्पलाइन')}: <strong className="text-white">1800-185-1850</strong></span>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="bg-white border-b border-slate-200 shadow-xs">
          <div className="uk-tricolor-line" />

          <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-12">
            <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
              
              {/* Brand Identity */}
              <div className="flex items-center justify-start shrink-0 mr-2 xl:mr-3 2xl:mr-6">
                <Link to="/safai-portal" className="flex items-center gap-2 sm:gap-3 group">
                  <img 
                    src={PANCHAYATI_RAJ_LOGO_URL} 
                    alt="Safai Portal Logo" 
                    className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs shrink-0" 
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-poppins font-bold text-navy-900 text-[13px] sm:text-base xl:text-lg 2xl:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                      {isHi ? 'ठोस अपशिष्ट प्रबंधन प्रकोष्ठ' : 'Solid Waste Management Cell'}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden xl:flex items-center justify-end gap-1 2xl:gap-2 shrink-0 ml-auto mr-3 xl:mr-4 2xl:mr-6">
                
                {/* 1. Back to Main Zila Panchayat Portal */}
                <Link
                  to="/"
                  className="px-2.5 py-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5 shadow-2xs mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHi ? 'मुख्य पोर्टल' : 'Main Portal'}</span>
                </Link>

                {/* 3. Bylaws & Rules Dropdown */}
                <div
                  className="relative"
                  ref={bylawsDropdownRef}
                  onMouseEnter={handleBylawsMouseEnter}
                  onMouseLeave={handleBylawsMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setBylawsDropdownOpen((prev) => !prev)}
                    className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${bylawsDropdownOpen
                      ? 'text-navy-900 bg-slate-100'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                      }`}
                    aria-expanded={bylawsDropdownOpen}
                  >
                    <span>{isHi ? 'उपनियम व नियम' : 'Bylaws & Rules'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${bylawsDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${bylawsDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                      }`}
                  >
                    <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                      <Link
                        to="/cleanliness-bylaws"
                        onClick={() => setBylawsDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws — 2023'}
                      </Link>
                      <Link
                        to="/swm-rules-2026"
                        onClick={() => setBylawsDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'ठोस अपशिष्ट प्रबंधन नियम, 2026' : 'Solid Waste Management Rules 2026'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 4. Complaint Dropdown Menu */}
                <div
                  className="relative"
                  ref={complaintDropdownRef}
                  onMouseEnter={handleComplaintMouseEnter}
                  onMouseLeave={handleComplaintMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setComplaintDropdownOpen((prev) => !prev)}
                    className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${complaintDropdownOpen
                      ? 'text-navy-900 bg-slate-100'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                      }`}
                    aria-expanded={complaintDropdownOpen}
                  >
                    <span className="text-amber-700 font-extrabold">{isHi ? 'शिकायत' : 'Complaints'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${complaintDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${complaintDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                      }`}
                  >
                    <div className="w-52 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                      <Link
                        to="/complaint?tab=submit"
                        onClick={() => setComplaintDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}
                      </Link>
                      <Link
                        to="/complaint?tab=track"
                        onClick={() => setComplaintDropdownOpen(false)}
                        className="flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'शिकायत की स्थिति जांचें' : 'Track Status'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 5. Daily Work */}
                <a
                  href="/safai-portal#daily-work"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  <span>{isHi ? 'दैनिक कार्य' : 'Daily Work'}</span>
                </a>

                {/* 6. Swachhata Pledge */}
                <a
                  href="/safai-portal#pledge"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-colors whitespace-nowrap"
                >
                  <span>{isHi ? 'स्वच्छता शपथ' : 'Swachhata Pledge'}</span>
                </a>
              </nav>

              {/* Desktop Actions: Admin Login / Sign In ONLY on Safai Portal */}
              <div className="hidden md:flex items-center justify-end gap-2.5 shrink-0 md:ml-auto xl:ml-0 whitespace-nowrap">
                {user && profile ? (
                  <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0" asChild>
                    <Link to="/dashboard">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      Admin Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="border-slate-300 text-navy-900 hover:bg-slate-50 font-bold whitespace-nowrap shrink-0" asChild>
                      <Link to="/signup">{t('nav.adminSignUp', 'पंजीकरण')}</Link>
                    </Button>
                    <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold whitespace-nowrap shrink-0" asChild>
                      <Link to="/signin">{t('nav.signIn', 'लॉगिन')}</Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile/Tablet Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-md text-navy-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : (
                  <div className="flex flex-col gap-[4px] w-6 h-6 justify-center items-center">
                    <span className="w-6 h-[2.5px] bg-[#FF9933] rounded-full" />
                    <span className="w-6 h-[2.5px] bg-slate-300 rounded-full" />
                    <span className="w-6 h-[2.5px] bg-[#138808] rounded-full" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu for Safai Portal */}
          <div
            className={`xl:hidden transition-all duration-200 overflow-hidden bg-slate-50 border-t border-slate-200 ${mobileOpen ? 'max-h-[50rem] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-4 pb-4 pt-2 space-y-1">
              {/* Back to Main Portal */}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-900 bg-blue-100/70 hover:bg-blue-100 rounded-md mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isHi ? 'मुख्य जिला पंचायत पोर्टल' : 'Back to Main Portal'}</span>
              </Link>

              <a
                href="/safai-portal#about-swm"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {isHi ? 'सफाई प्रकोष्ठ परिचय' : 'About SWM'}
              </a>

              {/* Mobile Bylaws & Rules */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileBylawsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
                >
                  <span>{isHi ? 'उपनियम व नियम' : 'Bylaws & Rules'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileBylawsOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileBylawsOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1">
                    <Link
                      to="/cleanliness-bylaws"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws 2023'}
                    </Link>
                    <Link
                      to="/swm-rules-2026"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'ठोस अपशिष्ट नियम 2026' : 'SWM Rules 2026'}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Complaint */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileComplaintOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md"
                >
                  <span>{isHi ? 'शिकायत निवारण' : 'Complaints'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileComplaintOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileComplaintOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1">
                    <Link
                      to="/complaint?tab=submit"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}
                    </Link>
                    <Link
                      to="/complaint?tab=track"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'शिकायत की स्थिति जांचें' : 'Track Status'}
                    </Link>
                  </div>
                )}
              </div>

              <a
                href="/safai-portal#daily-work"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {isHi ? 'दैनिक सफाई कार्य' : 'Daily Work'}
              </a>

              <a
                href="/safai-portal#pledge"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200 rounded-md"
              >
                {isHi ? 'स्वच्छता शपथ' : 'Swachhata Pledge'}
              </a>

              {/* Admin Login on Mobile (Safai Portal Only) */}
              <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
                {user && profile ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-navy-900 rounded-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      to="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-2 text-xs font-bold text-white bg-navy-900 rounded-md"
                    >
                      {t('nav.signIn', 'लॉगिन')}
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-2 text-xs font-bold text-navy-900 bg-white border border-slate-300 rounded-md"
                    >
                      {t('nav.adminSignUp', 'पंजीकरण')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
});

NavbarSafaiPortal.displayName = 'NavbarSafaiPortal';
