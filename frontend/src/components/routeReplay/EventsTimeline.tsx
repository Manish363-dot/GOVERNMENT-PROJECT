import { useTranslation } from 'react-i18next';
import type { ReplayEvent } from '@/types/routeReplay';
import { CheckCircle2, AlertOctagon, AlertTriangle, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventsTimelineProps {
    events: ReplayEvent[];
    onSelectEvent: (event: ReplayEvent) => void;
    activePointIndex?: number;
}

export function EventsTimeline({ events, onSelectEvent, activePointIndex }: EventsTimelineProps) {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';

    return (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-md">
            <div className="bg-navy-950 border-b border-navy-800 px-4 py-2.5 flex items-center justify-between">
                <span className="font-poppins text-xs font-bold text-white uppercase tracking-wider">
                    ⏱️ {isHi ? 'टेलीमैटिक्स घटनाक्रम समय-सारणी' : 'Telematics Events Timeline'} ({events.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{isHi ? 'रीप्ले देखने हेतु क्लिक करें' : 'Click event to seek replay'}</span>
            </div>

            <div className="divide-y divide-slate-200 max-h-[300px] overflow-y-auto touch-scroll">
                {events.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-mono">
                        {isHi ? 'इस मार्ग अंतराल के लिए कोई टेलीमैटिक्स घटना दर्ज नहीं है।' : 'No telemetry events logged for this route interval.'}
                    </div>
                ) : (
                    events.map((ev) => {
                        const isCurrent = activePointIndex === ev.pointIndex;
                        let badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;

                        if (ev.type === 'stop') {
                            badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
                            icon = <Clock className="w-4 h-4 text-amber-600 shrink-0" />;
                        } else if (ev.type === 'unexpected_stop') {
                            badgeBg = 'bg-red-100 text-red-900 border-red-300';
                            icon = <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 animate-pulse" />;
                        } else if (ev.type === 'deviation') {
                            badgeBg = 'bg-blue-100 text-blue-900 border-blue-300';
                            icon = <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />;
                        }

                        return (
                            <button
                                key={ev.id}
                                onClick={() => onSelectEvent(ev)}
                                className={cn(
                                    'w-full text-left p-3 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50 touch-target',
                                    isCurrent && 'bg-navy-50/80 border-l-4 border-l-navy-900'
                                )}
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {icon}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold font-mono text-navy-900 truncate">{ev.title}</span>
                                            <span className={cn('text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border', badgeBg)}>
                                                {ev.timeStr}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 truncate mt-0.5">{ev.description}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{ev.wardName}</p>
                                    </div>
                                </div>

                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
