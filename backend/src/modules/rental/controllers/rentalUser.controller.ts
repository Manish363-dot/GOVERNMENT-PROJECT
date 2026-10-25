import { Response } from 'express';
import { rentalUserService } from '../services/rentalUser.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const registerUserSchema = z.object({
  fullName: z.string().min(2, 'किरायेदार का पूरा नाम अनिवार्य है (Full name is required)'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'मान्य 10-अंकीय मोबाइल नंबर अनिवार्य है (Valid 10-digit mobile number required)'),
  email: z.string().email('मान्य ईमेल प्रारूप दर्ज करें').optional().or(z.literal('')),
  permanentAddress: z.string().min(3, 'स्थायी पता अनिवार्य है (Permanent address is required)'),
  currentAddress: z.string().min(3, 'वर्तमान पता अनिवार्य है (Current address is required)'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'मान्य 12-अंकीय आधार संख्या अनिवार्य है (Valid 12-digit Aadhaar number required)'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'मान्य 10-अंकीय पैन नंबर अनिवार्य है (Valid 10-character PAN required)'),
  gstNumber: z.string().optional().or(z.literal('')),
  propertyId: z.string().min(1, 'दुकान का चयन अनिवार्य है (Shop / property selection is required)'),
  monthlyRent: z.coerce.number().min(1, 'मासिक निर्धारित किराया अनिवार्य है (Monthly rent must be greater than 0)'),
  rentEffectiveDate: z.string().min(1, 'आवंटन प्रभावी तिथि अनिवार्य है (Lease effective date is required)'),
  initialPassword: z.string().min(6, 'पासवर्ड न्यूनतम 6 अक्षरों का होना चाहिए').optional().or(z.literal('')),
});

export class RentalUserController {
  /**
   * POST /api/rental/admin/users/register
   * Multi-part form handler for tenant registration with S3 documents
   */
  async registerTenant(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const parsed = registerUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid registration form', 400);
      }

      const files = (req as any).files || {};
      const fileData = {
        profilePhoto: files.profile_photo?.[0],
        aadhaarDoc: files.aadhaar_doc?.[0],
        panDoc: files.pan_doc?.[0],
        domicileDoc: files.domicile_doc?.[0],
        gstDoc: files.gst_doc?.[0],
      };

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalUserService.registerTenant(
        req.rentalAdmin.adminId,
        parsed.data,
        fileData,
        clientIp
      );

      return sendSuccess(res, result, 'Tenant registered successfully in Zila Panchayat Almora records', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to register tenant', 400);
    }
  }

  /**
   * GET /api/rental/admin/users
   * List tenants with search, status filters & pagination
   */
  async listTenants(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { search, status, page, limit } = req.query;
      const result = await rentalUserService.listTenants({
        search: search as string,
        status: status as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result, 'Tenants list retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to list tenants', 500);
    }
  }

  /**
   * GET /api/rental/admin/users/:id
   * Full profile view with property history and uploaded documents
   */
  async getTenantDetails(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const result = await rentalUserService.getTenantDetails(id);
      return sendSuccess(res, result, 'Tenant details fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch tenant details', 404);
    }
  }

  /**
   * PATCH /api/rental/admin/users/:id/status
   * Activate / Deactivate tenant
   */
  async updateTenantStatus(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return sendError(res, 'Valid status is required', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalUserService.updateTenantStatus(
        req.rentalAdmin.adminId,
        id,
        status,
        reason,
        clientIp
      );

      return sendSuccess(res, result, 'Tenant status updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update tenant status', 400);
    }
  }

  /**
   * PUT /api/rental/users/admin/:id
   * Admin: Update Tenant Profile (All fields editable)
   */
  async updateTenantProfile(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const files = (req as any).files || {};
      const fileData = {
        profilePhoto: files.profile_photo?.[0],
        aadhaarDoc: files.aadhaar_doc?.[0],
        panDoc: files.pan_doc?.[0],
        domicileDoc: files.domicile_doc?.[0],
        gstDoc: files.gst_doc?.[0],
      };

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalUserService.updateTenantProfile(
        req.rentalAdmin.adminId,
        id,
        req.body,
        fileData,
        clientIp
      );

      return sendSuccess(res, result, 'Tenant profile updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update tenant profile', 400);
    }
  }

  /**
   * GET /api/rental/users/documents/:docId/secure-url
   * Generates a 15-minute expiring S3 pre-signed URL with strict object-level authorization
   */
  async getSecureDocumentUrl(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { docId } = req.params;
      const isAdmin = !!req.rentalAdmin;
      const requestingUserId = req.rentalUser?.userId;

      if (!isAdmin && !requestingUserId) {
        return sendError(res, 'Authentication required to access private documents', 401);
      }

      const result = await rentalUserService.getSecureDocumentUrl(docId, requestingUserId, isAdmin);
      return sendSuccess(res, result, 'Secure download URL generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Access to document denied', 403);
    }
  }
}

export const rentalUserController = new RentalUserController();
