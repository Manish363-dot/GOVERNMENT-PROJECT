import { api } from './api';

export interface GpsDevice {
  id: string;
  device_identifier: string;
  device_type: string;
  status: string;
  last_seen_at: string | null;
  created_at: string;
}

export const gpsDeviceService = {
  getAll: () => api.get<{devices: GpsDevice[]}>('/gps-devices'),
  
  create: (data: Partial<GpsDevice>) => api.post('/gps-devices', data),

  delete: (id: string) => api.delete(`/gps-devices/${id}`),

  assignToVehicle: (vehicleId: string, gpsDeviceId: string) => api.post(`/gps-devices/assign`, { vehicle_id: vehicleId, gps_device_id: gpsDeviceId }),
};
