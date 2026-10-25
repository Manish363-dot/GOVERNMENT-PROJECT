import { Router } from 'express';
import { rentalPaymentController } from '../controllers/rentalPayment.controller';
import { rentalAdminAuth, rentalUserAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Tenant: Initiate Online Payment ──────────────────────────────────────────
router.post(
  '/initiate',
  rentalUserAuth,
  (req: any, res: any) => rentalPaymentController.initiatePayment(req, res)
);

// ── Tenant / Public Gateway Callback: Verify Payment ─────────────────────────
router.post(
  '/verify',
  (req: any, res: any) => rentalPaymentController.verifyPayment(req, res)
);

// ── Admin: Financial Audit Ledger ───────────────────────────────────────────
router.get(
  '/audit',
  rentalAdminAuth,
  (req: any, res: any) => rentalPaymentController.getAuditLedger(req, res)
);

// ── Admin: In-Person Office Counter Payment Collection ───────────────────────
router.post(
  '/counter',
  rentalAdminAuth,
  (req: any, res: any) => rentalPaymentController.recordCounterPayment(req, res)
);

export default router;
