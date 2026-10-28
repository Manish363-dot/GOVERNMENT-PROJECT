import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as complaintController from '../controllers/complaint.controller';
import { authMiddleware, requireAdmin } from '../../../shared/middleware/auth';
import { validate } from '../../../shared/middleware/validate';
import { createComplaintSchema, updateStatusSchema, getByIdSchema, sendOtpSchema, verifyOtpSchema } from '../schemas/complaint.schema';

import { uploadComplaintAttachment } from '../../../shared/middleware/upload';

const router = Router();

// Rate limit: 10 OTP requests per 15 minutes per IP (protects WhatsApp Cloud API quota)
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many OTP requests from this connection. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: Send & Verify WhatsApp OTP for citizen phone verification
router.post('/send-otp', otpRequestLimiter, validate(sendOtpSchema), complaintController.sendOtp);
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
