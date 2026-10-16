import { Router } from 'express';
import * as complaintController from '../controllers/complaint.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createComplaintSchema, updateStatusSchema, getByIdSchema, sendOtpSchema, verifyOtpSchema } from '../schemas/complaint.schema';

import { uploadComplaintAttachment } from '../middleware/upload';

const router = Router();

// Public: Send & Verify WhatsApp OTP for citizen phone verification
router.post('/send-otp', validate(sendOtpSchema), complaintController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), complaintController.verifyOtp);

// Public: Upload file attachment directly to AWS S3 (max 5 MB)
router.post('/upload', uploadComplaintAttachment.single('file'), complaintController.uploadAttachment);

// Public: Submit & Track complaint (no auth)
router.post('/', validate(createComplaintSchema), complaintController.create);
router.get('/track/:trackingId', complaintController.track);

// Public: Confirm complaint resolution by citizen
router.post('/track/:trackingId/confirm', complaintController.confirmResolution);
router.post('/:id/confirm', complaintController.confirmResolution);

// Authenticated: Admin complaint management
router.get('/', authMiddleware, requireAdmin, complaintController.getAll);
router.get('/counts', authMiddleware, requireAdmin, complaintController.getCounts);
router.get('/:id', authMiddleware, requireAdmin, validate(getByIdSchema), complaintController.getById);
router.put('/:id/status', authMiddleware, requireAdmin, validate(updateStatusSchema), complaintController.updateStatus);
router.put('/:id/archive', authMiddleware, requireAdmin, complaintController.archive);
router.delete('/:id', authMiddleware, requireAdmin, complaintController.deleteComplaint);

export default router;
