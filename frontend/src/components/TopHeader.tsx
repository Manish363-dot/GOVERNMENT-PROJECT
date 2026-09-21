import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Menu, X, Bell, User, ShieldCheck, LogOut,
  LayoutDashboard, MapPin, History, PlaySquare, MessageSquareWarning,
  Truck, Radio, Settings
} from 'lucide-react';
import { TopBarLogos } from '@/components/TopBarLogos';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड', to: '/dashboard' },
  { icon: MapPin, label: 'Tracking', labelHi: 'लाइव ट्रैकिंग', to: '/dashboard/tracking' },
  { icon: History, label: 'History', labelHi: 'इतिहास', to: '/dashboard/history' },
  { icon: PlaySquare, label: 'Route Replay', labelHi: 'रूट रीप्ले', to: '/dashboard/route-replay' },
  { icon: MessageSquareWarning, label: 'Grievances', labelHi: 'शिकायतें', to: '/dashboard/complaints' },
  { icon: Truck, label: 'Vehicles', labelHi: 'वाहन', to: '/dashboard/vehicles' }
];

export function TopHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
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
      <TopBarLogos variant="dashboard" className="border-b border-slate-200 bg-white flex" />

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
            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded shrink-0" />
            <div>
              <p className="text-xs sm:text-[16px] font-bold text-white leading-tight uppercase tracking-wide">
                Admin Control Panel
              </p>
              <div className="hidden sm:flex items-center gap-2 mt-0.5 text-[10px] sm:text-[12px] text-slate-300 font-mono">
                <span><p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Zila Panchayat Safai Portal |
                </p></span>
                <span className="text-emerald-400 font-semibold">{format(now, 'EEEE, dd MMM yyyy • hh:mm:ss a')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + User */}
        <div className="flex items-center gap-2 sm:gap-4">

          <div className="w-px h-6 bg-navy-700 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-bold text-white leading-none">{profile?.full_name || 'Admin Officer'}</p>
            </div>
            <div className="w-8 h-8 rounded bg-navy-800 border border-navy-700 text-amber-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
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
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950 border-b border-navy-800 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <nav className="flex flex-col py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-5 py-3 text-xs font-semibold transition-colors min-h-[44px]',
                    isActive
                      ? 'text-white bg-navy-800/90 border-l-4 border-amber-400 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/50 border-l-4 border-transparent'
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
                      <span className="tracking-wide uppercase text-[11px]">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">| {item.labelHi}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
            <div className="w-full bg-navy-800 h-px my-1.5" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors w-full text-left min-h-[44px]"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="uppercase text-[11px] tracking-wide font-bold">Sign Out</span>
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
