import { api } from './api';
import { Vehicle } from '@/types';

export const vehicleService = {
  getAll: () => api.get<{ vehicles: Vehicle[] }>('/vehicles'),
  getById: (id: string) => api.get<{ vehicle: Vehicle }>(`/vehicles/${id}`),
  create: (data: { vehicle_number: string; vehicle_name?: string; vehicle_type?: string }) =>
    api.post<{ vehicle: Vehicle }>('/vehicles', data),
  update: (id: string, data: Partial<Vehicle>) =>
    api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/vehicles/${id}`),
};
