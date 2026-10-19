import { useTranslation } from 'react-i18next';
import type { RouteReplayDataset } from '@/types/routeReplay';
import { cn } from '@/lib/utils';

interface TimelineSliderProps {
    dataset: RouteReplayDataset;
    currentIndex: number;
    onSeekIndex: (index: number) => void;
    /** 'default' = white card; 'overlay' = transparent glass for fullscreen overlay */
    variant?: 'default' | 'overlay';
}

export function TimelineSlider({ dataset, currentIndex, onSeekIndex, variant = 'default' }: TimelineSliderProps) {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';
    const totalPoints = dataset.points.length;
    const currentPoint = dataset.points[currentIndex];
    const isOverlay = variant === 'overlay';

    const startTimeStr = dataset.points[0]?.timeStr || dataset.startTime;
    const endTimeStr = dataset.points[totalPoints - 1]?.timeStr || dataset.endTime;

    return (
        <div className={cn(
            'rounded-xl p-4 space-y-2',
            isOverlay
                ? 'bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl'
                : 'bg-white border border-slate-300 shadow-md'
        )}>
            {/* Top Labels */}
            <div className={cn(
                'flex items-center justify-between text-xs font-mono font-bold',
                isOverlay ? 'text-slate-300' : 'text-slate-600'
            )}>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {isHi ? 'प्रारंभ:' : 'Start:'} {startTimeStr}
                </span>
                <span className={cn(
                    'px-2 py-0.5 rounded border font-bold',
                    isOverlay
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                )}>
                    {isHi ? 'सक्रिय:' : 'Active:'} {currentPoint?.timeStr || '--:--'} ({currentPoint?.speed || 0} {isHi ? 'किमी/घं' : 'km/h'})
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    {isHi ? 'समाप्त:' : 'End:'} {endTimeStr}
                </span>
            </div>

            {/* Slider Track with Event Markers */}
            <div className="relative w-full pt-1 pb-1">
                {/* Event ticks on timeline */}
                <div className="absolute inset-x-0 top-3 h-2 pointer-events-none z-10">
                    {dataset.events.map((ev) => {
                        const leftPct = totalPoints > 1 ? (ev.pointIndex / (totalPoints - 1)) * 100 : 0;
                        const colorClass =
                            ev.type === 'collection'
                                ? 'bg-emerald-500'
                                : ev.type === 'stop'
                                    ? 'bg-amber-500'
                                    : ev.type === 'unexpected_stop'
                                        ? 'bg-red-600 animate-ping'
                                        : 'bg-blue-500';

                        return (
                            <div
                                key={ev.id}
                                className={cn('absolute -translate-x-1/2 w-2 h-2 rounded-full border border-white shadow-xs', colorClass)}
                                style={{ left: `${leftPct}%` }}
                                title={`${ev.title} (${ev.timeStr})`}
                            />
                        );
                    })}
                </div>

                {/* HTML Input Range */}
                <input
                    type="range"
                    min={0}
                    max={Math.max(0, totalPoints - 1)}
                    value={currentIndex}
                    onChange={(e) => onSeekIndex(parseInt(e.target.value, 10))}
                    className={cn(
                        'w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none relative z-20',
                        isOverlay ? 'bg-white/20 accent-amber-400' : 'bg-slate-200 accent-navy-900'
                    )}
                />
            </div>

            {/* Visual Timeline Marker Labels */}
            <div className={cn(
                'flex justify-between items-center text-[10px] font-mono',
                isOverlay ? 'text-slate-400' : 'text-slate-400'
            )}>
                <span>06:00 AM ──</span>
                <span>08:00 AM ──</span>
                <span className={cn('font-bold', isOverlay ? 'text-white' : 'text-navy-900')}>10:00 AM ──</span>
                <span>12:00 PM</span>
            </div>
        </div>
    );
}
