export interface TenantDueRecord {
  shopNo: string;
  tenantName: string;
  market: string;
  monthlyRent: number;
  dueMonths: number;
  totalDue: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface RentalFeedbackInput {
  name: string;
  phone: string;
  shopNo?: string;
  message: string;
}

const sampleTenantData: TenantDueRecord[] = [
  {
    shopNo: 'SHOP-101',
    tenantName: 'रमेश चंद्र जोशी (Ramesh Chandra Joshi)',
    market: 'धारानौला मुख्य बाजार (Dharanaula Main Market)',
    monthlyRent: 4500,
    dueMonths: 2,
    totalDue: 9000,
    dueDate: '2026-11-05',
    status: 'pending'
  },
  {
    shopNo: 'SHOP-204',
    tenantName: 'सुरेश सिंह बिष्ट (Suresh Singh Bisht)',
    market: 'मॉल रोड बाजार अल्मोड़ा (Mall Road Almora)',
    monthlyRent: 6000,
    dueMonths: 0,
    totalDue: 0,
    dueDate: '2026-11-10',
    status: 'paid'
  },
  {
    shopNo: 'SHOP-308',
    tenantName: 'दीवान सिंह राणा (Diwan Singh Rana)',
    market: 'चौघानपाटा वाणिज्यिक परिसर (Chauganpata Complex)',
    monthlyRent: 5200,
    dueMonths: 1,
    totalDue: 5200,
    dueDate: '2026-11-01',
    status: 'pending'
  }
];

export class RentalService {
  /**
   * Search tenant dues by shop number or tenant name
   */
  async searchDues(query?: string): Promise<TenantDueRecord[]> {
    if (!query) return sampleTenantData;
    const q = query.trim().toLowerCase();
    const matched = sampleTenantData.filter(
      (item) =>
        item.shopNo.toLowerCase().includes(q) ||
        item.tenantName.toLowerCase().includes(q) ||
        item.market.toLowerCase().includes(q)
    );
    return matched.length > 0 ? matched : sampleTenantData;
  }

  /**
   * Record tenant grievance / feedback
   */
  async submitFeedback(input: RentalFeedbackInput) {
    const ticketId = `RENTAL-${Date.now().toString().slice(-6)}`;
    return {
      ticketId,
      name: input.name,
      shopNo: input.shopNo || 'N/A',
      submittedAt: new Date().toISOString(),
      status: 'OPEN'
    };
  }

  /**
   * Get health status for rental module
   */
  getHealth() {
    return {
      status: 'healthy',
      module: 'Commercial Asset & Rental Management',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }
}

export const rentalService = new RentalService();
