import { prisma, withDbRetry } from '../config/prisma';
import { GpsPositionPayload } from '../types';

interface CachedDeviceAssignment {
  deviceId: string;
  vehicleId: string | null;
  vehicleNumber?: string;
  vehicleName?: string;
  vehicleType?: string;
  expiresAt: number;
}

interface LastLocationState {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: string;
  lastHistoryTime: number;
  lastDeviceUpdateTime: number;
  lastDbUpdateTime: number;
}

const deviceCache = new Map<string, CachedDeviceAssignment>();
const locationStateCache = new Map<string, LastLocationState>();

// Helper to compute approx distance in meters between two lat/lon coordinates
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * 111320;
  const dLon = (lon2 - lon1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export async function processGpsPosition(payload: GpsPositionPayload): Promise<{
  success: boolean;
  vehicleId?: string;
  location?: any;
  message: string;
}> {
  const { device_identifier, latitude, longitude, speed = 0, heading = 0 } = payload;
  const now = Date.now();

  try {
    // 1. Resolve Device & Vehicle with in-memory caching (2-minute TTL)
    let cached = deviceCache.get(device_identifier);
    if (!cached || cached.expiresAt < now) {
      const device = await withDbRetry(() =>
        prisma.gpsDevice.findUnique({
          where: { device_identifier },
          select: { id: true },
        })
      );

      if (!device) {
        return { success: false, message: 'GPS device not found' };
      }

      const assignment = await withDbRetry(() =>
        prisma.vehicleGpsAssignment.findFirst({
          where: { gps_device_id: device.id, is_active: true },
          select: {
            vehicle_id: true,
            vehicle: {
              select: {
                id: true,
                vehicle_number: true,
                vehicle_name: true,
                vehicle_type: true,
              },
            },
          },
        })
      );

      cached = {
        deviceId: device.id,
        vehicleId: assignment ? assignment.vehicle_id : null,
        vehicleNumber: assignment?.vehicle?.vehicle_number || '',
        vehicleName: assignment?.vehicle?.vehicle_name || '',
        vehicleType: assignment?.vehicle?.vehicle_type || 'tipper',
        expiresAt: now + 120000, // 2-minute cache
      };
      deviceCache.set(device_identifier, cached);
    }

    if (!cached.vehicleId) {
      return { success: false, message: 'Device not assigned to a vehicle' };
    }

    const { deviceId, vehicleId, vehicleNumber, vehicleName, vehicleType } = cached;
    const status = speed > 2 ? 'moving' : 'idle';
    const prevState = locationStateCache.get(vehicleId);

    const distanceMoved = prevState
      ? getDistanceMeters(prevState.latitude, prevState.longitude, latitude, longitude)
      : 999;

    const formattedLocation = {
      vehicle_id: vehicleId,
      gps_device_id: deviceId,
      latitude,
      longitude,
      speed,
      heading,
      status,
      updated_at: new Date(),
      vehicle: {
        id: vehicleId,
        vehicle_number: vehicleNumber || 'Vehicle',
        vehicle_name: vehicleName || 'Waste Tipper',
        vehicle_type: vehicleType || 'tipper',
        status,
      },
    };

    // 2. High-Efficiency Delta Check:
    // If vehicle is stationary (speed <= 1 and moved < 4m) and database was updated in last 30s,
    // skip the heavy database writes to protect remote AWS RDS from connection churn.
    const isStationary = speed <= 1 && distanceMoved < 4;
    const isRecentDbWrite = prevState && now - prevState.lastDbUpdateTime < 30000;

    if (prevState && isStationary && isRecentDbWrite) {
      return {
        success: true,
        vehicleId,
        location: formattedLocation,
        message: 'Stationary position skipped DB write (cache fresh)',
      };
    }

    // 3. Resilient Database Upsert with automatic retry
    await withDbRetry(async () => {
      // Throttle device last_seen_at updates (at most once every 60s)
      if (!prevState || now - prevState.lastDeviceUpdateTime > 60000) {
        await prisma.gpsDevice
          .update({
            where: { id: deviceId },
            data: { last_seen_at: new Date(), status: 'active' },
          })
          .catch(() => {});
      }

      // Upsert current live location
      await prisma.vehicleCurrentLocation.upsert({
        where: { vehicle_id: vehicleId },
        update: {
          gps_device_id: deviceId,
          latitude,
          longitude,
          speed,
          heading,
          status: status as any,
          updated_at: new Date(),
        },
        create: {
          vehicle_id: vehicleId,
          gps_device_id: deviceId,
          latitude,
          longitude,
          speed,
          heading,
          status: status as any,
        },
      });

      // 4. Record Location History only when significant movement occurs
      const timeSinceLastHistory = prevState ? now - prevState.lastHistoryTime : 999999;
      const shouldRecordHistory =
        !prevState ||
        distanceMoved >= 8 ||
        (speed > 0 && timeSinceLastHistory >= 10000) ||
        timeSinceLastHistory >= 60000;

      if (shouldRecordHistory) {
        await prisma.vehicleLocationHistory.create({
          data: {
            vehicle_id: vehicleId,
            gps_device_id: deviceId,
            latitude,
            longitude,
            speed,
            heading,
            recorded_at: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          },
        });
      }

      // 5. Update vehicle status only if changed
      if (!prevState || prevState.status !== status) {
        await prisma.vehicle
          .update({
            where: { id: vehicleId },
            data: { status: status as any },
          })
          .catch(() => {});
      }
    });

    const timeSinceLastHistory = prevState ? now - prevState.lastHistoryTime : 999999;
    const recordedHistory =
      !prevState ||
      distanceMoved >= 8 ||
      (speed > 0 && timeSinceLastHistory >= 10000) ||
      timeSinceLastHistory >= 60000;

    // Update in-memory state cache
    locationStateCache.set(vehicleId, {
      latitude,
      longitude,
      speed,
      heading,
      status,
      lastHistoryTime: recordedHistory ? now : prevState ? prevState.lastHistoryTime : now,
      lastDeviceUpdateTime: now,
      lastDbUpdateTime: now,
    });

    return {
      success: true,
      vehicleId,
      location: formattedLocation,
      message: 'Position saved successfully',
    };
  } catch (error: any) {
    // Only fail gracefully without crashing
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

  const result = await processGpsPosition({
    device_identifier: device.uniqueId,
    latitude: position.latitude,
    longitude: position.longitude,
    speed: position.speed || 0,
    heading: position.course || 0,
    timestamp: position.fixTime,
  });

  return { success: result.success, message: result.message };
}
