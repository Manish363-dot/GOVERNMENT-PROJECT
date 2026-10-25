import { Router } from 'express';
import { rentalBillingController } from '../controllers/rentalBilling.controller';
import { rentalAdminAuth, rentalUserAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Public: Quick Dues Search ────────────────────────────────────────────────
router.get('/dues/search', (req, res) => rentalBillingController.searchDues(req, res));

// ── Admin: Bulk Generate Monthly Bills ───────────────────────────────────────
router.post(
  '/generate',
  rentalAdminAuth,
  (req: any, res: any) => rentalBillingController.generateMonthlyBills(req, res)
);

// ── Admin: Dashboard Analytics & Revenue KPI ─────────────────────────────────
router.get(
  '/analytics',
  rentalAdminAuth,
  (req: any, res: any) => rentalBillingController.getAnalytics(req, res)
);

// ── Admin or Tenant: List Bills ──────────────────────────────────────────────
router.get(
  '/',
  (req, res, next) => {
    // If admin auth header exists, authenticate as admin, else tenant
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Try admin auth first
      return rentalAdminAuth(req as any, res, (err?: any) => {
        if (!err && (req as any).rentalAdmin) {
          return rentalBillingController.listBills(req as any, res);
        }
        // Fallback to user auth
        return rentalUserAuth(req as any, res, () => rentalBillingController.listBills(req as any, res));
      });
    }
    return rentalBillingController.listBills(req as any, res);
  }
);

// ── Admin or Tenant: Single Bill Details ─────────────────────────────────────
router.get(
  '/:id',
  (req, res, next) => {
    return rentalAdminAuth(req as any, res, (err?: any) => {
      if (!err && (req as any).rentalAdmin) {
        return rentalBillingController.getBillDetails(req as any, res);
      }
      return rentalUserAuth(req as any, res, () => rentalBillingController.getBillDetails(req as any, res));
    });
  }
);

export default router;
