import { supabaseAdmin } from '../config/supabase';
import { GpsPositionPayload, VehicleStatus } from '../types';

/**
 * Process incoming GPS position data.
 * Flow: Validate → Identify device → Find vehicle → Upsert current location → Append history → Update statuses
 */
export async function processGpsPosition(payload: GpsPositionPayload): Promise<{
  success: boolean;
  vehicleId?: string;
  message: string;
}> {
  const { device_identifier, latitude, longitude, speed = 0, heading = 0 } = payload;

  // 1. Find the GPS device by its unique identifier
  const { data: device, error: deviceError } = await supabaseAdmin
    .from('gps_devices')
    .select('id')
    .eq('device_identifier', device_identifier)
    .single();

  if (deviceError || !device) {
    console.warn(`[GPS] Unknown device identifier: ${device_identifier}`);
    return { success: false, message: 'GPS device not found' };
  }

  // 2. Update device last_seen_at and status
  await supabaseAdmin
    .from('gps_devices')
    .update({ last_seen_at: new Date().toISOString(), status: 'active' })
    .eq('id', device.id);

  // 3. Find the active vehicle assignment for this device
  const { data: assignment, error: assignError } = await supabaseAdmin
    .from('vehicle_gps_assignments')
    .select('vehicle_id')
    .eq('gps_device_id', device.id)
    .eq('is_active', true)
    .single();

  if (assignError || !assignment) {
    console.warn(`[GPS] Device ${device_identifier} is not assigned to any vehicle`);
    return { success: false, message: 'Device not assigned to a vehicle' };
  }

  const vehicleId = assignment.vehicle_id;

  // 4. Determine vehicle status based on speed
  const status: VehicleStatus = speed > 2 ? 'moving' : 'idle';

  // 5. Upsert current vehicle location
  const { error: upsertError } = await supabaseAdmin
    .from('vehicle_current_locations')
    .upsert(
      {
        vehicle_id: vehicleId,
        gps_device_id: device.id,
        latitude,
        longitude,
        speed,
        heading,
        status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'vehicle_id' }
    );

  if (upsertError) {
    console.error(`[GPS] Failed to upsert current location:`, upsertError);
    return { success: false, message: 'Failed to update current location' };
  }

  // 6. Append to location history
  const { error: historyError } = await supabaseAdmin
    .from('vehicle_location_history')
    .insert({
      vehicle_id: vehicleId,
      gps_device_id: device.id,
      latitude,
      longitude,
      speed,
      heading,
      recorded_at: payload.timestamp || new Date().toISOString(),
    });

  if (historyError) {
    console.error(`[GPS] Failed to save location history:`, historyError);
  }

  // 7. Update vehicle status
  await supabaseAdmin
    .from('vehicles')
    .update({ status })
    .eq('id', vehicleId);

  return { success: true, vehicleId, message: 'Position saved successfully' };
}

/**
 * Process Traccar webhook event.
 * Converts Traccar format to our standard format and processes it.
 */
export async function processTraccarWebhook(payload: any): Promise<{
  success: boolean;
  message: string;
}> {
  // Traccar sends events with device and position info
  const device = payload.device;
  const position = payload.position;

  if (!device?.uniqueId || !position) {
    return { success: false, message: 'Invalid Traccar webhook payload' };
  }

  return processGpsPosition({
    device_identifier: device.uniqueId,
    latitude: position.latitude,
    longitude: position.longitude,
    speed: position.speed || 0,
    heading: position.course || 0,
    timestamp: position.fixTime,
  });
}
