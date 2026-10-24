import { Router } from 'express';
import { paymentController } from './controllers/payment.controller';

const router = Router();

// Health check
router.get('/health', (req, res) => paymentController.getHealth(req, res));

// e-Challan generation
router.post('/challan', (req, res) => paymentController.createChallan(req, res));

// Payment verification
router.post('/verify', (req, res) => paymentController.verifyPayment(req, res));

// Payment Gateway Webhook
router.post('/webhook', (req, res) => paymentController.handleWebhook(req, res));

export default router;
