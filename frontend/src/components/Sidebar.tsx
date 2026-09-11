import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, MapPin, History, MessageSquareWarning,
  Truck, Settings, LogOut, X, Radio, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuSections = [
  {
    title: 'OVERVIEW & TRACKING',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard Overview', to: '/dashboard' },
      { icon: MapPin, label: 'Live Vehicle Tracking', to: '/dashboard/tracking' },
      { icon: History, label: 'Vehicle Route History', to: '/dashboard/history' },
    ],
  },
  {
    title: 'FLEET & GRIEVANCE',
    items: [
      { icon: MessageSquareWarning, label: 'Grievance & Complaints', to: '/dashboard/complaints' },
      { icon: Truck, label: 'Sanitation Vehicles', to: '/dashboard/vehicles' },
      { icon: Radio, label: 'GPS Devices Registry', to: '/dashboard/gps-devices' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { icon: Settings, label: 'System Settings', to: '/dashboard/settings' },
    ],
  },
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
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-[#081325] text-slate-100 z-50 flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto shrink-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Official Header */}
        <div className="p-4 bg-[#0a182e] border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-950/90 px-2.5 py-1 rounded border border-emerald-700/60 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              उत्तराखंड शासन
            </span>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-md border border-emerald-500/40 shrink-0">
              <Truck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <span className="font-poppins font-bold text-sm text-white block leading-tight tracking-tight truncate">
                ZP Safai Control Panel
              </span>
              <span className="text-[10px] font-semibold text-amber-400 block tracking-wide truncate">
                Zila Panchayat Monitoring System
              </span>
            </div>
          </div>
        </div>

        {/* Official Tricolor Line */}
        <div className="uk-tricolor-line h-1" />

        {/* Categorized Navigation Menu */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 relative group',
                        isActive
                          ? 'bg-emerald-700 text-white shadow-md border border-emerald-500/40'
                          : 'text-slate-200 hover:bg-[#0f2240] hover:text-white border border-transparent'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-400 rounded-r-md" />
                        )}
                        <item.icon
                          className={cn(
                            'w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110',
                            isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-emerald-400'
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Telematics GPS Integration Card */}
        <div className="px-3 py-3 border-t border-slate-800/80 bg-[#0a182e]/80">
          <div className="bg-[#050c18] rounded-lg p-2.5 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">GPS Network</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Traccar Server Telematics Active</p>
          </div>
        </div>

        {/* Formal Logout Button */}
        <div className="p-3 border-t border-slate-800/90 bg-[#081325]">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-red-300 hover:bg-red-950/60 hover:text-red-100 transition-colors w-full border border-red-900/50 shadow-xs bg-red-950/20"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="uppercase tracking-wide">Sign Out Desk</span>
          </button>
        </div>
      </aside>
    </>
  );
}
