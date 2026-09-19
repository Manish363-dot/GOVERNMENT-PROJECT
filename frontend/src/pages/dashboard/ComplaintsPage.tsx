import { useState, useEffect } from 'react';
import { complaintService } from '@/services/complaint.service';
import { useRealtime } from '@/hooks/useRealtime';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareWarning, X, Clock, User, MapPin, Phone, FileText, Save } from 'lucide-react';
import { format } from 'date-fns';
import type { Complaint, ComplaintUpdate } from '@/types';

const statusLabels: Record<string, string> = {
  new: 'New',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const complaintTypeLabels: Record<string, string> = {
  vehicle_not_arrived: 'Vehicle Did Not Arrive',
  garbage_not_collected: 'Garbage Not Collected',
  other: 'Other',
};

export function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updates, setUpdates] = useState<ComplaintUpdate[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', remark: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  // Realtime: new complaints
  useRealtime<Complaint>('complaints', (payload) => {
    if (payload.eventType === 'INSERT' && payload.new) {
      setComplaints((prev) => [payload.new as Complaint, ...prev]);
    } else if (payload.eventType === 'UPDATE' && payload.new) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === (payload.new as Complaint).id ? (payload.new as Complaint) : c))
      );
    }
  });

  async function fetchComplaints() {
    setLoading(true);
    try {
      const data = await complaintService.getAll(filter !== 'all' ? filter : undefined);
      setComplaints(data.complaints);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  }

  async function viewComplaint(complaint: Complaint) {
    setSelectedComplaint(complaint);
    setStatusForm({ status: complaint.status, remark: '' });
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
    try {
      await complaintService.updateStatus(selectedComplaint.id, statusForm);
      setSelectedComplaint({ ...selectedComplaint, status: statusForm.status as any });
      fetchComplaints();
      const data = await complaintService.getById(selectedComplaint.id);
      setUpdates(data.updates);
      setStatusForm({ ...statusForm, remark: '' });
    } catch (err) {
      console.error('Failed to update complaint:', err);
    } finally {
      setUpdating(false);
    }
  }

  const filterTabs = [
    { key: 'all', label: 'All Grievances' },
    { key: 'new', label: 'New' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex items-center gap-2">
          <MessageSquareWarning className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[16px] font-bold text-white uppercase tracking-wide">Grievance &amp; Complaints Desk</p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="flex divide-x divide-slate-300 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${filter === tab.key
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
              <p className="text-[14px] font-bold text-[#0a1628] uppercase tracking-widest font-mono">
                Grievance Register — {complaints.length} Record(s)
              </p>
            </div>
            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
              {complaints.map((complaint) => (
                <button
                  key={complaint.id}
                  onClick={() => viewComplaint(complaint)}
                  className={`w-full text-left px-4 py-3 transition-colors ${selectedComplaint?.id === complaint.id
                      ? 'bg-[#e6edf7] border-l-2 border-l-[#1a3a6b]'
                      : 'hover:bg-[#f7f9fc] border-l-2 border-l-transparent'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[14px] font-bold text-[#1a3a6b]">
                        {complaint.complaint_number}
                      </span>
                      <span className="text-[14px] font-semibold text-[#0a1628]">{complaint.name}</span>
                    </div>
                    <Badge variant={complaint.status as any}>
                      {statusLabels[complaint.status]}
                    </Badge>
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
          <div className="lg:col-span-2">
            {selectedComplaint ? (
              <div className="bg-white border border-slate-300 rounded overflow-hidden sticky top-4">
                <div className="bg-[#0a1628] px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-[14px] font-bold text-white uppercase tracking-wider">Complaint Details</p>
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
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Complaint Type</p>
                    <p className="text-[11px] font-semibold text-[#0a1628]">{complaintTypeLabels[selectedComplaint.complaint_type]}</p>
                    {selectedComplaint.description && (
                      <>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 mt-2">Description</p>
                        <p className="text-[11px] text-slate-700">{selectedComplaint.description}</p>
                      </>
                    )}
                  </div>

                  {/* Update Status */}
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[10px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">Update Status</p>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      className="w-full h-8 border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <Textarea
                      placeholder="Add official remark..."
                      value={statusForm.remark}
                      onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                      rows={2}
                      className="text-[11px] font-mono resize-none"
                    />
                    <button
                      onClick={handleUpdateStatus}
                      disabled={updating}
                      className="w-full flex items-center justify-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider py-2 rounded-sm transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      {updating ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>

                  {/* Update history */}
                  {updates.length > 0 && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">Update History</p>
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
    </div>
  );
}
