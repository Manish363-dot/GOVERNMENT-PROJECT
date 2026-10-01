import { z } from 'zod';

export const vehicleIdParamSchema = z.object({
  params: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
  }),
});
