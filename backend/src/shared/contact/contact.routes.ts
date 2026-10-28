import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { contactFormSchema } from './contact.schema';
import * as contactController from './contact.controller';

const router = Router();

// Rate limit: 10 contact inquiries per hour per IP (protects mail server from abuse)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many inquiries submitted from this connection. Please try again after some time.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: Citizen inquiry submission
router.post('/', contactLimiter, validate(contactFormSchema), contactController.submitInquiry);

export default router;
