import { Response } from 'express';
import { rentalPropertyService } from '../services/rentalProperty.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const createPropertySchema = z.object({
  propertyName: z.string().min(2, 'Property name is required'),
  propertyType: z
    .enum(['COMMERCIAL_SHOP', 'ROADSIDE_STALL', 'WAREHOUSE_GODOWN', 'LAND_PARCEL', 'OFFICE_SPACE', 'OTHER'])
    .optional(),
  propertyNumber: z.string().min(1, 'Property/Shop number is required'),
  location: z.string().min(2, 'Location is required'),
  address: z.string().min(3, 'Address is required'),
  dimensionsSqft: z.coerce.number().positive().optional(),
  baseMonthlyRent: z.coerce.number().positive('Base monthly rent must be greater than zero'),
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

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const property = await rentalPropertyService.createProperty(
        req.rentalAdmin.adminId,
        parsed.data,
        clientIp
      );

      return sendSuccess(res, property, 'Commercial property added successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create commercial property', 400);
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
