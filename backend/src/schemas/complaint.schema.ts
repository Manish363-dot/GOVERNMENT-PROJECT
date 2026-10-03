import { z } from 'zod';

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
  }),
});

export const createComplaintSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    area: z.string().min(2, 'Area/Location is required'),
    complaint_type: z.enum(['vehicle_not_arrived', 'garbage_not_collected', 'other']),
    description: z.string().optional(),
    otp: z.string().length(4, 'OTP must be exactly 4 digits').regex(/^\d{4}$/, 'OTP must be 4 numeric digits'),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid complaint ID'),
  }),
  body: z.object({
    status: z.enum(['new', 'in_progress', 'resolved']),
    remark: z.string().optional(),
  }),
});

export const getByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid complaint ID'),
  }),
});
