import { Router } from 'express';
import { z } from 'zod';
import * as complaintController from '../controllers/complaint.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createComplaintSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
  area: z.string().min(2, 'Area/Location is required'),
  complaint_type: z.enum(['vehicle_not_arrived', 'garbage_not_collected', 'other']),
  description: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved']),
  remark: z.string().optional(),
});

// Public: Submit complaint (no auth)
router.post('/', validate(createComplaintSchema), complaintController.create);

// Authenticated: Admin complaint management
router.get('/', authMiddleware, complaintController.getAll);
router.get('/counts', authMiddleware, complaintController.getCounts);
router.get('/:id', authMiddleware, complaintController.getById);
router.put('/:id/status', authMiddleware, validate(updateStatusSchema), complaintController.updateStatus);

export default router;
