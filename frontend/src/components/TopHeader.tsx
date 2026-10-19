import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Menu, X, Bell, User, ShieldCheck, LogOut,
  LayoutDashboard, MapPin, History, PlaySquare, MessageSquareWarning,
  Truck, Radio, Settings, Image
} from 'lucide-react';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, labelKey: 'admin.nav.dashboard', label: 'Dashboard', labelHi: 'डैशबोर्ड', to: '/dashboard' },
  { icon: MapPin, labelKey: 'admin.nav.tracking', label: 'Tracking', labelHi: 'लाइव ट्रैकिंग', to: '/dashboard/tracking' },
  { icon: History, labelKey: 'admin.nav.history', label: 'History', labelHi: 'इतिहास', to: '/dashboard/history' },
  { icon: PlaySquare, labelKey: 'admin.nav.routeReplay', label: 'Route Replay', labelHi: 'रूट रीप्ले', to: '/dashboard/route-replay' },
  { icon: MessageSquareWarning, labelKey: 'admin.nav.grievances', label: 'Grievances', labelHi: 'शिकायतें', to: '/dashboard/complaints' },
  { icon: Truck, labelKey: 'admin.nav.vehicles', label: 'Vehicles', labelHi: 'वाहन', to: '/dashboard/vehicles' },
  { icon: Image, labelKey: 'admin.nav.media', label: 'Media', labelHi: 'मीडिया', to: '/dashboard/media' }
];

export function TopHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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

  const isHi = i18n.language === 'hi';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-300 shadow-sm flex flex-col w-full">
        {/* Top Logos Strip */}
        <TopBarLogos variant="dashboard" className="border-b border-slate-200 flex" />

        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 px-3 sm:px-6 bg-navy-900 border-b border-navy-800">
          {/* Left: Mobile Menu + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              className="lg:hidden p-2 rounded text-slate-300 hover:bg-navy-800 hover:text-white transition-colors touch-target flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : (
                <div className="flex flex-col gap-[3.5px] w-5 h-5 justify-center items-center">
                  <span className="w-5 h-[2px] bg-[#FF9933] rounded-full" />
                  <span className="w-5 h-[2px] bg-white rounded-full" />
                  <span className="w-5 h-[2px] bg-[#138808] rounded-full" />
                </div>
              )}
            </button>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded shrink-0" />
              <div>
                <p className="text-xs sm:text-[16px] font-bold text-white leading-tight uppercase tracking-wide">
                  {isHi ? 'एडमिन नियंत्रण कक्ष' : 'Admin Control Panel'}
                </p>
                <div className="hidden sm:flex items-center gap-2 mt-0.5 text-[10px] sm:text-[12px] text-slate-300 font-mono">
                  <span><p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {isHi ? 'जिला पंचायत सफाई पोर्टल |' : 'Zila Panchayat Safai Portal |'}
                  </p></span>
                  <span className="text-emerald-400 font-semibold">{format(now, 'EEEE, dd MMM yyyy • hh:mm:ss a')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status + Language Switcher + User */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Hindi / English Language Switcher */}
            <div className="scale-90 sm:scale-100">
              <LanguageSwitcher />
            </div>

            <div className="w-px h-6 bg-navy-700 hidden sm:block" />

            {/* User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[11px] font-bold text-white leading-none">{profile?.full_name || (isHi ? 'प्रशासनिक अधिकारी' : 'Admin Officer')}</p>
              </div>
              <div className="w-8 h-8 rounded bg-navy-800 border border-navy-700 text-amber-400 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
              <button
                onClick={handleLogout}
                title={isHi ? 'साइन आउट' : 'Sign Out'}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors ml-0.5 touch-target flex items-center justify-center"
                aria-label="Sign Out"
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
                    <span>{isHi ? item.labelHi : item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom accent: tricolor strip */}
        <div className="h-[2px] w-full flex">
          <div className="flex-1 bg-ukgreen-600" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-uksaffron-600" />
        </div>
      </header>

      {/* Mobile Navigation Drawer — Fixed overlay, does NOT block page scroll */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative z-10 flex flex-col w-72 max-w-[85vw] h-full bg-navy-950 shadow-2xl animate-in slide-in-from-left-2 duration-200 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-800">
              <p className="text-xs font-bold text-white uppercase tracking-widest">
                {isHi ? 'मेनू' : 'Navigation'}
              </p>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Nav Links */}
            <nav className="flex flex-col py-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-5 py-3.5 text-xs font-semibold transition-colors min-h-[48px] border-l-4',
                      isActive
                        ? 'text-white bg-navy-800/90 border-amber-400 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800/50 border-transparent'
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
                      <span className="tracking-wide uppercase text-xs font-semibold">
                        {isHi ? item.labelHi : item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            {/* Logout at bottom */}
            <div className="border-t border-navy-800 p-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors rounded min-h-[44px]"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="uppercase text-[11px] tracking-wide font-bold">{isHi ? 'साइन आउट' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
