import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, MapPin, History, MessageSquareWarning,
  Truck, Settings, LogOut, X, Radio,
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
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-navy-900 text-white z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-poppins font-bold text-sm text-white block leading-tight">
                ZP Safai
              </span>
              <span className="text-[9px] font-medium text-primary-300 tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-navy-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-navy-300 hover:bg-navy-800 hover:text-white'
                )
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* GPS Status */}
        <div className="px-3 py-3">
          <div className="bg-navy-800/50 rounded-xl p-3 border border-navy-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-3.5 h-3.5 text-navy-400" />
              <span className="text-xs text-navy-400">GPS Integration</span>
            </div>
            <p className="text-[10px] text-navy-500">Ready for Traccar</p>
          </div>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-navy-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
