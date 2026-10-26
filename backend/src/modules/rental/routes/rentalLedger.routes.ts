import { Router } from 'express';
import { rentalLedgerController } from '../controllers/rentalLedger.controller';
import { rentalAdminAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Admin: Financial Overview & KPIs ────────────────────────────────────────
router.get(
  '/overview',
  rentalAdminAuth,
  (req: any, res: any) => rentalLedgerController.getOverview(req, res)
);

// ── Admin: General Master Ledger Transactions ────────────────────────────────
router.get(
  '/transactions',
  rentalAdminAuth,
  (req: any, res: any) => rentalLedgerController.getTransactions(req, res)
);

// ── Admin: Fast Tenants List for Search/Dropdown ─────────────────────────────
router.get(
  '/tenants',
  rentalAdminAuth,
  (req: any, res: any) => rentalLedgerController.getTenantsList(req, res)
);

// ── Admin: Individual Tenant 360-Degree Statement ────────────────────────────
router.get(
  '/tenant/:userId',
  rentalAdminAuth,
  (req: any, res: any) => rentalLedgerController.getTenantLedger(req, res)
);

export default router;
