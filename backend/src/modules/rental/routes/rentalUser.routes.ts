import { Router } from 'express';
import { rentalUserController } from '../controllers/rentalUser.controller';
import { rentalAdminAuth, rentalUserAuth } from '../middleware/rentalAuth.middleware';
import { uploadRentalRegistrationDocs } from '../../../shared/middleware/upload';

const router = Router();

// Configure multi-document S3 upload middleware for tenant registration
const registrationUpload = uploadRentalRegistrationDocs.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'aadhaar_doc', maxCount: 1 },
  { name: 'pan_doc', maxCount: 1 },
  { name: 'domicile_doc', maxCount: 1 },
  { name: 'gst_doc', maxCount: 1 },
]);

// ── Admin: Register New Tenant with S3 Documents ────────────────────────────
router.post(
  '/admin/register',
  rentalAdminAuth,
  ...registrationUpload,
  (req: any, res: any) => rentalUserController.registerTenant(req, res)
);

// ── Admin: List Tenants ─────────────────────────────────────────────────────
router.get(
  '/admin/list',
  rentalAdminAuth,
  (req, res) => rentalUserController.listTenants(req, res)
);

// ── Admin: Tenant Profile Details ───────────────────────────────────────────
router.get(
  '/admin/:id',
  rentalAdminAuth,
  (req, res) => rentalUserController.getTenantDetails(req, res)
);

// ── Admin: Update Tenant Profile (All fields editable + S3 file upload) ─────
router.put(
  '/admin/:id',
  rentalAdminAuth,
  ...registrationUpload,
  (req: any, res: any) => rentalUserController.updateTenantProfile(req, res)
);

// ── Admin: Update Tenant Status ─────────────────────────────────────────────
router.patch(
  '/admin/:id/status',
  rentalAdminAuth,
  (req, res) => rentalUserController.updateTenantStatus(req, res)
);

// ── Secure Private S3 Document Expiring URL (Admin or owning Tenant) ────────
router.get(
  '/documents/:docId/secure-url',
  (req, res, next) => {
    // Allows either admin or tenant auth
    const authHeader = req.headers.authorization;
    if (authHeader || req.cookies?.rental_admin_token) {
      return rentalAdminAuth(req as any, res, () => rentalUserController.getSecureDocumentUrl(req as any, res));
    }
    return rentalUserAuth(req as any, res, () => rentalUserController.getSecureDocumentUrl(req as any, res));
  }
);

export default router;
