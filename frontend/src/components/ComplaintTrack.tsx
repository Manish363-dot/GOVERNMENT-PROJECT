import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { complaintService } from '@/services/complaint.service';
import { Search, CheckCircle2, Clock, MapPin, User, Phone, FileText, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Complaint, ComplaintUpdate } from '@/types';

interface ComplaintTrackProps {
    initialId?: string;
}

export const ComplaintTrack: React.FC<ComplaintTrackProps> = ({ initialId = '' }) => {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';

    const [query, setQuery] = useState(initialId);
    const [loading, setLoading] = useState(false);
    const [complaint, setComplaint] = useState<Complaint | null>(null);
    const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const statusLabels: Record<string, string> = {
        new: isHi ? 'शिकायत दर्ज (नया)' : 'Registered (New)',
        in_progress: isHi ? 'प्रगति पर (जांच जारी)' : 'In Progress',
        resolved: isHi ? 'निस्तारित (समाप्त)' : 'Resolved & Closed',
    };

    const typeLabels: Record<string, string> = {
        vehicle_not_arrived: isHi ? 'सफाई वाहन नहीं आया' : 'Vehicle Did Not Arrive',
        garbage_not_collected: isHi ? 'कचरा नहीं उठाया गया' : 'Garbage Not Collected',
        other: isHi ? 'अन्य शिकायत' : 'Other Complaint',
    };

    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const cleanQuery = query.trim();
        if (!cleanQuery) return;

        setLoading(true);
        setError(null);
        setSearched(true);
        setComplaint(null);
        setUpdates([]);

        try {
            const res = await complaintService.track(cleanQuery);
            setComplaint(res.complaint);
            setUpdates(res.updates || []);
        } catch (err: any) {
            setError(err.message || (isHi ? 'शिकायत नंबर से कोई रिकॉर्ड नहीं मिला।' : 'No complaint found with this ID or Mobile.'));
        } finally {
            setLoading(false);
        }
    }

    // Determine stage rank (1 = new, 2 = in_progress, 3 = resolved)
    const getStageRank = (status?: string) => {
        switch (status) {
            case 'new': return 1;
            case 'in_progress': return 2;
            case 'resolved': return 3;
            default: return 0;
        }
    };

    const currentRank = getStageRank(complaint?.status);

    return (
        <div className="space-y-6">
            {/* Search Header Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder={isHi ? 'अपनी शिकायत ID दर्ज करें (उदा. COMP-A1B2C3D4) या मोबाइल...' : 'Enter Complaint ID (e.g. COMP-A1B2C3D4) or Mobile...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-12 border-slate-300 font-mono text-sm pl-4 pr-10 focus:border-navy-900 focus:ring-1 focus:ring-navy-900"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="h-12 bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Search className="w-4 h-4 mr-1.5" />
                            {isHi ? 'ट्रैक करें' : 'Track Status'}
                        </>
                    )}
                </Button>
            </form>

            {/* Error / Not Found Alert */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">{isHi ? 'शिकायत नहीं मिली' : 'Complaint Not Found'}</p>
                        <p className="text-xs mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Complaint Details Result */}
            {complaint && (
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs space-y-6 p-5">
                    {/* Header Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                {isHi ? 'शिकायत संख्या' : 'Complaint Number'}
                            </span>
                            <h3 className="font-mono text-xl font-bold text-navy-900 flex items-center gap-2">
                                {complaint.complaint_number}
                            </h3>
                        </div>
                        <Badge variant={complaint.status as any} className="text-xs px-3 py-1">
                            {statusLabels[complaint.status] || complaint.status}
                        </Badge>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
                            {isHi ? 'प्रगति स्थिति (Lifecycle Progress)' : 'Lifecycle Progress Timeline'}
                        </p>
                        <div className="grid grid-cols-3 gap-2 relative">
                            {/* Connector line */}
                            <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                            <div
                                className="absolute top-4 left-6 h-1 bg-navy-900 transition-all duration-500 -z-0"
                                style={{
                                    width: currentRank === 1 ? '0%' : currentRank === 2 ? '50%' : '100%',
                                }}
                            />

                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${currentRank >= 1 ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                    1
                                </div>
                                <span className="text-xs font-bold text-navy-900 mt-2">{isHi ? 'शिकायत दर्ज' : 'Submitted'}</span>
                                <span className="text-[10px] text-slate-500">
                                    {format(new Date(complaint.created_at), 'dd MMM, HH:mm')}
                                </span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${currentRank >= 2 ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                    2
                                </div>
                                <span className={`text-xs font-bold mt-2 ${currentRank >= 2 ? 'text-amber-900' : 'text-slate-400'}`}>
                                    {isHi ? 'प्रगति पर' : 'In Progress'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {currentRank >= 2 ? (isHi ? 'कार्रवाई जारी' : 'Action Initiated') : (isHi ? 'लंबित' : 'Pending')}
                                </span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center relative z-10">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${currentRank >= 3 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                    3
                                </div>
                                <span className={`text-xs font-bold mt-2 ${currentRank >= 3 ? 'text-emerald-900' : 'text-slate-400'}`}>
                                    {isHi ? 'निस्तारित' : 'Resolved'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {currentRank >= 3 ? (isHi ? 'पूर्ण समाधान' : 'Fully Solved') : (isHi ? 'प्रतीक्षारत' : 'Awaiting')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Table Grid */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-500">{isHi ? 'शिकायतकर्ता:' : 'Complainant:'}</span>
                            <span className="font-semibold text-navy-900">{complaint.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-500">{isHi ? 'मोबाइल:' : 'Mobile:'}</span>
                            <span className="font-semibold font-mono text-navy-900">{complaint.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-500">{isHi ? 'क्षेत्र / वार्ड:' : 'Area/Ward:'}</span>
                            <span className="font-semibold text-navy-900">{complaint.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-500">{isHi ? 'शिकायत का प्रकार:' : 'Type:'}</span>
                            <span className="font-semibold text-navy-900">{typeLabels[complaint.complaint_type] || complaint.complaint_type}</span>
                        </div>
                    </div>

                    {complaint.description && (
                        <div className="p-3 bg-white border border-slate-200 rounded text-xs">
                            <span className="font-bold text-slate-700 block mb-1">{isHi ? 'विवरण (Description):' : 'Description:'}</span>
                            <p className="text-slate-600 leading-relaxed">{complaint.description}</p>
                        </div>
                    )}

                    {/* Activity / Update Remarks Log */}
                    {updates.length > 0 && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                {isHi ? 'अधिकारी टिप्पणी व इतिहास (Official Progress Log)' : 'Official Progress & Remarks Log'}
                            </p>
                            <div className="space-y-2">
                                {updates.map((update) => (
                                    <div key={update.id} className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Badge variant={update.status as any} className="text-[10px]">
                                                {statusLabels[update.status] || update.status}
                                            </Badge>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {format(new Date(update.updated_at), 'dd MMM yyyy, HH:mm')}
                                            </span>
                                        </div>
                                        {update.remark && (
                                            <p className="text-slate-700 pt-1 font-mono text-[11px]">
                                                💬 {update.remark}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
