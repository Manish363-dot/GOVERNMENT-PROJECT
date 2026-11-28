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

// ── Admin & SubAdmin: Rent Management Overview (Cards + Year-wise Ledger) ─────
router.get(
  '/rent-management',
  rentalAdminAuth,
  (req: any, res: any) => rentalBillingController.getRentManagementOverview(req, res)
);

// ── Admin: Dashboard Analytics & Revenue KPI ─────────────────────────────────
router.get(
  '/analytics',
  rentalAdminAuth,
  (req: any, res: any) => rentalBillingController.getAnalytics(req, res)
);

// ── Admin or Tenant: List Bills (Strictly Authenticated) ──────────────────────
router.get(
  '/',
  (req, res, next) => {
    const hasToken = Boolean(req.cookies?.rental_admin_token || req.headers.authorization);
    if (!hasToken) {
      return res.status(401).json({ success: false, error: 'Authentication required to view rental bills.' });
    }
    // Try admin auth first
    return rentalAdminAuth(req as any, res, (err?: any) => {
      if (!err && (req as any).rentalAdmin) {
        return rentalBillingController.listBills(req as any, res);
      }
      // Fallback to tenant auth
      return rentalUserAuth(req as any, res, () => rentalBillingController.listBills(req as any, res));
    });
  }
);

// ── Admin or Tenant: Single Bill Details (Strictly Authenticated) ─────────────
router.get(
  '/:id',
  (req, res, next) => {
    const hasToken = Boolean(req.cookies?.rental_admin_token || req.headers.authorization);
    if (!hasToken) {
      return res.status(401).json({ success: false, error: 'Authentication required to view bill details.' });
    }
    return rentalAdminAuth(req as any, res, (err?: any) => {
      if (!err && (req as any).rentalAdmin) {
        return rentalBillingController.getBillDetails(req as any, res);
      }
      return rentalUserAuth(req as any, res, () => rentalBillingController.getBillDetails(req as any, res));
    });
  }
);

export default router;
