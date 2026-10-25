import { api } from '@/services/api';

export interface RegisterTenantFormData {
  fullName: string;
  mobile: string;
  email?: string;
  permanentAddress: string;
  currentAddress?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  propertyId?: string;
  monthlyRent?: number;
  rentEffectiveDate?: string;
  initialPassword?: string;
  profilePhotoFile?: File | null;
  aadhaarFile?: File | null;
  panFile?: File | null;
  domicileFile?: File | null;
  gstFile?: File | null;
}

export interface TenantListItem {
  id: string;
  userCode: string;
  fullName: string;
  mobile: string;
  email?: string;
  profilePhotoUrl?: string;
  status: string;
  createdAt: string;
  assignedProperty?: {
    propertyId: string;
    propertyName: string;
    propertyNumber: string;
    location: string;
    monthlyRent: number;
  } | null;
  outstandingBalance: number;
}

export interface TenantListResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: TenantListItem[];
}

export const rentalUserApi = {
  registerTenant: async (formData: RegisterTenantFormData) => {
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('mobile', formData.mobile);
    if (formData.email) data.append('email', formData.email);
    data.append('permanentAddress', formData.permanentAddress);
    if (formData.currentAddress) data.append('currentAddress', formData.currentAddress);
    if (formData.aadhaarNumber) data.append('aadhaarNumber', formData.aadhaarNumber);
    if (formData.panNumber) data.append('panNumber', formData.panNumber);
    if (formData.gstNumber) data.append('gstNumber', formData.gstNumber);
    if (formData.propertyId) data.append('propertyId', formData.propertyId);
    if (formData.monthlyRent) data.append('monthlyRent', formData.monthlyRent.toString());
    if (formData.rentEffectiveDate) data.append('rentEffectiveDate', formData.rentEffectiveDate);
    if (formData.initialPassword) data.append('initialPassword', formData.initialPassword);

    if (formData.profilePhotoFile) data.append('profile_photo', formData.profilePhotoFile);
    if (formData.aadhaarFile) data.append('aadhaar_doc', formData.aadhaarFile);
    if (formData.panFile) data.append('pan_doc', formData.panFile);
    if (formData.domicileFile) data.append('domicile_doc', formData.domicileFile);
    if (formData.gstFile) data.append('gst_doc', formData.gstFile);

    return api.upload<{ success: boolean; data: any; message: string }>(
      '/rental/users/admin/register',
      data
    );
  },

  listTenants: (params: { search?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return api.get<{ success: boolean; data: TenantListResponse }>(`/rental/users/admin/list?${query.toString()}`);
  },

  getTenantDetails: (userId: string) =>
    api.get<{ success: boolean; data: any }>(`/rental/users/admin/${userId}`),

  updateTenantStatus: (userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', reason?: string) =>
    api.put<{ success: boolean; data: any; message: string }>(`/rental/users/admin/${userId}/status`, {
      status,
      reason,
    }),

  getSecureDocumentUrl: (docId: string) =>
    api.get<{ success: boolean; data: { docId: string; docType: string; fileName: string; presignedUrl: string; expiresInSeconds: number } }>(
      `/rental/users/documents/${docId}/secure-url`
    ),

  updateTenantProfile: async (
    userId: string,
    formData: Partial<RegisterTenantFormData> & { status?: string; password?: string }
  ) => {
    const data = new FormData();
    if (formData.fullName !== undefined) data.append('fullName', formData.fullName);
    if (formData.mobile !== undefined) data.append('mobile', formData.mobile);
    if (formData.email !== undefined) data.append('email', formData.email);
    if (formData.permanentAddress !== undefined) data.append('permanentAddress', formData.permanentAddress);
    if (formData.currentAddress !== undefined) data.append('currentAddress', formData.currentAddress);
    if (formData.aadhaarNumber !== undefined) data.append('aadhaarNumber', formData.aadhaarNumber);
    if (formData.panNumber !== undefined) data.append('panNumber', formData.panNumber);
    if (formData.gstNumber !== undefined) data.append('gstNumber', formData.gstNumber);
    if (formData.propertyId !== undefined) data.append('propertyId', formData.propertyId);
    if (formData.monthlyRent !== undefined) data.append('monthlyRent', formData.monthlyRent.toString());
    if (formData.status !== undefined) data.append('status', formData.status);
    if (formData.password) data.append('password', formData.password);

    if (formData.profilePhotoFile) data.append('profile_photo', formData.profilePhotoFile);
    if (formData.aadhaarFile) data.append('aadhaar_doc', formData.aadhaarFile);
    if (formData.panFile) data.append('pan_doc', formData.panFile);
    if (formData.domicileFile) data.append('domicile_doc', formData.domicileFile);
    if (formData.gstFile) data.append('gst_doc', formData.gstFile);

    return api.upload<{ success: boolean; data: any; message: string }>(
      `/rental/users/admin/${userId}`,
      data,
      'PUT'
    );
  },
};
