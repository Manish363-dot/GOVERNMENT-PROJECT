import { useAuth } from '@/contexts/AuthContext';
import { Menu, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './LanguageSwitcher';

interface TopHeaderProps {
  onMenuClick: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-poppins font-semibold text-navy-900 text-lg">
              Admin Dashboard
            </h1>
            <p className="text-xs text-secondary-text hidden sm:block">
              Zila Panchayat Safai — Waste Collection Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-navy-500" />
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-navy-900">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-secondary-text">{profile?.role || 'admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
