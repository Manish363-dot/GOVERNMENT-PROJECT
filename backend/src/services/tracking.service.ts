import { supabaseAdmin } from '../config/supabase';
import { VehicleCurrentLocation } from '../types';

/**
 * Get all live vehicle locations with vehicle details.
 */
export async function getLiveLocations(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('vehicle_current_locations')
    .select(`
      *,
      vehicles:vehicle_id(id, vehicle_number, vehicle_name, vehicle_type, status)
    `)
    .order('updated_at', { ascending: false });

  if (error) throw new Error('Failed to fetch live locations');
  return data || [];
}

/**
 * Get live location for a specific vehicle.
 */
export async function getVehicleLiveLocation(vehicleId: string): Promise<VehicleCurrentLocation | null> {
  const { data, error } = await supabaseAdmin
    .from('vehicle_current_locations')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get count of vehicles with live GPS data.
 */
export async function getLiveVehicleCount(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from('vehicle_current_locations')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', fiveMinutesAgo);

  if (error) return 0;
  return count || 0;
}

/**
 * Get count of online GPS devices (seen in the last 5 minutes).
 */
export async function getOnlineDeviceCount(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { count, error } = await supabaseAdmin
    .from('gps_devices')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('last_seen_at', fiveMinutesAgo);

  if (error) return 0;
  return count || 0;
}
