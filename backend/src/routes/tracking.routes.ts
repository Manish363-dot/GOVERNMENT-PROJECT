import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public: GPS webhook endpoint - supports both GET (Traccar default) and POST
router.post('/webhook', trackingController.receiveWebhook);
router.get('/webhook', trackingController.receiveWebhook);

// Authenticated: Live tracking data
router.get('/live', authMiddleware, trackingController.getLive);
router.get('/live/:vehicleId', authMiddleware, trackingController.getVehicleLive);
router.get('/stats', authMiddleware, trackingController.getStats);

export default router;
