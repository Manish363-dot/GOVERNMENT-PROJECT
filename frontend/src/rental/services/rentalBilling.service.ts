import { api } from '@/services/api';

export interface BillListItem {
  id: string;
  billNumber: string;
  billingMonth: string;
  billingYear: number;
  rentAmount: number;
  gstAmount?: number;
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
  isThisMonthComplete?: boolean;
  currentMonth?: string;
  message?: string;
  tenant?: {
    name: string;
    code: string;
    mobile: string;
    shopNo: string;
    location: string;
  } | null;
  currentMonthBill?: {
    billNumber: string;
    billingMonth: string;
    rentAmount: number;
    gstAmount?: number;
    totalAmountDue: number;
    amountPaid: number;
    balanceDue: number;
    status: string;
    dueDate: string;
    receipt?: {
      receipt_number: string;
      amount_paid: number;
      issued_at: string;
    } | null;
  } | null;
  pendingBills: Array<{
    id: string;
    billNumber: string;
    billingMonth: string;
    rentAmount?: number;
    gstAmount?: number;
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
  allBills?: Array<{
    id: string;
    billNumber: string;
    billingMonth: string;
    rentAmount: number;
    gstAmount?: number;
    totalAmountDue: number;
    amountPaid: number;
    balanceDue: number;
    dueDate: string;
    status: string;
    receiptNumber?: string | null;
  }>;
  receipts?: Array<{
    receiptNumber: string;
    amountPaid: number;
    baseRentAmount?: number;
    gstAmount?: number;
    issuedAt: string;
    billingMonth: string;
    propertyNumber: string;
    tenantName: string;
  }>;
}

export interface DashboardAuditPaymentItem {
  id: string;
  receiptNumber: string;
  billId?: string | null;
  billNumber?: string;
  tenantId?: string | null;
  tenantName: string;
  tenantMobile: string;
  tenantCode: string;
  shopNumber: string;
  location: string;
  amount: number;
  baseRentAmount?: number;
  gstAmount?: number;
  isFullPayment?: boolean;
  paymentMethod: string;
  createdAt: string;
  billingMonth: string;
}

export interface DashboardAnalytics {
  currentMonth?: string;
  fiscalYearLabel?: string;
  totalUsers: number;
  activeUsers?: number;
  inactiveUsers?: number;
  totalProperties: number;
  allottedProperties: number;
  vacantProperties: number;
  maintenanceProperties?: number;
  occupancyRate: number;
  complianceRate?: number;
  pendingDocsCount?: number;
  expectedMonthlyBaseRent?: number;
  expectedMonthlyGst?: number;
  expectedMonthlyRent: number;
  collectedThisMonth: number;
  monthTransactionsCount?: number;
  fiscalYearCollected?: number;
  totalAllTimeCollected?: number;
  totalOverdue: number;
  overdueTenantsCount?: number;
  overdueBillsCount?: number;
  todayCollected: number;
  todayTransactionsCount: number;
  propertyByType?: Array<{
    type: string;
    count: number;
  }>;
  paymentModeBreakdown?: Array<{
    mode: string;
    amount: number;
    count: number;
  }>;
  topDefaulters?: Array<{
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    mobile: string;
    shopNumber: string;
    location: string;
    unpaidMonthsCount: number;
    outstandingAmount: number;
    oldestPendingBillId: string;
    oldestBillingMonth: string;
  }>;
  leaseAlerts?: Array<{
    tenantId: string;
    tenantName: string;
    mobile: string;
    shopNumber: string;
    location: string;
    leaseEndDate: string;
    daysRemaining: number;
  }>;
  marketBreakdown?: Array<{
    location: string;
    totalShops: number;
    allottedShops: number;
    vacantShops: number;
    collectedAmount: number;
    pendingAmount: number;
  }>;
  todayAudit: DashboardAuditPaymentItem[];
  recentPayments?: DashboardAuditPaymentItem[];
  availableYears?: number[];
  yearlyTrends?: Record<
    string,
    Array<{
      month: string;
      monthNum: number;
      label: string;
      labelHi: string;
      fullLabel: string;
      fullLabelHi: string;
      target: number;
      achieved: number;
      remaining: number;
      overdue?: number;
      achievedPct: number;
    }>
  >;
  monthlyTrends: Array<{
    month: string;
    year?: number;
    monthNum?: number;
    label: string;
    labelHi?: string;
    baseBilled?: number;
    gstBilled?: number;
    billed: number;
    collected: number;
    overdue: number;
  }>;
}

export interface RentManagementReceiptRef {
  receiptId: string;
  receiptNumber: string;
  amountPaid: number;
  baseRentAmount?: number;
  gstAmount?: number;
  billingPeriod: string;
  billNumber: string;
  issuedAt: string;
  paymentMethod: string;
  collectorName?: string;
}

export interface RentManagementMonthlyRecord {
  billingMonth: string; // YYYY-MM
  year: number;
  month: number; // 1-12
  billId: string | null;
  billNumber: string | null;
  rentAmount: number;
  gstAmount?: number;
  totalAmountDue: number;
  amountPaid: number;
  balanceDue: number;
  dueDate: string;
  status: 'PAID' | 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID' | 'UPCOMING' | 'NOT_ALLOTTED';
  receipt: RentManagementReceiptRef | null;
}

export interface RentManagementPaymentHistoryItem {
  paymentId: string;
  paymentReference: string;
  receiptId: string;
  receiptNumber: string;
  amountPaid: number;
  baseRentAmount?: number;
  gstAmount?: number;
  paymentMethod: string;
  referenceNumber: string;
  billingPeriod: string;
  paidMonths: string[];
  billNumber: string;
  paidAt: string;
  collectorName?: string;
}

export interface RentManagementTenantCard {
  tenantId: string;
  tenantCode: string;
  fullName: string;
  mobile: string;
  email: string | null;
  profilePhotoUrl: string | null;
  shop: {
    propertyId: string;
    propertyCode: string;
    shopName: string;
    shopCode: string;
    address: string;
    location: string;
    allotmentDate: string;
    leaseEndDate: string | null;
    monthlyRent: number;
  } | null;
  summary: {
    totalRent: number;
    totalPaid: number;
    outstandingAmount: number;
    overdueMonthsCount: number;
    overdueMonths: string[];
    unpaidMonthsCount: number;
    paymentStatus: 'PAID' | 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID';
  };
  availableYears: number[];
  monthlyRecords: RentManagementMonthlyRecord[];
  paymentHistory: RentManagementPaymentHistoryItem[];
}

export interface RentManagementOverviewResponse {
  currentMonth: string;
  currentYear: number;
  summary: {
    totalTenants: number;
    totalRent: number;
    totalPaid: number;
    totalOutstanding: number;
    overdueTenantsCount: number;
  };
  tenants: RentManagementTenantCard[];
}

export const rentalBillingApi = {
  generateMonthlyBills: (billingMonth: string) =>
    api.post<{ success: boolean; data: any; message: string }>('/rental/bills/generate', {
      billingMonth,
    }),

  getAnalytics: () =>
    api.get<{ success: boolean; data: DashboardAnalytics }>('/rental/bills/analytics'),

  getRentManagementOverview: (params?: { search?: string; status?: string; year?: number; tenantId?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.year) query.set('year', String(params.year));
    if (params?.tenantId) query.set('tenantId', params.tenantId);
    const qs = query.toString();
    return api.get<{ success: boolean; data: RentManagementOverviewResponse }>(
      `/rental/bills/rent-management${qs ? `?${qs}` : ''}`
    );
  },

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
