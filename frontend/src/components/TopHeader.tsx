import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bell, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TopBarLogos } from '@/components/TopBarLogos';

interface TopHeaderProps {
  onMenuClick: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Top 4 Logos Strip: 2 Left, 2 Right */}
      <TopBarLogos variant="dashboard" className="border-b border-slate-100 bg-white" />

      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-navy-900 hover:bg-slate-100"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-poppins font-bold text-navy-900 text-base sm:text-lg leading-none">
                Administrative Control Panel
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Uttarakhand Zila Panchayat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
              Waste Collection Tracking & Public Grievance Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">System Active</span>
          </div>

          <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-navy-900 hover:bg-slate-100">
            <Bell className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs border border-navy-800">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-navy-900 leading-tight">{profile?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 font-mono capitalize">{profile?.role || 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
