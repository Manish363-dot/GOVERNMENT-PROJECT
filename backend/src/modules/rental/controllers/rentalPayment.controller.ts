import { Response } from 'express';
import { rentalPaymentService } from '../services/rentalPayment.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { z } from 'zod';

const initiatePaymentSchema = z.object({
  billId: z.string().uuid('Valid bill ID is required'),
});

const verifyPaymentSchema = z.object({
  paymentReference: z.string().min(3, 'Payment reference is required'),
  gatewayPaymentId: z.string().min(3, 'Gateway transaction ID is required'),
  gatewayOrderId: z.string().optional(),
  gatewaySignature: z.string().optional(),
});

const counterPaymentSchema = z.object({
  billId: z.string().uuid('Valid bill ID is required'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CHEQUE_DD', 'POS_MACHINE', 'NEFT_RTGS']),
  referenceNumber: z.string().optional(),
  remarks: z.string().optional(),
});

export class RentalPaymentController {
  /**
   * POST /api/rental/payments/initiate
   * Tenant initiates an online payment session for their bill
   */
  async initiatePayment(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalUser) {
        return sendError(res, 'Tenant authentication required to initiate payment', 401);
      }

      const parsed = initiatePaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid bill parameters', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const order = await rentalPaymentService.initiateOnlinePayment({
        billId: parsed.data.billId,
        userId: req.rentalUser.userId,
        clientIp,
        userAgent,
      });

      return sendSuccess(res, order, 'Payment session initiated successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to initiate payment', 400);
    }
  }

  /**
   * POST /api/rental/payments/verify
   * Verify gateway callback and issue official numbered receipt
   */
  async verifyPayment(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const parsed = verifyPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid payment verification payload', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      const result = await rentalPaymentService.verifyOnlinePayment({
        ...parsed.data,
        clientIp,
        userAgent,
      });

      return sendSuccess(res, result, result.message, 200);
    } catch (err: any) {
      return sendError(res, err.message || 'Payment verification failed', 400);
    }
  }

  /**
   * POST /api/rental/payments/counter
   * Municipal counter cash/cheque collection by authorized officer
   */
  async recordCounterPayment(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const parsed = counterPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid counter payment details', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';

      const result = await rentalPaymentService.recordCounterPayment(req.rentalAdmin.adminId, {
        ...parsed.data,
        clientIp,
      });

      return sendSuccess(res, result, result.message, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to record counter payment', 400);
    }
  }

  /**
   * GET /api/rental/payments/audit
   * Admin Financial Audit Ledger with filters (date, month, year, search)
   */
  async getAuditLedger(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }

      const { date, month, year, search, limit, page } = req.query;
      const data = await rentalPaymentService.getAuditLedger({
        date: date as string,
        month: month as string,
        year: year as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        page: page ? parseInt(page as string, 10) : 1,
      });

      return sendSuccess(res, data, 'Audit ledger retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve audit ledger', 500);
    }
  }
}

export const rentalPaymentController = new RentalPaymentController();
