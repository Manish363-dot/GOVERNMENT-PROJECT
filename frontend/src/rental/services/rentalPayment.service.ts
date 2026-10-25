import { api } from '@/services/api';

export interface InitiatePaymentResponse {
  paymentReference: string;
  gatewayOrderId: string;
  amount: number;
  currency: string;
  billNumber: string;
  propertyName: string;
  propertyNumber: string;
}

export interface VerifyPaymentInput {
  paymentReference: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
}

export interface VerifyPaymentResponse {
  status: string;
  receiptNumber: string;
  receiptId?: string;
  amountPaid: number;
  balanceDue: number;
  billStatus: string;
  message: string;
}

export interface CounterPaymentInput {
  billId: string;
  amount: number;
  paymentMethod: 'CASH' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS';
  referenceNumber?: string;
  remarks?: string;
}

export interface AuditRecord {
  id: string;
  receiptNumber: string;
  tenantId: string;
  tenantName: string;
  tenantMobile: string;
  tenantCode: string;
  shopNumber: string;
  location: string;
  propertyType: string;
  billNumber: string;
  billingMonth: string;
  amount: number;
  paymentMethod: string;
  gatewayRef: string;
  paymentReference: string;
  date: string;
}

export interface AuditLedgerResponse {
  total: number;
  page: number;
  limit: number;
  totalAmount: number;
  records: AuditRecord[];
}

export const rentalPaymentApi = {
  initiatePayment: (billId: string) =>
    api.post<{ success: boolean; data: InitiatePaymentResponse; message: string }>(
      '/rental/payments/initiate',
      { billId }
    ),

  verifyPayment: (data: VerifyPaymentInput) =>
    api.post<{ success: boolean; data: VerifyPaymentResponse; message: string }>(
      '/rental/payments/verify',
      data
    ),

  recordCounterPayment: (data: CounterPaymentInput) =>
    api.post<{ success: boolean; data: any; message: string }>(
      '/rental/payments/counter',
      data
    ),

  getAuditLedger: (params?: {
    date?: string;
    month?: string;
    year?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.month) query.set('month', params.month);
    if (params?.year) query.set('year', params.year);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    return api.get<{ success: boolean; data: AuditLedgerResponse }>(
      `/rental/payments/audit?${query.toString()}`
    );
  },
};
