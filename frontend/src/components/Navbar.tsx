import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ShieldCheck, PhoneCall } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const Navbar = React.memo(() => {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo(() => [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/#about' },
    { name: t('nav.Notices'), href: '/#Notices' },
    { name: t('nav.documents'), href: '/#documents' },
    { name: t('nav.complaint'), href: '/#complaint' },
    { name: t('nav.contact'), href: '/#contact' },
  ], [t]);

  return (
    <>
      {/* Top Bar - Non-Sticky (Smoothly hides on scroll) */}
      <div className={`grid transition-all duration-500 ease-in-out ${isScrolled ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
        <div className="overflow-hidden bg-white">
          {/* 1. Top-most 4 Logos Strip (2 Left, 2 Right) */}
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo & Identity */}
          <div className="flex flex-1 justify-start">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-poppins font-bold text-navy-900 text-[15px] sm:text-xl tracking-tight leading-none mb-[2px] sm:mb-0 whitespace-nowrap">
                {t('nav.brandName')}
              </span>
              <span className="text-[8px] sm:text-[11px] font-bold text-ukgreen-800 tracking-wide uppercase leading-[1.1] sm:mt-0.5 max-w-[190px] sm:max-w-none whitespace-nowrap">
                {t('nav.brandTagline')}
              </span>
            </div>
          </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center justify-center gap-1 xl:pl-24 2xl:pl-40">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            {user && profile ? (
              <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold flex items-center gap-2" asChild>
                <Link to="/dashboard">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" className="border-slate-300 text-navy-900 hover:bg-slate-50 font-bold" asChild>
                  <Link to="/signup">{t('nav.adminSignUp')}</Link>
                </Button>
                <Button size="sm" className="bg-navy-900 hover:bg-navy-800 text-white shadow-xs font-bold" asChild>
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
        className={`md:hidden transition-all duration-200 overflow-hidden bg-slate-50 border-t border-slate-200 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-slate-700 hover:text-navy-900 hover:bg-slate-200 rounded-md"
            >
              {link.name}
            </a>
          ))}
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
