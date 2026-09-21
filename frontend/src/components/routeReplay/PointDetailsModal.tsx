import type { ReplayPoint } from '@/types/routeReplay';
import { X, Clock, MapPin, Gauge, ShieldCheck, Trash2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointDetailsModalProps {
    point: ReplayPoint | null;
    onClose: () => void;
}

export function PointDetailsModal({ point, onClose }: PointDetailsModalProps) {
    if (!point) return null;

    const statusColor =
        point.status === 'moving'
            ? 'bg-emerald-500 text-white'
            : point.status === 'collection'
                ? 'bg-emerald-600 text-white'
                : point.status === 'stopped'
                    ? 'bg-red-600 text-white'
                    : point.status === 'deviation'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-500 text-white';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="bg-navy-950 px-4 py-3 flex items-center justify-between border-b border-navy-800">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="font-poppins text-xs font-bold text-white uppercase tracking-wider">
                            Telemetry Inspection Point #{point.index + 1}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md"
                        aria-label="Close Inspection Modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 font-mono">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="text-xs text-slate-500 uppercase font-bold">Vehicle Status</span>
                        <span className={cn('px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider', statusColor)}>
                            {point.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                <Clock className="w-3.5 h-3.5 text-navy-800" />
                                <span className="text-[10px] uppercase font-bold">Timestamp</span>
                            </div>
                            <p className="text-xs font-bold text-navy-900">{point.timeStr}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] uppercase font-bold">Speed</span>
                            </div>
                            <p className="text-xs font-bold text-navy-900">{point.speed} km/h</p>
                        </div>
                    </div>

                    {/* Location & Ward */}
                    <div className="space-y-2 pt-1">
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-[10px] uppercase font-bold">Location / Landmark</span>
                            </div>
                            <p className="text-xs font-bold text-navy-900 leading-tight">{point.locationName}</p>
                            <p className="text-[10px] text-slate-500">
                                GPS: {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[10px] uppercase font-bold">Ward / Area</span>
                            </div>
                            <p className="text-xs font-bold text-navy-900 leading-tight">{point.wardName}</p>
                        </div>
                    </div>

                    {/* Collection Status */}
                    {point.collectionStatus && point.collectionStatus !== 'N/A' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4 text-emerald-700" />
                                <div>
                                    <span className="text-[10px] text-emerald-800 uppercase font-bold block">Collection Bin</span>
                                    <span className="text-xs font-bold text-emerald-950">{point.collectionName || 'District Waste Bin'}</span>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                                {point.collectionStatus}
                            </span>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded uppercase tracking-wider transition-colors"
                    >
                        Close Inspector
                    </button>
                </div>
            </div>
        </div>
    );
}
