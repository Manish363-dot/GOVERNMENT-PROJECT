import { supabaseAdmin } from '../config/supabase';
import { Vehicle } from '../types';

/**
 * Get all vehicles.
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch vehicles');
  return data || [];
}

/**
 * Get a single vehicle by ID.
 */
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create a new vehicle.
 */
export async function createVehicle(vehicle: {
  vehicle_number: string;
  vehicle_name?: string;
  vehicle_type?: string;
}): Promise<Vehicle> {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .insert({
      vehicle_number: vehicle.vehicle_number.toUpperCase(),
      vehicle_name: vehicle.vehicle_name || null,
      vehicle_type: vehicle.vehicle_type || 'truck',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('VEHICLE_NUMBER_EXISTS');
    }
    throw new Error('Failed to create vehicle');
  }
  return data;
}

/**
 * Update a vehicle.
 */
export async function updateVehicle(
  id: string,
  updates: Partial<Pick<Vehicle, 'vehicle_number' | 'vehicle_name' | 'vehicle_type' | 'status'>>
): Promise<Vehicle> {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Failed to update vehicle');
  return data;
}

/**
 * Delete a vehicle.
 */
export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('vehicles')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Failed to delete vehicle');
}

/**
 * Get vehicle count.
 */
export async function getVehicleCount(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from('vehicles')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count || 0;
}
