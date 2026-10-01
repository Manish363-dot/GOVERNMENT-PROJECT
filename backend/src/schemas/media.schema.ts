import { z } from 'zod';

export const addDailyWorkSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    description: z.string().optional(),
  }),
});

export const mediaIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid media ID'),
  }),
});
