import { Request, Response } from 'express';
import { rentalService } from '../services/rental.service';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';

export class RentalController {
  async getHealth(_req: Request, res: Response) {
    const health = rentalService.getHealth();
    return res.json(health);
  }

  async getRoot(_req: Request, res: Response) {
    return res.send('🏛️ Zila Panchayat Almora — Commercial Rental & Asset Management API is running.');
  }

  async searchDues(req: Request, res: Response) {
    try {
      const { query } = req.query;
      const data = await rentalService.searchDues(query as string | undefined);
      return sendSuccess(res, data, 'Tenant dues fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to search tenant dues', 500);
    }
  }

  async submitFeedback(req: Request, res: Response) {
    try {
      const { name, phone, shopNo, message } = req.body;
      if (!name || !phone || !message) {
        return sendError(res, 'Name, phone, and message are required', 400);
      }

      const result = await rentalService.submitFeedback({ name, phone, shopNo, message });
      return sendSuccess(res, result, 'Feedback / Grievance recorded successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to submit grievance', 500);
    }
  }
}

export const rentalController = new RentalController();
