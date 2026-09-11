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
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 relative group overflow-hidden">
      {/* Subtle Top Accent */}
      <div className="h-0.5 bg-emerald-600 absolute top-0 left-0 right-0" />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="font-poppins text-2xl sm:text-3xl font-extrabold text-navy-900 leading-none pt-0.5">
            {value}
          </p>
          {subtitle && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                {subtitle}
              </span>
            </div>
          )}
        </div>

        <div className="w-11 h-11 rounded-lg bg-slate-100/90 text-navy-900 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-800 transition-colors">
          <Icon className="w-5 h-5 text-slate-700 group-hover:text-emerald-700 transition-colors" />
        </div>
      </div>
    </div>
  );
}
