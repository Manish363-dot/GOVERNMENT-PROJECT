import { Router } from 'express';
import { rentalNoticeController } from '../controllers/rentalNotice.controller';
import { rentalAdminAuth, rentalUserAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Public / Tenant / Admin: List Notices ────────────────────────────────────
router.get(
  '/',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return rentalAdminAuth(req as any, res, (err?: any) => {
        if (!err && (req as any).rentalAdmin) {
          return rentalNoticeController.listNotices(req as any, res);
        }
        return rentalUserAuth(req as any, res, () => rentalNoticeController.listNotices(req as any, res));
      });
    }
    return rentalNoticeController.listNotices(req as any, res);
  }
);

// ── Admin: Create Notice ─────────────────────────────────────────────────────
router.post(
  '/',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.createNotice(req, res)
);

// ── Admin: Delete Notice ─────────────────────────────────────────────────────
router.delete(
  '/:id',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.deleteNotice(req, res)
);

export default router;
