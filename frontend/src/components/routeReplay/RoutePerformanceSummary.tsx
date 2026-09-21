import { useTranslation } from 'react-i18next';
import type { RoutePerformance } from '@/types/routeReplay';
import { Route, Clock, OctagonAlert, CheckCircle2, XCircle, AlertTriangle, Gauge } from 'lucide-react';

interface RoutePerformanceSummaryProps {
    performance: RoutePerformance;
}

export function RoutePerformanceSummary({ performance }: RoutePerformanceSummaryProps) {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';

    const cards = [
        {
            icon: Route,
            label: isHi ? 'कुल दूरी' : 'Total Distance',
            value: `${performance.totalDistanceKm} ${isHi ? 'किमी' : 'km'}`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50/70 border-blue-200',
        },
        {
            icon: Clock,
            label: isHi ? 'सक्रिय ड्राइविंग' : 'Active Driving',
            value: performance.activeDrivingTimeStr,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50/70 border-indigo-200',
        },
        {
            icon: OctagonAlert,
            label: isHi ? 'वाहन ठहराव' : 'Vehicle Stops',
            value: `${performance.totalStopsCount} ${isHi ? 'ठहराव' : 'stops'}`,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50/70 border-amber-200',
        },
        {
            icon: CheckCircle2,
            label: isHi ? 'कचरा पात्र संकलित' : 'Bins Visited',
            value: `${performance.collectionPointsVisited} / ${performance.totalCollectionPoints}`,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50/70 border-emerald-200',
        },
        {
            icon: XCircle,
            label: isHi ? 'छूटे कचरा पात्र' : 'Missed Bins',
            value: String(performance.missedCollectionPoints),
            color: performance.missedCollectionPoints > 0 ? 'text-red-600' : 'text-slate-600',
            bgColor: performance.missedCollectionPoints > 0 ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200',
        },
        {
            icon: AlertTriangle,
            label: isHi ? 'रूट विचलन' : 'Deviations',
            value: String(performance.routeDeviationsCount),
            color: performance.routeDeviationsCount > 0 ? 'text-purple-600' : 'text-slate-600',
            bgColor: performance.routeDeviationsCount > 0 ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-50 border-slate-200',
        },
        {
            icon: Gauge,
            label: isHi ? 'औसत गति' : 'Avg Speed',
            value: `${performance.averageSpeedKmH} ${isHi ? 'किमी/घं' : 'km/h'}`,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50/70 border-teal-200',
        },
    ];

    return (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs font-mono">
            <div className="bg-navy-950 border-b border-navy-800 px-3.5 py-2 flex items-center justify-between">
                <span className="font-poppins text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>📊</span> {isHi ? 'रूट प्रदर्शन ऑडिट' : 'Route Performance Audit'}
                </span>
                <span className="text-[10px] text-slate-400">{isHi ? 'जीआईएस मेट्रिक्स' : 'GIS Metrics'}</span>
            </div>

            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cards.map(({ icon: Icon, label, value, color, bgColor }) => (
                    <div key={label} className={`p-2.5 rounded-lg border ${bgColor} flex flex-col justify-between`}>
                        <div className="flex items-center gap-1 mb-1">
                            <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate">
                                {label}
                            </span>
                        </div>
                        <p className="font-mono text-sm font-bold text-navy-900 leading-none mt-1">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
