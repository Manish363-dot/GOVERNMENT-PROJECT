import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { complaintService } from '@/services/complaint.service';
import { Search, CheckCircle2, Clock, MapPin, User, Phone, FileText, AlertCircle, ShieldCheck, Copy, Check, Printer, Building2, Wrench, Lock, FileCheck } from 'lucide-react';
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
    const [copied, setCopied] = useState(false);

    const statusLabels: Record<string, string> = {
        new: isHi ? 'पंजीकृत (नया)' : 'Submitted',
        in_progress: isHi ? 'जांच व कार्रवाई जारी' : 'In Progress',
        resolved: isHi ? 'निस्तारित व फ़ाइल बंद' : 'Resolved & Locked',
    };

    const typeLabels: Record<string, string> = {
        vehicle_not_arrived: isHi ? 'सफाई वाहन नहीं आया (Vehicle Did Not Arrive)' : 'Vehicle Did Not Arrive',
        garbage_not_collected: isHi ? 'कचरा नहीं उठाया गया (Garbage Not Collected)' : 'Garbage Not Collected',
        other: isHi ? 'अन्य समस्या (Other Grievance)' : 'Other Grievance',
    };

    const handleSearch = useCallback(async (e?: React.FormEvent) => {
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
            setError(err.message || (isHi ? 'शिकायत नंबर से कोई आधिकारिक रिकॉर्ड नहीं मिला।' : 'No official record found matching this ID or Mobile number.'));
        } finally {
            setLoading(false);
        }
    }, [query, isHi]);

    const handleCopyId = useCallback((id: string) => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    }, []);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

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
                        placeholder={isHi ? 'शिकायत ID दर्ज करें (उदा. COMP-83005777) या 10-अंकीय मोबाइल...' : 'Enter Complaint Reference ID (e.g. COMP-83005777) or Mobile...'}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-12 border-slate-300 font-mono text-sm pl-4 pr-10 focus:border-navy-900 focus:ring-1 focus:ring-navy-900 shadow-xs"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="h-12 bg-navy-900 hover:bg-navy-800 text-white font-bold px-6 shadow-xs text-xs uppercase tracking-wider gap-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Search className="w-4 h-4 text-amber-400" />
                            {isHi ? 'स्थिति खोजें' : 'Track Status'}
                        </>
                    )}
                </Button>
            </form>

            {/* Error / Not Found Alert */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-900 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">{isHi ? 'कोई रिकॉर्ड नहीं मिला' : 'No Grievance Record Found'}</p>
                        <p className="text-xs text-red-700 mt-0.5">{error}</p>
                    </div>
                </div>
            )}

            {/* Official Complaint Certificate Sheet */}
            {complaint && (
                <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-md space-y-0 text-slate-800 animate-fade-in print:border-none print:shadow-none">

                    {/* ── Official Government Header ── */}
                    <div className="bg-navy-950 text-white p-4 sm:p-5 border-b-2 border-amber-500/80 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block">
                                    {isHi ? 'जिला पंचायत - जन शिकायत निवारण पोर्टल' : 'ZILA PANCHAYAT • PUBLIC GRIEVANCE REDRESSAL'}
                                </span>
                                <h3 className="font-bold text-base sm:text-lg text-white">
                                    {isHi ? 'आधिकारिक स्थिति रिपोर्ट' : 'Official Grievance Tracking Status'}
                                </h3>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                            {complaint.status === 'new' && (
                                <div className="px-3 py-1 bg-blue-900/90 text-blue-200 border border-blue-400/50 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    {isHi ? 'पंजीकृत (NEW)' : 'REGISTERED'}
                                </div>
                            )}
                            {complaint.status === 'in_progress' && (
                                <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/60 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-pulse">
                                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                                    {isHi ? 'कार्रवाई जारी (IN PROGRESS)' : 'IN PROGRESS'}
                                </div>
                            )}
                            {complaint.status === 'resolved' && (
                                <div className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/60 rounded-full text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                                    {isHi ? 'निस्तारित व बंद (RESOLVED & LOCKED)' : 'RESOLVED & LOCKED'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Grievance Reference Strip ── */}
                    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                                {isHi ? 'यूनिक शिकायत ID:' : 'Grievance Reference No:'}
                            </span>
                            <span className="font-mono text-base font-black text-navy-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 tracking-wider">
                                {complaint.complaint_number}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCopyId(complaint.complaint_number)}
                                className="p-1 text-slate-500 hover:text-navy-900 transition-colors"
                                title="Copy ID"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="text-slate-500 font-mono text-[11px]">
                            {isHi ? 'पंजीकरण तिथि:' : 'Filed On:'}{' '}
                            <span className="font-semibold text-slate-700">
                                {format(new Date(complaint.created_at), 'dd MMM yyyy, hh:mm a')}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-6">

                        {/* ── Official Lifecycle Stepper ── */}
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border border-slate-200">
                            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-600 mb-5 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-navy-900" />
                                {isHi ? 'आधिकारिक स्थिति प्रगति (Lifecycle Audit Timeline)' : 'Official Lifecycle Audit Timeline'}
                            </p>

                            <div className="grid grid-cols-3 gap-2 relative">
                                {/* Track Line Background */}
                                <div className="absolute top-4 left-8 right-8 h-1 bg-slate-200 -z-0" />
                                <div
                                    className="absolute top-4 left-8 h-1 bg-navy-900 transition-all duration-500 -z-0"
                                    style={{
                                        width: currentRank === 1 ? '0%' : currentRank === 2 ? '50%' : '100%',
                                    }}
                                />

                                {/* Step 1: Submitted */}
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-xs transition-colors ${currentRank >= 1 ? 'bg-navy-900 border-navy-900 text-white' : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                        1
                                    </div>
                                    <span className="text-xs font-bold text-navy-900 mt-2">
                                        {isHi ? 'शिकायत दर्ज' : 'Submitted'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {format(new Date(complaint.created_at), 'dd MMM, HH:mm')}
                                    </span>
                                </div>

                                {/* Step 2: In Progress */}
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-xs transition-colors ${currentRank >= 2 ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                        2
                                    </div>
                                    <span className={`text-xs font-bold mt-2 ${currentRank >= 2 ? 'text-amber-900' : 'text-slate-400'}`}>
                                        {isHi ? 'कार्रवाई जारी' : 'In Progress'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {currentRank >= 2 ? (isHi ? 'निरीक्षण शुरू' : 'Inspection Assigned') : (isHi ? 'लंबित' : 'Pending')}
                                    </span>
                                </div>

                                {/* Step 3: Resolved */}
                                <div className="flex flex-col items-center text-center relative z-10">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-xs transition-colors ${currentRank >= 3 ? 'bg-emerald-700 border-emerald-700 text-white' : 'bg-white border-slate-300 text-slate-400'
                                        }`}>
                                        3
                                    </div>
                                    <span className={`text-xs font-bold mt-2 ${currentRank >= 3 ? 'text-emerald-900' : 'text-slate-400'}`}>
                                        {isHi ? 'निस्तारित व लॉक्ड' : 'Resolved'}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {currentRank >= 3 ? (isHi ? 'निस्तारण पूर्ण' : 'Officially Closed') : (isHi ? 'प्रतीक्षारत' : 'Awaiting')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Official Citizen Details Grid ── */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-navy-900 uppercase tracking-wider text-[11px]">
                                {isHi ? 'शिकायतकर्ता विवरण (Grievant Details)' : 'Grievant Registration Details'}
                            </div>

                            <div className="divide-y divide-slate-200 bg-white">
                                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                    <div className="p-3 flex items-center gap-2.5">
                                        <User className="w-4 h-4 text-navy-900 shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'शिकायतकर्ता नाम' : 'Complainant Name'}</span>
                                            <span className="font-bold text-navy-900">{complaint.name}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-navy-900 shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
                                            <span className="font-mono font-bold text-navy-900">+91 {complaint.mobile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                    <div className="p-3 flex items-center gap-2.5">
                                        <MapPin className="w-4 h-4 text-navy-900 shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'क्षेत्र / ग्राम पंचायत वार्ड' : 'Area / Ward Location'}</span>
                                            <span className="font-semibold text-slate-800">{complaint.area}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 flex items-center gap-2.5">
                                        <FileText className="w-4 h-4 text-navy-900 shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">{isHi ? 'शिकायत की श्रेणी' : 'Grievance Category'}</span>
                                            <span className="font-semibold text-slate-800">{typeLabels[complaint.complaint_type] || complaint.complaint_type}</span>
                                        </div>
                                    </div>
                                </div>

                                {complaint.description && (
                                    <div className="p-3 bg-slate-50/50">
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                                            {isHi ? 'समस्या का विवरण (Grievance Description)' : 'Grievance Description'}
                                        </span>
                                        <p className="text-slate-700 leading-relaxed font-sans italic">
                                            "{complaint.description}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Official Action & Remarks Audit Log ── */}
                        {updates.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-bold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4 text-amber-600" />
                                    {isHi ? 'विभाग द्वारा की गई कार्रवाई व टिप्पणियां' : 'Departmental Progress & Official Remarks Log'}
                                </p>
                                <div className="space-y-2.5">
                                    {updates.map((update, idx) => (
                                        <div key={update.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-navy-900 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-navy-900" />
                                                    {statusLabels[update.status] || update.status}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {format(new Date(update.updated_at), 'dd MMM yyyy, hh:mm a')}
                                                </span>
                                            </div>
                                            {update.remark && (
                                                <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-700 font-mono text-[11px] mt-1">
                                                    💬 {update.remark}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Action Toolbar (Print Official Receipt) ── */}
                        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200 print:hidden">
                            <span className="text-[10px] text-slate-500 font-mono">
                                {isHi ? 'जिला पंचायत उत्तराखंड • जन शिकायत निवारण रिकॉर्ड' : 'Zila Panchayat Public Redressal System'}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrint}
                                className="h-9 px-4 text-xs font-bold gap-1.5 border-slate-300 text-navy-900 hover:bg-slate-100 shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5 text-navy-900" />
                                {isHi ? 'रसीद प्रिंट करें' : 'Print Official Receipt'}
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
