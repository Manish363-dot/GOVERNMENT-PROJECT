import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Menu, X, Bell, User, ShieldCheck, LogOut,
  LayoutDashboard, MapPin, History, MessageSquareWarning,
  Truck, Radio, Settings
} from 'lucide-react';
import { TopBarLogos } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड', to: '/dashboard' },
  { icon: MapPin, label: 'Tracking', labelHi: 'लाइव ट्रैकिंग', to: '/dashboard/tracking' },
  { icon: History, label: 'History', labelHi: 'इतिहास', to: '/dashboard/history' },
  { icon: MessageSquareWarning, label: 'Grievances', labelHi: 'शिकायतें', to: '/dashboard/complaints' },
  { icon: Truck, label: 'Vehicles', labelHi: 'वाहन', to: '/dashboard/vehicles' }
];

export function TopHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm flex flex-col w-full">
      {/* Top Logos Strip */}
      <TopBarLogos variant="dashboard" className="border-b border-slate-200 bg-white hidden sm:flex" />

      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 bg-navy-900 border-b border-navy-800">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : (
              <div className="flex flex-col gap-[3.5px] w-5 h-5 justify-center items-center">
                <span className="w-5 h-[2px] bg-[#FF9933] rounded-full" />
                <span className="w-5 h-[2px] bg-white rounded-full" />
                <span className="w-5 h-[2px] bg-[#138808] rounded-full" />
              </div>
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded shrink-0" />
            <div>
              <p className="text-[16px] sm:text-[16px] font-bold text-white leading-none uppercase tracking-wide">
                {t('admin.nav.controlPanel')}
              </p>
              <div className="hidden sm:flex items-center gap-2 mt-0.5 text-[10px] sm:text-[12px] text-slate-300 font-mono">
                <span><p className="text-[11px] text-slate-300 font-mono mt-0.5">
              {t('admin.nav.portalTitle')} |
              </p></span>
                <span className="text-emerald-400 font-semibold">{format(now, 'EEEE, dd MMM yyyy • hh:mm:ss a')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + User */}
        <div className="flex items-center gap-4">

          <div className="w-px h-6 bg-navy-700 hidden sm:block" />

          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          <div className="w-px h-6 bg-navy-700 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-bold text-white leading-none">{profile?.full_name || 'Admin Officer'}</p>
            </div>
            <div className="w-8 h-8 rounded bg-navy-800 border border-navy-700 text-amber-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Bar */}
      <div className="bg-navy-900 border-b border-navy-800 hidden lg:block">
        <nav className="flex items-center justify-center px-4 sm:px-6 overflow-x-auto w-full max-w-6xl mx-auto" style={{ scrollbarWidth: 'none' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center gap-2 px-6 py-3 text-[11px] uppercase tracking-wider font-semibold transition-colors border-b-2 whitespace-nowrap min-w-[120px]',
                  isActive
                    ? 'text-white border-amber-400 bg-navy-800/80'
                    : 'text-slate-300 border-transparent hover:text-white hover:bg-navy-800/40'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'w-3.5 h-3.5 shrink-0',
                      isActive ? 'text-amber-400' : 'text-slate-400'
                    )}
                  />
                  <div className="flex flex-col items-center justify-center leading-none">
                    <span>{t(`admin.nav.${item.to.split('/').pop() || 'dashboard'}`)}</span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-900 border-b border-navy-800">
          <nav className="flex flex-col py-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-6 py-2.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'text-white bg-navy-800/80 border-l-2 border-amber-400'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/40 border-l-2 border-transparent'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-amber-400' : 'text-slate-400'
                      )}
                    />
                    <div className="flex gap-2 items-center">
                      <span>{t(`admin.nav.${item.to.split('/').pop() || 'dashboard'}`)}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
            <div className="w-full bg-navy-800 h-px my-1" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>{t('admin.nav.signOut')}</span>
            </button>
          </nav>
        </div>
      )}

      {/* Bottom accent: tricolor strip */}
      <div className="h-[2px] w-full flex">
        <div className="flex-1 bg-ukgreen-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-uksaffron-600" />
      </div>
    </header>
  );
}
