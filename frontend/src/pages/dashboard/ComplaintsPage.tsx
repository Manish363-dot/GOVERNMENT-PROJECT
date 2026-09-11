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
import { MessageSquareWarning, Search, X, Clock, User, MapPin, Phone } from 'lucide-react';
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

  return (
    <div className="animate-fade-in">
      {/* Official Government Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              <MessageSquareWarning className="w-3 h-3 text-emerald-600" />
              लोक शिकायत कक्ष • Uttarakhand Portal
            </span>
          </div>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Grievance & Complaints Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor and resolve citizen waste collection grievances across all Zila Panchayat wards
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 my-5 flex-wrap">
        {['all', 'new', 'in_progress', 'resolved'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
            className={filter === status ? 'bg-navy-900 hover:bg-navy-800 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'}
          >
            {status === 'all' ? 'All Grievances' : statusLabels[status]}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="No Complaints Available"
          description="There are no complaints to display. When citizens submit complaints through the website, they will appear here."
        />
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Complaints list */}
          <div className="lg:col-span-3 space-y-3 max-h-[700px] overflow-y-auto">
            {complaints.map((complaint) => (
              <button
                key={complaint.id}
                onClick={() => viewComplaint(complaint)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${selectedComplaint?.id === complaint.id
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-white hover:border-primary/30 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-primary">
                      {complaint.complaint_number}
                    </span>
                    <p className="font-semibold text-sm text-navy-900 mt-0.5">{complaint.name}</p>
                  </div>
                  <Badge variant={complaint.status as any}>
                    {statusLabels[complaint.status]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-text">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {complaint.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(complaint.created_at), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-navy-500 mt-1.5 bg-navy-50 rounded px-2 py-1 inline-block">
                  {complaintTypeLabels[complaint.complaint_type]}
                </p>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2">
            {selectedComplaint ? (
              <div className="bg-white rounded-xl border border-border p-5 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-poppins font-semibold text-navy-900">Complaint Details</h3>
                  <button onClick={() => setSelectedComplaint(null)}>
                    <X className="w-4 h-4 text-navy-400" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">
                      {selectedComplaint.complaint_number}
                    </span>
                    <Badge variant={selectedComplaint.status as any}>
                      {statusLabels[selectedComplaint.status]}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-navy-400" />
                      <span>{selectedComplaint.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-navy-400" />
                      <span>{selectedComplaint.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-navy-400" />
                      <span>{selectedComplaint.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-navy-400" />
                      <span>{format(new Date(selectedComplaint.created_at), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                  </div>

                  <div className="bg-navy-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-navy-500 mb-1">Type</p>
                    <p className="text-sm">{complaintTypeLabels[selectedComplaint.complaint_type]}</p>
                    {selectedComplaint.description && (
                      <>
                        <p className="text-xs font-medium text-navy-500 mb-1 mt-2">Description</p>
                        <p className="text-sm">{selectedComplaint.description}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Update status */}
                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-sm text-navy-900">Update Status</h4>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                      className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Remark</Label>
                    <Textarea
                      placeholder="Add a remark..."
                      value={statusForm.remark}
                      onChange={(e) => setStatusForm({ ...statusForm, remark: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleUpdateStatus} disabled={updating} className="w-full">
                    {updating ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>

                {/* Update history */}
                {updates.length > 0 && (
                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="font-semibold text-sm text-navy-900 mb-3">Update History</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {updates.map((update) => (
                        <div key={update.id} className="text-xs p-2 bg-navy-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <Badge variant={update.status as any} className="text-[10px]">
                              {statusLabels[update.status]}
                            </Badge>
                            <span className="text-navy-400">
                              {format(new Date(update.updated_at), 'dd MMM, HH:mm')}
                            </span>
                          </div>
                          {update.remark && (
                            <p className="mt-1 text-navy-600">{update.remark}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-border p-8 text-center">
                <MessageSquareWarning className="w-8 h-8 text-navy-300 mx-auto mb-3" />
                <p className="text-sm text-secondary-text">Select a complaint to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
