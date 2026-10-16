import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { complaintService } from '@/services/complaint.service';
import { useRealtime } from '@/hooks/useRealtime';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquareWarning, X, Clock, User, MapPin, Phone, FileText, Save, Paperclip, ExternalLink, Image as ImageIcon, Archive, Trash2, RotateCcw, BadgeCheck, CheckCircle2, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Complaint, ComplaintUpdate } from '@/types';

export const ComplaintsPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const statusLabels: Record<string, string> = {
    new: isHi ? 'नया / खुला' : 'New',
    in_progress: isHi ? 'प्रगति पर' : 'In Progress',
    resolved: isHi ? 'निस्तारित' : 'Resolved',
  };

  const complaintTypeLabels: Record<string, string> = {
    vehicle_not_arrived: isHi ? 'सफाई वाहन नहीं आया' : 'Vehicle Did Not Arrive',
    garbage_not_collected: isHi ? 'कचरा नहीं उठाया गया' : 'Garbage Not Collected',
    other: isHi ? 'अन्य समस्या' : 'Other',
  };
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
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
      ? (isHi ? 'क्या आप इस शिकायत को सुरक्षित रूप से आर्काइव करना चाहते हैं? यह सक्रिय सूची से हट जाएगी, लेकिन सरकारी ऑडिट अभिलेख सुरक्षित रहेंगे।' : 'Are you sure you want to archive this complaint? It will be moved out of the active register while preserving official audit records.')
      : (isHi ? 'क्या आप इस शिकायत को पुनः सक्रिय रजिस्टर में पुनर्स्थापित करना चाहते हैं?' : 'Are you sure you want to restore this complaint to the active register?');
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
    const msg = isHi
      ? '⚠️ स्थायी रूप से हटाने की पुष्टि करें: क्या आप सचमुच इस शिकायत को हमेशा के लिए हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
      : '⚠️ Permanent Deletion: Are you sure you want to permanently delete this complaint? This action cannot be undone.';
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
    { key: 'all', label: isHi ? 'सभी सक्रिय' : 'All Active' },
    { key: 'new', label: isHi ? 'नया / खुला' : 'New' },
    { key: 'in_progress', label: isHi ? 'प्रगति पर' : 'In Progress' },
    { key: 'resolved', label: isHi ? 'निस्तारित' : 'Resolved' },
    { key: 'confirmed', label: isHi ? 'नागरिक द्वारा पुष्ट' : 'User Confirmed' },
    { key: 'archived', label: isHi ? 'आर्काइव्ड (सुरक्षित)' : 'Archived' },
  ];

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex items-center gap-2">
          <MessageSquareWarning className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[16px] font-bold text-white uppercase tracking-normal">
              {t('admin.grievances.title')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="flex divide-x divide-slate-300 overflow-x-auto touch-scroll no-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-normal transition-colors whitespace-nowrap touch-target flex items-center justify-center ${filter === tab.key
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
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No Complaints Available"
          description="There are no complaints to display. When citizens submit complaints through the website, they will appear here."
        />
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Complaints list */}
          <div className="lg:col-span-3 bg-white border border-slate-300 rounded overflow-hidden">
            <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
              <p className="text-[14px] font-bold text-[#0a1628] uppercase tracking-normal">
                Grievance Register — {complaints.length} Record(s)
              </p>
            </div>
            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto touch-scroll">
              {complaints.map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() => viewComplaint(complaint)}
                  className={`w-full text-left px-4 py-3 transition-colors ${selectedComplaint?.id === complaint.id
                    ? 'bg-[#e6edf7] border-l-4 border-l-[#1a3a6b]'
                    : 'hover:bg-[#f7f9fc] border-l-4 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[14px] font-bold text-[#1a3a6b]">
                        {complaint.complaint_number}
                      </span>
                      <span className="text-[14px] font-semibold text-[#0a1628]">{complaint.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={complaint.status as any}>
                        {statusLabels[complaint.status]}
                      </Badge>
                      {complaint.user_confirmed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded shadow-2xs">
                          <BadgeCheck className="w-2.5 h-2.5 text-emerald-600" />
                          <span>User Confirmed</span>
                        </span>
                      )}
                      {complaint.is_archived && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                          <Archive className="w-2.5 h-2.5 text-slate-500" />
                          <span>Archived</span>
                        </span>
                      )}
                      {complaint.attachment_url && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>Evidence</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[14px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {complaint.area}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm')}
                    </span>
                    <span className="text-slate-400">{complaintTypeLabels[complaint.complaint_type]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div ref={detailRef} className="lg:col-span-2">
            {selectedComplaint ? (
              <div className="bg-white border border-slate-300 rounded overflow-hidden sticky top-4">
                <div className="bg-[#0a1628] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-[14px] font-bold text-white uppercase tracking-normal">Complaint Details</p>
                  </div>
                  <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-200">
                  {/* ID + Status */}
                  <div className="px-4 py-2.5 flex items-center justify-between bg-[#f0f4f9]">
                    <span className="font-mono text-xs font-bold text-[#1a3a6b]">{selectedComplaint.complaint_number}</span>
                    <Badge variant={selectedComplaint.status as any}>{statusLabels[selectedComplaint.status]}</Badge>
                  </div>

                  {/* Details rows */}
                  <div className="px-4 py-3 space-y-2">
                    {[
                      { icon: User, label: 'Complainant', value: selectedComplaint.name },
                      { icon: Phone, label: 'Mobile', value: selectedComplaint.mobile },
                      { icon: MapPin, label: 'Area/Ward', value: selectedComplaint.area },
                      { icon: Clock, label: 'Filed On', value: format(new Date(selectedComplaint.created_at), 'dd MMM yyyy, HH:mm') },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-2 text-[11px]">
                        <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="text-slate-500 font-mono w-20 shrink-0">{label}:</span>
                        <span className="font-semibold text-[#0a1628]">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Type + Description */}
                  <div className="px-4 py-3 bg-[#f7f9fc]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal mb-1">Complaint Type</p>
                    <p className="text-[11px] font-semibold text-[#0a1628]">{complaintTypeLabels[selectedComplaint.complaint_type]}</p>
                    {selectedComplaint.description && (
                      <>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal mb-1 mt-2">Description</p>
                        <p className="text-[11px] text-slate-700 whitespace-pre-line">{selectedComplaint.description}</p>
                      </>
                    )}
                  </div>

                  {/* Attached Evidence (AWS S3) - Inline Display */}
                  {selectedComplaint.attachment_url && (
                    <div className="px-4 py-3 bg-white border-t border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-navy-950 uppercase tracking-normal flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-[#1a3a6b]" />
                          <span>Attached Evidence (संलग्न साक्ष्य)</span>
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                          {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(selectedComplaint.attachment_url)
                            ? 'Photo Proof'
                            : 'PDF Document'}
                        </span>
                      </div>

                      {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(selectedComplaint.attachment_url) ? (
                        <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 relative group p-2">
                          <img
                            src={selectedComplaint.attachment_url}
                            alt="Attached complaint proof"
                            className="w-full max-h-72 object-contain bg-slate-100 rounded mx-auto"
                            loading="lazy"
                          />
                          <button
                            type="button"
                            onClick={() => setEnlargedImage(selectedComplaint.attachment_url!)}
                            className="absolute bottom-4 right-4 bg-navy-950/85 hover:bg-navy-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md shadow flex items-center gap-1 transition-all cursor-pointer backdrop-blur-xs"
                            title="Zoom In"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Zoom In</span>
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

                  {/* Update Status */}
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-bold text-[#0a1628] uppercase tracking-normal flex items-center justify-between">
                      <span>Update Lifecycle Status</span>
                      <span className="text-[9px] text-amber-700 font-semibold">(Forward-Only Progress)</span>
                    </p>

                    {updateError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-[11px] font-medium">
                        ⚠️ {updateError}
                      </div>
                    )}

                    {selectedComplaint.status === 'resolved' ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs">
                        <p className="font-bold flex items-center gap-1.5 text-emerald-950">
                          <span>🔒</span> Grievance Resolved & Locked
                        </p>
                        <p className="text-[10px] text-emerald-800 mt-1">
                          This complaint has reached the final stage (Resolved) and cannot be modified or reverted to previous stages.
                        </p>
                      </div>
                    ) : (
                      <>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                          className="w-full h-8 border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
                        >
                          {selectedComplaint.status === 'new' && (
                            <>
                              <option value="new">New (Current Stage)</option>
                              <option value="in_progress">Advance to: In Progress ➔</option>
                              <option value="resolved">Advance to: Resolved ➔</option>
                            </>
                          )}
                          {selectedComplaint.status === 'in_progress' && (
                            <>
                              <option value="in_progress">In Progress (Current Stage)</option>
                              <option value="resolved">Advance to: Resolved (Final Stage) ➔</option>
                            </>
                          )}
                        </select>
                        <Textarea
                          placeholder="Add official remark / resolution notes..."
                          value={statusForm.remark}
                          onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                          className="min-h-[50px] text-[11px] font-mono border-slate-300 focus:border-[#1a3a6b] rounded-sm"
                          rows={2}
                        />
                        <button
                          onClick={handleUpdateStatus}
                          disabled={updating || !statusForm.status || statusForm.status === selectedComplaint.status}
                          className="w-full py-1.5 bg-[#1a3a6b] hover:bg-[#0a1628] text-white text-[11px] font-bold uppercase tracking-normal disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>{updating ? 'Saving...' : 'Save Lifecycle Update'}</span>
                        </button>
                      </>
                    )}
                  </div>

                  {/* ── Citizen Confirmation Indicator ── */}
                  {selectedComplaint.user_confirmed && (
                    <div className="px-4 py-3 bg-emerald-50/80 border-t border-emerald-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-emerald-950">
                              {isHi ? '✓ नागरिक द्वारा समस्या समाधान की पुष्टि की गई' : '✓ Resolution Confirmed by Citizen'}
                            </p>
                            <p className="text-[10px] text-emerald-700 font-mono">
                              {selectedComplaint.user_confirmed_at 
                                ? format(new Date(selectedComplaint.user_confirmed_at), 'dd MMM yyyy, hh:mm a') 
                                : 'Verified by Citizen'}
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase shadow-2xs">
                          User Confirmed
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Administrative Action Bar (Archive & Delete) ── */}
                  {(selectedComplaint.user_confirmed || selectedComplaint.is_archived) && (
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-navy-950 uppercase tracking-normal">
                          {isHi ? 'प्रशासनिक कार्रवाई (Admin Record Actions)' : 'Administrative Record Actions'}
                        </p>
                        {selectedComplaint.user_confirmed && !selectedComplaint.is_archived && (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Action Enabled
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {selectedComplaint.is_archived ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleArchive(false)}
                            className="h-8 text-xs bg-navy-900 hover:bg-navy-800 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isHi ? 'सक्रिय सूची में पुनर्स्थापित करें' : 'Restore to Active'}</span>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleArchive(true)}
                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
                            title="Safe Government Archive — keeps audit logs intact"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>{isHi ? 'आर्काइव करें (सुरक्षित)' : 'Archive (Safe)'}</span>
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
                          <span>{isHi ? 'स्थायी रूप से हटाएं (Delete)' : 'Delete Permanently'}</span>
                        </Button>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-tight">
                        {isHi 
                          ? '💡 सुरक्षा सुझाव: स्थायी डिलीट करने के बजाय आर्काइव करना अधिक सुरक्षित है, जिससे भविष्य के सरकारी ऑडिट हेतु संपूर्ण इतिहास सुरक्षित रहता है।' 
                          : '💡 Security note: Archiving is recommended over permanent deletion to maintain official records for government audit trails.'}
                      </p>
                    </div>
                  )}

                  {/* Update history */}
                  {updates.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-normal mb-2">Update History</p>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {updates.map((update) => (
                          <div key={update.id} className="flex items-center justify-between text-[10px] px-2 py-1.5 bg-[#f0f4f9] border border-slate-200 rounded-sm">
                            <Badge variant={update.status as any} className="text-[9px]">
                              {statusLabels[update.status]}
                            </Badge>
                            <span className="text-slate-500 font-mono">
                              {format(new Date(update.updated_at), 'dd MMM, HH:mm')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-300 rounded p-8 text-center">
                <MessageSquareWarning className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[11px] font-mono text-slate-500">Select a complaint from the register to view details</p>
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
