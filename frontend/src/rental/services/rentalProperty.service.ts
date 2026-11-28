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
  photoUrls?: string[];
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

export interface PublicAvailableShopItem {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  propertyNumber: string;
  location: string;
  address: string;
  dimensionsSqft?: number | null;
  baseMonthlyRent: number;
  photoUrls: string[];
  createdAt: string;
}

export interface PropertyListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PropertyListItem[];
}

export interface CreatePropertyInput {
  propertyName?: string;
  propertyType: 'COMMERCIAL_SHOP' | 'ROADSIDE_STALL' | 'WAREHOUSE_GODOWN' | 'LAND_PARCEL' | 'OFFICE_SPACE' | 'OTHER';
  propertyNumber: string;
  location?: string;
  address: string;
  dimensionsSqft?: number;
  baseMonthlyRent: number;
  photos?: File[];
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
  createProperty: (data: CreatePropertyInput) => {
    if (data.photos && data.photos.length > 0) {
      const fd = new FormData();
      if (data.propertyName) fd.append('propertyName', data.propertyName);
      fd.append('propertyType', data.propertyType);
      fd.append('propertyNumber', data.propertyNumber);
      if (data.location) fd.append('location', data.location);
      fd.append('address', data.address);
      if (data.dimensionsSqft !== undefined && data.dimensionsSqft !== null) {
        fd.append('dimensionsSqft', String(data.dimensionsSqft));
      }
      fd.append('baseMonthlyRent', String(data.baseMonthlyRent));
      data.photos.slice(0, 3).forEach((file) => {
        fd.append('shop_photos', file);
      });
      return api.upload<{ success: boolean; data: any; message: string }>('/rental/properties', fd, 'POST');
    }
    const { photos, ...jsonPayload } = data;
    return api.post<{ success: boolean; data: any; message: string }>('/rental/properties', jsonPayload);
  },

  updatePropertyPhotos: (id: string, keepUrls: string[], newFiles: File[]) => {
    const fd = new FormData();
    fd.append('keepUrls', JSON.stringify(keepUrls));
    newFiles.slice(0, 3).forEach((file) => {
      fd.append('shop_photos', file);
    });
    return api.upload<{ success: boolean; data: { id: string; photoUrls: string[] }; message: string }>(
      `/rental/properties/${id}/photos`,
      fd,
      'PUT'
    );
  },

  listPublicAvailableProperties: (force = false) =>
    api.get<{ success: boolean; data: PublicAvailableShopItem[] }>(
      '/rental/properties/public/available',
      { force, freshMs: 5_000 }
    ),

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

  deleteProperty: (id: string) =>
    api.delete<{ success: boolean; data: any; message: string }>(`/rental/properties/${id}`),
};
