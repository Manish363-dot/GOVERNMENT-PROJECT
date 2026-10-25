import React from 'react';
import { TopBarLogos } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { PhoneCall, Menu } from 'lucide-react';

interface RentalAdminNavbarProps {
  onMobileMenuToggle?: () => void;
  showMobileToggle?: boolean;
}

export const RentalAdminNavbar: React.FC<RentalAdminNavbarProps> = ({
  onMobileMenuToggle,
  showMobileToggle = true,
}) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  return (
    <div className="w-full select-none">
      {/* ───────────────────────────────────────────────────────────────────────
          Official Government Logos Top Strip (Stable, No Flickering)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-[#faf8f5] border-b border-slate-200/80">
        <TopBarLogos variant="public" />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          Sticky Header - Official Government Strip
      ──────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex flex-col shadow-xs">
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between">
            {/* Left: Mobile Sidebar Button + State Badge & Department */}
            <div className="flex items-center gap-2 font-medium">
              {showMobileToggle && (
                <button
                  onClick={onMobileMenuToggle}
                  className="md:hidden p-1 rounded hover:bg-navy-800 text-slate-300 mr-1"
                  title="Toggle Navigation Menu"
                >
                  <Menu className="w-4 h-4 text-amber-400" />
                </button>
              )}
              <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-ukgreen-900/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                {t('nav.govBadgeHi', 'उत्तराखण्ड शासन')}
              </span>
              <span className="hidden md:inline text-slate-300">|</span>
              <span className="hidden sm:inline text-slate-300">
                {isHi
                  ? 'वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन प्रकोष्ठ'
                  : 'Commercial Asset & Rental Management Cell'}
              </span>
            </div>

            {/* Right: Toll Free Helpline & Language Switcher */}
            <div className="flex items-center gap-4 text-slate-300">
              <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>
                  {t('nav.helpline', 'टोल फ्री हेल्पलाइन')}:{' '}
                  <strong className="text-white">1800-185-1850</strong>
                </span>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default RentalAdminNavbar;
