import { supabaseAdmin } from '../config/supabase';
import { GpsDevice, VehicleGpsAssignment } from '../types';

/**
 * Get all GPS devices.
 */
export async function getAllDevices(): Promise<GpsDevice[]> {
  const { data, error } = await supabaseAdmin
    .from('gps_devices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch GPS devices');
  return data || [];
}

/**
 * Get a single GPS device by ID.
 */
export async function getDeviceById(id: string): Promise<GpsDevice | null> {
  const { data, error } = await supabaseAdmin
    .from('gps_devices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create a new GPS device.
 */
export async function createDevice(device: {
  device_name?: string;
  device_identifier: string;
  imei?: string;
}): Promise<GpsDevice> {
  const { data, error } = await supabaseAdmin
    .from('gps_devices')
    .insert({
      device_name: device.device_name || null,
      device_identifier: device.device_identifier,
      imei: device.imei || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('DEVICE_IDENTIFIER_EXISTS');
    }
    throw new Error('Failed to create GPS device');
  }
  return data;
}

/**
 * Update a GPS device.
 */
export async function updateDevice(
  id: string,
  updates: Partial<Pick<GpsDevice, 'device_name' | 'device_identifier' | 'imei' | 'status'>>
): Promise<GpsDevice> {
  const { data, error } = await supabaseAdmin
    .from('gps_devices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Failed to update GPS device');
  return data;
}

/**
 * Delete a GPS device.
 */
export async function deleteDevice(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('gps_devices')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Failed to delete GPS device');
}

/**
 * Assign a GPS device to a vehicle.
 * Deactivates any existing assignment for both the device and the vehicle.
 */
export async function assignDeviceToVehicle(
  vehicleId: string,
  gpsDeviceId: string
): Promise<VehicleGpsAssignment> {
  // Deactivate existing active assignments for this device
  await supabaseAdmin
    .from('vehicle_gps_assignments')
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq('gps_device_id', gpsDeviceId)
    .eq('is_active', true);

  // Deactivate existing active assignments for this vehicle
  await supabaseAdmin
    .from('vehicle_gps_assignments')
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq('vehicle_id', vehicleId)
    .eq('is_active', true);

  // Create new assignment
  const { data, error } = await supabaseAdmin
    .from('vehicle_gps_assignments')
    .insert({
      vehicle_id: vehicleId,
      gps_device_id: gpsDeviceId,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to assign GPS device to vehicle');

  // Activate the device
  await supabaseAdmin
    .from('gps_devices')
    .update({ status: 'active' })
    .eq('id', gpsDeviceId);

  return data;
}

/**
 * Unassign a GPS device from a vehicle.
 */
export async function unassignDevice(assignmentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('vehicle_gps_assignments')
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq('id', assignmentId);

  if (error) throw new Error('Failed to unassign GPS device');
}

/**
 * Get active assignments with vehicle and device info.
 */
export async function getActiveAssignments(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('vehicle_gps_assignments')
    .select(`
      *,
      vehicles:vehicle_id(*),
      gps_devices:gps_device_id(*)
    `)
    .eq('is_active', true)
    .order('assigned_at', { ascending: false });

  if (error) throw new Error('Failed to fetch assignments');
  return data || [];
}
