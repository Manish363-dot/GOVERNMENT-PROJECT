import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, MapPin, History, MessageSquareWarning,
  Truck, Settings, LogOut, X, Radio, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: MapPin, label: 'Live Tracking', to: '/dashboard/tracking' },
  { icon: History, label: 'Vehicle History', to: '/dashboard/history' },
  { icon: MessageSquareWarning, label: 'Complaints', to: '/dashboard/complaints' },
  { icon: Truck, label: 'Vehicles', to: '/dashboard/vehicles' },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
  { icon: Radio, label: 'GPS Devices', to: '/dashboard/gps-devices' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-navy-900 text-slate-200 z-50 flex flex-col border-r border-navy-800 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Government Identity Header */}
        <div className="p-4 border-b border-navy-800 bg-navy-950/50">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              उत्तराखंड शासन
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded hover:bg-navy-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="w-8 h-8 rounded bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-poppins font-bold text-sm text-white block leading-tight">
                ZP Safai Portal
              </span>
              <span className="text-[10px] font-medium text-slate-400 block">
                Admin Control Desk
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-4 h-4 opacity-90" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* GPS Integration Status */}
        <div className="px-3 py-3 border-t border-navy-800/60 bg-navy-950/30">
          <div className="bg-navy-950/80 rounded-md p-2.5 border border-navy-800">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">GPS Network</span>
            </div>
            <p className="text-[10px] text-slate-400">Traccar Server Integration</p>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-300 transition-colors w-full border border-transparent hover:border-red-900/50"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
