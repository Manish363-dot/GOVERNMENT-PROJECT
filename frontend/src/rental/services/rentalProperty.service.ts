import { api } from '@/services/api';

export interface PropertyListItem {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyNumber: string;
  location: string;
  address: string;
  dimensionsSqft?: number | null;
  baseMonthlyRent: number;
  status: 'VACANT' | 'ALLOTTED' | 'MAINTENANCE' | 'DISPUTED';
  currentTenant?: {
    userId: string;
    userCode: string;
    fullName: string;
    mobile: string;
    profilePhotoUrl?: string | null;
    activeRent: number;
    leaseStartDate: string;
  } | null;
}

export interface PropertyListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PropertyListItem[];
}

export interface CreatePropertyInput {
  propertyName: string;
  propertyType: 'COMMERCIAL_SHOP' | 'ROADSIDE_STALL' | 'WAREHOUSE_GODOWN' | 'LAND_PARCEL' | 'OFFICE_SPACE' | 'OTHER';
  propertyNumber: string;
  location: string;
  address: string;
  dimensionsSqft?: number;
  baseMonthlyRent: number;
}

export interface RentHistoryEntry {
  id: string;
  property_id: string;
  user_id: string;
  previous_rent: number;
  new_rent: number;
  effective_date: string;
  reason: string;
  approved_by?: string;
  requested_by?: string;
  created_at: string;
  user?: {
    id: string;
    user_id: string;
    full_name: string;
    mobile: string;
  };
  property?: {
    id: string;
    property_id: string;
    property_number: string;
    location: string;
  };
}

export const rentalPropertyApi = {
  createProperty: (data: CreatePropertyInput) =>
    api.post<{ success: boolean; data: any; message: string }>('/rental/properties', data),

  listProperties: (params: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return api.get<{ success: boolean; data: PropertyListResponse }>(`/rental/properties?${query.toString()}`);
  },

  getPropertyDetails: (id: string) =>
    api.get<{ success: boolean; data: any }>(`/rental/properties/${id}`),

  assignProperty: (
    id: string,
    data: {
      userId: string;
      monthlyRent?: number;
      leaseStartDate: string;
      leaseEndDate?: string;
    }
  ) => api.post<{ success: boolean; data: any; message: string }>(`/rental/properties/${id}/assign`, data),

  unassignProperty: (id: string, reason: string) =>
    api.post<{ success: boolean; data: any; message: string }>(`/rental/properties/${id}/unassign`, { reason }),

  changeRent: (
    id: string,
    data: {
      userId: string;
      newRent: number;
      effectiveDate: string;
      reason: string;
      requestedBy?: string;
    }
  ) => api.post<{ success: boolean; data: any; message: string }>(`/rental/properties/${id}/rent-change`, data),

  getRentHistory: (id: string) =>
    api.get<{ success: boolean; data: RentHistoryEntry[] }>(`/rental/properties/${id}/rent-history`),
};
