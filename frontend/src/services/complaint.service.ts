import { api } from './api';
import { Complaint, ComplaintUpdate } from '@/types';

export const complaintService = {
  // Public: send OTP
  sendOtp: (data: { mobile: string }) =>
    api.post<{ success: boolean; message: string; devOtp?: string }>('/complaints/send-otp', data),

  // Public: submit complaint with OTP (required)
  create: (data: {
    name: string;
    mobile: string;
    area: string;
    complaint_type: string;
    description?: string;
    otp: string; // Required
  }) => api.post<{ message: string; complaint_number: string; complaint: Complaint }>('/complaints', data),

  // Public: track complaint
  track: (trackingId: string) =>
    api.get<{ complaint: Complaint; updates: ComplaintUpdate[] }>(`/complaints/track/${encodeURIComponent(trackingId.trim())}`),

  // Admin: get all complaints
  getAll: (status?: string) =>
    api.get<{ complaints: Complaint[] }>(`/complaints${status ? `?status=${status}` : ''}`),

  // Admin: get complaint detail
  getById: (id: string) =>
    api.get<{ complaint: Complaint; updates: ComplaintUpdate[] }>(`/complaints/${id}`),

  // Admin: update complaint status
  updateStatus: (id: string, data: { status: string; remark?: string }) =>
    api.put<{ complaint: Complaint }>(`/complaints/${id}/status`, data),

  // Admin: get counts
  getCounts: () =>
    api.get<{ counts: { total: number; new: number; in_progress: number; resolved: number } }>('/complaints/counts'),
};
