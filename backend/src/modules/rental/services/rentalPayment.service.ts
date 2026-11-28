import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import crypto from 'crypto';
import { calculateRentWithGst, resolveBillAmounts, RENTAL_GST_RATE } from '../utils/gst.util';
import { rentalCache } from '../utils/rentalCache.util';

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

      const resolvedOnline = resolveBillAmounts(bill);
      if (bill.status === 'PAID' || resolvedOnline.balanceDue <= 0) {
        throw new Error('This bill has already been paid in full.');
      }

      if (resolvedOnline.needsGstSync) {
        await rentalPrisma.rentalBill.update({
          where: { id: bill.id },
          data: {
            gst_rate: RENTAL_GST_RATE,
            gst_amount: resolvedOnline.gstAmount,
            adjustment_amount: 0.0,
            total_amount_due: resolvedOnline.totalAmountDue,
            balance_due: resolvedOnline.balanceDue,
          },
        });
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
      const amountToPay = resolvedOnline.balanceDue;

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

        // 3. Issue Official Sequential Municipal Receipt (Sequential +1)
        const latestReceipt = await tx.rentalReceipt.findFirst({
          orderBy: { issued_at: 'desc' },
          select: { receipt_number: true },
        });

        let nextReceiptNum = 286480;
        if (latestReceipt?.receipt_number) {
          const parsed = parseInt(latestReceipt.receipt_number.replace(/\D/g, ''), 10);
          if (!isNaN(parsed) && parsed >= 100) {
            nextReceiptNum = parsed + 1;
          } else {
            const totalReceipts = await tx.rentalReceipt.count();
            nextReceiptNum = 286480 + totalReceipts + 1;
          }
        }
        const receiptNumber = String(nextReceiptNum);

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

        rentalCache.invalidate('analytics', 'overview:', 'tenants:', 'ledger:', 'audit:');

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
      paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS';
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

        const resolved = resolveBillAmounts(bill);
        if (bill.status === 'PAID' || resolved.balanceDue <= 0) {
          throw new Error('This bill is already settled in full.');
        }

        const currentBalance = resolved.balanceDue;
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

        // 2. Update Bill Balance (preserving 18% GST breakdown)
        const newAmountPaid = resolved.amountPaid + amount;
        const newBalanceDue = Math.max(0, Math.round((resolved.totalAmountDue - newAmountPaid) * 100) / 100);
        const newStatus = newBalanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID';

        await tx.rentalBill.update({
          where: { id: bill.id },
          data: {
            gst_rate: RENTAL_GST_RATE,
            gst_amount: resolved.gstAmount,
            adjustment_amount: 0.0,
            total_amount_due: resolved.totalAmountDue,
            amount_paid: newAmountPaid,
            balance_due: newBalanceDue,
            status: newStatus,
          },
        });

        // 3. Generate Official Numbered Receipt (Sequential +1)
        const latestReceipt = await tx.rentalReceipt.findFirst({
          orderBy: { issued_at: 'desc' },
          select: { receipt_number: true },
        });

        let nextReceiptNum = 286480;
        if (latestReceipt?.receipt_number) {
          const parsed = parseInt(latestReceipt.receipt_number.replace(/\D/g, ''), 10);
          if (!isNaN(parsed) && parsed >= 100) {
            nextReceiptNum = parsed + 1;
          } else {
            const totalReceipts = await tx.rentalReceipt.count();
            nextReceiptNum = 286480 + totalReceipts + 1;
          }
        }
        const receiptNumber = String(nextReceiptNum);

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

        rentalCache.invalidate('analytics', 'overview:', 'tenants:', 'ledger:', 'audit:');

        return {
          paymentId: payment.id,
          receiptNumber,
          receiptId: receipt.id,
          amountPaid: amount,
          baseRentAmount: resolved.rentAmount,
          gstAmount: resolved.gstAmount,
          remainingBalance: newBalanceDue,
          billStatus: newStatus,
          message: 'Counter payment recorded and official receipt issued successfully.',
        };
      });
    });
  }

  /**
   * Record Multi-Month Rent Collection by Admin / SubAdmin
   * Creates separate monthly RentalBill records (marking every selected month PAID),
   * prevents duplicate payments, generates ONE unique official PDF receipt for the payment,
   * and logs complete ledger entries and audit trails atomically.
   */
  async collectMultiMonthPayment(
    adminId: string,
    params: {
      userId: string;
      propertyId: string;
      months: string[];
      paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS';
      referenceNumber?: string;
      remarks?: string;
      idempotencyKey?: string;
      clientIp?: string;
    }
  ) {
    return withRentalDbRetry(async () => {
      const {
        userId,
        propertyId,
        months,
        paymentMethod,
        referenceNumber,
        remarks,
        idempotencyKey,
        clientIp,
      } = params;

      const sortedMonths = Array.from(new Set(months.map((m) => m.trim())))
        .filter((m) => /^\d{4}-(0[1-9]|1[0-2])$/.test(m))
        .sort();

      if (sortedMonths.length === 0) {
        throw new Error('कृपया भुगतान के लिए कम से कम एक मान्य माह चुनें। (Please select at least one valid month.)');
      }

      return rentalPrisma.$transaction(
        async (tx) => {
          // 1. Run all initial validation & bill lookups concurrently in 1 batch
          const [
            existingIdemp,
            adminRecord,
            tenant,
            property,
            assignment,
            existingBills,
            latestReceipt,
          ] = await Promise.all([
            idempotencyKey
              ? tx.rentalPayment.findUnique({
                  where: { idempotency_key: idempotencyKey },
                  include: {
                    receipt: true,
                    user: { select: { full_name: true, user_id: true } },
                    property: { select: { property_number: true, location: true, address: true } },
                    bill: { select: { bill_number: true } },
                  },
                })
              : Promise.resolve(null),
            tx.rentalAdmin.findUnique({
              where: { id: adminId },
              select: { id: true, username: true, full_name: true, role: true },
            }),
            tx.rentalUser.findUnique({ where: { id: userId } }),
            tx.rentalProperty.findUnique({ where: { id: propertyId } }),
            tx.propertyAssignment.findFirst({
              where: { user_id: userId, property_id: propertyId, is_active: true },
            }),
            tx.rentalBill.findMany({
              where: {
                user_id: userId,
                property_id: propertyId,
                billing_month: { in: sortedMonths },
              },
            }),
            tx.rentalReceipt.findFirst({
              orderBy: { issued_at: 'desc' },
              select: { receipt_number: true },
            }),
          ]);

          if (existingIdemp && existingIdemp.status === 'SUCCESS') {
            return {
              paymentId: existingIdemp.id,
              receiptId: existingIdemp.receipt?.id,
              receiptNumber: existingIdemp.receipt?.receipt_number,
              amountPaid: Number(existingIdemp.amount),
              billingPeriod: existingIdemp.receipt?.billing_period || sortedMonths.join(', '),
              paidMonths: sortedMonths,
              billNumber: existingIdemp.bill?.bill_number || 'MULTI-MONTH',
              tenantName: existingIdemp.user?.full_name || '',
              tenantCode: existingIdemp.user?.user_id || '',
              shopNumber: existingIdemp.property?.property_number || '',
              location: existingIdemp.property?.address || existingIdemp.property?.location || '',
              paymentMethod: existingIdemp.payment_method,
              issuedAt: (existingIdemp.receipt?.issued_at || existingIdemp.created_at).toISOString(),
              message: 'Payment already recorded.',
            };
          }

          if (!adminRecord) {
            throw new Error('Unauthorized administrator / sub-admin.');
          }
          if (!tenant) throw new Error('किरायेदार विवरण नहीं मिला। (Tenant not found.)');
          if (!property) throw new Error('आवंटित दुकान विवरण नहीं मिला। (Shop/Property not found.)');

          const baseRent = Number(assignment?.monthly_rent || property.base_monthly_rent || 0);
          const {
            gstRate: defaultGstRate,
            gstAmount: singleBaseGst,
            totalWithGst: singleBaseTotal,
          } = calculateRentWithGst(baseRent);
          const startDate = new Date(
            assignment?.allotment_date || assignment?.lease_start_date || tenant.created_at || new Date()
          );
          const allotMonthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;

          const existingByMonth = new Map(existingBills.map((b) => [b.billing_month, b]));

          const billsToPay: Array<{
            billId: string;
            billNumber: string;
            monthStr: string;
            payPortion: number;
            fullAmount: number;
            rentPortion: number;
            gstPortion: number;
            gstRate: number;
            isNew: boolean;
          }> = [];
          const newBillsData: Array<{
            id: string;
            bill_number: string;
            user_id: string;
            property_id: string;
            assignment_id: string | null;
            billing_month: string;
            billing_year: number;
            rent_amount: number;
            gst_rate: number;
            gst_amount: number;
            adjustment_amount: number;
            total_amount_due: number;
            amount_paid: number;
            balance_due: number;
            due_date: Date;
            status: 'PAID';
          }> = [];
          const ledgerEntriesData: Array<{
            user_id: string;
            property_id: string;
            bill_id: string;
            payment_id?: string;
            entry_type: 'RENT_CHARGE' | 'PAYMENT';
            debit: number;
            credit: number;
            running_balance: number;
            description: string;
            transaction_reference: string;
          }> = [];

          for (const mStr of sortedMonths) {
            if (mStr < allotMonthStr) {
              throw new Error(
                `माह ${mStr} आवंटन तिथि (${allotMonthStr}) से पहले का है। (Month ${mStr} precedes allotment date ${allotMonthStr}.)`
              );
            }

            const existing = existingByMonth.get(mStr);
            if (existing) {
              const resolved = resolveBillAmounts(existing);
              const singleTotal = resolved.totalAmountDue;
              const balanceForMonth = resolved.balanceDue;

              if (existing.status === 'PAID' || balanceForMonth <= 0) {
                throw new Error(
                  `माह ${mStr} का किराया पहले ही जमा हो चुका है। डुप्लिकेट भुगतान संभव नहीं है। (Month ${mStr} is already paid.)`
                );
              }

              billsToPay.push({
                billId: existing.id,
                billNumber: existing.bill_number,
                monthStr: mStr,
                payPortion: balanceForMonth,
                fullAmount: singleTotal,
                rentPortion: resolved.rentAmount,
                gstPortion: resolved.gstAmount,
                gstRate: RENTAL_GST_RATE,
                isNew: false,
              });
            } else {
              const [yStr, moStr] = mStr.split('-');
              const y = parseInt(yStr, 10);
              const mo = parseInt(moStr, 10);
              const dueDate = new Date(y, mo - 1, 20, 23, 59, 59);
              const autoBillNo = `BL-${property.property_number}-${mStr}-${(assignment?.id || userId).slice(0, 4).toUpperCase()}`;
              const newId = crypto.randomUUID();

              newBillsData.push({
                id: newId,
                bill_number: autoBillNo,
                user_id: userId,
                property_id: propertyId,
                assignment_id: assignment?.id || null,
                billing_month: mStr,
                billing_year: y,
                rent_amount: baseRent,
                gst_rate: defaultGstRate,
                gst_amount: singleBaseGst,
                adjustment_amount: 0.0,
                total_amount_due: singleBaseTotal,
                amount_paid: singleBaseTotal,
                balance_due: 0.0,
                due_date: dueDate,
                status: 'PAID',
              });

              ledgerEntriesData.push({
                user_id: userId,
                property_id: propertyId,
                bill_id: newId,
                entry_type: 'RENT_CHARGE',
                debit: singleBaseTotal,
                credit: 0.0,
                running_balance: singleBaseTotal,
                description: `Monthly Commercial Rent + 18% GST Charge for ${mStr} (${property.property_number})`,
                transaction_reference: autoBillNo,
              });

              billsToPay.push({
                billId: newId,
                billNumber: autoBillNo,
                monthStr: mStr,
                payPortion: singleBaseTotal,
                fullAmount: singleBaseTotal,
                rentPortion: baseRent,
                gstPortion: singleBaseGst,
                gstRate: defaultGstRate,
                isNew: true,
              });
            }
          }

          const totalPaidAmount = Math.round(billsToPay.reduce((sum, item) => sum + item.payPortion, 0) * 100) / 100;
          const totalRentAmount = Math.round(billsToPay.reduce((sum, item) => sum + item.rentPortion, 0) * 100) / 100;
          const totalGstAmount = Math.round(billsToPay.reduce((sum, item) => sum + item.gstPortion, 0) * 100) / 100;
          if (totalPaidAmount <= 0) {
            throw new Error('कुल देय राशि ₹0 से अधिक होनी चाहिए।');
          }

          // Compute unique sequential Official Receipt Number
          let nextReceiptNum = 286480;
          if (latestReceipt?.receipt_number) {
            const parsed = parseInt(latestReceipt.receipt_number.replace(/\D/g, ''), 10);
            if (!isNaN(parsed) && parsed >= 100) {
              nextReceiptNum = parsed + 1;
            } else {
              const totalReceipts = await tx.rentalReceipt.count();
              nextReceiptNum = 286480 + totalReceipts + 1;
            }
          }
          while (await tx.rentalReceipt.findUnique({ where: { receipt_number: String(nextReceiptNum) } })) {
            nextReceiptNum++;
          }
          const receiptNumber = String(nextReceiptNum);
          const billingPeriodStr = sortedMonths.join(', ');

          const firstBill = billsToPay[0];
          const paymentRef = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
          const resolvedIdempKey =
            idempotencyKey || `IDEMP-MULTI-${userId.slice(0, 8)}-${sortedMonths.join('_')}-${Date.now()}`;

          // 2. Batch bill creates & updates concurrently
          const existingToUpdate = billsToPay.filter((item) => !item.isNew);
          await Promise.all([
            ...(newBillsData.length > 0 ? [tx.rentalBill.createMany({ data: newBillsData })] : []),
            ...existingToUpdate.map((item) =>
              tx.rentalBill.update({
                where: { id: item.billId },
                data: {
                  gst_rate: item.gstRate,
                  gst_amount: item.gstPortion,
                  total_amount_due: item.fullAmount,
                  adjustment_amount: 0.0,
                  amount_paid: item.fullAmount,
                  balance_due: 0.0,
                  status: 'PAID',
                },
              })
            ),
          ]);

          // 3. Create ONE atomic Payment record (after bills exist in DB)
          const payment = await tx.rentalPayment.create({
            data: {
              payment_reference: paymentRef,
              user_id: userId,
              property_id: propertyId,
              bill_id: firstBill.billId,
              amount: totalPaidAmount,
              payment_method: paymentMethod,
              gateway_payment_id: referenceNumber?.trim() || paymentRef,
              idempotency_key: resolvedIdempKey,
              status: 'SUCCESS',
              verified_at: new Date(),
            },
          });

          // Build PAYMENT ledger rows linked to payment.id
          for (const item of billsToPay) {
            ledgerEntriesData.push({
              user_id: userId,
              property_id: propertyId,
              bill_id: item.billId,
              payment_id: payment.id,
              entry_type: 'PAYMENT',
              debit: 0.0,
              credit: item.payPortion,
              running_balance: 0.0,
              description: `Rent Payment via ${paymentMethod} for ${item.monthStr} (Receipt: ${receiptNumber})`,
              transaction_reference: receiptNumber,
            });
          }

          // 4. Create receipt, all ledger entries, and both audit trails concurrently
          const [receipt] = await Promise.all([
            tx.rentalReceipt.create({
              data: {
                receipt_number: receiptNumber,
                payment_id: payment.id,
                bill_id: firstBill.billId,
                user_id: userId,
                property_id: propertyId,
                amount_paid: totalPaidAmount,
                billing_period: billingPeriodStr,
              },
            }),
            tx.rentalLedgerEntry.createMany({ data: ledgerEntriesData }),
            tx.paymentAuditTrail.create({
              data: {
                payment_id: payment.id,
                user_id: userId,
                property_id: propertyId,
                bill_id: firstBill.billId,
                event_type: 'MULTI_MONTH_RENT_COLLECTED',
                previous_status: null,
                new_status: 'SUCCESS',
                gateway_txn_ref: referenceNumber?.trim() || paymentRef,
                actor_id: adminId,
                actor_type: adminRecord.role,
                ip_address: clientIp || 'Unknown',
                details: JSON.stringify({
                  months: sortedMonths,
                  paymentMethod,
                  referenceNumber,
                  remarks,
                  receiptNumber,
                  amountPaid: totalPaidAmount,
                  collector: adminRecord.full_name || adminRecord.username,
                }),
              },
            }),
            tx.rentalAdminAuditLog.create({
              data: {
                admin_id: adminId,
                action: 'RENT_COLLECTED_MULTI_MONTH',
                target_entity: 'RentalPayment',
                target_id: payment.id,
                reason: remarks || `Collected ₹${totalPaidAmount} for ${billingPeriodStr}`,
                after_state: JSON.stringify({
                  receiptNumber,
                  months: sortedMonths,
                  amountPaid: totalPaidAmount,
                  paymentMethod,
                }),
                ip_address: clientIp || 'Unknown',
              },
            }),
          ]);

          const billNumbersSummary =
            billsToPay.length === 1
              ? firstBill.billNumber
              : `${firstBill.billNumber} (+${billsToPay.length - 1})`;

          rentalCache.invalidate('analytics', 'overview:', 'tenants:', 'ledger:', 'audit:');

          return {
            paymentId: payment.id,
            receiptId: receipt.id,
            receiptNumber,
            amountPaid: totalPaidAmount,
            baseRentAmount: totalRentAmount,
            gstAmount: totalGstAmount,
            billingPeriod: billingPeriodStr,
            paidMonths: sortedMonths,
            billNumber: billNumbersSummary,
            tenantName: tenant.full_name,
            tenantCode: tenant.user_id,
            shopNumber: property.property_number,
            location: (property as any).address || property.location,
            paymentMethod,
            issuedAt: receipt.issued_at.toISOString(),
            collectorName: adminRecord.full_name || adminRecord.username,
            message: `भुगतान सफलतापूर्वक दर्ज किया गया (रसीद संख्या: ${receiptNumber})।`,
          };
        },
        { maxWait: 10000, timeout: 30000 }
      );
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
    const cacheKey = `audit:${params.date || ''}:${params.month || ''}:${params.year || ''}:${(params.search || '').trim().toLowerCase()}:${params.page || 1}:${params.limit || 50}`;
    return rentalCache.getOrSet(cacheKey, 15_000, () =>
      withRentalDbRetry(async () => {
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
            billingMonth: p.receipt?.billing_period || p.bill?.billing_month || 'N/A',
            amount: Number(p.amount),
            paymentMethod: p.payment_method,
            gatewayRef: p.gateway_payment_id || p.payment_reference,
            paymentReference: p.payment_reference,
            date: p.created_at,
          })),
        };
      })
    );
  }
}

export const rentalPaymentService = new RentalPaymentService();
