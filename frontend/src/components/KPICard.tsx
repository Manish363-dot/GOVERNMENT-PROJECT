import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}

const colorMap = {
  blue: { bg: 'bg-navy-900 text-amber-400', border: 'border-slate-200', title: 'text-slate-600' },
  green: { bg: 'bg-emerald-800 text-emerald-100', border: 'border-slate-200', title: 'text-slate-600' },
  orange: { bg: 'bg-amber-600 text-white', border: 'border-slate-200', title: 'text-slate-600' },
  red: { bg: 'bg-red-700 text-white', border: 'border-slate-200', title: 'text-slate-600' },
};

export function KPICard({ title, value, icon: Icon, color, loading }: KPICardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-lg border bg-white p-5 shadow-xs transition-all duration-150 hover:border-slate-300',
      colors.border
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <p className="font-poppins text-2xl sm:text-3xl font-extrabold text-navy-900">{value}</p>
        </div>
        <div className={cn('w-11 h-11 rounded-md flex items-center justify-center shadow-xs', colors.bg)}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      </div>
    </div>
  );
}
