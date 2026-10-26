import { Response } from 'express';
import { rentalLedgerService } from '../services/rentalLedger.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';

export class RentalLedgerController {
  /**
   * GET /api/rental/ledger/overview
   * Overall financial metrics, yearly, monthly, today, and custom period
   */
  async getOverview(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }

      const { date, startDate, endDate, month, year } = req.query;

      const overview = await rentalLedgerService.getOverview({
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        month: month as string,
        year: year as string,
      });

      return sendSuccess(res, overview, 'Ledger overview fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch ledger overview', 500);
    }
  }

  /**
   * GET /api/rental/ledger/transactions
   * General master ledger transactions with multi-field search and filters
   */
  async getTransactions(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }

      const {
        date,
        startDate,
        endDate,
        month,
        year,
        search,
        paymentMethod,
        limit,
        page,
      } = req.query;

      const data = await rentalLedgerService.getTransactions({
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        month: month as string,
        year: year as string,
        search: search as string,
        paymentMethod: paymentMethod as string,
        limit: limit ? parseInt(limit as string, 10) : 50,
        page: page ? parseInt(page as string, 10) : 1,
      });

      return sendSuccess(res, data, 'Ledger transactions fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch ledger transactions', 500);
    }
  }

  /**
   * GET /api/rental/ledger/tenant/:userId
   * Individual Tenant Complete 360-Degree Ledger Statement
   */
  async getTenantLedger(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }

      const { userId } = req.params;
      if (!userId) {
        return sendError(res, 'Tenant identifier is required', 400);
      }

      const statement = await rentalLedgerService.getTenantLedgerStatement(userId);
      return sendSuccess(res, statement, 'Tenant ledger statement generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate tenant ledger statement', 404);
    }
  }

  /**
   * GET /api/rental/ledger/tenants
   * Fast dropdown list of tenants
   */
  async getTenantsList(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator access required', 401);
      }

      const { search } = req.query;
      const list = await rentalLedgerService.getTenantsList(search as string);
      return sendSuccess(res, list, 'Tenants list fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch tenants list', 500);
    }
  }
}

export const rentalLedgerController = new RentalLedgerController();
