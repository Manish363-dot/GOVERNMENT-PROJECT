import { api } from '@/services/api';

export interface BillListItem {
  id: string;
  billNumber: string;
  billingMonth: string;
  billingYear: number;
  rentAmount: number;
  arrearsAmount: number;
  totalAmountDue: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  createdAt: string;
  tenant: {
    id: string;
    userCode: string;
    fullName: string;
    mobile: string;
    profilePhotoUrl?: string | null;
  };
  property: {
    id: string;
    propertyCode: string;
    propertyNumber: string;
    propertyName: string;
    location: string;
  };
  receipts: Array<{
    id: string;
    receiptNumber: string;
    amountPaid: number;
    issuedAt: string;
  }>;
}

export interface BillListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: BillListItem[];
}

export interface DuesSearchResult {
  totalOutstanding: number;
  billCount: number;
  message?: string;
  pendingBills: Array<{
    id: string;
    billNumber: string;
    billingMonth: string;
    totalAmountDue: number;
    amountPaid: number;
    balanceDue: number;
    dueDate: string;
    status: string;
    tenantName: string;
    tenantCode: string;
    propertyNumber: string;
    location: string;
  }>;
}

export interface DashboardAnalytics {
  totalUsers: number;
  totalProperties: number;
  allottedProperties: number;
  vacantProperties: number;
  occupancyRate: number;
  expectedMonthlyRent: number;
  collectedThisMonth: number;
  totalOverdue: number;
  todayCollected: number;
  todayTransactionsCount: number;
  todayAudit: Array<{
    id: string;
    receiptNumber: string;
    tenantName: string;
    tenantMobile: string;
    tenantCode: string;
    shopNumber: string;
    location: string;
    amount: number;
    paymentMethod: string;
    createdAt: string;
    billingMonth: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    label: string;
    billed: number;
    collected: number;
    overdue: number;
  }>;
}

export const rentalBillingApi = {
  generateMonthlyBills: (billingMonth: string) =>
    api.post<{ success: boolean; data: any; message: string }>('/rental/bills/generate', {
      billingMonth,
    }),

  getAnalytics: () =>
    api.get<{ success: boolean; data: DashboardAnalytics }>('/rental/bills/analytics'),

  listBills: (params: {
    search?: string;
    status?: string;
    billingMonth?: string;
    propertyId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.billingMonth) query.set('billingMonth', params.billingMonth);
    if (params.propertyId) query.set('propertyId', params.propertyId);
    if (params.userId) query.set('userId', params.userId);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return api.get<{ success: boolean; data: BillListResponse }>(`/rental/bills?${query.toString()}`);
  },

  getBillDetails: (billId: string) =>
    api.get<{ success: boolean; data: any }>(`/rental/bills/${billId}`),

  searchDues: (query: string) =>
    api.get<{ success: boolean; data: DuesSearchResult }>(`/rental/bills/dues/search?q=${encodeURIComponent(query)}`),
};
