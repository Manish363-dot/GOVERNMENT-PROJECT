import { z } from 'zod';

export const getHistorySchema = z.object({
  query: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  }),
});
