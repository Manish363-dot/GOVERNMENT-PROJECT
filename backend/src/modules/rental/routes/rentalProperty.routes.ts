import { Router } from 'express';
import { rentalPropertyController } from '../controllers/rentalProperty.controller';
import { rentalAdminAuth } from '../middleware/rentalAuth.middleware';

const router = Router();

// ── Admin: Create Commercial Property Asset ──────────────────────────────────
router.post(
  '/',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.createProperty(req, res)
);

// ── Admin/Public: List All Properties with Filters ───────────────────────────
router.get(
  '/',
  (req: any, res: any) => rentalPropertyController.listProperties(req, res)
);

// ── Admin/Tenant: Single Property Details ───────────────────────────────────
router.get(
  '/:id',
  (req: any, res: any) => rentalPropertyController.getPropertyDetails(req, res)
);

// ── Admin: Allot Property to Tenant ─────────────────────────────────────────
router.post(
  '/:id/assign',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.assignProperty(req, res)
);

// ── Admin: Vacate Property ──────────────────────────────────────────────────
router.post(
  '/:id/unassign',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.unassignProperty(req, res)
);

// ── Admin: Revise Rent with Audit Trail ──────────────────────────────────────
router.post(
  '/:id/rent-change',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.changeRent(req, res)
);

// ── Admin: Rent Change History for Property ─────────────────────────────────
router.get(
  '/:id/rent-history',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.getRentHistory(req, res)
);

export default router;
