import { api } from './api';
import { Complaint, ComplaintUpdate } from '@/types';

export const complaintService = {
  // Public: upload evidence attachment directly to AWS S3
  uploadAttachment: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{ url: string; originalName: string; size: number; mimetype: string }>('/complaints/upload', formData);
  },

  // Public: Send verification OTP to WhatsApp
  sendOtp: (mobile: string) =>
    api.post<{ success: boolean; message: string; whatsappSent: boolean; devOtp?: string }>('/complaints/send-otp', { mobile }),

  // Public: Verify WhatsApp OTP
  verifyOtp: (mobile: string, otp: string) =>
    api.post<{ success: boolean; message: string }>('/complaints/verify-otp', { mobile, otp }),

  // Public: submit complaint
  create: (data: {
    name: string;
    mobile: string;
    area: string;
    complaint_type: string;
    description?: string;
    attachment_url?: string | null;
  }) => api.post<{ message: string; complaint_number: string; complaint: Complaint }>('/complaints', data),

  // Public: track complaint
  track: (trackingId: string) =>
    api.get<{ complaint: Complaint; updates: ComplaintUpdate[] }>(`/complaints/track/${encodeURIComponent(trackingId.trim())}`),

  // Public: citizen confirms resolution
  confirmResolution: (trackingIdOrId: string) =>
    api.post<{ message: string; complaint: Complaint }>(`/complaints/track/${encodeURIComponent(trackingIdOrId.trim())}/confirm`, {}),

  // Admin: get all complaints
  getAll: (status?: string) =>
    api.get<{ complaints: Complaint[] }>(`/complaints${status ? `?status=${status}` : ''}`),

  // Admin: get complaint detail
  getById: (id: string) =>
    api.get<{ complaint: Complaint; updates: ComplaintUpdate[] }>(`/complaints/${id}`),

  // Admin: update complaint status
  updateStatus: (id: string, data: { status: string; remark?: string }) =>
    api.put<{ complaint: Complaint }>(`/complaints/${id}/status`, data),

  // Admin: archive or restore complaint
  archive: (id: string, isArchived: boolean = true) =>
    api.put<{ message: string; complaint: Complaint }>(`/complaints/${id}/archive`, { isArchived }),

  // Admin: permanently delete complaint
  delete: (id: string) =>
    api.delete<{ message: string }>(`/complaints/${id}`),

  // Admin: get counts
  getCounts: () =>
    api.get<{ counts: { total: number; new: number; in_progress: number; resolved: number; confirmed: number; archived: number } }>('/complaints/counts'),
};
