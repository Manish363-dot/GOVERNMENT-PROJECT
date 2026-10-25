import { Router } from 'express';
import { rentalAuthController } from '../controllers/rentalAuth.controller';
import {
  rentalAdminAuth,
  requireRentalSuperAdmin,
  rentalUserAuth,
} from '../middleware/rentalAuth.middleware';
import {
  rentalAdminLoginLimiter,
  rentalUserLoginLimiter,
} from '../middleware/rentalRateLimit';

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

// ── Registered Tenant / User Authentication Routes (Rate Limited) ───────────
router.post('/user/login', rentalUserLoginLimiter, (req, res) =>
  rentalAuthController.userLogin(req, res)
);

router.get('/user/me', rentalUserAuth, (req, res) =>
  rentalAuthController.getUserProfile(req, res)
);

router.post('/user/change-password', rentalUserAuth, (req, res) =>
  rentalAuthController.changeUserPassword(req, res)
);

export default router;
