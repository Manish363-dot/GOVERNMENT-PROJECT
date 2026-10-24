import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldCheck, PhoneCall, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useTranslation } from 'react-i18next';

export const NavbarLandingPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Dropdown states & timeout refs for smooth hover hit area
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAboutMouseEnter = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setAboutDropdownOpen(true);
  };
  const handleAboutMouseLeave = () => {
    aboutTimeoutRef.current = setTimeout(() => setAboutDropdownOpen(false), 160);
  };

  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setServicesDropdownOpen(true);
  };
  const handleServicesMouseLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setServicesDropdownOpen(false), 160);
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
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(target)) {
        setAboutDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(target)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
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
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                {t('nav.govBadgeHi', 'उत्तराखण्ड शासन')}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {t('nav.govSubtitle', 'पंचायती राज विभाग')}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>{t('nav.helpline', 'टोल फ्री हेल्पलाइन')}: <strong className="text-white">1800-185-1850</strong></span>
              </div>
              <span className="hidden xl:inline text-navy-700">|</span>
              <a
                href="/#social-engagement"
                className="hidden xl:flex items-center gap-1 text-[11px] text-slate-300 hover:text-amber-300 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isHi ? 'सोशल मीडिया' : 'Social Media'}</span>
              </a>
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
                <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                  <img 
                    src={PANCHAYATI_RAJ_LOGO_URL} 
                    alt="Zila Panchayat Almora Logo" 
                    className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs shrink-0" 
                  />
                  <div className="flex flex-col justify-center">
                    <span className="font-poppins font-bold text-navy-900 text-[13px] sm:text-base xl:text-lg 2xl:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                      {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-normal leading-tight hidden sm:block">
                      {isHi ? 'पंचायती राज विभाग • उत्तराखण्ड शासन' : 'Panchayati Raj Dept • Govt. of Uttarakhand'}
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden xl:flex items-center justify-end gap-1 2xl:gap-2 shrink-0 ml-auto mr-3 xl:mr-4 2xl:mr-6">
                
                {/* 1. Home Link */}
                <Link
                  to="/"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  {t('nav.home', 'मुख्य पृष्ठ')}
                </Link>

                {/* 2. About Dropdown Menu */}
                <div
                  className="relative"
                  ref={aboutDropdownRef}
                  onMouseEnter={handleAboutMouseEnter}
                  onMouseLeave={handleAboutMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setAboutDropdownOpen((prev) => !prev)}
                    className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${aboutDropdownOpen
                      ? 'text-navy-900 bg-slate-100'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                      }`}
                    aria-expanded={aboutDropdownOpen}
                  >
                    <span className="whitespace-nowrap">{t('nav.about', 'हमारे बारे में')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${aboutDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${aboutDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                      }`}
                  >
                    <div className="w-60 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                      <a
                        href="/#about-zp"
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'जिला पंचायत अल्मोड़ा - परिचय' : 'About Zila Panchayat Almora'}
                      </a>
                      <Link
                        to="/our-initiative"
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'हमारी पहल' : 'Our Initiative'}
                      </Link>
                      <Link
                        to="/vision-mission"
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'विज़न और मिशन' : 'Our Vision & Mission'}
                      </Link>
                      <Link
                        to="/staff-directory"
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
                      </Link>
                      <a
                        href="/#social-engagement"
                        onClick={() => setAboutDropdownOpen(false)}
                        className="block px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors"
                      >
                        {isHi ? 'सोशल मीडिया जुड़ाव' : 'Social Engagement'}
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Services Dropdown (2 options: Safai Portal & Rental System) */}
                <div
                  className="relative"
                  ref={servicesDropdownRef}
                  onMouseEnter={handleServicesMouseEnter}
                  onMouseLeave={handleServicesMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => setServicesDropdownOpen((prev) => !prev)}
                    className={`px-2.5 2xl:px-3 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer whitespace-nowrap ${servicesDropdownOpen
                      ? 'text-navy-900 bg-slate-100'
                      : 'text-slate-700 hover:text-navy-900 hover:bg-slate-100'
                      }`}
                    aria-expanded={servicesDropdownOpen}
                  >
                    <span className="whitespace-nowrap">{isHi ? 'सेवाएं व पोर्टल' : 'Services & Portals'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${servicesDropdownOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'}`} />
                  </button>

                  <div
                    className={`absolute top-full left-0 pt-1.5 z-50 transition-all duration-200 ease-out origin-top-left ${servicesDropdownOpen
                      ? 'opacity-100 scale-100 translate-y-0 visible pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 invisible pointer-events-none'
                      }`}
                  >
                    <div className="w-72 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden divide-y divide-slate-100">
                      <Link
                        to="/safai-portal"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-emerald-50/60 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                            {isHi ? 'ठोस अपशिष्ट एवं सफाई पोर्टल' : 'Safai & SWM Portal'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {isHi ? 'सक्रिय' : 'Live'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isHi ? 'कचरा प्रबंधन, जीपीएस ट्रैकिंग व शिकायत समाधान' : 'Waste collection, GPS fleet & grievances'}
                        </p>
                      </Link>

                      <Link
                        to="/rental"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="block px-4 py-3 hover:bg-blue-50/60 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700">
                            {isHi ? 'दुकान व परिसंपत्ति किराया प्रणाली' : 'Commercial Rental System'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            {isHi ? 'सक्रिय' : 'Live'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isHi ? 'दुकान आवंटन, लीज अनुबंध व ऑनलाइन किराया बिलिंग' : 'Shop allotment, lease & computerized rent'}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 4. 11 Blocks Link */}
                <a
                  href="/#blocks"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">{isHi ? '11 विकासखंड' : '11 Blocks'}</span>
                </a>

                {/* 5. Notices and Updates Link */}
                <a
                  href="/#notices"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">{isHi ? 'सूचनाएं एवं विज्ञप्तियां' : 'Notices & Updates'}</span>
                </a>

                {/* 6. Contact Link */}
                <Link
                  to="/contact"
                  className="px-2.5 2xl:px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">{t('nav.contact', 'संपर्क सूत्र')}</span>
                </Link>
              </nav>

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

          {/* Mobile Menu for Main Landing Page */}
          <div
            className={`xl:hidden transition-all duration-200 overflow-hidden bg-slate-50 border-t border-slate-200 ${mobileOpen ? 'max-h-[46rem] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className="px-4 pb-4 pt-2 space-y-1">
              {/* Quick Highlight to Safai Portal */}
              <Link
                to="/safai-portal"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-emerald-900 bg-emerald-100 rounded-lg mb-2"
              >
                <span>{isHi ? 'ठोस अपशिष्ट एवं सफाई पोर्टल' : 'Safai & SWM Portal'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              </Link>

              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {t('nav.home', 'मुख्य पृष्ठ')}
              </Link>

              {/* Mobile About */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileAboutOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
                >
                  <span>{t('nav.about', 'हमारे बारे में')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAboutOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1">
                    <a
                      href="/#about-zp"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'जिला पंचायत अल्मोड़ा - परिचय' : 'About Zila Panchayat Almora'}
                    </a>
                    <Link
                      to="/our-initiative"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'हमारी पहल' : 'Our Initiative'}
                    </Link>
                    <Link
                      to="/vision-mission"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'विज़न और मिशन' : 'Our Vision & Mission'}
                    </Link>
                    <Link
                      to="/staff-directory"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
                    </Link>
                    <a
                      href="/#social-engagement"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-navy-900 rounded-md"
                    >
                      {isHi ? 'सोशल मीडिया जुड़ाव' : 'Social Engagement'}
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile Services */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileServicesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
                >
                  <span>{isHi ? 'सेवाएं व पोर्टल' : 'Services & Portals'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileServicesOpen && (
                  <div className="pl-4 pr-2 py-1 space-y-1">
                    <Link
                      to="/safai-portal"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-md"
                    >
                      <span>{isHi ? 'ठोस अपशिष्ट एवं सफाई पोर्टल' : 'Safai & SWM Portal'}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </Link>
                    <Link
                      to="/rental"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50 rounded-md"
                    >
                      <span>{isHi ? 'दुकान व परिसंपत्ति किराया प्रणाली' : 'Rental System'}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        {isHi ? 'सक्रिय' : 'Live'}
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile 11 Blocks */}
              <a
                href="/#blocks"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {isHi ? '11 विकासखंड' : '11 District Blocks'}
              </a>

              {/* Mobile Notices */}
              <a
                href="/#notices"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {isHi ? 'सूचनाएं एवं विज्ञप्तियां' : 'Notices & Updates'}
              </a>

              {/* Mobile Contact */}
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
              >
                {t('nav.contact', 'संपर्क सूत्र')}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
});

NavbarLandingPage.displayName = 'NavbarLandingPage';
