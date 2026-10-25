import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import crypto from 'crypto';

export class RentalPaymentService {
  /**
   * Initiate Online Payment for a Rental Bill
   * Generates unique idempotency key, prevents race conditions, and logs audit trail.
   */
  async initiateOnlinePayment(params: {
    billId: string;
    userId: string;
    clientIp?: string;
    userAgent?: string;
  }) {
    return withRentalDbRetry(async () => {
      const { billId, userId, clientIp, userAgent } = params;

      const bill = await rentalPrisma.rentalBill.findUnique({
        where: { id: billId },
        include: { property: true, user: true },
      });

      if (!bill) {
        throw new Error('Rental bill not found.');
      }

      if (bill.user_id !== userId) {
        throw new Error('Unauthorized: You can only pay bills issued under your tenant ID.');
      }

      if (bill.status === 'PAID' || Number(bill.balance_due) <= 0) {
        throw new Error('This bill has already been paid in full.');
      }

      // Concurrency check: Reject if there is already an active INITIATED payment within the last 2 minutes
      const recentInitiated = await rentalPrisma.rentalPayment.findFirst({
        where: {
          bill_id: billId,
          status: 'INITIATED',
          created_at: { gte: new Date(Date.now() - 2 * 60 * 1000) },
        },
      });

      if (recentInitiated) {
        return {
          paymentReference: recentInitiated.payment_reference,
          gatewayOrderId: recentInitiated.gateway_order_id,
          amount: Number(recentInitiated.amount),
          currency: 'INR',
          billNumber: bill.bill_number,
          propertyNumber: bill.property.property_number,
          message: 'An existing payment session is already active. Please complete the transaction.',
        };
      }

      const paymentReference = `PAY-ZPA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const idempotencyKey = `IDEMP-${bill.id}-${Date.now()}`;
      const gatewayOrderId = `order_zpa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const amountToPay = Number(bill.balance_due);

      const payment = await rentalPrisma.rentalPayment.create({
        data: {
          payment_reference: paymentReference,
          user_id: bill.user_id,
          property_id: bill.property_id,
          bill_id: bill.id,
          amount: amountToPay,
          payment_method: 'ONLINE_PAYMENT',
          gateway_order_id: gatewayOrderId,
          idempotency_key: idempotencyKey,
          status: 'INITIATED',
        },
      });

      // Append-Only Payment Audit Trail
      await rentalPrisma.paymentAuditTrail.create({
        data: {
          payment_id: payment.id,
          user_id: bill.user_id,
          property_id: bill.property_id,
          bill_id: bill.id,
          event_type: 'PAYMENT_INITIATED',
          previous_status: null,
          new_status: 'INITIATED',
          gateway_order_id: gatewayOrderId,
          actor_id: userId,
          actor_type: 'CITIZEN',
          ip_address: clientIp || 'Unknown',
          user_agent: userAgent || 'Unknown',
          details: JSON.stringify({ amount: amountToPay, billNumber: bill.bill_number }),
        },
      });

      return {
        paymentReference,
        gatewayOrderId,
        amount: amountToPay,
        currency: 'INR',
        billNumber: bill.bill_number,
        propertyName: bill.property.property_name,
        propertyNumber: bill.property.property_number,
      };
    });
  }

  /**
   * Verify Online Payment & Generate Official Receipt Atomically
   * Strictly enforces idempotency: repeated callback returns original receipt.
   */
  async verifyOnlinePayment(params: {
    paymentReference: string;
    gatewayPaymentId: string;
    gatewayOrderId?: string;
    gatewaySignature?: string;
    clientIp?: string;
    userAgent?: string;
  }) {
    return withRentalDbRetry(async () => {
      const { paymentReference, gatewayPaymentId, gatewayOrderId, gatewaySignature, clientIp, userAgent } =
        params;

      return rentalPrisma.$transaction(async (tx) => {
        const payment = await tx.rentalPayment.findUnique({
          where: { payment_reference: paymentReference },
          include: { bill: true, user: true, property: true },
        });

        if (!payment) {
          throw new Error('Payment reference not found.');
        }

        // Idempotency: If payment was already verified, return existing receipt directly
        if (payment.status === 'SUCCESS') {
          const existingReceipt = await tx.rentalReceipt.findUnique({
            where: { payment_id: payment.id },
          });

          return {
            status: 'ALREADY_VERIFIED',
            receiptNumber: existingReceipt?.receipt_number,
            amount: Number(payment.amount),
            message: 'Payment has already been confirmed and processed.',
          };
        }

        if (!payment.bill) {
          throw new Error('Associated bill not found.');
        }

        // 1. Mark Payment SUCCESS
        const updatedPayment = await tx.rentalPayment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            gateway_payment_id: gatewayPaymentId,
            gateway_signature: gatewaySignature || null,
            verified_at: new Date(),
          },
        });

        // 2. Update Bill Balance & Status
        const paidAmount = Number(payment.amount);
        const currentAmountPaid = Number(payment.bill.amount_paid);
        const totalDue = Number(payment.bill.total_amount_due);

        const newAmountPaid = currentAmountPaid + paidAmount;
        const newBalanceDue = Math.max(0, totalDue - newAmountPaid);
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

        await tx.rentalBill.update({
          where: { id: payment.bill.id },
          data: {
            amount_paid: newAmountPaid,
            balance_due: newBalanceDue,
            status: newStatus,
          },
        });

        // 3. Issue Official Sequential Municipal Receipt
        const totalReceipts = await tx.rentalReceipt.count();
        const currentYear = new Date().getFullYear();
        const receiptNumber = `ZPA-REC-${currentYear}-${(totalReceipts + 1).toString().padStart(5, '0')}`;

        const receipt = await tx.rentalReceipt.create({
          data: {
            receipt_number: receiptNumber,
            payment_id: payment.id,
            bill_id: payment.bill.id,
            user_id: payment.user_id,
            property_id: payment.property_id,
            amount_paid: paidAmount,
            billing_period: payment.bill.billing_month,
          },
        });

        // 4. Record Financial Ledger Entry (Credit)
        await tx.rentalLedgerEntry.create({
          data: {
            user_id: payment.user_id,
            property_id: payment.property_id,
            bill_id: payment.bill.id,
            payment_id: payment.id,
            entry_type: 'PAYMENT',
            debit: 0.0,
            credit: paidAmount,
            running_balance: newBalanceDue,
            description: `Online Payment received for Bill ${payment.bill.bill_number} (Ref: ${gatewayPaymentId})`,
            transaction_reference: receiptNumber,
          },
        });

        // 5. Append-Only Payment Audit Trail
        await tx.paymentAuditTrail.create({
          data: {
            payment_id: payment.id,
            user_id: payment.user_id,
            property_id: payment.property_id,
            bill_id: payment.bill.id,
            event_type: 'PAYMENT_SUCCESS',
            previous_status: 'INITIATED',
            new_status: 'SUCCESS',
            gateway_order_id: gatewayOrderId || payment.gateway_order_id,
            gateway_txn_ref: gatewayPaymentId,
            actor_id: payment.user_id,
            actor_type: 'CITIZEN',
            ip_address: clientIp || 'Unknown',
            user_agent: userAgent || 'Unknown',
            details: JSON.stringify({
              receiptNumber,
              paidAmount,
              newBalanceDue,
              newStatus,
            }),
          },
        });

        return {
          status: 'SUCCESS',
          paymentId: payment.id,
          receiptNumber,
          receiptId: receipt.id,
          amountPaid: paidAmount,
          balanceDue: newBalanceDue,
          billStatus: newStatus,
          message: 'Payment verified and official receipt generated successfully.',
        };
      });
    });
  }

  /**
   * Record Official Municipal Counter Payment (Cash / Cheque / DD)
   * Processed at Zila Panchayat Almora office counter with full audit logging.
   */
  async recordCounterPayment(
    adminId: string,
    params: {
      billId: string;
      amount: number;
      paymentMethod: 'CASH' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS';
      referenceNumber?: string;
      remarks?: string;
      clientIp?: string;
    }
  ) {
    return withRentalDbRetry(async () => {
      const { billId, amount, paymentMethod, referenceNumber, remarks, clientIp } = params;

      return rentalPrisma.$transaction(async (tx) => {
        const bill = await tx.rentalBill.findUnique({
          where: { id: billId },
          include: { property: true, user: true },
        });

        if (!bill) {
          throw new Error('Rental bill not found.');
        }

        if (bill.status === 'PAID' || Number(bill.balance_due) <= 0) {
          throw new Error('This bill is already settled in full.');
        }

        const currentBalance = Number(bill.balance_due);
        if (amount > currentBalance) {
          throw new Error(`Amount ₹${amount} exceeds current balance due of ₹${currentBalance}.`);
        }

        const paymentRef = `COUNTER-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const idempotencyKey = `IDEMP-COUNTER-${bill.id}-${Date.now()}`;

        // 1. Create Payment record in SUCCESS status
        const payment = await tx.rentalPayment.create({
          data: {
            payment_reference: paymentRef,
            user_id: bill.user_id,
            property_id: bill.property_id,
            bill_id: bill.id,
            amount: amount,
            payment_method: paymentMethod,
            gateway_payment_id: referenceNumber || paymentRef,
            idempotency_key: idempotencyKey,
            status: 'SUCCESS',
            verified_at: new Date(),
          },
        });

        // 2. Update Bill Balance
        const newAmountPaid = Number(bill.amount_paid) + amount;
        const newBalanceDue = Math.max(0, Number(bill.total_amount_due) - newAmountPaid);
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

        await tx.rentalBill.update({
          where: { id: bill.id },
          data: {
            amount_paid: newAmountPaid,
            balance_due: newBalanceDue,
            status: newStatus,
          },
        });

        // 3. Generate Official Numbered Receipt
        const totalReceipts = await tx.rentalReceipt.count();
        const currentYear = new Date().getFullYear();
        const receiptNumber = `ZPA-REC-${currentYear}-${(totalReceipts + 1).toString().padStart(5, '0')}`;

        const receipt = await tx.rentalReceipt.create({
          data: {
            receipt_number: receiptNumber,
            payment_id: payment.id,
            bill_id: bill.id,
            user_id: bill.user_id,
            property_id: bill.property_id,
            amount_paid: amount,
            billing_period: bill.billing_month,
          },
        });

        // 4. Ledger entry (Credit)
        await tx.rentalLedgerEntry.create({
          data: {
            user_id: bill.user_id,
            property_id: bill.property_id,
            bill_id: bill.id,
            payment_id: payment.id,
            entry_type: 'PAYMENT',
            debit: 0.0,
            credit: amount,
            running_balance: newBalanceDue,
            description: `Office Counter Payment via ${paymentMethod} (Receipt: ${receiptNumber})`,
            transaction_reference: receiptNumber,
          },
        });

        // 5. Payment Audit Trail
        await tx.paymentAuditTrail.create({
          data: {
            payment_id: payment.id,
            user_id: bill.user_id,
            property_id: bill.property_id,
            bill_id: bill.id,
            event_type: 'COUNTER_PAYMENT_COLLECTED',
            previous_status: null,
            new_status: 'SUCCESS',
            actor_id: adminId,
            actor_type: 'ADMIN',
            ip_address: clientIp || 'Unknown',
            details: JSON.stringify({
              paymentMethod,
              referenceNumber,
              remarks,
              receiptNumber,
              amount,
            }),
          },
        });

        // 6. Admin Audit Log
        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'COUNTER_PAYMENT_ACCEPTED',
            target_entity: 'RentalPayment',
            target_id: payment.id,
            reason: remarks || `Counter payment of ₹${amount} received`,
            after_state: JSON.stringify({ receiptNumber, amount, billId: bill.id }),
            ip_address: clientIp || 'Unknown',
          },
        });

        return {
          paymentId: payment.id,
          receiptNumber,
          receiptId: receipt.id,
          amountPaid: amount,
          remainingBalance: newBalanceDue,
          billStatus: newStatus,
          message: 'Counter payment recorded and official receipt issued successfully.',
        };
      });
    });
  }

  /**
   * Financial Audit Ledger
   * Allows filtering payments by date, month, year, search term, and exports full transaction trails.
   */
  async getAuditLedger(params: {
    date?: string;
    month?: string; // YYYY-MM
    year?: string;  // YYYY
    search?: string;
    limit?: number;
    page?: number;
  }) {
    return withRentalDbRetry(async () => {
      const { date, month, year, search, limit = 50, page = 1 } = params;
      const where: any = { status: 'SUCCESS' };

      if (date) {
        const d = new Date(date);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        where.created_at = { gte: start, lte: end };
      } else if (month) {
        const [y, m] = month.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        where.created_at = { gte: start, lte: end };
      } else if (year) {
        const y = parseInt(year, 10);
        const start = new Date(y, 0, 1);
        const end = new Date(y, 11, 31, 23, 59, 59);
        where.created_at = { gte: start, lte: end };
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { user: { full_name: { contains: q, mode: 'insensitive' } } },
          { user: { mobile: { contains: q } } },
          { user: { user_id: { contains: q, mode: 'insensitive' } } },
          { property: { property_number: { contains: q, mode: 'insensitive' } } },
          { receipt: { receipt_number: { contains: q, mode: 'insensitive' } } },
        ];
      }

      const [total, payments] = await Promise.all([
        rentalPrisma.rentalPayment.count({ where }),
        rentalPrisma.rentalPayment.findMany({
          where,
          include: {
            user: { select: { id: true, full_name: true, mobile: true, user_id: true, aadhaar_masked: true } },
            property: { select: { id: true, property_number: true, location: true, property_type: true } },
            receipt: true,
            bill: { select: { id: true, bill_number: true, billing_month: true } },
          },
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      return {
        total,
        page,
        limit,
        totalAmount,
        records: payments.map((p) => ({
          id: p.id,
          receiptNumber: p.receipt?.receipt_number || `REC-${p.id.slice(0, 8)}`,
          tenantId: p.user?.id || '',
          tenantName: p.user?.full_name || 'Almora Resident',
          tenantMobile: p.user?.mobile || 'N/A',
          tenantCode: p.user?.user_id || 'TENANT',
          shopNumber: p.property?.property_number || 'SHOP',
          location: p.property?.location || 'Almora Market',
          propertyType: p.property?.property_type || 'COMMERCIAL_SHOP',
          billNumber: p.bill?.bill_number || 'N/A',
          billingMonth: p.bill?.billing_month || 'N/A',
          amount: Number(p.amount),
          paymentMethod: p.payment_method,
          gatewayRef: p.gateway_payment_id || p.payment_reference,
          paymentReference: p.payment_reference,
          date: p.created_at,
        })),
      };
    });
  }
}

export const rentalPaymentService = new RentalPaymentService();
