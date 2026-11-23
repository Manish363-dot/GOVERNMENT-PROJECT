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

export const rentalAuthApi = {
  adminLogin: (identifier: string, password: string) =>
    api.post<{ success: boolean; data: RentalAdminLoginResponse; message: string }>(
      '/rental/auth/admin/login',
      { identifier, password }
    ),

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
};
