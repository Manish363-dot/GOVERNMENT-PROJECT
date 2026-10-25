import { api } from '@/services/api';

export interface RentalAdminLoginResponse {
  token: string;
  admin: {
    id: string;
    username: string;
    fullName: string;
    role: 'SUPER_ADMIN' | 'SUB_ADMIN';
    mobile: string;
    email?: string;
    permissions: string[];
  };
}

export interface RentalUserLoginResponse {
  token: string;
  user: {
    id: string;
    userCode: string;
    fullName: string;
    mobile: string;
    email?: string;
    profilePhotoUrl?: string;
    status: string;
  };
}

export interface DesignatedOfficerProfile {
  full_name: string;
  designation: string;
  department: string;
  office_phone: string;
  official_email: string;
  office_address: string;
  working_hours: string;
}

export interface TenantProfileResponse {
  id: string;
  userCode: string;
  fullName: string;
  mobile: string;
  email?: string;
  profilePhotoUrl?: string;
  permanentAddress: string;
  currentAddress?: string;
  aadhaarMasked?: string;
  panMasked?: string;
  gstNumber?: string;
  status: string;
  activeProperty?: {
    propertyId: string;
    propertyName: string;
    propertyType: string;
    location: string;
    monthlyRent: number;
    allotmentDate: string;
  } | null;
  documents: Array<{
    id: string;
    doc_type: string;
    file_name: string;
    file_url: string;
    verification_status: string;
  }>;
  designatedOfficer: DesignatedOfficerProfile;
}

export const rentalAuthApi = {
  adminLogin: (identifier: string, password: string) =>
    api.post<{ success: boolean; data: RentalAdminLoginResponse; message: string }>(
      '/rental/auth/admin/login',
      { identifier, password }
    ),

  userLogin: (identifier: string, password: string) =>
    api.post<{ success: boolean; data: RentalUserLoginResponse; message: string }>(
      '/rental/auth/user/login',
      { identifier, password }
    ),

  getUserProfile: () =>
    api.get<{ success: boolean; data: TenantProfileResponse }>('/rental/auth/user/me'),

  changeUserPassword: (currentPassword: string, newPassword: string) =>
    api.post<{ success: boolean; message: string }>('/rental/auth/user/change-password', {
      currentPassword,
      newPassword,
    }),

  listSubAdmins: () =>
    api.get<{ success: boolean; data: any[] }>('/rental/auth/admin/subadmins'),

  createSubAdmin: (data: {
    username: string;
    fullName: string;
    mobile: string;
    email?: string;
    initialPassword: string;
    permissions?: string[];
  }) => api.post<{ success: boolean; data: any; message: string }>('/rental/auth/admin/subadmins', data),

  toggleSubAdminStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    api.put<{ success: boolean; data: any; message: string }>(
      `/rental/auth/admin/subadmins/${id}/status`,
      { status }
    ),

  getDesignatedOfficer: () =>
    api.get<{ success: boolean; data: DesignatedOfficerProfile }>('/rental/auth/officer'),
};
