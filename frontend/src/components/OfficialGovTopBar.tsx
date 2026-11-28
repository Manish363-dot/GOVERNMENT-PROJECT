import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopBarLogos } from '@/components/TopBarLogos';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface OfficialGovTopBarProps {
  children?: React.ReactNode;
  subtitle?: string;
}

/**
 * 🏛️ Unified Government Top Bar Component
 * Single Source of Truth for:
 * 1. Main Landing Portal
 * 2. Safai / SWM Portal
 * 3. Commercial Asset & Rental Portal
 */
export const OfficialGovTopBar: React.FC<OfficialGovTopBarProps> = ({ children, subtitle }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultSubtitle = isHi
    ? 'उत्तराखंड सरकार • जिला पंचायत डिजिटल सेवाएं'
    : 'Government of Uttarakhand • Zila Panchayat Digital Services';

  return (
    <>
      {/* ============================================================ */}
      {/* 1. TOP PANORAMIC LOGOS & SLOGAN BANNER (Scrolls away)        */}
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
      {/* 2. STICKY HEADER (Navy Strip + Portal Specific Navbar)       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-30 flex flex-col shadow-xs">
        {/* Official Government Strip */}
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            {/* Left: Gov Authority badge & subtitle */}
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                {t('nav.govBadgeHi', 'उत्तराखण्ड शासन')}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {subtitle || defaultSubtitle}
              </span>
            </div>

            {/* Right: Accessibility Toolbar & Language Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
              <AccessibilityToolbar />
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* 3. Portal Specific Main Navbar (Landing, SWM Safai, or Rental) */}
        {children}
      </header>
    </>
  );
};

export default OfficialGovTopBar;
