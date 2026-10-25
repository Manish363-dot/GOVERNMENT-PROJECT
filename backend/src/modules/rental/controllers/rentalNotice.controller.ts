import { Response } from 'express';
import { rentalNoticeService } from '../services/rentalNotice.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const createNoticeSchema = z.object({
  title: z.string().min(3, 'Notice title is required'),
  message: z.string().min(5, 'Notice message body is required'),
  category: z.enum(['PUBLIC', 'INDIVIDUAL']),
  recipientUserId: z.string().uuid().optional(),
  priority: z.enum(['NORMAL', 'IMPORTANT', 'URGENT']).optional(),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
  expiresAt: z.string().optional(),
});

export class RentalNoticeController {
  /**
   * POST /api/rental/notices
   * Admin publishes a notice
   */
  async createNotice(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const parsed = createNoticeSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid notice details', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const notice = await rentalNoticeService.createNotice(
        req.rentalAdmin.adminId,
        parsed.data,
        clientIp
      );

      return sendSuccess(res, notice, 'Notice published successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to publish notice', 400);
    }
  }

  /**
   * GET /api/rental/notices
   * List notices (Public, tenant-specific, or all for admin)
   */
  async listNotices(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const { category, search, page, limit } = req.query;
      const tenantUserId = req.rentalUser ? req.rentalUser.userId : undefined;

      const result = await rentalNoticeService.listNotices({
        category: category as string,
        tenantUserId,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      return sendSuccess(res, result, 'Notices retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve notices', 400);
    }
  }

  /**
   * DELETE /api/rental/notices/:id
   * Admin removes a notice
   */
  async deleteNotice(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const { id } = req.params;
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalNoticeService.deleteNotice(req.rentalAdmin.adminId, id, clientIp);

      return sendSuccess(res, result, 'Notice deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete notice', 400);
    }
  }
}

export const rentalNoticeController = new RentalNoticeController();
