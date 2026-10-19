import { api } from './api';

export interface GpsDevice {
  id: string;
  device_name?: string | null;
  device_identifier: string;
  imei?: string | null;
  sim_number?: string | null;
  device_type?: string;
  status: string;
  ignition?: boolean;
  last_seen_at: string | null;
  created_at: string;
  assigned_vehicle?: {
    id: string;
    vehicle_number: string;
    vehicle_name: string | null;
  } | null;
}

export const gpsDeviceService = {
  getAll: () => api.get<{devices: GpsDevice[]}>('/gps-devices'),
  
  create: (data: Partial<GpsDevice>) => api.post('/gps-devices', data),

  update: (id: string, data: Partial<GpsDevice>) => api.put<{device: GpsDevice}>(`/gps-devices/${id}`, data),

  delete: (id: string) => api.delete(`/gps-devices/${id}`),

  assignToVehicle: (vehicleId: string, gpsDeviceId: string) => api.post(`/gps-devices/assign`, { vehicle_id: vehicleId, gps_device_id: gpsDeviceId }),
};
