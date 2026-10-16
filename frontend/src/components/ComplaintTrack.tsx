import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { complaintService } from '@/services/complaint.service';
import { Search, CheckCircle2, Clock, MapPin, User, Phone, FileText, AlertCircle, ShieldCheck, Copy, Check, Building2, Wrench, Lock, FileCheck, Landmark, BadgeCheck, Paperclip, ExternalLink, Maximize2, X, Image as ImageIcon } from 'lucide-react';
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
    const [confirming, setConfirming] = useState(false);
    const [confirmSuccess, setConfirmSuccess] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

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

    const handleConfirmResolution = async () => {
        if (!complaint) return;
        setConfirming(true);
        try {
            await complaintService.confirmResolution(complaint.complaint_number);
            setComplaint(prev => prev ? { 
                ...prev, 
                user_confirmed: true, 
                user_confirmed_at: new Date().toISOString() 
            } : null);
            setConfirmSuccess(true);
            const refreshed = await complaintService.track(complaint.complaint_number);
            setUpdates(refreshed.updates || []);
        } catch (err: any) {
            alert(err.message || 'पुष्टि करने में विफल। पुनः प्रयास करें।');
        } finally {
            setConfirming(false);
        }
    };

    const handleCopyId = useCallback((id: string) => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
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

            {/* ── Citizen Resolution Confirmation Card / Popup ── */}
            {complaint && complaint.status === 'resolved' && !complaint.user_confirmed && (
                <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-400 rounded-2xl p-5 sm:p-6 shadow-xl animate-fade-in relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-extrabold text-base sm:text-lg text-emerald-950 leading-tight">
                                        {isHi ? 'आपकी शिकायत का समाधान हो गया है!' : 'Your complaint has been resolved!'}
                                    </h3>
                                    <span className="bg-emerald-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
                                        Resolved
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-emerald-900 mt-1.5 leading-relaxed font-medium">
                                    {isHi 
                                        ? 'प्रशासन द्वारा आपकी शिकायत का निस्तारण कर दिया गया है। कृपया पुष्टि करें कि आपकी समस्या हल हो गई है।' 
                                        : 'The administration has resolved your grievance. Please confirm that your issue has been successfully resolved.'}
                                </p>

                                <div className="mt-2.5 text-xs font-mono text-emerald-950 bg-white/90 inline-block px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                                    <span className="text-slate-500 font-bold mr-1">Complaint ID:</span>
                                    <span className="font-extrabold text-emerald-900">{complaint.complaint_number}</span>
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 sm:self-center w-full sm:w-auto">
                            <Button
                                type="button"
                                onClick={handleConfirmResolution}
                                disabled={confirming}
                                className="w-full sm:w-auto h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {confirming ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>{isHi ? 'पुष्टि दर्ज की जा रही है...' : 'Confirming...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 stroke-[3]" />
                                        <span>{isHi ? 'हाँ, मेरी समस्या हल हो गई है' : 'Yes, my issue is resolved'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Citizen Confirmed Banner ── */}
            {complaint && complaint.user_confirmed && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-950 shadow-xs animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <BadgeCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-extrabold text-emerald-950">
                                {isHi ? '✓ नागरिक द्वारा समाधान की पुष्टि की जा चुकी है' : '✓ Resolution Confirmed by Citizen'}
                            </p>
                            <p className="text-xs text-emerald-800">
                                {isHi 
                                    ? 'आपने पुष्टि कर दी है कि आपकी समस्या का संतोषजनक समाधान हो गया है।' 
                                    : 'You have confirmed that your issue has been satisfactorily resolved.'}
                            </p>
                        </div>
                    </div>
                    {complaint.user_confirmed_at && (
                        <div className="text-right shrink-0">
                            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Confirmed At:</span>
                            <span className="text-xs font-mono font-bold text-emerald-900">
                                {format(new Date(complaint.user_confirmed_at), 'dd MMM yyyy, hh:mm a')}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Official Complaint Certificate Sheet */}
            {complaint && (
                <div className="printable-receipt bg-white border-2 border-slate-400 rounded-xl overflow-hidden shadow-lg space-y-0 text-slate-800 animate-fade-in print:border-2 print:border-slate-800 print:shadow-none">

                    {/* ── Grievance Reference & Status Banner Strip ── */}
                    <div className="bg-slate-100 px-4 sm:px-6 py-3 border-b border-slate-300 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                            <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                                {isHi ? 'शिकायत संदर्भ संख्या:' : 'Grievance Reference No:'}
                            </span>
                            <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded border-2 border-navy-900 shadow-xs">
                                <span className="font-mono text-base font-black text-navy-900 tracking-wider">
                                    {complaint.complaint_number}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleCopyId(complaint.complaint_number)}
                                    className="p-1 text-slate-500 hover:text-navy-900 transition-colors print:hidden"
                                    title="Copy Reference Number"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-mono">
                            <div>
                                <span className="text-slate-500">{isHi ? 'पंजीकरण तिथि:' : 'Filed On:'} </span>
                                <span className="font-bold text-slate-900">
                                    {format(new Date(complaint.created_at), 'dd MMM yyyy, hh:mm a')}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div>
                                {complaint.status === 'new' && (
                                    <span className="px-3 py-1 bg-blue-900 text-white rounded font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-blue-300" />
                                        {isHi ? 'पंजीकृत (NEW)' : 'REGISTERED'}
                                    </span>
                                )}
                                {complaint.status === 'in_progress' && (
                                    <span className="px-3 py-1 bg-amber-600 text-white rounded font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
                                        <Wrench className="w-3 h-3 text-amber-200" />
                                        {isHi ? 'कार्रवाई जारी (IN PROGRESS)' : 'IN PROGRESS'}
                                    </span>
                                )}
                                {complaint.status === 'resolved' && (
                                    <span className="px-3 py-1 bg-emerald-800 text-white rounded font-bold uppercase text-[10px] tracking-wider inline-flex items-center gap-1">
                                        <Lock className="w-3 h-3 text-emerald-300" />
                                        {isHi ? 'निस्तारित व बंद (RESOLVED)' : 'RESOLVED & LOCKED'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6 space-y-6">

                        {/* ── Official Citizen Particulars Table Card ── */}
                        <div className="border-2 border-slate-300 rounded-lg overflow-hidden text-xs">
                            <div className="bg-navy-900 text-white px-4 py-2 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                                <span>{isHi ? '1. शिकायतकर्ता एवं समस्या का आधिकारिक विवरण' : '1. Complainant & Grievance Official Registration Particulars'}</span>
                                <span className="font-mono text-[10px] text-amber-400">PANCHAYAT RECORD SHEET</span>
                            </div>

                            <div className="divide-y divide-slate-200 bg-white">
                                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                    <div className="p-3.5 flex items-start gap-3 bg-slate-50/50">
                                        <User className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">{isHi ? 'शिकायतकर्ता नाम (Complainant Name)' : 'Complainant Name'}</span>
                                            <span className="font-extrabold text-sm text-navy-900">{complaint.name}</span>
                                        </div>
                                    </div>
                                    <div className="p-3.5 flex items-start gap-3 bg-slate-50/50">
                                        <Phone className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">{isHi ? 'पंजीकृत मोबाइल (Registered Mobile)' : 'Registered Mobile'}</span>
                                            <span className="font-mono font-bold text-sm text-navy-900">+91 {complaint.mobile}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                                    <div className="p-3.5 flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">{isHi ? 'स्थान / ग्राम पंचायत वार्ड (Location / Ward)' : 'Area / Ward Location'}</span>
                                            <span className="font-bold text-slate-900">{complaint.area}</span>
                                        </div>
                                    </div>
                                    <div className="p-3.5 flex items-start gap-3">
                                        <FileText className="w-4 h-4 text-navy-900 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[10px] text-slate-500 uppercase font-bold block">{isHi ? 'शिकायत की श्रेणी (Grievance Category)' : 'Grievance Category'}</span>
                                            <span className="font-bold text-slate-900">{typeLabels[complaint.complaint_type] || complaint.complaint_type}</span>
                                        </div>
                                    </div>
                                </div>

                                {complaint.description && (
                                    <div className="p-3.5 bg-amber-50/30">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                                            {isHi ? 'समस्या का विस्तृत विवरण (Grievance Description)' : 'Grievance Detailed Description'}
                                        </span>
                                        <p className="text-slate-800 leading-relaxed font-sans font-medium text-xs whitespace-pre-line">
                                            "{complaint.description}"
                                        </p>
                                    </div>
                                )}

                                {complaint.attachment_url && (
                                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="w-4 h-4 text-navy-900 shrink-0" />
                                                <span className="text-xs font-bold text-navy-950 uppercase tracking-wide">
                                                    {isHi ? 'संलग्न साक्ष्य / दस्तावेज' : 'Uploaded Evidence'}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                                                {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(complaint.attachment_url)
                                                    ? (isHi ? 'तस्वीर साक्ष्य (Photo Proof)' : 'Photo Proof')
                                                    : (isHi ? 'पीडीएफ दस्तावेज (PDF Document)' : 'PDF Document')}
                                            </span>
                                        </div>

                                        {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(complaint.attachment_url) ? (
                                            <div className="rounded-lg border-2 border-slate-200 overflow-hidden bg-white shadow-xs p-2">
                                                <div className="relative group flex items-center justify-center bg-slate-100/70 rounded-md p-2 min-h-[220px]">
                                                    <img
                                                        src={complaint.attachment_url}
                                                        alt="Complaint Attachment"
                                                        className="max-h-[380px] w-auto max-w-full object-contain rounded shadow-xs"
                                                        loading="lazy"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setEnlargedImage(complaint.attachment_url!)}
                                                        className="absolute bottom-3 right-3 bg-navy-950/85 hover:bg-navy-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
                                                        title={isHi ? 'बड़ा करके देखें' : 'View Full Image'}
                                                    >
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        <span>{isHi ? 'बड़ा देखें' : 'Zoom In'}</span>
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-slate-500 text-center font-medium mt-1.5">
                                                    {isHi ? 'नागरिक द्वारा शिकायत के साथ संलग्न की गई तस्वीर' : 'Citizen-uploaded photo evidence for this complaint'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-slate-200 overflow-hidden bg-white shadow-xs">
                                                <iframe
                                                    src={complaint.attachment_url}
                                                    className="w-full h-[450px] border-none"
                                                    title="Complaint PDF Document"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Official Lifecycle Stepper ── */}
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-lg border-2 border-slate-300">
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-xs font-extrabold uppercase tracking-widest text-navy-900 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                    {isHi ? '2. स्थिति प्रगति ऑडिट (Official Lifecycle Audit Progress)' : '2. Official Lifecycle Audit Progress'}
                                </p>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Stage {currentRank} of 3</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 relative">
                                {/* Track Line Background */}
                                <div className="absolute top-[18px] left-[16.66%] right-[16.66%] h-1 bg-slate-300 z-0 -translate-y-1/2">
                                    <div
                                        className="h-full bg-navy-900 transition-all duration-500"
                                        style={{
                                            width: currentRank <= 1 ? '0%' : currentRank === 2 ? '50%' : '100%',
                                        }}
                                    />
                                </div>

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
                                    <span className="text-[10px] text-slate-500 font-medium">
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
                                        {isHi ? 'निस्तारित व बंद' : 'Resolved'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        {currentRank >= 3 ? (isHi ? 'निस्तारण पूर्ण' : 'Officially Closed') : (isHi ? 'प्रतीक्षारत' : 'Awaiting')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Official Action & Remarks Audit Log ── */}
                        {updates.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-extrabold uppercase tracking-wider text-navy-900 flex items-center gap-1.5">
                                    <FileCheck className="w-4 h-4 text-amber-600" />
                                    {isHi ? '3. विभागीय कार्रवाई एवं आधिकारिक टिप्पणियां' : '3. Departmental Progress & Official Remarks Audit Log'}
                                </p>
                                <div className="space-y-2.5">
                                    {updates.map((update) => (
                                        <div key={update.id} className="p-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1.5">
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
                                                <div className="bg-white p-2.5 rounded border border-slate-300 text-slate-800 font-mono text-[11px] mt-1">
                                                    💬 <span className="font-semibold">{update.remark}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Inline Lightbox Modal (Same page, no new tab) */}
            {enlargedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                    onClick={() => setEnlargedImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-3 bg-navy-950 text-white flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-amber-400" />
                                {isHi ? 'संलग्न साक्ष्य (उच्च गुणवत्ता दृश्य)' : 'Uploaded Evidence (High Resolution)'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setEnlargedImage(null)}
                                className="p-1 rounded hover:bg-white/20 text-white transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-3 overflow-auto bg-slate-900/10 flex items-center justify-center">
                            <img
                                src={enlargedImage}
                                alt="Full size attachment"
                                className="max-h-[75vh] w-auto max-w-full object-contain rounded shadow-md"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
