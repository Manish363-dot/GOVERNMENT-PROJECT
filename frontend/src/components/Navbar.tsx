import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ShieldCheck, PhoneCall, ChevronDown, FileText, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = React.memo(() => {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [complaintDropdownOpen, setComplaintDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [bylawsDropdownOpen, setBylawsDropdownOpen] = useState(false);
  const bylawsDropdownRef = useRef<HTMLDivElement>(null);
  const bylawsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mobileBylawsOpen, setMobileBylawsOpen] = useState(false);

  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setComplaintDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setComplaintDropdownOpen(false);
    }, 160);
  };

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current);
      aboutTimeoutRef.current = null;
    }
    setAboutDropdownOpen(true);
  };

  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setAboutDropdownOpen(false);
    }, 160);
  };

  const handleBylawsMouseEnter = () => {
    if (bylawsTimeoutRef.current) {
      clearTimeout(bylawsTimeoutRef.current);
      bylawsTimeoutRef.current = null;
    }
    setBylawsDropdownOpen(true);
  };

  const handleBylawsMouseLeave = () => {
    bylawsTimeoutRef.current = setTimeout(() => {
      setBylawsDropdownOpen(false);
    }, 160);
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setComplaintDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
      if (bylawsDropdownRef.current && !bylawsDropdownRef.current.contains(event.target as Node)) {
        setBylawsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
      if (bylawsTimeoutRef.current) clearTimeout(bylawsTimeoutRef.current);
    };
  }, []);


  return (
    <>
      {/* Top Bar - Non-Sticky (Smoothly hides on scroll) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isScrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
        <div className="overflow-hidden bg-[#faf8f5]">
          {/* 1. Top Panoramic Header Banner */}
          <TopBarLogos variant="public" />
        </div>
      </div>

      {/* Sticky Container */}
      <header className="sticky top-0 z-50 flex flex-col">
        {/* 2. Official Government Strip (Sticky) */}
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-ukgreen-900/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {t('nav.govBadgeHi')}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {t('nav.govSubtitle')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>{t('nav.helpline')}: <strong className="text-white">1800-185-1850</strong></span>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Main Navbar - Sticky */}
        <div className="bg-white border-b border-slate-200 shadow-xs">
          {/* Uttarakhand Flag/Accent Tricolor Bar */}
          <div className="uk-tricolor-line" />
      
      {/* Main Header Brand & Navigation */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center justify-start shrink-0 mr-2 xl:mr-3 2xl:mr-6">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-poppins font-bold text-navy-900 text-[13px] sm:text-base xl:text-lg 2xl:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                {t('nav.brandName')}
              </span>
            </div>
          </Link>
          </div>

          {/* Desktop Navigation Links (Shifted to Right) */}
          <nav className="hidden xl:flex items-center justify-end gap-0.5 2xl:gap-1.5 shrink-0 ml-auto mr-3 xl:mr-4 2xl:mr-6">
            {/* Home Link */}
            <Link
              to="/"
              className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              {t('nav.home')}
            </Link>

            {/* About Dropdown Menu (Our Initiative, Vision & Mission, Staff Directory) */}
            <div 
              className="relative" 
              ref={aboutDropdownRef}
              onMouseEnter={handleAboutMouseEnter}
              onMouseLeave={handleAboutMouseLeave}
            >
              <button
                type="button"
                onClick={() => setAboutDropdownOpen((prev) => !prev)}
                className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${
                  aboutDropdownOpen 
                    ? 'text-navy-900 bg-slate-100' 
                    : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                }`}
                aria-expanded={aboutDropdownOpen}
              >
                <span className="whitespace-nowrap">{t('nav.about')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${aboutDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
              </button>

              {/* Dropdown Popover with Smooth CSS Transition & Zero-gap hover hit area */}
              <div 
                className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${
                  aboutDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' 
                    : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="w-56 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                  {/* Option 1: Our Initiative (Separate Dedicated Page) */}
                  <Link
                    to="/our-initiative"
                    onClick={() => {
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {isHi ? 'हमारी पहल' : 'Our Initiative'}
                  </Link>

                  {/* Option 2: Our Vision & Mission (Separate Dedicated Page) */}
                  <Link
                    to="/vision-mission"
                    onClick={() => {
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {isHi ? 'विज़न और मिशन' : 'Our Vision & Mission'}
                  </Link>

                  {/* Option 3: Staff & Officers Directory (Separate Dedicated Page) */}
                  <Link
                    to="/staff-directory"
                    onClick={() => {
                      setAboutDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Notices Link */}
            <a
              href="/#Notices"
              className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              <span className="whitespace-nowrap">{t('nav.Notices')}</span>
            </a>

            {/* Bylaws & Rules Dropdown Menu */}
            <div 
              className="relative" 
              ref={bylawsDropdownRef}
              onMouseEnter={handleBylawsMouseEnter}
              onMouseLeave={handleBylawsMouseLeave}
            >
              <button
                type="button"
                onClick={() => setBylawsDropdownOpen((prev) => !prev)}
                className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${
                  bylawsDropdownOpen 
                    ? 'text-navy-900 bg-slate-100' 
                    : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                }`}
                aria-expanded={bylawsDropdownOpen}
              >
                <span className="whitespace-nowrap">{t('nav.documents', isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${bylawsDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
              </button>

              {/* Dropdown Popover */}
              <div 
                className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${
                  bylawsDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' 
                    : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="w-64 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                  {/* Option 1: Cleanliness Bylaws */}
                  <Link
                    to="/cleanliness-bylaws"
                    onClick={() => {
                      setBylawsDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-navy-900">
                        {isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws — 2023'}
                      </span>
                    </div>
                  </Link>

                  {/* Option 2: Solid Waste Management Rules 2026 */}
                  <Link
                    to="/swm-rules-2026"
                    onClick={() => {
                      setBylawsDropdownOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="block px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-navy-900">
                        {isHi ? 'ठोस अपशिष्ट प्रबंधन नियम, 2026' : 'Solid Waste Management Rules 2026'}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Complaint Dropdown Menu (Do Complaint & Track) */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setComplaintDropdownOpen((prev) => !prev)}
                className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${
                  complaintDropdownOpen 
                    ? 'text-navy-900 bg-slate-100' 
                    : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                }`}
                aria-expanded={complaintDropdownOpen}
              >
                <span className="whitespace-nowrap">{t('nav.complaint')}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${complaintDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
              </button>

              {/* Dropdown Popover with Smooth CSS Transition & Zero-gap hover hit area */}
              <div 
                className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${
                  complaintDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto' 
                    : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                }`}
              >
                <div className="w-48 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden">
                  {/* Option 1: Do Complaint */}
                  <Link
                    to="/complaint?tab=submit"
                    onClick={() => setComplaintDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors border-b border-slate-100 whitespace-nowrap"
                  >
                    {isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}
                  </Link>

                  {/* Option 2: Track Complaint */}
                  <Link
                    to="/complaint?tab=track"
                    onClick={() => setComplaintDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {isHi ? 'शिकायत ट्रैक करें' : 'Track Status'}
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Us Link */}
            <Link
              to="/contact"
              className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              <span className="whitespace-nowrap">{t('nav.contact')}</span>
            </Link>
          </nav>

          {/* Desktop Actions */}
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
                  <Link to="/signup">{t('nav.adminSignUp')}</Link>
                </Button>
                <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold whitespace-nowrap shrink-0" asChild>
                  <Link to="/signin">{t('nav.signIn')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-navy-900 hover:bg-slate-100 transition-colors"
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

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-200 overflow-hidden bg-slate-50 border-t border-slate-200 ${mobileOpen ? 'max-h-[46rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1">
          {/* Mobile Home */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
          >
            {t('nav.home')}
          </Link>

          {/* Mobile About Dropdown (Collapsible, No Icons, No Subcontent) */}
          <div className="py-0.5">
            <button
              type="button"
              onClick={() => setMobileAboutOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              <span>{t('nav.about')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
            </button>

            {/* Collapsible Dropdown Options */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                mobileAboutOpen ? 'max-h-48 opacity-100 pl-4 pr-2 py-1 space-y-1' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <Link
                to="/our-initiative"
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                {isHi ? 'हमारी पहल' : 'Our Initiative'}
              </Link>

              <Link
                to="/vision-mission"
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                {isHi ? 'विज़न और मिशन' : 'Our Vision & Mission'}
              </Link>

              <Link
                to="/staff-directory"
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
              </Link>
            </div>
          </div>

          {/* Mobile Notices */}
          <a
            href="/#Notices"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
          >
            {t('nav.Notices')}
          </a>

          {/* Mobile Bylaws & Rules Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setMobileBylawsOpen((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md transition-colors"
            >
              <span>{t('nav.documents', isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileBylawsOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
            </button>

            {/* Collapsible Dropdown Options */}
            <div
              className={`overflow-hidden transition-all duration-200 ease-in-out ${
                mobileBylawsOpen ? 'max-h-48 opacity-100 pl-4 pr-2 py-1 space-y-1' : 'max-h-0 opacity-0 pointer-events-none'
              }`}
            >
              <Link
                to="/cleanliness-bylaws"
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                {isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws — 2023'}
              </Link>

              <Link
                to="/swm-rules-2026"
                onClick={() => {
                  setMobileOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200/60 rounded-md transition-colors"
              >
                {isHi ? 'ठोस अपशिष्ट प्रबंधन नियम, 2026' : 'Solid Waste Management Rules 2026'}
              </Link>
            </div>
          </div>

          {/* Mobile Complaint Options */}
          <div className="border-y border-slate-200/80 my-2 py-2 bg-white/60 rounded-xl px-2">
            <div className="px-2 pb-1 text-[11px] font-extrabold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t('nav.complaint')}</span>
            </div>
            <div className="space-y-1 mt-1">
              <Link
                to="/complaint?tab=submit"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
              >
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>{isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}</span>
              </Link>
              <Link
                to="/complaint?tab=track"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
              >
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <span>{isHi ? 'शिकायत ट्रैक करें' : 'Track Complaint'}</span>
              </Link>
            </div>
          </div>

          {/* Mobile Contact Link */}
          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
          >
            {t('nav.contact')}
          </Link>

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-200 mt-2">
            {user && profile ? (
              <Button size="sm" className="w-full justify-center bg-navy-900 text-white font-bold flex items-center gap-2" asChild>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="w-full justify-center" asChild>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>{t('nav.adminSignUp')}</Link>
                </Button>
                <Button size="sm" className="w-full justify-center bg-navy-900 text-white" asChild>
                  <Link to="/signin" onClick={() => setMobileOpen(false)}>{t('nav.signIn')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </header>
    </>
  );
});

