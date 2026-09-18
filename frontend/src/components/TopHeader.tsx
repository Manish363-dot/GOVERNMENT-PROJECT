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
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड', to: '/dashboard' },
  { icon: MapPin, label: 'Tracking', labelHi: 'लाइव ट्रैकिंग', to: '/dashboard/tracking' },
  { icon: History, label: 'History', labelHi: 'इतिहास', to: '/dashboard/history' },
  { icon: MessageSquareWarning, label: 'Grievances', labelHi: 'शिकायतें', to: '/dashboard/complaints' },
  { icon: Truck, label: 'Vehicles', labelHi: 'वाहन', to: '/dashboard/vehicles' },
  { icon: Radio, label: 'GPS Devices', labelHi: 'डिवाइस', to: '/dashboard/gps-devices' },
  { icon: Settings, label: 'Settings', labelHi: 'सेटिंग', to: '/dashboard/settings' },
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
      <TopBarLogos variant="dashboard" className="border-b border-slate-200 bg-white hidden sm:flex" />

      {/* Main Header Bar */}
      <div className="flex items-center justify-between h-14 px-4 sm:px-6 bg-navy-900 border-b border-navy-800">
        {/* Left: Mobile Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded text-slate-300 hover:bg-navy-800 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded shrink-0" />
            <div>
              <p className="text-[12px] sm:text-[14px] font-bold text-white leading-none uppercase tracking-wide">
                Admin Control Panel
              </p>
              <div className="hidden sm:flex items-center gap-2 mt-0.5 text-[9px] sm:text-[10px] text-slate-300 font-mono">
                <span>Zila Panchayat Safai • Operations</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-semibold">{format(now, 'EEEE, dd MMM yyyy • hh:mm:ss a')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status + User */}
        <div className="flex items-center gap-4">
          {/* Live Status */}
          <div className="hidden md:flex items-center gap-1.5 bg-navy-950 border border-navy-800 px-2.5 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">System Active</span>
          </div>

          <button className="relative p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded transition-colors hidden sm:block">
            <Bell className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-navy-700 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-[11px] font-bold text-white leading-none">{profile?.full_name || 'Admin Officer'}</p>
              <p className="text-[9px] text-slate-300 font-mono capitalize mt-0.5">{profile?.role || 'administrator'}</p>
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
                  <span>{item.label}</span>
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
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">| {item.labelHi}</span>
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
              <span>Sign Out</span>
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
