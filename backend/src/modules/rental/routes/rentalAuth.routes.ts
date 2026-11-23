import { Router } from 'express';
import { rentalAuthController } from '../controllers/rentalAuth.controller';
import {
  rentalAdminAuth,
  requireRentalSuperAdmin,
} from '../middleware/rentalAuth.middleware';
import { rentalAdminLoginLimiter } from '../middleware/rentalRateLimit';

const router = Router();

// ── Admin Authentication Routes (Rate Limited) ──────────────────────────────
router.post('/admin/login', rentalAdminLoginLimiter, (req, res) =>
  rentalAuthController.adminLogin(req, res)
);

router.get('/admin/me', rentalAdminAuth, (req, res) =>
  rentalAuthController.getAdminProfile(req, res)
);

// ── Super Admin: Sub-Admin Management ───────────────────────────────────────
router.post(
  '/admin/subadmins',
  rentalAdminAuth,
  requireRentalSuperAdmin,
  (req, res) => rentalAuthController.createSubAdmin(req, res)
);

router.get(
  '/admin/subadmins',
  rentalAdminAuth,
  requireRentalSuperAdmin,
  (req, res) => rentalAuthController.listSubAdmins(req, res)
);

router.patch(
  '/admin/subadmins/:id/status',
  rentalAdminAuth,
  requireRentalSuperAdmin,
  (req, res) => rentalAuthController.toggleSubAdminStatus(req, res)
);

router.put(
  '/admin/subadmins/:id/status',
  rentalAdminAuth,
  requireRentalSuperAdmin,
  (req, res) => rentalAuthController.toggleSubAdminStatus(req, res)
);

export default router;
