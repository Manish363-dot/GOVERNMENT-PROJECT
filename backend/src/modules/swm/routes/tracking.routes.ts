import { Router, Request, Response, NextFunction } from 'express';
import * as trackingController from '../controllers/tracking.controller';
import { authMiddleware, requireAdmin } from '../../../shared/middleware/auth';
import { env } from '../../../shared/config/env';
import { validate } from '../../../shared/middleware/validate';
import { vehicleIdParamSchema } from '../schemas/tracking.schema';

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
// Supports both GET and POST for GPS device telemetry webhooks
router.post('/webhook', webhookApiKeyAuth, trackingController.receiveWebhook);
router.get('/webhook', webhookApiKeyAuth, trackingController.receiveWebhook);

// Authenticated: Live tracking data
router.get('/live', authMiddleware, requireAdmin, trackingController.getLive);
router.get('/live/:vehicleId', authMiddleware, requireAdmin, validate(vehicleIdParamSchema), trackingController.getVehicleLive);
router.get('/stats', authMiddleware, requireAdmin, trackingController.getStats);

export default router;
