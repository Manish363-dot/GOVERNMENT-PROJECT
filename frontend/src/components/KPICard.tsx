import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  icon: LucideIcon;
  loading?: boolean;
}

export function KPICard({ title, subtitle, value, icon: Icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-md">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="px-5 py-5 flex items-center justify-between">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-md hover:border-navy-800 hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Card Header - Official Style */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between group-hover:bg-navy-50/50 transition-colors">
        <p className="text-[10px] sm:text-xs font-bold text-navy-900 uppercase tracking-widest font-mono truncate pr-2">{title}</p>
        <div className="w-7 h-7 rounded-sm bg-navy-100 border border-navy-200 flex items-center justify-center shrink-0 group-hover:bg-navy-800 group-hover:border-navy-900 transition-colors">
          <Icon className="w-3.5 h-3.5 text-navy-800 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Card Value */}
      <div className="px-4 py-4 flex items-end justify-between">
        <div>
          <p className="font-poppins text-3xl font-extrabold text-navy-900 leading-none">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-navy-800/10 group-hover:bg-navy-800 transition-colors" />
    </div>
  );
}
