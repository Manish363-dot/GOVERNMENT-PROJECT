import type { RouteReplayDataset } from '@/types/routeReplay';
import { cn } from '@/lib/utils';

interface TimelineSliderProps {
    dataset: RouteReplayDataset;
    currentIndex: number;
    onSeekIndex: (index: number) => void;
}

export function TimelineSlider({ dataset, currentIndex, onSeekIndex }: TimelineSliderProps) {
    const totalPoints = dataset.points.length;
    const currentPoint = dataset.points[currentIndex];

    const startTimeStr = dataset.points[0]?.timeStr || dataset.startTime;
    const endTimeStr = dataset.points[totalPoints - 1]?.timeStr || dataset.endTime;

    return (
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-md space-y-2">
            {/* Top Labels */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 font-bold">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Start: {startTimeStr}
                </span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold">
                    Active: {currentPoint?.timeStr || '--:--'} ({currentPoint?.speed || 0} km/h)
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    End: {endTimeStr}
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
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-navy-900 focus:outline-none relative z-20"
                />
            </div>

            {/* Visual Timeline Marker Labels */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>06:00 AM ──</span>
                <span>08:00 AM ──</span>
                <span className="font-bold text-navy-900">10:00 AM ──</span>
                <span>12:00 PM</span>
            </div>
        </div>
    );
}
