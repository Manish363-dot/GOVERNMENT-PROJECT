import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as pledgeController from '../controllers/pledge.controller';

const router = Router();

// Protect counter file writes from flood / DoS
const pledgeIncrementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public: Get current count of citizens who have taken the pledge
router.get('/count', pledgeController.getPledgeCount);

// Public: Increment pledge count when certificate is downloaded
router.post('/increment', pledgeIncrementLimiter, pledgeController.incrementPledgeCount);

export default router;
