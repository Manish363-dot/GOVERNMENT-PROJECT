import { api } from '@/services/api';

export interface NoticeItem {
  id: string;
  noticeNumber: string;
  title: string;
  message: string;
  category: 'PUBLIC' | 'INDIVIDUAL';
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  attachmentUrl?: string | null;
  publishedAt: string;
  expiresAt?: string | null;
  recipient?: {
    id: string;
    userCode: string;
    fullName: string;
    mobile: string;
  } | null;
}

export interface NoticeListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: NoticeItem[];
}

export interface CreateNoticeInput {
  title: string;
  message: string;
  category: 'PUBLIC' | 'INDIVIDUAL';
  recipientUserId?: string;
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  attachmentUrl?: string;
  expiresAt?: string;
}

export const rentalNoticeApi = {
  createNotice: (data: CreateNoticeInput) =>
    api.post<{ success: boolean; data: NoticeItem; message: string }>('/rental/notices', data),

  listNotices: (params: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return api.get<{ success: boolean; data: NoticeListResponse }>(`/rental/notices?${query.toString()}`);
  },

  deleteNotice: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/rental/notices/${id}`),
};
