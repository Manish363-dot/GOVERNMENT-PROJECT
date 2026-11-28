import React from 'react';
import { Link } from 'react-router-dom';
import { TopBarLogos } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, ArrowLeft } from 'lucide-react';

interface RentalAdminNavbarProps {
  onMobileMenuToggle?: () => void;
  showMobileToggle?: boolean;
  onLogout?: () => void;
}

export const RentalAdminNavbar: React.FC<RentalAdminNavbarProps> = ({
  onMobileMenuToggle,
  showMobileToggle = true,
  onLogout,
}) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────────────
          Official Government Logos Top Strip (Stable, No Flickering)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="w-full select-none bg-[#faf8f5] border-b border-slate-200/80">
        <TopBarLogos variant="public" />
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          Sticky Header - Official Government Strip
      ──────────────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full select-none flex flex-col shadow-xs">
        <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800 shadow-sm">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between">
            {/* Left: State Badge & Department (Mobile-only drawer toggle) */}
            <div className="flex items-center gap-2 font-medium">
              {showMobileToggle && (
                <button
                  type="button"
                  onClick={onMobileMenuToggle}
                  className="md:hidden p-1 rounded hover:bg-navy-800 text-slate-300 mr-1 cursor-pointer"
                  title={isHi ? 'मेनू' : 'Menu'}
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

            {/* Right: Back to Rental Portal + Language Switcher + Logout Button */}
            <div className="flex items-center gap-2.5 text-slate-300">
              
              <Link
                to="/rental"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-navy-800/80 hover:bg-navy-700 text-amber-300 border border-slate-700/70 text-[11px] font-bold transition"
                title={isHi ? 'किराया पोर्टल पर वापस जाएं' : 'Back to Rental Portal'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isHi ? 'किराया पोर्टल' : 'Back to Rental Portal'}
                </span>
              </Link>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-900/70 hover:bg-red-800 text-red-100 border border-red-700/70 text-[11px] font-bold transition cursor-pointer"
                  title={isHi ? 'लॉगआउट' : 'Logout'}
                >
                  <LogOut className="w-3.5 h-3.5 text-red-300" />
                  <span>{isHi ? 'लॉगआउट' : 'Logout'}</span>
                </button>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default RentalAdminNavbar;
