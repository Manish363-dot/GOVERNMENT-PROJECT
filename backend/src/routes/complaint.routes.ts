import { Router } from 'express';
import * as complaintController from '../controllers/complaint.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendOtpSchema, createComplaintSchema, updateStatusSchema, getByIdSchema } from '../schemas/complaint.schema';

const router = Router();

// Public: Submit & Track complaint & OTP (no auth)
router.post('/send-otp', validate(sendOtpSchema), complaintController.sendOtp);
router.post('/', validate(createComplaintSchema), complaintController.create);
router.get('/track/:trackingId', complaintController.track);

// Authenticated: Admin complaint management
router.get('/', authMiddleware, requireAdmin, complaintController.getAll);
router.get('/counts', authMiddleware, requireAdmin, complaintController.getCounts);
router.get('/:id', authMiddleware, requireAdmin, validate(getByIdSchema), complaintController.getById);
router.put('/:id/status', authMiddleware, requireAdmin, validate(updateStatusSchema), complaintController.updateStatus);

export default router;
