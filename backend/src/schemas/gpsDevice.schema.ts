import { z } from 'zod';

export const createDeviceSchema = z.object({
  body: z.object({
    device_name: z.string().optional(),
    device_identifier: z.string().min(1, 'Device identifier is required'),
    imei: z.string().optional(),
  }),
});

export const updateDeviceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid device ID'),
  }),
  body: z.object({
    device_name: z.string().optional(),
    device_identifier: z.string().optional(),
    imei: z.string().optional(),
  }),
});

export const assignSchema = z.object({
  body: z.object({
    vehicle_id: z.string().uuid('Invalid vehicle ID'),
    gps_device_id: z.string().uuid('Invalid GPS device ID'),
  }),
});

export const unassignSchema = z.object({
  body: z.object({
    assignment_id: z.string().uuid('Invalid assignment ID'),
  }),
});

export const gpsDeviceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid device ID'),
  }),
});
