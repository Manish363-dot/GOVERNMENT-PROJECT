import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';

export class PaymentController {
  async getHealth(_req: Request, res: Response) {
    return res.json(paymentService.getHealth());
  }

  async createChallan(req: Request, res: Response) {
    try {
      const { serviceType, payerName, payerPhone, payerEmail, referenceId, amount, description } = req.body;
      if (!serviceType || !payerName || !payerPhone || !amount) {
        return sendError(res, 'Missing required challan fields (serviceType, payerName, payerPhone, amount)', 400);
      }

      const challan = await paymentService.createChallan({
        serviceType,
        payerName,
        payerPhone,
        payerEmail,
        referenceId: referenceId || 'GEN',
        amount: Number(amount),
        description: description || 'Zila Panchayat Municipal Fee'
      });

      return sendSuccess(res, challan, 'Government e-Challan generated successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create challan', 500);
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const { challanNo, transactionId } = req.body;
      if (!challanNo || !transactionId) {
        return sendError(res, 'Challan number and transaction ID are required', 400);
      }

      const receipt = await paymentService.verifyPayment(challanNo, transactionId);
      return sendSuccess(res, receipt, 'Payment verified successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to verify payment', 500);
    }
  }

  async handleWebhook(req: Request, res: Response) {
    // Gateway webhook handler (SBI ePay / Razorpay / Treasury)
    return res.json({ received: true, timestamp: new Date().toISOString() });
  }
}

export const paymentController = new PaymentController();
