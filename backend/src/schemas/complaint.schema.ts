import { z } from 'zod';

export const createComplaintSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
    area: z.string().min(2, 'Area/Location is required'),
    complaint_type: z.enum(['vehicle_not_arrived', 'garbage_not_collected', 'other']),
    description: z.string().optional(),
    attachment_url: z.string().optional().nullable(),
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

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  }),
});

export const getByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid complaint ID'),
  }),
});
