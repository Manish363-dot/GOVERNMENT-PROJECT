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
  blue: { bg: 'bg-blue-50', icon: 'text-primary', border: 'border-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-success', border: 'border-green-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-accent', border: 'border-orange-100' },
  red: { bg: 'bg-red-50', icon: 'text-danger', border: 'border-red-100' },
};

export function KPICard({ title, value, icon: Icon, color, loading }: KPICardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
      colors.border
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-text mb-1">{title}</p>
          <p className="font-poppins text-3xl font-bold text-navy-900">{value}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </div>
  );
}
