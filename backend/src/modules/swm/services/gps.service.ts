import { prisma, withDbRetry } from '../../../shared/config/prisma';
import { GpsPositionPayload } from '../../../shared/types';

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
  consecutiveStationary: number;
  consecutiveMoving: number;
  lastMotionTime: number;
  lastHistoryTime: number;
  lastDeviceUpdateTime: number;
  lastDbUpdateTime: number;
  lastIgnition?: boolean;
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
  const { device_identifier, latitude, longitude, speed = 0, heading = 0, ignition } = payload;
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
    const prevState = locationStateCache.get(vehicleId);

    const distanceMoved = prevState
      ? getDistanceMeters(prevState.latitude, prevState.longitude, latitude, longitude)
      : 999;

    // 1. GPS DRIFT / MULTIPATH JITTER FILTER:
    // If vehicle has moved less than 6 meters from previous fix, it is stationary.
    // In mountain/hilly terrain (Almora), GPS multipath drift often reports instantaneous speeds of 2-18 km/h while stationary.
    let effectiveSpeed = Number(speed) || 0;
    if (prevState && distanceMoved < 6 && effectiveSpeed < 20) {
      effectiveSpeed = 0;
    }

    // 2. ANTI-FLAPPING HYSTERESIS FOR VEHICLE STATUS:
    // Genuine movement threshold for tippers/trucks is >= 5 km/h with confirmed distance delta.
    let status = prevState ? prevState.status : (effectiveSpeed >= 5 ? 'moving' : 'idle');
    let consecutiveStationary = prevState ? (prevState.consecutiveStationary || 0) : (effectiveSpeed < 5 ? 1 : 0);
    let consecutiveMoving = prevState ? (prevState.consecutiveMoving || 0) : (effectiveSpeed >= 5 ? 1 : 0);
    let lastMotionTime = prevState ? (prevState.lastMotionTime || 0) : (effectiveSpeed >= 5 ? now : 0);

    if (effectiveSpeed >= 5 && distanceMoved >= 5) {
      consecutiveStationary = 0;
      consecutiveMoving += 1;
      lastMotionTime = now;

      // Transition from idle -> moving:
      // Requires either at least 2 consecutive moving readings OR significant distance moved (>= 12 meters)
      // to prevent momentary 1-second GPS spikes while parked.
      if (status === 'idle') {
        if (consecutiveMoving >= 2 || distanceMoved >= 12) {
          status = 'moving';
        }
      }
    } else {
      consecutiveMoving = 0;
      consecutiveStationary += 1;
      effectiveSpeed = 0; // Clamp speed to 0 when not in genuine motion

      // Transition from moving -> idle (Parked):
      // When a vehicle is driving, heartbeat packets or brief pauses at intersections send 0 speed.
      // Do NOT instantly declare it Parked on a single packet!
      // Require at least 3 consecutive stationary packets (>= 12 seconds) before switching to 'idle'.
      if (status === 'moving') {
        const timeSinceMotion = now - lastMotionTime;
        if (consecutiveStationary >= 3 || timeSinceMotion > 15000) {
          status = 'idle';
        } else {
          status = 'moving';
        }
      }
    }

    const formattedLocation = {
      vehicle_id: vehicleId,
      gps_device_id: deviceId,
      latitude,
      longitude,
      speed: effectiveSpeed,
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

    // 3. High-Efficiency Delta Check:
    // If vehicle is stationary (effectiveSpeed === 0 and moved < 4m) and database was updated in last 30s,
    // skip the heavy database writes to protect remote AWS RDS from connection churn.
    const isStationary = effectiveSpeed === 0 && distanceMoved < 4;
    const isRecentDbWrite = prevState && now - prevState.lastDbUpdateTime < 30000;
    const ignitionChanged =
      ignition !== undefined &&
      prevState?.lastIgnition !== undefined &&
      ignition !== prevState.lastIgnition;

    if (prevState && isStationary && isRecentDbWrite && !ignitionChanged) {
      locationStateCache.set(vehicleId, {
        latitude,
        longitude,
        speed: 0,
        heading,
        status: 'idle',
        consecutiveStationary,
        consecutiveMoving,
        lastMotionTime,
        lastHistoryTime: prevState.lastHistoryTime,
        lastDeviceUpdateTime: prevState.lastDeviceUpdateTime,
        lastDbUpdateTime: prevState.lastDbUpdateTime,
        lastIgnition: ignition !== undefined ? ignition : prevState.lastIgnition,
      });

      return {
        success: true,
        vehicleId,
        location: formattedLocation,
        message: 'Stationary position skipped DB write (cache fresh)',
      };
    }

    // Determine device status strictly based on ignition:
    // If ignition telemetry is present: Active when Ignition is ON, Inactive when Ignition is OFF.
    const isDeviceActive = ignition !== undefined
      ? Boolean(ignition)
      : (effectiveSpeed >= 5 || status === 'moving');
    const targetDeviceStatus = isDeviceActive ? 'active' : 'inactive';

    // 4. Resilient Database Upsert with automatic retry
    const shouldUpdateDevice =
      !prevState ||
      ignitionChanged ||
      now - (prevState.lastDeviceUpdateTime || 0) >= 60000;

    await withDbRetry(async () => {
      // Throttle device updates (or update immediately when ignition changes)
      if (shouldUpdateDevice) {
        await prisma.gpsDevice
          .update({
            where: { id: deviceId },
            data: { last_seen_at: new Date(), status: targetDeviceStatus },
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
          speed: effectiveSpeed,
          heading,
          status: status as any,
          updated_at: new Date(),
        },
        create: {
          vehicle_id: vehicleId,
          gps_device_id: deviceId,
          latitude,
          longitude,
          speed: effectiveSpeed,
          heading,
          status: status as any,
        },
      });

      // 5. Record Location History only when significant movement occurs
      const timeSinceLastHistory = prevState ? now - prevState.lastHistoryTime : 999999;
      const shouldRecordHistory =
        !prevState ||
        (status === 'moving' && (distanceMoved >= 8 || timeSinceLastHistory >= 10000)) ||
        (status === 'idle' && timeSinceLastHistory >= 60000 && distanceMoved >= 15);

      if (shouldRecordHistory) {
        await prisma.vehicleLocationHistory.create({
          data: {
            vehicle_id: vehicleId,
            gps_device_id: deviceId,
            latitude,
            longitude,
            speed: effectiveSpeed,
            heading,
            recorded_at: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          },
        });
      }

      // 6. Update vehicle status only if changed
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
      (status === 'moving' && (distanceMoved >= 8 || timeSinceLastHistory >= 10000)) ||
      (status === 'idle' && timeSinceLastHistory >= 60000 && distanceMoved >= 15);

    // Update in-memory state cache with full anti-flapping metadata
    locationStateCache.set(vehicleId, {
      latitude,
      longitude,
      speed: effectiveSpeed,
      heading,
      status,
      consecutiveStationary,
      consecutiveMoving,
      lastMotionTime,
      lastHistoryTime: recordedHistory ? now : prevState ? prevState.lastHistoryTime : now,
      lastDeviceUpdateTime: shouldUpdateDevice ? now : (prevState ? prevState.lastDeviceUpdateTime : now),
      lastDbUpdateTime: now,
      lastIgnition: ignition !== undefined ? ignition : prevState?.lastIgnition,
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


