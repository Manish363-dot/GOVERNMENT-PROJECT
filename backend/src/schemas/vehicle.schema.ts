import { z } from 'zod';

export const createVehicleSchema = z.object({
  body: z.object({
    vehicle_number: z.string().min(1, 'Vehicle number is required'),
    vehicle_name: z.string().optional(),
    vehicle_type: z.enum(['truck', 'mini_truck', 'auto', 'other']).optional(),
  }),
});

export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID'),
  }),
  body: z.object({
    vehicle_number: z.string().optional(),
    vehicle_name: z.string().optional(),
    vehicle_type: z.enum(['truck', 'mini_truck', 'auto', 'other']).optional(),
    status: z.enum(['moving', 'idle', 'offline']).optional(),
  }),
});

export const vehicleIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID'),
  }),
});
