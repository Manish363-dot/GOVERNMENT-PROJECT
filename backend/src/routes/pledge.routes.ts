import { Router } from 'express';
import * as pledgeController from '../controllers/pledge.controller';

const router = Router();

// Public: Get current count of citizens who have taken the pledge
router.get('/count', pledgeController.getPledgeCount);

// Public: Increment pledge count when certificate is downloaded
router.post('/increment', pledgeController.incrementPledgeCount);

export default router;
