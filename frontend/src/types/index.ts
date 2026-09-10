// ============================================================
// Shared TypeScript types for the frontend
// ============================================================

export type VehicleStatus = 'moving' | 'idle' | 'offline';
export type VehicleType = 'truck' | 'mini_truck' | 'auto' | 'other';
export type DeviceStatus = 'active' | 'inactive';
export type ComplaintType = 'vehicle_not_arrived' | 'garbage_not_collected' | 'other';
export type ComplaintStatus = 'new' | 'in_progress' | 'resolved';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_name: string | null;
  vehicle_type: VehicleType;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export interface GpsDevice {
  id: string;
  device_name: string | null;
  device_identifier: string;
  imei: string | null;
  status: DeviceStatus;
  last_seen_at: string | null;
  created_at: string;
}

export interface VehicleGpsAssignment {
  id: string;
  vehicle_id: string;
  gps_device_id: string;
  assigned_at: string;
  unassigned_at: string | null;
  is_active: boolean;
  vehicles?: Vehicle;
  gps_devices?: GpsDevice;
}

export interface VehicleCurrentLocation {
  id: string;
  vehicle_id: string;
  gps_device_id: string | null;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: VehicleStatus;
  updated_at: string;
  vehicles?: Vehicle;
}

export interface VehicleLocationHistory {
  id: string;
  vehicle_id: string;
  gps_device_id: string | null;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  recorded_at: string;
}

export interface HistoryResult {
  history: VehicleLocationHistory[];
  summary: {
    totalPoints: number;
    startTime: string | null;
    endTime: string | null;
    totalDistance: number;
  };
}

export interface Complaint {
  id: string;
  complaint_number: string;
  name: string;
  mobile: string;
  area: string;
  complaint_type: ComplaintType;
  description: string | null;
  status: ComplaintStatus;
  created_at: string;
}

export interface ComplaintUpdate {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  remark: string | null;
  updated_by: string | null;
  updated_at: string;
}

export interface DashboardStats {
  totalVehicles: number;
  liveVehicles: number;
  onlineDevices: number;
  newComplaints: number;
}
