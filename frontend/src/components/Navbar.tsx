import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Menu, X, ShieldCheck, PhoneCall } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TopBarLogos } from '@/components/TopBarLogos';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/#about' },
    { name: t('nav.complaint'), href: '/#complaint' },
    { name: t('nav.contact'), href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Top-most 4 Logos Strip (2 Left, 2 Right) */}
      <TopBarLogos variant="public" />

      {/* 2. Official Government Strip */}
      <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

      {/* Uttarakhand Flag/Accent Tricolor Bar */}
      <div className="uk-tricolor-line" />

      {/* Main Header Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg shadow-xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-poppins font-bold text-navy-900 text-lg sm:text-xl tracking-tight leading-none">
                  {t('nav.brandName')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-ukgreen-800 tracking-wide uppercase block mt-0.5">
                {t('nav.brandTagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
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
          <div className="hidden md:flex items-center gap-3">
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
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
    </header>
  );
}
