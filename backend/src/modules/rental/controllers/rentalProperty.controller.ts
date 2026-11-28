import { Response } from 'express';
import { rentalPropertyService } from '../services/rentalProperty.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const createPropertySchema = z.object({
  propertyName: z.string().trim().optional().or(z.literal('')),
  propertyType: z
    .enum(['COMMERCIAL_SHOP', 'ROADSIDE_STALL', 'WAREHOUSE_GODOWN', 'LAND_PARCEL', 'OFFICE_SPACE', 'OTHER'])
    .optional(),
  propertyNumber: z.string().trim().min(1, 'Shop code is required'),
  location: z.string().trim().optional().or(z.literal('')),
  address: z.string().trim().min(3, 'Shop address is required'),
  dimensionsSqft: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive('Area in Sq. Ft must be greater than zero').optional()
  ),
  baseMonthlyRent: z.coerce.number().positive('Monthly rent must be greater than zero'),
});

const assignPropertySchema = z.object({
  userId: z.string().uuid('Valid tenant user ID is required'),
  monthlyRent: z.coerce.number().positive().optional(),
  leaseStartDate: z.string().min(4, 'Valid lease start date is required'),
  leaseEndDate: z.string().optional(),
});

const unassignPropertySchema = z.object({
  reason: z.string().min(3, 'Deactivation/Vacation reason is required'),
});

const changeRentSchema = z.object({
  userId: z.string().uuid('Valid tenant user ID is required'),
  newRent: z.coerce.number().positive('New rent amount must be greater than zero'),
  effectiveDate: z.string().min(4, 'Effective date is required'),
  reason: z.string().min(3, 'Reason for rent change is required'),
  requestedBy: z.string().optional(),
});

export class RentalPropertyController {
  /**
   * POST /api/rental/properties
   * Add a new commercial property asset
   */
  async createProperty(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const parsed = createPropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid property parameters', 400);
      }

      const rawFiles = ((req as any).files?.shop_photos as Array<{ location: string; key: string }>) || [];
      const uploadedPhotos = rawFiles
        .filter((f) => f && f.location)
        .slice(0, 3)
        .map((f) => ({ url: f.location, key: f.key }));

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const property = await rentalPropertyService.createProperty(
        req.rentalAdmin.adminId,
        {
          ...parsed.data,
          uploadedPhotos,
        },
        clientIp
      );

      return sendSuccess(res, property, 'Commercial property added successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create commercial property', 400);
    }
  }

  /**
   * GET /api/rental/properties/public/available
   * Public endpoint returning strictly VACANT (unallotted) shops with photos & details
   */
  async listPublicAvailableProperties(_req: AuthenticatedRentalRequest, res: Response) {
    try {
      const items = await rentalPropertyService.listPublicAvailableProperties();
      return sendSuccess(res, items, 'Available properties retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve available properties', 400);
    }
  }

  /**
   * PUT /api/rental/properties/:id/photos
   * Update up to 3 photos on an existing shop/property
   */
  async updatePropertyPhotos(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      let keepUrls: string[] = [];
      if (req.body?.keepUrls) {
        if (Array.isArray(req.body.keepUrls)) {
          keepUrls = req.body.keepUrls.map(String);
        } else if (typeof req.body.keepUrls === 'string') {
          try {
            const parsed = JSON.parse(req.body.keepUrls);
            if (Array.isArray(parsed)) keepUrls = parsed.map(String);
          } catch {
            keepUrls = [req.body.keepUrls];
          }
        }
      }

      const rawFiles = ((req as any).files?.shop_photos as Array<{ location: string; key: string }>) || [];
      const newPhotos = rawFiles
        .filter((f) => f && f.location)
        .map((f) => ({ url: f.location, key: f.key }));

      if (keepUrls.length + newPhotos.length > 3) {
        return sendError(res, 'अधिकतम 3 फोटो ही जोड़ी जा सकती हैं। (Maximum 3 photos allowed)', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const updated = await rentalPropertyService.updatePropertyPhotos(
        req.rentalAdmin.adminId,
        id,
        keepUrls,
        newPhotos,
        clientIp
      );

      return sendSuccess(res, updated, 'Shop photos updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update shop photos', 400);
    }
  }

  /**
   * GET /api/rental/properties
   * List all commercial properties with filter, status, and search
   */
  async listProperties(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { search, status, type, page, limit } = req.query;
      const result = await rentalPropertyService.listProperties({
        search: search as string,
        status: status as string,
        type: type as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result, 'Properties retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve properties', 400);
    }
  }

  /**
   * GET /api/rental/properties/:id
   * Get single property details with current tenant, assignment history, and rent revisions
   */
  async getPropertyDetails(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { id } = req.params;
      const property = await rentalPropertyService.getPropertyDetails(id);
      return sendSuccess(res, property, 'Property details retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve property details', 404);
    }
  }

  /**
   * POST /api/rental/properties/:id/assign
   * Allot/Assign a vacant property to an active registered tenant
   */
  async assignProperty(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const parsed = assignPropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid assignment details', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const assignment = await rentalPropertyService.assignProperty(
        req.rentalAdmin.adminId,
        {
          propertyId: id,
          ...parsed.data,
        },
        clientIp
      );

      return sendSuccess(res, assignment, 'Property allotted to tenant successfully', 200);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to assign property', 400);
    }
  }

  /**
   * POST /api/rental/properties/:id/unassign
   * Vacate/Deactivate an allotment
   */
  async unassignProperty(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const parsed = unassignPropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Vacation reason required', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalPropertyService.unassignProperty(
        req.rentalAdmin.adminId,
        id,
        parsed.data.reason,
        clientIp
      );

      return sendSuccess(res, result, 'Property marked as VACANT successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to vacate property', 400);
    }
  }

  /**
   * POST /api/rental/properties/:id/rent-change
   * Revise rent with immutable audit trail and maker-checker validation
   */
  async changeRent(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const parsed = changeRentSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid rent revision payload', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalPropertyService.changeRent(
        req.rentalAdmin.adminId,
        {
          propertyId: id,
          ...parsed.data,
        },
        clientIp
      );

      return sendSuccess(res, result, 'Monthly rent revised and recorded in audit history successfully', 200);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to change rent', 400);
    }
  }

  /**
   * DELETE /api/rental/properties/:id
   * Delete a commercial property asset permanently
   */
  async deleteProperty(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalPropertyService.deleteProperty(
        req.rentalAdmin.adminId,
        id,
        clientIp
      );

      return sendSuccess(res, result, 'Property deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete property', 400);
    }
  }

  /**
   * GET /api/rental/properties/:id/rent-history
   * Get chronological rent revision audit logs for a property
   */
  async getRentHistory(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { id } = req.params;
      const history = await rentalPropertyService.getRentHistory({ propertyId: id });
      return sendSuccess(res, history, 'Rent change history retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve rent change history', 400);
    }
  }
}

export const rentalPropertyController = new RentalPropertyController();
