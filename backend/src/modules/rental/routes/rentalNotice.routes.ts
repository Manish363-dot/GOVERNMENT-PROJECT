import { Router } from 'express';
import { rentalNoticeController } from '../controllers/rentalNotice.controller';
import { rentalAdminAuth, rentalUserAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Public / Tenant / Admin: List Notices ────────────────────────────────────
router.get(
  '/',
  (req, res) => {
    const authHeader = req.headers.authorization;
    const hasAdminToken = Boolean(req.cookies?.rental_admin_token || authHeader?.startsWith('Bearer '));
    const hasUserToken = Boolean(req.cookies?.rental_user_token);

    if (hasAdminToken) {
      return rentalAdminAuth(req as any, res, (err?: any) => {
        if (!err && (req as any).rentalAdmin) {
          return rentalNoticeController.listNotices(req as any, res);
        }
        return rentalUserAuth(req as any, res, () => rentalNoticeController.listNotices(req as any, res));
      });
    }

    if (hasUserToken) {
      return rentalUserAuth(req as any, res, () => rentalNoticeController.listNotices(req as any, res));
    }

    // Unauthenticated visitors on Rental Portal landing page -> strictly PUBLIC notices
    return rentalNoticeController.listNotices(req as any, res);
  }
);

// ── Admin: Meta WhatsApp Cloud API Status ───────────────────────────────────
router.get(
  '/whatsapp-status',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.getWhatsAppStatus(req, res)
);

// ── Admin: Create Notice ─────────────────────────────────────────────────────
router.post(
  '/',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.createNotice(req, res)
);

// ── Admin: Dispatch / Resend Notice via Meta WhatsApp API ────────────────────
router.post(
  '/:id/send-whatsapp',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.sendWhatsAppNotice(req, res)
);

// ── Admin: Delete Notice ─────────────────────────────────────────────────────
router.delete(
  '/:id',
  rentalAdminAuth,
  (req: any, res: any) => rentalNoticeController.deleteNotice(req, res)
);

export default router;
