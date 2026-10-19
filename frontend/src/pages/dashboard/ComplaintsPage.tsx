import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { useRealtime } from '@/hooks/useRealtime';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquareWarning, X, Clock, User, MapPin, Phone, FileText, Save, Paperclip, ExternalLink, Image as ImageIcon, Archive, Trash2, RotateCcw, BadgeCheck, CheckCircle2, Maximize2, ChevronDown, ChevronUp, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import type { Complaint, ComplaintUpdate } from '@/types';

export const ComplaintsPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const statusLabels: Record<string, string> = {
    new: isHi?'नया' : 'New',
    in_progress: isHi?'प्रगति पर' : 'In Progress',
    resolved: isHi?'निस्तारित' : 'Resolved',
  };

  const complaintTypeLabels: Record<string, string> = {
    vehicle_not_arrived: isHi ? 'सफाई वाहन नहीं आया' :'Vehicle Did Not Arrive',
    garbage_not_collected: isHi?'कचरा नहीं उठाया गया' :'Garbage Not Collected',
    other: isHi ?'अन्य समस्या' : 'Other Issue',
  };
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', remark: '' });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setShowAll(false);
    fetchComplaints().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [filter]);

  // Realtime: new complaints
  useRealtime<{ type: string, new: Complaint }>('complaint_update', (payload) => {
    if (payload.type === 'INSERT' && payload.new) {
      setComplaints((prev) => [payload.new, ...prev.filter(c => c.id !== payload.new.id)]);
    } else if (payload.type === 'UPDATE' && payload.new) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === payload.new.id ? payload.new : c))
      );
    }
  });

  // ESC key to close modal or image
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (enlargedImage) {
          setEnlargedImage(null);
        } else if (selectedComplaint) {
          setSelectedComplaint(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComplaint, enlargedImage]);

  async function fetchComplaints() {
    try {
      const data = await complaintService.getAll(filter !== 'all' ? filter : undefined);
      setComplaints(data.complaints);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  }

  async function viewComplaint(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setStatusForm({ status: complaint.status, remark: '' });
    setUpdateError(null);
    setDetailLoading(true);
    try {
      const data = await complaintService.getById(complaint.id);
      setUpdates(data.updates);
    } catch (err) {
      console.error('Failed to fetch complaint details:', err);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedComplaint || !statusForm.status) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      await complaintService.updateStatus(selectedComplaint.id, statusForm);
      setSelectedComplaint({ ...selectedComplaint, status: statusForm.status as any });
      fetchComplaints();
      const data = await complaintService.getById(selectedComplaint.id);
      setUpdates(data.updates);
      setStatusForm({ ...statusForm, remark: '' });
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update complaint status');
    } finally {
      setUpdating(false);
    }
  }

  async function handleArchive(isArchived: boolean = true) {
    if (!selectedComplaint) return;
    const msg = isArchived
      ? 'क्या आप इस शिकायत को सुरक्षित रूप से आर्काइव करना चाहते हैं? यह सक्रिय सूची से हट जाएगी, लेकिन सरकारी ऑडिट अभिलेख सुरक्षित रहेंगे। (Archive complaint safely?)'
      : 'क्या आप इस शिकायत को पुनः सक्रिय रजिस्टर में पुनर्स्थापित करना चाहते हैं? (Restore complaint to active?)';
    if (!window.confirm(msg)) return;

    try {
      await complaintService.archive(selectedComplaint.id, isArchived);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to archive complaint');
    }
  }

  async function handleDeletePermanently() {
    if (!selectedComplaint) return;
    const msg = '⚠️ स्थायी रूप से हटाने की पुष्टि करें: क्या आप सचमुच इस शिकायत को हमेशा के लिए हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती। (Permanently delete this complaint record?)';
    if (!window.confirm(msg)) return;

    try {
      await complaintService.delete(selectedComplaint.id);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to delete complaint');
    }
  }

  const filterTabs = [
    { key: 'all', label: isHi ?'सभी सक्रिय' : 'All'},
    { key: 'new', label: isHi ?'नया' :'New' },
    { key: 'in_progress', label: isHi?'प्रगति पर' : 'In Progress' },
    { key: 'resolved', label: isHi ?'निस्तारित' : 'Resolved' },
    { key: 'confirmed', label: isHi ?'नागरिक पुष्ट' : 'Confirmed' },
    { key: 'archived', label: isHi ?'आर्काइव्ड' : 'Archived' },
  ];

  const COMPLAINTS_LIMIT = 5;

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.complaint_number.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q)
    );
  });

  const displayedComplaints = showAll ? filteredComplaints : filteredComplaints.slice(0, COMPLAINTS_LIMIT);
  const hasMultipleComplaints = filteredComplaints.length > COMPLAINTS_LIMIT;

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex items-center gap-2">
          <MessageSquareWarning className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[15px] sm:text-[16px] font-bold text-white uppercase tracking-normal">
              {isHi ? 'शिकायत निवारण पंजिका' :'Complaint Redressal Register'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        {/* Mobile View (< md): 2-column on phones, 3-column on small tablets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:hidden">
          {filterTabs.map((tab, idx) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-normal transition-colors text-center flex items-center justify-center border-b border-r border-slate-200 ${
                idx % 2 === 1 ? 'border-r-0 sm:border-r' : ''
              } ${
                (idx + 1) % 3 === 0 ? 'sm:border-r-0' : ''
              } ${
                idx >= 4 ? 'border-b-0' : ''
              } ${
                filter === tab.key
                  ? 'bg-[#0a1628] text-white font-black'
                  : 'text-slate-600 hover:bg-[#f0f4f9] hover:text-[#0a1628]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop & Tablet View (>= md): Horizontal segmented bar */}
        <div className="hidden md:flex divide-x divide-slate-300 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`shrink-0 flex-1 px-4 py-2.5 text-[11px] font-bold uppercase tracking-normal transition-colors whitespace-nowrap flex items-center justify-center ${
                filter === tab.key
                  ? 'bg-[#0a1628] text-white'
                  : 'text-slate-600 hover:bg-[#f0f4f9] hover:text-[#0a1628]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-300 rounded p-8 text-center text-slate-500 font-mono text-xs">
          डेटा लोड हो रहा है... (Loading complaints data...)
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded p-8 text-center text-slate-500 font-mono text-xs">
          {isHi ? 'कोई शिकायत नहीं मिली' : 'No complaints found in this category'}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded p-8 text-center text-slate-500 font-mono text-xs">
          {isHi ? 'खोज के अनुसार कोई शिकायत नहीं मिली' : 'No complaints matching your search'}
        </div>
      ) : (
        <div className="w-full bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[13px] sm:text-[14px] font-bold text-[#0a1628] uppercase tracking-normal flex items-center gap-1.5">
                <span>📋</span>
                <span>{isHi ? 'शिकायत रजिस्टर' : 'Grievance Register'}</span>
                <span className="text-slate-400 font-normal">|</span>
                <span className="font-mono text-[#1a3a6b] font-extrabold">{filteredComplaints.length} {isHi ? 'रिकॉर्ड' : 'Records'}</span>
              </p>
              {hasMultipleComplaints && !showAll && (
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {isHi ? `(प्रारंभिक ${COMPLAINTS_LIMIT} दिखाए गए)` : `(Showing top ${COMPLAINTS_LIMIT})`}
                </span>
              )}
            </div>

            {/* Quick search input when there are multiple complaints */}
            {complaints.length > 3 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder={isHi ? 'खोजें (ID, नाम, वार्ड)...' : 'Search (ID, name, ward)...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-7 text-xs bg-white border border-slate-300 rounded focus:border-[#1a3a6b] focus:outline-none w-48 sm:w-60"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-200">
            {displayedComplaints.map((complaint) => {
              return (
                <div
                  key={complaint.id}
                  onClick={() => viewComplaint(complaint)}
                  className="p-3.5 sm:px-5 sm:py-4 cursor-pointer space-y-1.5 transition-all hover:bg-blue-50/60 active:bg-blue-100/60 group"
                >
                  {/* Top line: Complaint ID + Complainant name + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <span className="font-mono text-xs sm:text-[13px] font-bold text-[#1a3a6b] group-hover:underline">
                        {complaint.complaint_number}
                      </span>
                      <span className="text-xs sm:text-[14px] font-semibold text-[#0a1628] truncate">
                        {complaint.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={complaint.status as any} className="text-[10px] sm:text-[11px] font-bold">
                        {statusLabels[complaint.status]}
                      </Badge>
                      {complaint.user_confirmed && (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
                          <BadgeCheck className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">Confirmed</span>
                        </span>
                      )}
                      {complaint.attachment_url && (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          <Paperclip className="w-3 h-3" />
                          <span className="hidden sm:inline">Evidence</span>
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1a3a6b] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                    </div>
                  </div>

                  {/* Second line: Area, Category, Date */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{complaint.area}</span>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">
                      {complaintTypeLabels[complaint.complaint_type]}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm')}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── View All Section (जब multiple complaints हों) ── */}
          {hasMultipleComplaints && (
            <div className="bg-[#f0f4f9] border-t border-slate-300 px-4 py-3 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-slate-600 font-mono">
                {showAll ? (
                  <span>
                    {isHi ? `सभी ${filteredComplaints.length} शिकायतें प्रदर्शित` : `Showing all ${filteredComplaints.length} complaints`}
                  </span>
                ) : (
                  <span>
                    {isHi ? `प्रारंभिक ${COMPLAINTS_LIMIT} / ${filteredComplaints.length} शिकायतें प्रदर्शित` : `Showing top ${COMPLAINTS_LIMIT} of ${filteredComplaints.length} complaints`}
                    <span className="text-slate-400 ml-1">
                      ({isHi ? `${filteredComplaints.length - COMPLAINTS_LIMIT} अन्य उपलब्ध` : `${filteredComplaints.length - COMPLAINTS_LIMIT} more`})
                    </span>
                  </span>
                )}
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="h-8 px-4 text-xs font-bold bg-white text-[#1a3a6b] hover:bg-[#1a3a6b] hover:text-white border-slate-300 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>{isHi ? 'कम देखें' : 'Show Less'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>{isHi ? `सभी देखें (${filteredComplaints.length})` : `View All (${filteredComplaints.length})`}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Big Card Modal: Complaint Details (अलग से बड़ा कार्ड) ── */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
          onClick={() => setSelectedComplaint(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0a1628] px-4 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm sm:text-base font-bold uppercase tracking-normal">
                      {isHi ? 'शिकायत विवरण' : 'Complaint Details'}
                    </p>
                    <span className="font-mono text-xs sm:text-sm bg-white/10 px-2 py-0.5 rounded text-amber-300 font-bold">
                      #{selectedComplaint.complaint_number}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={selectedComplaint.status as any} className="text-xs font-bold">
                  {statusLabels[selectedComplaint.status]}
                </Badge>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close (ESC)"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 divide-y divide-slate-200">
              {/* Complainant & Location Information */}
              <div className="pt-0">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1a3a6b]" />
                  <span>{isHi ? 'नागरिक एवं स्थान विवरण' : 'Citizen & Location Details'}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8fafc] p-3.5 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-sm block">{isHi ? 'शिकायतकर्ता का नाम' : 'Complainant Name'}:</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedComplaint.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div>
                      <span className="text-slate-500 text-sm block">{isHi ? 'मोबाइल नंबर' : 'Mobile'}:</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedComplaint.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-sm block">{isHi ? 'क्षेत्र / वार्ड ' : 'Area / Ward'}:</span>
                      <span className="font-bold text-slate-900 text-sm">{selectedComplaint.area}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 text-sm block">{isHi ? 'दर्ज दिनांक व समय' : 'Filed On'}:</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {format(new Date(selectedComplaint.created_at), 'dd MMM yyyy, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Type + Description */}
              <div className="pt-4 space-y-2.5">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isHi ? 'शिकायत का प्रकार' : 'Complaint Type'}
                  </p>
                  <p className="text-sm font-bold text-[#0a1628] bg-slate-100 inline-block px-3 py-1 rounded border border-slate-200">
                    {complaintTypeLabels[selectedComplaint.complaint_type] || selectedComplaint.complaint_type}
                  </p>
                </div>

                {selectedComplaint.description && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {isHi ? 'शिकायत विवरण' : 'Complaint Description'}
                    </p>
                    <div className="bg-[#f0f4f9] p-3.5 rounded-lg border border-slate-200">
                      <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                        {selectedComplaint.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attached Evidence */}
              {selectedComplaint.attachment_url && (
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#1a3a6b]" />
                      <span>{isHi ? 'संलग्न साक्ष्य' : 'Attached Evidence'}</span>
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(selectedComplaint.attachment_url)
                        ? (isHi ? 'फोटो साक्ष्य' : 'Photo Proof')
                        : (isHi ? 'पीडीएफ दस्तावेज' : 'PDF Document')}
                    </span>
                  </div>

                  {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(selectedComplaint.attachment_url) ? (
                    <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 relative group p-2 text-center">
                      <img
                        src={selectedComplaint.attachment_url}
                        alt="Attached complaint proof"
                        className="max-h-80 w-auto max-w-full mx-auto object-contain bg-slate-100 rounded"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() => setEnlargedImage(selectedComplaint.attachment_url!)}
                        className="absolute bottom-4 right-4 bg-navy-950/85 hover:bg-navy-900 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
                        title="Zoom In"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{isHi ? 'बड़ा देखें' : 'Zoom In'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
                      <iframe
                        src={selectedComplaint.attachment_url}
                        className="w-full h-80 border-none"
                        title="Complaint PDF Document"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Update Status Form */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>{isHi ? 'स्थिति अपडेट करें' : 'Update Status'}</span>
                  </p>
                </div>

                {updateError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-xs font-medium">
                    ⚠️ {updateError}
                  </div>
                )}

                {selectedComplaint.status === 'resolved' ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-950 text-sm">
                      <span>🔒</span> {isHi ? 'समस्या निस्तारित एवं सुरक्षित' : 'Grievance Resolved & Locked'}
                    </p>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      {isHi
                        ? 'यह शिकायत अंतिम चरण (निस्तारित) पर पहुंच चुकी है। इसमें अब परिवर्तन नहीं किया जा सकता।'
                        : 'Final stage reached. This grievance record is now resolved and locked.'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#f8fafc] p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      {isHi ? 'अगला स्थिति चरण चुनें' : 'Select Next Status'}
                    </label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      className="w-full h-9 border border-slate-300 bg-white px-3 text-xs font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded"
                    >
                      {selectedComplaint.status === 'new' && (
                        <>
                          <option value="new">{isHi ? 'नया' : 'New'}</option>
                          <option value="in_progress">{isHi ? 'प्रगति पर' : 'In Progress'}</option>
                          <option value="resolved">{isHi ? 'सीधे निस्तारित करें' : 'Resolved'}</option>
                        </>
                      )}
                      {selectedComplaint.status === 'in_progress' && (
                        <>
                          <option value="in_progress">{isHi ? 'प्रगति पर' : 'In Progress'}</option>
                          <option value="resolved">{isHi ? 'अंतिम निस्तारण' : 'Resolved'}</option>
                        </>
                      )}
                    </select>

                    <label className="text-[11px] font-bold text-slate-700 block">
                      {isHi ? 'आधिकारिक टिप्पणी / समाधान विवरण:' : 'Official Remark / Resolution Note:'}
                    </label>
                    <Textarea
                      placeholder={isHi ? 'समाधान विवरण या कारण लिखें...' : 'Add official remark or resolution details...'}
                      value={statusForm.remark}
                      onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                      className="min-h-[60px] text-xs font-mono border-slate-300 focus:border-[#1a3a6b] rounded"
                      rows={2}
                    />

                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating || !statusForm.status || statusForm.status === selectedComplaint.status}
                      className="w-full py-2.5 bg-[#1a3a6b] hover:bg-[#0a1628] text-white text-xs font-bold uppercase tracking-normal disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updating ? (isHi ? 'सहेज रहे हैं...' : 'Saving...') : (isHi ? 'स्थिति अपडेट सहेजें' : 'Save Status Update')}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Citizen Confirmation Indicator */}
              {selectedComplaint.user_confirmed && (
                <div className="pt-4">
                  <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <BadgeCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-emerald-950">
                          {isHi ? '✓ नागरिक द्वारा समस्या समाधान की पुष्टि की गई (Resolution Confirmed by Citizen)' : '✓ Resolution Confirmed by Citizen'}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-mono">
                          {selectedComplaint.user_confirmed_at
                            ? format(new Date(selectedComplaint.user_confirmed_at), 'dd MMM yyyy, hh:mm a')
                            : 'Verified by Citizen'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-1 rounded uppercase shadow-2xs">
                      {isHi ? 'सत्यापित' : 'Confirmed'}
                    </span>
                  </div>
                </div>
              )}

              {/* Administrative Actions */}
              {(selectedComplaint.user_confirmed || selectedComplaint.is_archived) && (
                <div className="pt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {isHi ? 'प्रशासनिक कार्रवाई' : 'Administrative Actions'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedComplaint.is_archived ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleArchive(false)}
                        className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isHi ? 'सक्रिय रजिस्टर में पुनर्स्थापित करें' : 'Restore to Active'}</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleArchive(true)}
                        className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                        title="Safe Government Archive"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{isHi ? 'आर्काइव करें' : 'Archive'}</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleDeletePermanently}
                      className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                      title="Permanently remove from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHi ? 'स्थायी रूप से हटाएं' : 'Delete Permanently'}</span>
                    </Button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    💡 {isHi ? 'सुरक्षा सुझाव: सरकारी ऑडिट हेतु आर्काइव करना अधिक सुरक्षित है।' : 'Security note: Archiving recommended for official audit trail.'}
                  </p>
                </div>
              )}

              {/* Update History */}
              {updates.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {isHi ? 'अपडेट इतिहास' : 'Update History'}
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {updates.map((update) => (
                      <div key={update.id} className="p-2.5 bg-[#f0f4f9] border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={update.status as any} className="text-[9px] font-bold">
                            {statusLabels[update.status] || update.status}
                          </Badge>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {format(new Date(update.updated_at), 'dd MMM yyyy, HH:mm')}
                          </span>
                        </div>
                        {update.remark && (
                          <p className="text-slate-700 font-sans text-xs bg-white p-2 rounded border border-slate-200">
                            💬 {update.remark}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Footer with Close Button */}
            <div className="px-4 sm:px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedComplaint(null)}
                className="h-8 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </Button>
            </div>
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
                <span>Uploaded Complaint Evidence (High Resolution)</span>
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
                alt="Full size complaint attachment"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
