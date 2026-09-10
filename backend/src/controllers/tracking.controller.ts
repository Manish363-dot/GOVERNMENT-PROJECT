import { Request, Response } from 'express';
import * as trackingService from '../services/tracking.service';
import * as gpsService from '../services/gps.service';

/**
 * GET /api/tracking/live
 * Authenticated — returns all live vehicle locations.
 */
export async function getLive(req: Request, res: Response): Promise<void> {
  try {
    const locations = await trackingService.getLiveLocations();
    res.json({ locations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch live locations' });
  }
}

/**
 * GET /api/tracking/live/:vehicleId
 * Authenticated — returns live location for a specific vehicle.
 */
export async function getVehicleLive(req: Request, res: Response): Promise<void> {
  try {
    const location = await trackingService.getVehicleLiveLocation(req.params.vehicleId);
    if (!location) {
      res.status(404).json({ error: 'No live data available for this vehicle' });
      return;
    }
    res.json({ location });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle location' });
  }
}

/**
 * GET/POST /api/tracking/webhook
 * Receives GPS data from Traccar position forwarding.
 * 
 * Traccar can forward in 3 formats:
 * 1. Default (no forward.json): GET/POST with query params ?id=DEVICE_ID&lat=X&lon=Y&speed=Z&bearing=B&timestamp=T
 * 2. forward.json=true: POST with flat JSON { id: "DEVICE_ID", latitude: X, longitude: Y, speed: Z, course: B, fixTime: T }
 * 3. Event forwarding: POST with nested JSON { device: { uniqueId: "..." }, position: { latitude: X, ... } }
 */
export async function receiveWebhook(req: Request, res: Response): Promise<void> {
  try {
    console.log('[Webhook] ===== INCOMING GPS DATA =====');
    console.log('[Webhook] Method:', req.method);
    console.log('[Webhook] Query:', JSON.stringify(req.query));
    console.log('[Webhook] Body:', JSON.stringify(req.body));

    let device_identifier: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;
    let speed: number = 0;
    let heading: number = 0;
    let timestamp: string | undefined;

    const q = req.query;
    const body = req.body;

    // FORMAT 1: Query parameters (Traccar default forwarding)
    // URL: ?id=DEVICE_ID&lat=29.6&lon=79.6&speed=0&bearing=0&timestamp=1234567890
    if (q.id && (q.lat || q.latitude)) {
      console.log('[Webhook] Detected: Traccar query-param format');
      device_identifier = String(q.id);
      latitude = parseFloat(String(q.lat || q.latitude));
      longitude = parseFloat(String(q.lon || q.longitude));
      speed = parseFloat(String(q.speed || 0));
      heading = parseFloat(String(q.bearing || q.course || 0));
      timestamp = q.timestamp ? String(q.timestamp) : undefined;
    }
    // FORMAT 2: Nested event JSON { device: { uniqueId }, position: { latitude, longitude } }
    else if (body?.device && body?.position) {
      console.log('[Webhook] Detected: Traccar nested event format');
      device_identifier = body.device.uniqueId || body.device.name;
      latitude = body.position.latitude;
      longitude = body.position.longitude;
      speed = body.position.speed || 0;
      heading = body.position.course || 0;
      timestamp = body.position.fixTime;
    }
    // FORMAT 3: Flat JSON { id: "DEVICE_ID", latitude, longitude }
    else if (body?.id && body?.latitude !== undefined && body?.longitude !== undefined) {
      console.log('[Webhook] Detected: Traccar flat JSON format');
      device_identifier = String(body.id);
      latitude = body.latitude;
      longitude = body.longitude;
      speed = body.speed || 0;
      heading = body.course || 0;
      timestamp = body.fixTime || body.deviceTime;
    }
    // FORMAT 4: Our direct GPS API format
    else if (body?.device_identifier && body?.latitude && body?.longitude) {
      console.log('[Webhook] Detected: Direct GPS API format');
      device_identifier = body.device_identifier;
      latitude = body.latitude;
      longitude = body.longitude;
      speed = body.speed || 0;
      heading = body.heading || 0;
      timestamp = body.timestamp;
    }

    if (!device_identifier || latitude === undefined || longitude === undefined) {
      console.warn('[Webhook] Could not extract GPS data from request');
      res.status(400).json({ error: 'Invalid GPS data format. Could not extract device_identifier, latitude, longitude.' });
      return;
    }

    console.log(`[Webhook] Parsed: device=${device_identifier} lat=${latitude} lon=${longitude} speed=${speed}`);

    const result = await gpsService.processGpsPosition({
      device_identifier,
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
    });

    console.log(`[Webhook] Result:`, JSON.stringify(result));

    if (result.success) {
      res.json(result);
    } else {
      res.status(422).json(result);
    }
  } catch (err) {
    console.error('[Webhook] Error processing GPS data:', err);
    res.status(500).json({ error: 'Failed to process GPS data' });
  }
}

/**
 * GET /api/tracking/stats
 * Authenticated — returns tracking statistics.
 */
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const [liveCount, onlineDevices] = await Promise.all([
      trackingService.getLiveVehicleCount(),
      trackingService.getOnlineDeviceCount(),
    ]);

    res.json({ liveVehicles: liveCount, onlineDevices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tracking stats' });
  }
}
