import { Router, Request, Response, NextFunction } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import { authMiddleware } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

/**
 * Middleware: Validate API key for webhook endpoints.
 * The key must be sent as x-api-key header or ?apiKey query parameter.
 */
function webhookApiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey || apiKey !== env.WEBHOOK_API_KEY) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }

  next();
}

// Public: GPS webhook endpoint — secured with API key
// Supports both GET (Traccar default) and POST
router.post('/webhook', webhookApiKeyAuth, trackingController.receiveWebhook);
router.get('/webhook', webhookApiKeyAuth, trackingController.receiveWebhook);

// Authenticated: Live tracking data
router.get('/live', authMiddleware, trackingController.getLive);
router.get('/live/:vehicleId', authMiddleware, trackingController.getVehicleLive);
router.get('/stats', authMiddleware, trackingController.getStats);

export default router;
