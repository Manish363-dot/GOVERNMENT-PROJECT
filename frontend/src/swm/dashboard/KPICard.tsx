import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

export function KPICard({ title, value, loading }: KPICardProps) {
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
        <p className="text-[11px] sm:text-[13px] font-bold text-navy-900 uppercase tracking-normal leading-tight line-clamp-2 pr-2">{title}</p>
      </div>

      {/* Card Value */}
      <div className="px-4 py-4 flex items-end justify-between">
        <div>
          <p className="font-poppins text-3xl font-extrabold text-navy-900 leading-none">{value}</p>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="h-1 bg-navy-800/10 group-hover:bg-navy-800 transition-colors" />
    </div>
  );
}
