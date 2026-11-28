import { Router } from 'express';
import { rentalPropertyController } from '../controllers/rentalProperty.controller';
import { rentalAdminAuth } from '../middleware/rentalAuth.middleware';
import { uploadRentalShopPhotos } from '../../../shared/middleware/upload';

const router = Router();

const shopPhotosUpload = uploadRentalShopPhotos.fields([
  { name: 'shop_photos', maxCount: 3 },
]);

// ── Public: List Available (VACANT) Shops for Citizen Landing Page ───────────
router.get(
  '/public/available',
  (req: any, res: any) => rentalPropertyController.listPublicAvailableProperties(req, res)
);

// ── Admin: Create Commercial Property Asset (with optional 1–3 photos) ───────
router.post(
  '/',
  rentalAdminAuth,
  ...shopPhotosUpload,
  (req: any, res: any) => rentalPropertyController.createProperty(req, res)
);

// ── Admin: Update / Manage Photos (1–3 photos) on Existing Property ──────────
router.put(
  '/:id/photos',
  rentalAdminAuth,
  ...shopPhotosUpload,
  (req: any, res: any) => rentalPropertyController.updatePropertyPhotos(req, res)
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

// ── Admin: Delete Property Asset ────────────────────────────────────────────
router.delete(
  '/:id',
  rentalAdminAuth,
  (req: any, res: any) => rentalPropertyController.deleteProperty(req, res)
);

export default router;
