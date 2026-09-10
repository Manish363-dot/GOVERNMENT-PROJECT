import { api } from './api';
import { VehicleCurrentLocation } from '@/types';

export const trackingService = {
  getLive: () => api.get<{ locations: VehicleCurrentLocation[] }>('/tracking/live'),
  getVehicleLive: (vehicleId: string) =>
    api.get<{ location: VehicleCurrentLocation }>(`/tracking/live/${vehicleId}`),
  getStats: () =>
    api.get<{ liveVehicles: number; onlineDevices: number }>('/tracking/stats'),
};
