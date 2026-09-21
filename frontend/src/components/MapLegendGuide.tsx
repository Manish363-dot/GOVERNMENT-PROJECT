import { Info, CheckCircle2, Clock, AlertOctagon, Navigation } from 'lucide-react';

export function MapLegendGuide() {
    return (
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm space-y-3 font-mono">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Info className="w-4 h-4 text-navy-900" />
                <h4 className="font-poppins text-xs font-bold text-navy-900 uppercase tracking-wider">
                    GIS Map Indicators Guide • नक्शा संकेत तालिका
                </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Green */}
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-xs shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-emerald-900 block leading-tight">🟢 Green / हरा</span>
                        <span className="text-[11px] text-emerald-800 leading-snug block mt-0.5">
                            • Moving Vehicle (चलती गाड़ी &gt;0 km/h)<br />
                            • Waste Bin Cleaned (सफाई पूर्ण)
                        </span>
                    </div>
                </div>

                {/* Orange / Yellow */}
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-amber-900 block leading-tight">🟡 Orange / नारंगी</span>
                        <span className="text-[11px] text-amber-800 leading-snug block mt-0.5">
                            • Idle Halt / Signal (इंजन चालू, 0 km/h)<br />
                            • Short Traffic Stop (&lt;5 min)
                        </span>
                    </div>
                </div>

                {/* Red */}
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow-xs shrink-0 mt-0.5 animate-pulse" />
                    <div>
                        <span className="font-bold text-red-900 block leading-tight">🔴 Red / लाल</span>
                        <span className="text-[11px] text-red-800 leading-snug block mt-0.5">
                            • Offline GPS / Ignition Off<br />
                            • Prolonged Stop Alert (&gt;10 min)
                        </span>
                    </div>
                </div>

                {/* Blue */}
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold text-blue-900 block leading-tight">🔵 Blue / नीला</span>
                        <span className="text-[11px] text-blue-800 leading-snug block mt-0.5">
                            • Route Deviation (मास्टर रूट से विचलन)<br />
                            • Detour Warning Alert
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
