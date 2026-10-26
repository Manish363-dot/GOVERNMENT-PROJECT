import { api } from '@/services/api';

export interface LedgerOverview {
  fiscalYear: string;
  currentMonth: string;
  totalRentCollectedAllTime: number;
  todayCollection: number;
  monthlyCollection: number;
  yearlyCollection: number;
  totalBilledAllTime: number;
  totalRentDue: number;
  totalTenants: number;
  activeTenants: number;
  totalProperties: number;
  allottedProperties: number;
  vacantProperties: number;
  hasCustomFilter?: boolean;
  periodCollection?: number | null;
  periodCount?: number | null;
}

export interface LedgerTransactionRecord {
  id: string;
  date: string;
  receiptNumber: string;
  paymentReference: string;
  gatewayRef: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  tenantMobile: string;
  tenantRegistrationDate?: string;
  shopNumber: string;
  propertyName: string;
  location: string;
  propertyType: string;
  billNumber: string;
  billingMonth: string;
  amount: number;
  remainingBalance: number;
  paymentMethod: string;
  status: string;
}

export interface LedgerTransactionsResponse {
  totalCount: number;
  page: number;
  limit: number;
  totalFilteredAmount: number;
  records: LedgerTransactionRecord[];
}

export interface TenantLedgerRow {
  id: string;
  date: string;
  type: 'BILL' | 'PAYMENT' | 'ADJUSTMENT' | 'OPENING';
  documentNumber: string;
  description: string;
  shopNumber: string;
  billingPeriod?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  paymentMethod?: string;
  transactionRef?: string;
  status: string;
}

export interface TenantLedgerStatementResponse {
  tenant: {
    id: string;
    tenantCode: string;
    fullName: string;
    mobile: string;
    email: string;
    permanentAddress: string;
    currentAddress: string;
    aadhaarMasked: string;
    panMasked: string;
    gstNumber: string;
    status: string;
    registrationDate: string; // Registration date
  };
  allotment: {
    assignmentId: string;
    propertyId: string;
    propertyCode: string;
    propertyNumber: string;
    propertyName: string;
    location: string;
    address: string;
    propertyType: string;
    dimensionsSqft?: number | null;
    allotmentDate: string;
    leaseStartDate: string;
    leaseEndDate?: string | null; // Validity date
    isValid: boolean;
    isExpired: boolean;
    monthlyRent: number;
    isActive: boolean;
  } | null;
  summary: {
    totalBilled: number;
    totalPaid: number;
    totalOutstanding: number;
    totalReceiptsIssued: number;
    lastPaymentDate?: string | null;
    lastPaymentAmount?: number;
  };
  ledgerHistory: TenantLedgerRow[];
  rawBills: Array<{
    id: string;
    billNumber: string;
    billingMonth: string;
    rentAmount: number;
    arrearsAmount: number;
    totalAmountDue: number;
    amountPaid: number;
    balanceDue: number;
    dueDate: string;
    status: string;
    createdAt: string;
  }>;
  rawPayments: Array<{
    id: string;
    paymentReference: string;
    receiptNumber: string;
    billingMonth: string;
    shopNumber?: string;
    amount: number;
    paymentMethod: string;
    gatewayRef?: string;
    date: string;
    status: string;
  }>;
}

export interface TenantDropdownItem {
  id: string;
  tenantCode: string;
  fullName: string;
  mobile: string;
  status: string;
  registeredAt: string;
  shopNumber: string;
  location: string;
  monthlyRent: number;
  leaseEndDate?: string | null;
}

export const rentalLedgerApi = {
  getOverview: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year);
    return api.get<{ success: boolean; data: LedgerOverview }>(
      `/rental/ledger/overview?${query.toString()}`
    );
  },

  getTransactions: (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    search?: string;
    paymentMethod?: string;
    limit?: number;
    page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year);
    if (params?.search) query.set('search', params.search);
    if (params?.paymentMethod) query.set('paymentMethod', params.paymentMethod);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.page) query.set('page', params.page.toString());
    return api.get<{ success: boolean; data: LedgerTransactionsResponse }>(
      `/rental/ledger/transactions?${query.toString()}`
    );
  },

  getTenantLedger: (userId: string) => {
    return api.get<{ success: boolean; data: TenantLedgerStatementResponse }>(
      `/rental/ledger/tenant/${userId}`
    );
  },

  getTenantsList: (search?: string) => {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    return api.get<{ success: boolean; data: TenantDropdownItem[] }>(
      `/rental/ledger/tenants?${query.toString()}`
    );
  },
};
