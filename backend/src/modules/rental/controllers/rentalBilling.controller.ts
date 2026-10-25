import { Response } from 'express';
import { rentalBillingService } from '../services/rentalBilling.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const generateBillsSchema = z.object({
  billingMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Billing month must be YYYY-MM (e.g. 2026-10)'),
});

export class RentalBillingController {
  /**
   * POST /api/rental/bills/generate
   * Admin bulk generates monthly rental bills for all active leased properties
   */
  async generateMonthlyBills(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const parsed = generateBillsSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid billing month', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalBillingService.generateMonthlyBills(
        req.rentalAdmin.adminId,
        parsed.data.billingMonth,
        clientIp
      );

      return sendSuccess(res, result, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate monthly bills', 400);
    }
  }

  /**
   * GET /api/rental/bills
   * List bills with filters (admin sees all, tenant sees own)
   */
  async listBills(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { search, status, billingMonth, propertyId, userId, page, limit } = req.query;

      // Anti-IDOR: If logged in as tenant, restrict strictly to their own bills
      let targetUserId = userId as string | undefined;
      if (req.rentalUser) {
        targetUserId = req.rentalUser.userId;
      }

      const result = await rentalBillingService.listBills({
        search: search as string,
        status: status as string,
        billingMonth: billingMonth as string,
        propertyId: propertyId as string,
        userId: targetUserId,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result, 'Bills retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve bills', 400);
    }
  }

  /**
   * GET /api/rental/bills/:id
   * Get single bill details with anti-IDOR check
   */
  async getBillDetails(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { id } = req.params;
      const tenantUserId = req.rentalUser ? req.rentalUser.userId : undefined;

      const bill = await rentalBillingService.getBillDetails(id, tenantUserId);
      return sendSuccess(res, bill, 'Bill details retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve bill details', 404);
    }
  }

  /**
   * GET /api/rental/bills/dues/search
   * Public dues lookup for citizens and quick payment
   */
  async searchDues(req: any, res: Response) {
    try {
      const q = (req.query.q as string) || '';
      const result = await rentalBillingService.searchDues(q);
      return sendSuccess(res, result, 'Dues search completed');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to search dues', 400);
    }
  }

  /**
   * GET /api/rental/bills/analytics
   * Admin Executive Dashboard Analytics & Trends
   */
  async getAnalytics(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }
      const data = await rentalBillingService.getDashboardAnalytics();
      return sendSuccess(res, data, 'Analytics data retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to load analytics', 500);
    }
  }
}

export const rentalBillingController = new RentalBillingController();
