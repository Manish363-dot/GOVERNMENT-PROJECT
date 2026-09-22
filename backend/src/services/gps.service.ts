import { prisma } from '../config/prisma';
import { GpsPositionPayload } from '../types';

export async function processGpsPosition(payload: GpsPositionPayload): Promise<{
  success: boolean;
  vehicleId?: string;
  message: string;
}> {
  const { device_identifier, latitude, longitude, speed = 0, heading = 0 } = payload;

  try {
    const device = await prisma.gpsDevice.findUnique({
      where: { device_identifier }
    });

    if (!device) {
      return { success: false, message: 'GPS device not found' };
    }

    await prisma.gpsDevice.update({
      where: { id: device.id },
      data: { last_seen_at: new Date(), status: 'active' }
    });

    const assignment = await prisma.vehicleGpsAssignment.findFirst({
      where: { gps_device_id: device.id, is_active: true }
    });

    if (!assignment) {
      return { success: false, message: 'Device not assigned to a vehicle' };
    }

    const vehicleId = assignment.vehicle_id;
    const status = (speed > 2 ? 'moving' : 'idle') as any;

    await prisma.vehicleCurrentLocation.upsert({
      where: { vehicle_id: vehicleId },
      update: {
        gps_device_id: device.id,
        latitude,
        longitude,
        speed,
        heading,
        status,
        updated_at: new Date()
      },
      create: {
        vehicle_id: vehicleId,
        gps_device_id: device.id,
        latitude,
        longitude,
        speed,
        heading,
        status
      }
    });

    await prisma.vehicleLocationHistory.create({
      data: {
        vehicle_id: vehicleId,
        gps_device_id: device.id,
        latitude,
        longitude,
        speed,
        heading,
        recorded_at: payload.timestamp ? new Date(payload.timestamp) : new Date()
      }
    });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: status as any }
    });

    return { success: true, vehicleId, message: 'Position saved successfully' };
  } catch (error) {
    return { success: false, message: 'Database error' };
  }
}

export async function processTraccarWebhook(payload: any): Promise<{
  success: boolean;
  message: string;
}> {
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
