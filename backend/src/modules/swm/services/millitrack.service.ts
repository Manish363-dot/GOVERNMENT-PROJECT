import http from 'http';
import querystring from 'querystring';
import * as gpsService from './gps.service';
import { env } from '../../../shared/config/env';

let ioInstance: any = null;

export function setSocketIoInstance(io: any) {
  ioInstance = io;
}

interface MillitrackDevice {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  lastUpdate: string;
  positionId: number;
  phone?: string;
  model?: string;
}

interface MillitrackPosition {
  id: number;
  deviceId: number;
  protocol: string;
  serverTime: string;
  deviceTime: string;
  fixTime: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  address?: string;
  attributes?: any;
}

class MillitrackSyncService {
  private host = 'track11.millitrack.com';
  private port = 80;
  private email = env.MILLITRACK_USER || 'uk01ga0324';
  private password = env.MILLITRACK_PASSWORD || '123456';
  private sessionCookie: string[] | null = null;
  private syncTimeout: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isSyncing = false;

  private async login(): Promise<boolean> {
    try {
      const postData = querystring.stringify({
        email: this.email,
        password: this.password,
      });

      return await new Promise<boolean>((resolve) => {
        const req = http.request(
          {
            hostname: this.host,
            port: this.port,
            path: '/api/session',
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData),
            },
            timeout: 8000,
          },
          (res) => {
            let body = '';
            res.on('data', (c) => (body += c));
            res.on('end', () => {
              if (res.statusCode === 200 && res.headers['set-cookie']) {
                this.sessionCookie = res.headers['set-cookie'];
                console.log('[MilliTrack] Successfully authenticated with track11.millitrack.com');
                resolve(true);
              } else {
                console.warn('[MilliTrack] Login failed with status:', res.statusCode);
                this.sessionCookie = null;
                resolve(false);
              }
            });
          }
        );

        req.on('error', (err) => {
          console.warn('[MilliTrack] Login connection error:', err.message);
          this.sessionCookie = null;
          resolve(false);
        });

        req.write(postData);
        req.end();
      });
    } catch (err: any) {
      console.warn('[MilliTrack] Unexpected login error:', err.message);
      return false;
    }
  }

  private async fetchJson<T>(path: string): Promise<T | null> {
    if (!this.sessionCookie) {
      const loggedIn = await this.login();
      if (!loggedIn) return null;
    }

    return new Promise<T | null>((resolve) => {
      const req = http.get(
        {
          hostname: this.host,
          port: this.port,
          path,
          headers: {
            Cookie: this.sessionCookie || [],
          },
          timeout: 8000,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(data) as T);
              } catch (e) {
                resolve(null);
              }
            } else if (res.statusCode === 401) {
              // Session expired, re-authenticate next time
              this.sessionCookie = null;
              resolve(null);
            } else {
              resolve(null);
            }
          });
        }
      );

      req.on('error', () => {
        resolve(null);
      });
    });
  }

  public async syncOnce(): Promise<void> {
    try {
      const [devices, positions] = await Promise.all([
        this.fetchJson<MillitrackDevice[]>('/api/devices'),
        this.fetchJson<MillitrackPosition[]>('/api/positions'),
      ]);

      if (!devices || !positions) {
        return;
      }

      for (const pos of positions) {
        const dev = devices.find((d) => d.id === pos.deviceId);
        if (!dev || !dev.uniqueId) continue;

        // Parse speed from MilliTrack (knots -> km/h)
        let rawSpeed = Number(pos.speed) || 0;

        // Check MilliTrack's internal motion detection and status
        const isMotionFalse = pos.attributes && pos.attributes.motion === false;
        const isStoppedStatus = pos.attributes?.currentStatus === 'STOPPED';

        // If MilliTrack's server-side telemetry explicitly marks the device as not in motion or stopped,
        // clamp rawSpeed to 0 to prevent GPS multipath / Doppler jitter from reporting false movement.
        if (isMotionFalse || isStoppedStatus) {
          rawSpeed = 0;
        }

        const calculatedSpeed = Math.round(rawSpeed * 1.852);

        // Process position into database with smart delta filtering
        const result = await gpsService.processGpsPosition({
          device_identifier: dev.uniqueId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: calculatedSpeed,
          heading: pos.course || 0,
          timestamp: pos.fixTime || pos.deviceTime || new Date().toISOString(),
          ignition: pos.attributes?.ignition !== undefined ? Boolean(pos.attributes.ignition) : undefined,
        });

        if (!result.success) {
          if (result.message === 'Database error') {
            // Temporary remote database blip; break cleanly and try next scheduled sync
            break;
          }
          continue;
        }

        // Real-time broadcast to connected WebSocket clients without extra DB read
        if (result.location && ioInstance) {
          ioInstance.to('live_locations').emit('location_update', {
            type: 'UPDATE',
            new: result.location,
          });
        }
      }
    } catch (err: any) {
      // Catch-all to prevent unhandled rejections
    }
  }

  private scheduleNext(intervalMs: number): void {
    if (!this.isRunning) return;
    this.syncTimeout = setTimeout(async () => {
      await this.safeSync();
      this.scheduleNext(intervalMs);
    }, intervalMs);
  }

  private async safeSync(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      await this.syncOnce();
    } catch {
      // Non-blocking
    } finally {
      this.isSyncing = false;
    }
  }

  public startSync(intervalMs = 4000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[MilliTrack] Starting auto-sync service (every ${intervalMs / 1000}s, resilient mode)...`);

    // First immediate sync, followed by non-overlapping self-scheduling loop
    this.safeSync().finally(() => {
      this.scheduleNext(intervalMs);
    });
  }

  public stopSync(): void {
    this.isRunning = false;
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    console.log('[MilliTrack] Auto-sync service stopped.');
  }
}

export const millitrackSyncService = new MillitrackSyncService();
