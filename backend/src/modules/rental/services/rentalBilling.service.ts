import { randomUUID } from 'crypto';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { calculateRentWithGst, resolveBillAmounts, RENTAL_GST_RATE } from '../utils/gst.util';
import { rentalCache } from '../utils/rentalCache.util';

const toMonthKey = (year: number, monthNum: number) =>
  `${year}-${String(monthNum).padStart(2, '0')}`;

const computeDueDate = (year: number, monthNum: number, startDate: Date): Date => {
  const startY = startDate.getFullYear();
  const startM = startDate.getMonth() + 1;
  // If allotted after the 20th of its very first month, due date is end of that first month
  if (year === startY && monthNum === startM && startDate.getDate() > 20) {
    return new Date(year, monthNum, 0, 23, 59, 59);
  }
  return new Date(year, monthNum - 1, 20, 23, 59, 59);
};

export class RentalBillingService {
  /**
   * Automatically generates separate monthly RentalBill records from each active
   * tenant's allotment/registration date through the current month (capped by lease_end_date if past).
   * Updates overdue status on past-due unpaid bills without double-counting arrears.
   */
  async ensureAccruedMonthlyBills(targetUserId?: string) {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonthNum = now.getMonth() + 1;

    const activeAssignments = await rentalPrisma.propertyAssignment.findMany({
      where: {
        is_active: true,
        ...(targetUserId ? { user_id: targetUserId } : {}),
      },
      include: {
        property: true,
        user: { select: { id: true, created_at: true } },
        bills: {
          select: {
            id: true,
            billing_month: true,
            status: true,
            balance_due: true,
            due_date: true,
          },
        },
      },
    });

    for (const assign of activeAssignments) {
      const startDate = new Date(
        assign.allotment_date || assign.lease_start_date || assign.user.created_at || now
      );
      let startYear = startDate.getFullYear();
      let startMonth = startDate.getMonth() + 1;

      if (isNaN(startYear) || isNaN(startMonth)) {
        startYear = curYear;
        startMonth = curMonthNum;
      }

      // Cap automatic accrued demand at current month (or lease_end_date if lease ended earlier)
      let capYear = curYear;
      let capMonth = curMonthNum;
      if (assign.lease_end_date) {
        const endDt = new Date(assign.lease_end_date);
        if (!isNaN(endDt.getTime())) {
          const endY = endDt.getFullYear();
          const endM = endDt.getMonth() + 1;
          if (endY < capYear || (endY === capYear && endM < capMonth)) {
            capYear = endY;
            capMonth = endM;
          }
        }
      }

      // Guard: if allotment date is in a future month beyond current month, still allow tracking without backfill
      if (startYear > capYear || (startYear === capYear && startMonth > capMonth)) {
        continue;
      }

      const existingMap = new Map(assign.bills.map((b) => [b.billing_month, b]));
      const rentAmt = Number(assign.monthly_rent || assign.property.base_monthly_rent || 0);
      const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(rentAmt);

      let y = startYear;
      let m = startMonth;
      let safetyGuard = 0;

      while ((y < capYear || (y === capYear && m <= capMonth)) && safetyGuard < 120) {
        safetyGuard++;
        const mStr = toMonthKey(y, m);
        const dueDate = computeDueDate(y, m, startDate);
        const isPastMonth = y < curYear || (y === curYear && m < curMonthNum);
        const isOverdue = isPastMonth || now > dueDate;

        const existing = existingMap.get(mStr);
        if (!existing) {
          const billNo = `BL-${assign.property.property_number}-${mStr}-${assign.id.slice(0, 4).toUpperCase()}`;
          try {
            const bill = await rentalPrisma.rentalBill.create({
              data: {
                bill_number: billNo,
                user_id: assign.user_id,
                property_id: assign.property_id,
                assignment_id: assign.id,
                billing_month: mStr,
                billing_year: y,
                rent_amount: rentAmt,
                gst_rate: gstRate,
                gst_amount: gstAmount,
                adjustment_amount: 0.0,
                total_amount_due: totalWithGst,
                amount_paid: 0.0,
                balance_due: totalWithGst,
                due_date: dueDate,
                status: isOverdue ? 'OVERDUE' : 'PENDING',
              },
            });

            await rentalPrisma.rentalLedgerEntry.create({
              data: {
                user_id: assign.user_id,
                property_id: assign.property_id,
                bill_id: bill.id,
                entry_type: 'RENT_CHARGE',
                debit: totalWithGst,
                credit: 0.0,
                running_balance: totalWithGst,
                description: `Monthly Commercial Rent + 18% GST Demand for ${mStr} (${assign.property.property_number})`,
                transaction_reference: billNo,
              },
            });
          } catch {
            // Ignore unique constraint collision across concurrent requests
          }
        } else if (
          existing.status === 'PENDING' &&
          Number(existing.balance_due) > 0 &&
          (isPastMonth || now > new Date(existing.due_date))
        ) {
          try {
            await rentalPrisma.rentalBill.update({
              where: { id: existing.id },
              data: { status: 'OVERDUE' },
            });
          } catch {
            // Non-blocking status refresh
          }
        }

        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }
    }
  }

  /**
   * Bulk Monthly Bill Generation for All Active Leased Properties
   * Creates separate monthly rent records (no compounding arrears roll-forward).
   */
  async generateMonthlyBills(adminId: string, billingMonth: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth)) {
        throw new Error('Billing month must be in YYYY-MM format (e.g. 2026-10).');
      }

      const [yearStr, monthStr] = billingMonth.split('-');
      const billingYear = parseInt(yearStr, 10);
      const billingMonthNum = parseInt(monthStr, 10);
      const now = new Date();
      const dueDate = new Date(billingYear, billingMonthNum - 1, 20, 23, 59, 59);
      const isOverdue = now > dueDate;

      const activeAssignments = await rentalPrisma.propertyAssignment.findMany({
        where: { is_active: true },
        include: {
          user: true,
          property: true,
        },
      });

      if (activeAssignments.length === 0) {
        return {
          generatedCount: 0,
          skippedCount: 0,
          message: 'No active leases found to generate monthly bills.',
        };
      }

      let generatedCount = 0;
      let skippedCount = 0;

      const existingBillsCount = await rentalPrisma.rentalBill.count();

      for (let i = 0; i < activeAssignments.length; i++) {
        const assignment = activeAssignments[i];

        const existingBill = await rentalPrisma.rentalBill.findUnique({
          where: {
            user_id_property_id_billing_month: {
              user_id: assignment.user_id,
              property_id: assignment.property_id,
              billing_month: billingMonth,
            },
          },
        });

        if (existingBill) {
          skippedCount++;
          continue;
        }

        const monthlyRent = Number(assignment.monthly_rent);
        const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(monthlyRent);
        const billNumber = `BILL-${billingMonth.replace('-', '')}-${(existingBillsCount + generatedCount + 1)
          .toString()
          .padStart(4, '0')}`;

        await rentalPrisma.$transaction(async (tx) => {
          const bill = await tx.rentalBill.create({
            data: {
              bill_number: billNumber,
              user_id: assignment.user_id,
              property_id: assignment.property_id,
              assignment_id: assignment.id,
              billing_month: billingMonth,
              billing_year: billingYear,
              rent_amount: monthlyRent,
              gst_rate: gstRate,
              gst_amount: gstAmount,
              adjustment_amount: 0.0,
              total_amount_due: totalWithGst,
              amount_paid: 0.0,
              balance_due: totalWithGst,
              due_date: dueDate,
              status: isOverdue ? 'OVERDUE' : 'PENDING',
            },
          });

          await tx.rentalLedgerEntry.create({
            data: {
              user_id: assignment.user_id,
              property_id: assignment.property_id,
              bill_id: bill.id,
              entry_type: 'RENT_CHARGE',
              debit: totalWithGst,
              credit: 0.0,
              running_balance: totalWithGst,
              description: `Monthly Commercial Rent + 18% GST Charge for ${billingMonth} (${assignment.property.property_number})`,
              transaction_reference: billNumber,
            },
          });
        });

        generatedCount++;
      }

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'MONTHLY_BILLS_GENERATED',
          target_entity: 'RentalBill',
          target_id: billingMonth,
          after_state: JSON.stringify({
            billingMonth,
            generatedCount,
            skippedCount,
          }),
          ip_address: clientIp || 'Unknown',
        },
      });

      rentalCache.invalidate('analytics', 'overview:', 'tenants:', 'properties:', 'ledger:', 'audit:');

      return {
        billingMonth,
        generatedCount,
        skippedCount,
        message: `Successfully generated ${generatedCount} bills for month ${billingMonth} (${skippedCount} already existed).`,
      };
    });
  }

  /**
   * Rent Management Overview (Tenant-Centric Cards, Year-Wise Monthly Ledger, Payment History & Receipts)
   */
  async getRentManagementOverview(params: {
    search?: string;
    status?: string;
    year?: number;
    tenantId?: string;
  }) {
    const overviewKey = `overview:${params.year || 'cur'}:${params.tenantId || 'all'}`;
    const baseData = await rentalCache.getOrSet(overviewKey, 15_000, () =>
      withRentalDbRetry(async () => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonthNum = now.getMonth() + 1;
        const curMonthStr = toMonthKey(curYear, curMonthNum);

        const userFilter = params.tenantId
          ? { id: params.tenantId }
          : {
              OR: [
                { assignments: { some: { is_active: true } } },
                { bills: { some: {} } },
                { payments: { some: { status: 'SUCCESS' as const } } },
              ],
            };
        const scopedFilter = params.tenantId ? { user_id: params.tenantId } : {};

        // Execute flat, lean queries concurrently (1 parallel RTT instead of multi-level sequential Prisma includes)
        const [
          users,
          assignments,
          bills,
          payments,
          receipts,
          paymentLedgerLinks,
          auditTrails,
          admins,
        ] = await Promise.all([
          rentalPrisma.rentalUser.findMany({
            where: userFilter,
            select: {
              id: true,
              user_id: true,
              full_name: true,
              mobile: true,
              email: true,
              profile_photo_url: true,
              created_at: true,
            },
            orderBy: { created_at: 'desc' },
          }),
        rentalPrisma.propertyAssignment.findMany({
          where: scopedFilter,
          select: {
            id: true,
            user_id: true,
            property_id: true,
            monthly_rent: true,
            allotment_date: true,
            lease_start_date: true,
            lease_end_date: true,
            is_active: true,
            created_at: true,
            property: {
              select: {
                id: true,
                property_id: true,
                property_name: true,
                property_number: true,
                address: true,
                location: true,
                base_monthly_rent: true,
              },
            },
          },
          orderBy: [{ is_active: 'desc' }, { created_at: 'desc' }],
        }),
        rentalPrisma.rentalBill.findMany({
          where: scopedFilter,
          select: {
            id: true,
            bill_number: true,
            user_id: true,
            property_id: true,
            assignment_id: true,
            billing_month: true,
            billing_year: true,
            rent_amount: true,
            gst_rate: true,
            gst_amount: true,
            adjustment_amount: true,
            total_amount_due: true,
            amount_paid: true,
            balance_due: true,
            due_date: true,
            status: true,
          },
          orderBy: { billing_month: 'asc' },
        }),
        rentalPrisma.rentalPayment.findMany({
          where: { ...scopedFilter, status: 'SUCCESS' },
          select: {
            id: true,
            user_id: true,
            property_id: true,
            bill_id: true,
            payment_reference: true,
            gateway_payment_id: true,
            amount: true,
            payment_method: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        }),
        rentalPrisma.rentalReceipt.findMany({
          where: scopedFilter,
          select: {
            id: true,
            receipt_number: true,
            payment_id: true,
            bill_id: true,
            user_id: true,
            amount_paid: true,
            billing_period: true,
            issued_at: true,
          },
          orderBy: { issued_at: 'desc' },
        }),
        rentalPrisma.rentalLedgerEntry.findMany({
          where: { ...scopedFilter, payment_id: { not: null } },
          select: {
            bill_id: true,
            payment_id: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        }),
        rentalPrisma.paymentAuditTrail.findMany({
          where: params.tenantId
            ? { user_id: params.tenantId, payment_id: { not: null } }
            : { payment_id: { not: null } },
          select: {
            payment_id: true,
            actor_id: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        }),
        rentalPrisma.rentalAdmin.findMany({
          select: { id: true, username: true, full_name: true },
        }),
      ]);

      // Build fast in-memory lookup maps
      const adminMap = new Map(admins.map((a) => [a.id, a.full_name || a.username]));
      const userCreatedMap = new Map(users.map((u) => [u.id, u.created_at]));

      const assignsByUser = new Map<string, (typeof assignments)>();
      for (const a of assignments) {
        const list = assignsByUser.get(a.user_id) || [];
        list.push(a);
        assignsByUser.set(a.user_id, list);
      }

      const propMap = new Map<string, (typeof assignments)[number]['property']>();
      for (const a of assignments) {
        if (a.property) propMap.set(a.property.id, a.property);
      }

      const billsByUser = new Map<string, typeof bills>();
      const billById = new Map<string, (typeof bills)[number]>();
      const billKeySet = new Set<string>();
      for (const b of bills) {
        billById.set(b.id, b);
        billKeySet.add(`${b.user_id}::${b.property_id}::${b.billing_month}`);
        const list = billsByUser.get(b.user_id) || [];
        list.push(b);
        billsByUser.set(b.user_id, list);
      }

      // Inline accrual & overdue detection — writes ONLY if any bill is actually missing or stale
      if (!params.year) {
        const missingBills: Array<{
          id: string;
          bill_number: string;
          user_id: string;
          property_id: string;
          assignment_id: string;
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
          status: 'PENDING' | 'OVERDUE';
        }> = [];
        const missingLedgerEntries: Array<{
          user_id: string;
          property_id: string;
          bill_id: string;
          entry_type: 'RENT_CHARGE';
          debit: number;
          credit: number;
          running_balance: number;
          description: string;
          transaction_reference: string;
        }> = [];
        const overdueIdsToMark: string[] = [];

        for (const assign of assignments) {
          if (!assign.is_active) continue;
          const startDate = new Date(
            assign.allotment_date || assign.lease_start_date || userCreatedMap.get(assign.user_id) || now
          );
          let startYear = startDate.getFullYear();
          let startMonth = startDate.getMonth() + 1;
          if (isNaN(startYear) || isNaN(startMonth)) {
            startYear = curYear;
            startMonth = curMonthNum;
          }

          let capYear = curYear;
          let capMonth = curMonthNum;
          if (assign.lease_end_date) {
            const endDt = new Date(assign.lease_end_date);
            if (!isNaN(endDt.getTime())) {
              const endY = endDt.getFullYear();
              const endM = endDt.getMonth() + 1;
              if (endY < capYear || (endY === capYear && endM < capMonth)) {
                capYear = endY;
                capMonth = endM;
              }
            }
          }

          if (startYear > capYear || (startYear === capYear && startMonth > capMonth)) continue;

          const rentAmt = Number(assign.monthly_rent || assign.property?.base_monthly_rent || 0);
          const { gstRate: accruedGstRate, gstAmount: accruedGst, totalWithGst: accruedTotal } = calculateRentWithGst(rentAmt);
          const propNum = assign.property?.property_number || 'SHOP';
          const userBillsMap = new Map(
            (billsByUser.get(assign.user_id) || []).map((b) => [b.billing_month, b])
          );

          let y = startYear;
          let m = startMonth;
          let guard = 0;
          while ((y < capYear || (y === capYear && m <= capMonth)) && guard < 120) {
            guard++;
            const mStr = toMonthKey(y, m);
            const dueDate = computeDueDate(y, m, startDate);
            const isPastMonth = y < curYear || (y === curYear && m < curMonthNum);
            const isOverdue = isPastMonth || now > dueDate;

            const existing = userBillsMap.get(mStr);
            const uniqueKey = `${assign.user_id}::${assign.property_id}::${mStr}`;
            if (!existing && !billKeySet.has(uniqueKey)) {
              const id = randomUUID();
              const billNo = `BL-${propNum}-${mStr}-${assign.id.slice(0, 4).toUpperCase()}`;
              const status: 'PENDING' | 'OVERDUE' = isOverdue ? 'OVERDUE' : 'PENDING';
              missingBills.push({
                id,
                bill_number: billNo,
                user_id: assign.user_id,
                property_id: assign.property_id,
                assignment_id: assign.id,
                billing_month: mStr,
                billing_year: y,
                rent_amount: rentAmt,
                gst_rate: accruedGstRate,
                gst_amount: accruedGst,
                adjustment_amount: 0.0,
                total_amount_due: accruedTotal,
                amount_paid: 0.0,
                balance_due: accruedTotal,
                due_date: dueDate,
                status,
              });
              missingLedgerEntries.push({
                user_id: assign.user_id,
                property_id: assign.property_id,
                bill_id: id,
                entry_type: 'RENT_CHARGE',
                debit: accruedTotal,
                credit: 0.0,
                running_balance: accruedTotal,
                description: `Monthly Commercial Rent + 18% GST Demand for ${mStr} (${propNum})`,
                transaction_reference: billNo,
              });
              billKeySet.add(uniqueKey);

              const syntheticBill = {
                id,
                bill_number: billNo,
                user_id: assign.user_id,
                property_id: assign.property_id,
                assignment_id: assign.id,
                billing_month: mStr,
                billing_year: y,
                rent_amount: rentAmt as any,
                gst_rate: accruedGstRate as any,
                gst_amount: accruedGst as any,
                adjustment_amount: 0 as any,
                total_amount_due: accruedTotal as any,
                amount_paid: 0 as any,
                balance_due: accruedTotal as any,
                due_date: dueDate,
                status: status as any,
              };
              const list = billsByUser.get(assign.user_id) || [];
              list.push(syntheticBill);
              billsByUser.set(assign.user_id, list);
              billById.set(id, syntheticBill);
            } else if (
              existing &&
              existing.status === 'PENDING' &&
              Number(existing.balance_due) > 0 &&
              isOverdue
            ) {
              overdueIdsToMark.push(existing.id);
              existing.status = 'OVERDUE' as any;
            }

            m++;
            if (m > 12) {
              m = 1;
              y++;
            }
          }
        }

        if (missingBills.length > 0 || overdueIdsToMark.length > 0) {
          const ops: Promise<any>[] = [];
          if (missingBills.length > 0) {
            ops.push(
              rentalPrisma.rentalBill
                .createMany({ data: missingBills, skipDuplicates: true })
                .then(() =>
                  rentalPrisma.rentalLedgerEntry.createMany({
                    data: missingLedgerEntries,
                    skipDuplicates: true,
                  })
                )
            );
          }
          if (overdueIdsToMark.length > 0) {
            ops.push(
              rentalPrisma.rentalBill.updateMany({
                where: { id: { in: overdueIdsToMark } },
                data: { status: 'OVERDUE' },
              })
            );
          }
          await Promise.all(ops).catch(() => {
            // Non-fatal if concurrent request already created them
          });
        }
      }

      const paymentById = new Map(payments.map((p) => [p.id, p]));
      const paymentsByUser = new Map<string, typeof payments>();
      for (const p of payments) {
        const list = paymentsByUser.get(p.user_id) || [];
        list.push(p);
        paymentsByUser.set(p.user_id, list);
      }

      const receiptByPaymentId = new Map<string, (typeof receipts)[number]>();
      const receiptsByBillId = new Map<string, typeof receipts>();
      for (const r of receipts) {
        if (r.payment_id && !receiptByPaymentId.has(r.payment_id)) {
          receiptByPaymentId.set(r.payment_id, r);
        }
        if (r.bill_id) {
          const list = receiptsByBillId.get(r.bill_id) || [];
          list.push(r);
          receiptsByBillId.set(r.bill_id, list);
        }
      }

      const ledgerPaymentByBillId = new Map<string, string>();
      for (const l of paymentLedgerLinks) {
        if (l.bill_id && l.payment_id && !ledgerPaymentByBillId.has(l.bill_id)) {
          ledgerPaymentByBillId.set(l.bill_id, l.payment_id);
        }
      }

      const actorByPaymentId = new Map<string, string>();
      for (const a of auditTrails) {
        if (a.payment_id && a.actor_id && !actorByPaymentId.has(a.payment_id)) {
          actorByPaymentId.set(a.payment_id, a.actor_id);
        }
      }

      const billsToSyncGst: Array<{
        id: string;
        gstAmount: number;
        totalAmountDue: number;
        balanceDue: number;
      }> = [];

      let tenantCards = users.map((u) => {
        const userAssigns = assignsByUser.get(u.id) || [];
        const userBills = billsByUser.get(u.id) || [];
        const userPayments = paymentsByUser.get(u.id) || [];

        const activeAssign = userAssigns.find((a) => a.is_active) || userAssigns[0] || null;
        const prop =
          activeAssign?.property ||
          (userBills[0]?.property_id ? propMap.get(userBills[0].property_id) : null) ||
          null;
        const allotmentDate =
          activeAssign?.allotment_date || activeAssign?.lease_start_date || u.created_at;
        const monthlyRent = Number(activeAssign?.monthly_rent || prop?.base_monthly_rent || 0);

        const allotDt = new Date(allotmentDate);
        const allotYear = isNaN(allotDt.getTime()) ? curYear : allotDt.getFullYear();
        const allotMonth = isNaN(allotDt.getTime()) ? curMonthNum : allotDt.getMonth() + 1;
        const allotMonthStr = toMonthKey(allotYear, allotMonth);

        const billByMonth = new Map<string, (typeof userBills)[number]>();
        for (const b of userBills) {
          if (!billByMonth.has(b.billing_month)) {
            billByMonth.set(b.billing_month, b);
          }
        }

        const minYear = Math.min(allotYear, curYear);
        let maxDropdownYear = curYear + 1;
        let maxLoadedYear = curYear;
        for (const b of userBills) {
          if (b.billing_year > maxDropdownYear) maxDropdownYear = b.billing_year;
          if (b.billing_year > maxLoadedYear) maxLoadedYear = b.billing_year;
        }
        const availableYears: number[] = [];
        for (let y = minYear; y <= maxDropdownYear; y++) {
          availableYears.push(y);
        }

        const yearsToBuildSet = new Set<number>();
        for (let y = minYear; y <= maxLoadedYear; y++) {
          yearsToBuildSet.add(y);
        }
        if (
          params.year &&
          Number.isFinite(params.year) &&
          params.year >= minYear &&
          params.year <= maxDropdownYear + 2
        ) {
          yearsToBuildSet.add(params.year);
          if (!availableYears.includes(params.year)) {
            availableYears.push(params.year);
            availableYears.sort((a, b) => a - b);
          }
        }
        const yearsToBuild = Array.from(yearsToBuildSet).sort((a, b) => a - b);

        const monthlyRecords: Array<{
          billingMonth: string;
          year: number;
          month: number;
          billId: string | null;
          billNumber: string | null;
          rentAmount: number;
          gstAmount: number;
          totalAmountDue: number;
          amountPaid: number;
          balanceDue: number;
          dueDate: string | null;
          status: 'PAID' | 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID' | 'UPCOMING' | 'NOT_ALLOTTED';
          receipt: {
            receiptId: string;
            receiptNumber: string;
            amountPaid: number;
            baseRentAmount?: number;
            gstAmount?: number;
            billingPeriod: string;
            billNumber: string;
            issuedAt: string;
            paymentMethod: string;
            collectorName?: string;
          } | null;
        }> = [];

        for (const y of yearsToBuild) {
          for (let m = 1; m <= 12; m++) {
            const mStr = toMonthKey(y, m);
            const existingBill = billByMonth.get(mStr);

            if (existingBill) {
              const resolved = resolveBillAmounts(existingBill);
              const singleRent = resolved.rentAmount;
              const singleGst = resolved.gstAmount;
              const singleTotal = resolved.totalAmountDue;
              const paidAmt = resolved.amountPaid;
              const balAmt = resolved.balanceDue;

              if (resolved.needsGstSync) {
                billsToSyncGst.push({
                  id: existingBill.id,
                  gstAmount: singleGst,
                  totalAmountDue: singleTotal,
                  balanceDue: balAmt,
                });
              }

              let resolvedReceipt: any = null;
              const directReceipts = receiptsByBillId.get(existingBill.id) || [];
              if (directReceipts.length > 0) {
                const r = directReceipts[0];
                const pay = r.payment_id ? paymentById.get(r.payment_id) : undefined;
                const actorId = r.payment_id ? actorByPaymentId.get(r.payment_id) : undefined;
                resolvedReceipt = {
                  receiptId: r.id,
                  receiptNumber: r.receipt_number,
                  amountPaid: Number(r.amount_paid),
                  ...(singleGst > 0 ? { baseRentAmount: singleRent, gstAmount: singleGst } : {}),
                  billingPeriod: r.billing_period,
                  billNumber: existingBill.bill_number,
                  issuedAt: r.issued_at.toISOString(),
                  paymentMethod: pay?.payment_method || 'CASH',
                  collectorName: actorId ? adminMap.get(actorId) : undefined,
                };
              } else {
                const linkedPayId = ledgerPaymentByBillId.get(existingBill.id);
                const r = linkedPayId ? receiptByPaymentId.get(linkedPayId) : undefined;
                if (r && linkedPayId) {
                  const pay = paymentById.get(linkedPayId);
                  const actorId = actorByPaymentId.get(linkedPayId);
                  resolvedReceipt = {
                    receiptId: r.id,
                    receiptNumber: r.receipt_number,
                    amountPaid: Number(r.amount_paid),
                    ...(singleGst > 0 ? { baseRentAmount: singleRent, gstAmount: singleGst } : {}),
                    billingPeriod: r.billing_period,
                    billNumber: existingBill.bill_number,
                    issuedAt: r.issued_at.toISOString(),
                    paymentMethod: pay?.payment_method || 'CASH',
                    collectorName: actorId ? adminMap.get(actorId) : undefined,
                  };
                }
              }

              let monthStatus: 'PAID' | 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID' = 'UNPAID';
              if (existingBill.status === 'PAID' || balAmt <= 0) {
                monthStatus = 'PAID';
              } else if (existingBill.status === 'PARTIALLY_PAID') {
                monthStatus =
                  mStr < curMonthStr || now > new Date(existingBill.due_date)
                    ? 'OVERDUE'
                    : 'PARTIALLY_PAID';
              } else if (
                existingBill.status === 'OVERDUE' ||
                mStr < curMonthStr ||
                now > new Date(existingBill.due_date)
              ) {
                monthStatus = 'OVERDUE';
              }

              monthlyRecords.push({
                billingMonth: mStr,
                year: y,
                month: m,
                billId: existingBill.id,
                billNumber: existingBill.bill_number,
                rentAmount: singleRent,
                gstAmount: singleGst,
                totalAmountDue: singleTotal,
                amountPaid: paidAmt,
                balanceDue: balAmt,
                dueDate: new Date(existingBill.due_date).toISOString(),
                status: monthStatus,
                receipt: resolvedReceipt,
              });
            } else if (mStr < allotMonthStr) {
              monthlyRecords.push({
                billingMonth: mStr,
                year: y,
                month: m,
                billId: null,
                billNumber: null,
                rentAmount: 0,
                gstAmount: 0,
                totalAmountDue: 0,
                amountPaid: 0,
                balanceDue: 0,
                dueDate: null,
                status: 'NOT_ALLOTTED',
                receipt: null,
              });
            } else {
              const isPastOrCurrent = mStr <= curMonthStr;
              const dueDt = computeDueDate(y, m, allotDt);
              const derivedStatus = isPastOrCurrent
                ? mStr < curMonthStr || now > dueDt
                  ? 'OVERDUE'
                  : 'UNPAID'
                : 'UPCOMING';
              const { gstAmount: virtGst, totalWithGst: virtTotal } = calculateRentWithGst(monthlyRent);

              monthlyRecords.push({
                billingMonth: mStr,
                year: y,
                month: m,
                billId: null,
                billNumber: null,
                rentAmount: monthlyRent,
                gstAmount: virtGst,
                totalAmountDue: virtTotal,
                amountPaid: 0,
                balanceDue: virtTotal,
                dueDate: dueDt.toISOString(),
                status: derivedStatus,
                receipt: null,
              });
            }
          }
        }

        const accountableRecords = monthlyRecords.filter(
          (r) =>
            r.status === 'PAID' ||
            r.status === 'OVERDUE' ||
            r.status === 'UNPAID' ||
            r.status === 'PARTIALLY_PAID'
        );

        const totalRent = accountableRecords.reduce((sum, r) => sum + r.totalAmountDue, 0);
        const totalPaidFromPayments = userPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const totalPaidFromBills = accountableRecords.reduce((sum, r) => sum + r.amountPaid, 0);
        const totalPaid = totalPaidFromPayments > 0 ? totalPaidFromPayments : totalPaidFromBills;
        const outstandingAmount = accountableRecords.reduce((sum, r) => sum + r.balanceDue, 0);
        const overdueList = accountableRecords
          .filter((r) => r.status === 'OVERDUE')
          .map((r) => r.billingMonth);
        const unpaidCount = accountableRecords.filter((r) => r.balanceDue > 0).length;

        let paymentStatus: 'PAID' | 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID' = 'PAID';
        if (overdueList.length > 0) {
          paymentStatus = 'OVERDUE';
        } else if (outstandingAmount > 0) {
          const hasPartial = accountableRecords.some((r) => r.status === 'PARTIALLY_PAID');
          paymentStatus = hasPartial ? 'PARTIALLY_PAID' : 'UNPAID';
        }

        const paymentHistory = userPayments.map((p) => {
          const r = receiptByPaymentId.get(p.id);
          const bill = p.bill_id ? billById.get(p.bill_id) : undefined;
          const period = r?.billing_period || bill?.billing_month || '';
          const paidMonths = period
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          const actorId = actorByPaymentId.get(p.id);
          const paidNum = Number(p.amount);
          const matchedRecs = monthlyRecords.filter((mRec) => paidMonths.includes(mRec.billingMonth));
          const matchedGstSum = matchedRecs.reduce((s, mRec) => s + mRec.gstAmount, 0);
          const matchedRentSum = matchedRecs.reduce((s, mRec) => s + mRec.rentAmount, 0);
          const hasGstBreakdown =
            matchedGstSum > 0 && Math.abs(matchedRentSum + matchedGstSum - paidNum) <= 0.5;

          return {
            paymentId: p.id,
            paymentReference: p.payment_reference,
            receiptId: r?.id || p.id,
            receiptNumber: r?.receipt_number || `REC-${p.id.slice(0, 8)}`,
            amountPaid: paidNum,
            ...(hasGstBreakdown ? { baseRentAmount: matchedRentSum, gstAmount: matchedGstSum } : {}),
            paymentMethod: p.payment_method,
            referenceNumber: p.gateway_payment_id || p.payment_reference,
            billingPeriod: period,
            paidMonths,
            billNumber: bill?.bill_number || `BL-${prop?.property_number || 'SHOP'}`,
            paidAt: (r?.issued_at || p.created_at).toISOString(),
            collectorName: actorId ? adminMap.get(actorId) : undefined,
          };
        });

        return {
          tenantId: u.id,
          tenantCode: u.user_id,
          fullName: u.full_name,
          mobile: u.mobile,
          email: u.email,
          profilePhotoUrl: u.profile_photo_url,
          shop: prop
            ? {
                propertyId: prop.id,
                propertyCode: prop.property_id,
                shopName: prop.property_name,
                shopCode: prop.property_number,
                address: prop.address || prop.location,
                location: prop.location,
                allotmentDate: new Date(allotmentDate).toISOString(),
                leaseEndDate: activeAssign?.lease_end_date
                  ? new Date(activeAssign.lease_end_date).toISOString()
                  : null,
                monthlyRent,
              }
            : null,
          summary: {
            totalRent,
            totalPaid,
            outstandingAmount,
            overdueMonthsCount: overdueList.length,
            overdueMonths: overdueList,
            unpaidMonthsCount: unpaidCount,
            paymentStatus,
          },
          availableYears,
          monthlyRecords,
          paymentHistory,
        };
      });

      if (billsToSyncGst.length > 0) {
        await Promise.all(
          billsToSyncGst.map((b) =>
            rentalPrisma.rentalBill.update({
              where: { id: b.id },
              data: {
                gst_rate: RENTAL_GST_RATE,
                gst_amount: b.gstAmount,
                adjustment_amount: 0.0,
                total_amount_due: b.totalAmountDue,
                balance_due: b.balanceDue,
              },
            })
          )
        ).catch(() => {
          // Non-fatal background sync
        });
      }

      return {
        currentMonth: curMonthStr,
        currentYear: curYear,
        tenants: tenantCards,
      };
    })
    );

    let filteredTenants = baseData.tenants;
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filteredTenants = filteredTenants.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.mobile.toLowerCase().includes(q) ||
          t.tenantCode.toLowerCase().includes(q) ||
          (t.shop?.shopCode || '').toLowerCase().includes(q) ||
          (t.shop?.shopName || '').toLowerCase().includes(q) ||
          (t.shop?.address || '').toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'ALL') {
      filteredTenants = filteredTenants.filter((t) => {
        if (params.status === 'UNPAID') {
          return ['UNPAID', 'OVERDUE', 'PARTIALLY_PAID'].includes(t.summary.paymentStatus);
        }
        return t.summary.paymentStatus === params.status;
      });
    }

    const globalSummary = {
      totalTenants: filteredTenants.length,
      totalRent: filteredTenants.reduce((s, t) => s + t.summary.totalRent, 0),
      totalPaid: filteredTenants.reduce((s, t) => s + t.summary.totalPaid, 0),
      totalOutstanding: filteredTenants.reduce((s, t) => s + t.summary.outstandingAmount, 0),
      overdueTenantsCount: filteredTenants.filter((t) => t.summary.overdueMonthsCount > 0).length,
    };

    return {
      currentMonth: baseData.currentMonth,
      currentYear: baseData.currentYear,
      summary: globalSummary,
      tenants: filteredTenants,
    };
  }

  /**
   * List bills with multi-dimensional filtering, search, and pagination
   */
  async listBills(params: {
    search?: string;
    status?: string;
    billingMonth?: string;
    propertyId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    return withRentalDbRetry(async () => {
      // Ensure all active assignments have at least their initial PENDING bill
      const unbilledAssignments = await rentalPrisma.propertyAssignment.findMany({
        where: {
          is_active: true,
          ...(params.userId ? { user_id: params.userId } : {}),
          bills: { none: {} },
        },
        include: { property: true },
      });

      if (unbilledAssignments.length > 0) {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonthNum = now.getMonth() + 1;
        const curMonthStr = `${curYear}-${String(curMonthNum).padStart(2, '0')}`;
        const curDueDate = new Date(curYear, curMonthNum - 1, 20, 23, 59, 59);

        for (const assign of unbilledAssignments) {
          const rentAmt = Number(assign.monthly_rent || assign.property.base_monthly_rent || 0);
          const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(rentAmt);
          const autoBillNo = `BL-${assign.property.property_number}-${curMonthStr}`;
          try {
            const bill = await rentalPrisma.rentalBill.create({
              data: {
                bill_number: autoBillNo,
                user_id: assign.user_id,
                property_id: assign.property_id,
                assignment_id: assign.id,
                billing_month: curMonthStr,
                billing_year: curYear,
                rent_amount: rentAmt,
                gst_rate: gstRate,
                gst_amount: gstAmount,
                adjustment_amount: 0.0,
                total_amount_due: totalWithGst,
                amount_paid: 0.0,
                balance_due: totalWithGst,
                due_date: curDueDate,
                status: 'PENDING',
              },
            });
            await rentalPrisma.rentalLedgerEntry.create({
              data: {
                user_id: assign.user_id,
                property_id: assign.property_id,
                bill_id: bill.id,
                entry_type: 'RENT_CHARGE',
                debit: totalWithGst,
                credit: 0.0,
                running_balance: totalWithGst,
                description: `Initial Monthly Commercial Rent + 18% GST Demand for ${curMonthStr} (${assign.property.property_number})`,
                transaction_reference: autoBillNo,
              },
            });
          } catch {
            // Ignore duplicate collision
          }
        }
      }

      const page = Math.max(1, params.page || 1);
      const limit = Math.min(100, Math.max(1, params.limit || 20));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (params.status && params.status !== 'ALL') {
        where.status = params.status;
      }
      if (params.billingMonth) {
        where.billing_month = params.billingMonth;
      }
      if (params.propertyId) {
        where.property_id = params.propertyId;
      }
      if (params.userId) {
        where.user_id = params.userId;
      }

      if (params.search && params.search.trim()) {
        const s = params.search.trim();
        where.OR = [
          { bill_number: { contains: s, mode: 'insensitive' } },
          { user: { full_name: { contains: s, mode: 'insensitive' } } },
          { user: { mobile: { contains: s, mode: 'insensitive' } } },
          { user: { user_id: { contains: s, mode: 'insensitive' } } },
          { property: { property_number: { contains: s, mode: 'insensitive' } } },
          { property: { property_name: { contains: s, mode: 'insensitive' } } },
          { property: { location: { contains: s, mode: 'insensitive' } } },
        ];
      }

      const [total, bills] = await Promise.all([
        rentalPrisma.rentalBill.count({ where }),
        rentalPrisma.rentalBill.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                user_id: true,
                full_name: true,
                mobile: true,
                profile_photo_url: true,
              },
            },
            property: {
              select: {
                id: true,
                property_id: true,
                property_number: true,
                property_name: true,
                location: true,
              },
            },
            receipts: {
              select: {
                id: true,
                receipt_number: true,
                amount_paid: true,
                issued_at: true,
              },
            },
          },
          orderBy: [{ billing_month: 'desc' }, { created_at: 'desc' }],
          skip,
          take: limit,
        }),
      ]);

      const formatted = bills.map((b) => {
        const resolved = resolveBillAmounts(b);
        return {
          id: b.id,
          billNumber: b.bill_number,
          billingMonth: b.billing_month,
          billingYear: b.billing_year,
          rentAmount: resolved.rentAmount,
          gstAmount: resolved.gstAmount,
          arrearsAmount: Number(b.adjustment_amount),
          totalAmountDue: resolved.totalAmountDue,
          amountPaid: resolved.amountPaid,
          balanceDue: resolved.balanceDue,
          dueDate: b.due_date,
          status: b.status,
          createdAt: b.created_at,
          tenant: {
            id: b.user.id,
            userCode: b.user.user_id,
            fullName: b.user.full_name,
            mobile: b.user.mobile,
            profilePhotoUrl: b.user.profile_photo_url,
          },
          property: {
            id: b.property.id,
            propertyCode: b.property.property_id,
            propertyNumber: b.property.property_number,
            propertyName: b.property.property_name,
            location: b.property.location,
          },
          receipts: b.receipts.map((r) => ({
            id: r.id,
            receiptNumber: r.receipt_number,
            amountPaid: Number(r.amount_paid),
            issuedAt: r.issued_at,
          })),
        };
      });

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: formatted,
      };
    });
  }

  /**
   * Get Single Bill Details with Anti-IDOR Check
   */
  async getBillDetails(billId: string, tenantUserId?: string) {
    return withRentalDbRetry(async () => {
      const bill = await rentalPrisma.rentalBill.findFirst({
        where: {
          OR: [
            { id: billId },
            { bill_number: billId },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              user_id: true,
              full_name: true,
              mobile: true,
              email: true,
              permanent_address: true,
              profile_photo_url: true,
            },
          },
          property: true,
          payments: {
            orderBy: { created_at: 'desc' },
          },
          receipts: {
            orderBy: { issued_at: 'desc' },
          },
        },
      });

      if (!bill) {
        throw new Error('Rental bill not found.');
      }

      // Enforce anti-IDOR if requested by a tenant
      if (tenantUserId && bill.user_id !== tenantUserId) {
        throw new Error('Access denied: You are not authorized to view this bill.');
      }

      const resolved = resolveBillAmounts(bill);
      if (resolved.needsGstSync) {
        await rentalPrisma.rentalBill
          .update({
            where: { id: bill.id },
            data: {
              gst_rate: RENTAL_GST_RATE,
              gst_amount: resolved.gstAmount,
              adjustment_amount: 0.0,
              total_amount_due: resolved.totalAmountDue,
              balance_due: resolved.balanceDue,
            },
          })
          .catch(() => {});
      }

      return {
        id: bill.id,
        billNumber: bill.bill_number,
        billingMonth: bill.billing_month,
        billingYear: bill.billing_year,
        rentAmount: resolved.rentAmount,
        gstAmount: resolved.gstAmount,
        arrearsAmount: Number(bill.adjustment_amount),
        totalAmountDue: resolved.totalAmountDue,
        amountPaid: resolved.amountPaid,
        balanceDue: resolved.balanceDue,
        dueDate: bill.due_date,
        status: bill.status,
        createdAt: bill.created_at,
        tenant: bill.user,
        property: bill.property,
        payments: bill.payments.map((p) => ({
          id: p.id,
          paymentReference: p.payment_reference,
          amount: Number(p.amount),
          paymentMethod: p.payment_method,
          status: p.status,
          createdAt: p.created_at,
          verifiedAt: p.verified_at,
        })),
        receipts: bill.receipts.map((r) => ({
          id: r.id,
          receiptNumber: r.receipt_number,
          amountPaid: Number(r.amount_paid),
          issuedAt: r.issued_at,
          receiptPdfUrl: r.receipt_pdf_url,
        })),
      };
    });
  }

  /**
   * Public Dues Search for Citizens & Quick Pay Portal
   * Searches by Shop Number, Tenant Code, or Mobile Number
   */
  async searchDues(query: string) {
    return withRentalDbRetry(async () => {
      const clean = query.trim();
      if (!clean) {
        return { totalOutstanding: 0, pendingBills: [] };
      }

      // Find tenant or property
      const [tenants, properties] = await Promise.all([
        rentalPrisma.rentalUser.findMany({
          where: {
            OR: [
              { user_id: { equals: clean, mode: 'insensitive' } },
              { mobile: { equals: clean } },
            ],
          },
          include: {
            assignments: {
              where: { is_active: true },
              include: { property: true },
            },
          },
        }),
        rentalPrisma.rentalProperty.findMany({
          where: {
            OR: [
              { property_number: { equals: clean, mode: 'insensitive' } },
              { property_id: { equals: clean, mode: 'insensitive' } },
            ],
          },
          include: {
            assignments: {
              where: { is_active: true },
              include: { user: true },
            },
          },
        }),
      ]);

      const userIds = [
        ...tenants.map((t) => t.id),
        ...properties.flatMap((p) => p.assignments.map((a) => a.user_id)),
      ];
      const propertyIds = [
        ...properties.map((p) => p.id),
        ...tenants.flatMap((t) => t.assignments.map((a) => a.property_id)),
      ];

      // Extract resolved tenant and shop details
      const primaryTenant = tenants[0] || properties[0]?.assignments[0]?.user;
      const primaryProperty = properties[0] || tenants[0]?.assignments[0]?.property;

      if (userIds.length === 0 && propertyIds.length === 0) {
        return {
          totalOutstanding: 0,
          billCount: 0,
          pendingBills: [],
          allBills: [],
          tenant: null,
          isThisMonthComplete: true,
          message: 'No active commercial records found matching the search criteria.',
        };
      }

      // Fetch all bills (both pending and paid) for complete ledger & status
      let allBills = await rentalPrisma.rentalBill.findMany({
        where: {
          OR: [
            { user_id: { in: userIds } },
            { property_id: { in: propertyIds } },
          ],
        },
        include: {
          user: {
            select: { id: true, user_id: true, full_name: true, mobile: true },
          },
          property: {
            select: { id: true, property_id: true, property_number: true, location: true },
          },
          receipts: {
            select: { id: true, receipt_number: true, amount_paid: true, issued_at: true, receipt_pdf_url: true },
            orderBy: { issued_at: 'desc' },
          },
        },
        orderBy: { billing_month: 'desc' },
      });

      // Current month determination (e.g. "2026-11")
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // If newly registered tenant has an active assignment but 0 bills yet, auto-create current month PENDING bill
      const activeAssignment = tenants[0]?.assignments?.[0] || properties[0]?.assignments?.[0];
      if (allBills.length === 0 && primaryTenant && primaryProperty && activeAssignment) {
        const rentAmt = Number(activeAssignment.monthly_rent || primaryProperty.base_monthly_rent || 0);
        const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(rentAmt);
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 20, 23, 59, 59);
        const autoBillNo = `BL-${primaryProperty.property_number}-${currentMonthStr}`;
        try {
          await rentalPrisma.rentalBill.create({
            data: {
              bill_number: autoBillNo,
              user_id: primaryTenant.id,
              property_id: primaryProperty.id,
              assignment_id: activeAssignment.id,
              billing_month: currentMonthStr,
              billing_year: now.getFullYear(),
              rent_amount: rentAmt,
              gst_rate: gstRate,
              gst_amount: gstAmount,
              adjustment_amount: 0.0,
              total_amount_due: totalWithGst,
              amount_paid: 0.0,
              balance_due: totalWithGst,
              due_date: dueDate,
              status: 'PENDING',
            },
          });
          allBills = await rentalPrisma.rentalBill.findMany({
            where: { user_id: primaryTenant.id },
            include: {
              user: { select: { id: true, user_id: true, full_name: true, mobile: true } },
              property: { select: { id: true, property_id: true, property_number: true, location: true } },
              receipts: {
                select: { id: true, receipt_number: true, amount_paid: true, issued_at: true, receipt_pdf_url: true },
                orderBy: { issued_at: 'desc' },
              },
            },
            orderBy: { billing_month: 'desc' },
          });
        } catch {
          // Ignore if already exists
        }
      }

      const resolvedAllBills = allBills.map((b) => ({
        raw: b,
        resolved: resolveBillAmounts(b),
      }));

      const unpaidSyncBills = resolvedAllBills.filter((item) => item.resolved.needsGstSync);
      if (unpaidSyncBills.length > 0) {
        await Promise.all(
          unpaidSyncBills.map((item) =>
            rentalPrisma.rentalBill.update({
              where: { id: item.raw.id },
              data: {
                gst_rate: RENTAL_GST_RATE,
                gst_amount: item.resolved.gstAmount,
                adjustment_amount: 0.0,
                total_amount_due: item.resolved.totalAmountDue,
                balance_due: item.resolved.balanceDue,
              },
            })
          )
        ).catch(() => {});
      }

      const pendingBills = resolvedAllBills.filter((item) =>
        ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(item.raw.status)
      );
      const totalOutstanding = pendingBills.reduce((acc, item) => acc + item.resolved.balanceDue, 0);

      const currentMonthItem =
        pendingBills[0] ||
        resolvedAllBills.find((item) => item.raw.billing_month === currentMonthStr) ||
        resolvedAllBills[0];
      // Status is ONLY complete (PAID) when ALL bills up to the current month are paid (0 pending bills)
      const isThisMonthComplete = Boolean(
        resolvedAllBills.length > 0 &&
        pendingBills.length === 0 &&
        totalOutstanding <= 0
      );

      // Extract all receipts for download
      const allReceipts = resolvedAllBills.flatMap(({ raw: b, resolved }) =>
        b.receipts.map((r) => ({
          receiptNumber: r.receipt_number,
          amountPaid: Number(r.amount_paid),
          ...(resolved.gstAmount > 0 ? { baseRentAmount: resolved.rentAmount, gstAmount: resolved.gstAmount } : {}),
          issuedAt: r.issued_at,
          billingMonth: b.billing_month,
          propertyNumber: b.property.property_number,
          tenantName: b.user.full_name,
        }))
      );

      return {
        totalOutstanding,
        billCount: pendingBills.length,
        isThisMonthComplete,
        currentMonth: currentMonthStr,
        tenant: {
          name: primaryTenant?.full_name || allBills[0]?.user?.full_name || 'Almora Commercial Tenant',
          code: primaryTenant?.user_id || allBills[0]?.user?.user_id || 'ALM-TENANT',
          mobile: primaryTenant?.mobile || allBills[0]?.user?.mobile || clean,
          shopNo: primaryProperty?.property_number || allBills[0]?.property?.property_number || '—',
          location: primaryProperty?.location || allBills[0]?.property?.location || 'अल्मोड़ा',
        },
        currentMonthBill: currentMonthItem
          ? {
              billNumber: currentMonthItem.raw.bill_number,
              billingMonth: currentMonthItem.raw.billing_month,
              rentAmount: currentMonthItem.resolved.rentAmount,
              gstAmount: currentMonthItem.resolved.gstAmount,
              totalAmountDue: currentMonthItem.resolved.totalAmountDue,
              amountPaid: currentMonthItem.resolved.amountPaid,
              balanceDue: currentMonthItem.resolved.balanceDue,
              status: currentMonthItem.raw.status,
              dueDate: currentMonthItem.raw.due_date,
              receipt: currentMonthItem.raw.receipts[0] || null,
            }
          : null,
        pendingBills: pendingBills.map(({ raw: b, resolved }) => ({
          id: b.id,
          billNumber: b.bill_number,
          billingMonth: b.billing_month,
          rentAmount: resolved.rentAmount,
          gstAmount: resolved.gstAmount,
          totalAmountDue: resolved.totalAmountDue,
          amountPaid: resolved.amountPaid,
          balanceDue: resolved.balanceDue,
          dueDate: b.due_date,
          status: b.status,
          tenantName: b.user.full_name,
          tenantCode: b.user.user_id,
          propertyNumber: b.property.property_number,
          location: b.property.location,
        })),
        allBills: resolvedAllBills.map(({ raw: b, resolved }) => ({
          id: b.id,
          billNumber: b.bill_number,
          billingMonth: b.billing_month,
          rentAmount: resolved.rentAmount,
          gstAmount: resolved.gstAmount,
          totalAmountDue: resolved.totalAmountDue,
          amountPaid: resolved.amountPaid,
          balanceDue: resolved.balanceDue,
          dueDate: b.due_date,
          status: b.status,
          receiptNumber: b.receipts[0]?.receipt_number || null,
        })),
        receipts: allReceipts,
      };
    });
  }

  /**
   * Executive Dashboard Analytics
   * Computes 100% live database metrics (zero dummy fallbacks) for Super Admin and Sub Admins:
   * Users, shops & occupancy, base rent + GST demand, monthly/FY/today collections,
   * top defaulters, lease expiry alerts, market-wise summary, payment mode split, and 12-month trends.
   */
  async getDashboardAnalytics() {
    return rentalCache.getOrSet('analytics:dashboard', 15_000, () =>
      withRentalDbRetry(async () => {
        // Ensure monthly bills are accrued before computing dashboard figures
        await this.ensureAccruedMonthlyBills().catch(() => {});

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthNum = now.getMonth() + 1;
        const currentMonthStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}`;

        // Indian Financial Year (1 April – 31 March)
        const fyStartYear = currentMonthNum >= 4 ? currentYear : currentYear - 1;
        const fyEndYearShort = String((fyStartYear + 1) % 100).padStart(2, '0');
        const fiscalYearLabel = `${fyStartYear}-${fyEndYearShort}`;
        const startOfFiscalYear = new Date(fyStartYear, 3, 1, 0, 0, 0);

        const startOfToday = new Date(currentYear, currentMonthNum - 1, now.getDate(), 0, 0, 0);
        const endOfToday = new Date(currentYear, currentMonthNum - 1, now.getDate(), 23, 59, 59);
        const startOfMonth = new Date(currentYear, currentMonthNum - 1, 1, 0, 0, 0);

        const [
          users,
          properties,
          activeAssignments,
          allBills,
          allSuccessPayments,
          recentRawPayments,
          pendingDocsCount,
        ] = await Promise.all([
          rentalPrisma.rentalUser.findMany({
            select: { id: true, user_id: true, full_name: true, mobile: true, status: true },
          }),
          rentalPrisma.rentalProperty.findMany({
            select: {
              id: true,
              property_number: true,
              property_name: true,
              property_type: true,
              location: true,
              status: true,
              base_monthly_rent: true,
            },
          }),
          rentalPrisma.propertyAssignment.findMany({
            where: { is_active: true },
            select: {
              id: true,
              user_id: true,
              property_id: true,
              monthly_rent: true,
              lease_start_date: true,
              lease_end_date: true,
              user: { select: { id: true, user_id: true, full_name: true, mobile: true } },
              property: { select: { id: true, property_number: true, location: true, base_monthly_rent: true } },
            },
          }),
          rentalPrisma.rentalBill.findMany({
            where: { status: { not: 'CANCELLED' } },
            select: {
              id: true,
              bill_number: true,
              user_id: true,
              property_id: true,
              billing_month: true,
              rent_amount: true,
              gst_amount: true,
              adjustment_amount: true,
              total_amount_due: true,
              amount_paid: true,
              balance_due: true,
              due_date: true,
              status: true,
            },
          }),
          rentalPrisma.rentalPayment.findMany({
            where: { status: 'SUCCESS' },
            select: {
              id: true,
              amount: true,
              payment_method: true,
              property_id: true,
              created_at: true,
            },
            orderBy: { created_at: 'desc' },
          }),
          rentalPrisma.rentalPayment.findMany({
            where: { status: 'SUCCESS' },
            select: {
              id: true,
              amount: true,
              payment_method: true,
              payment_reference: true,
              created_at: true,
              user: { select: { id: true, full_name: true, mobile: true, user_id: true } },
              property: { select: { property_number: true, location: true } },
              receipt: { select: { receipt_number: true, billing_period: true } },
              bill: {
                select: {
                  id: true,
                  bill_number: true,
                  billing_month: true,
                  rent_amount: true,
                  gst_amount: true,
                  balance_due: true,
                  status: true,
                },
              },
            },
            orderBy: { created_at: 'desc' },
            take: 25,
          }),
          rentalPrisma.rentalUserDocument.count({
            where: { verification_status: 'PENDING' },
          }),
        ]);

        // 1. User & Property Counts
        const totalUsers = users.length;
        const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
        const inactiveUsers = totalUsers - activeUsers;

        const totalProperties = properties.length;
        const allottedProperties = properties.filter((p) => p.status === 'ALLOTTED').length;
        const vacantProperties = properties.filter((p) => p.status === 'VACANT').length;
        const maintenanceProperties = properties.filter(
          (p) => p.status === 'MAINTENANCE' || p.status === 'INACTIVE'
        ).length;
        const occupancyRate =
          totalProperties > 0 ? Math.round((allottedProperties / totalProperties) * 100) : 0;

        // Real Property Category Counts
        const typeCountsMap: Record<string, number> = {
          COMMERCIAL_SHOP: 0,
          ROADSIDE_STALL: 0,
          WAREHOUSE_GODOWN: 0,
          OFFICE_SPACE: 0,
          LAND_PARCEL: 0,
          OTHER: 0,
        };
        for (const p of properties) {
          const t = p.property_type || 'OTHER';
          typeCountsMap[t] = (typeCountsMap[t] || 0) + 1;
        }
        const propertyByType = Object.entries(typeCountsMap).map(([type, count]) => ({
          type,
          count,
        }));

        // 2. Expected Monthly Rent (Base + 18% GST) — 100% Real
        let expectedMonthlyBaseRent = 0;
        let expectedMonthlyGst = 0;
        let expectedMonthlyRent = 0;

        for (const a of activeAssignments) {
          const base = Number(a.monthly_rent || a.property.base_monthly_rent || 0);
          const calc = calculateRentWithGst(base);
          expectedMonthlyBaseRent += calc.rentAmount;
          expectedMonthlyGst += calc.gstAmount;
          expectedMonthlyRent += calc.totalWithGst;
        }

        const currentMonthBills = allBills.filter((b) => b.billing_month === currentMonthStr);
        if (currentMonthBills.length > 0) {
          let billBaseSum = 0;
          let billGstSum = 0;
          let billTotalSum = 0;
          for (const b of currentMonthBills) {
            const res = resolveBillAmounts(b);
            billBaseSum += res.rentAmount;
            billGstSum += res.gstAmount;
            billTotalSum += res.totalAmountDue;
          }
          if (billTotalSum > expectedMonthlyRent) {
            expectedMonthlyBaseRent = Math.round(billBaseSum * 100) / 100;
            expectedMonthlyGst = Math.round(billGstSum * 100) / 100;
            expectedMonthlyRent = Math.round(billTotalSum * 100) / 100;
          }
        }

        // 3. Collections (Today, Current Month, Fiscal Year, All-Time) & Payment Mode Split
        let todayCollected = 0;
        let todayTransactionsCount = 0;
        let collectedThisMonth = 0;
        let monthTransactionsCount = 0;
        let fiscalYearCollected = 0;
        let totalAllTimeCollected = 0;

        const modeAccumulator: Record<string, { amount: number; count: number }> = {};

        for (const p of allSuccessPayments) {
          const amt = Number(p.amount || 0);
          totalAllTimeCollected += amt;

          if (p.created_at >= startOfFiscalYear) {
            fiscalYearCollected += amt;
          }
          if (p.created_at >= startOfMonth) {
            collectedThisMonth += amt;
            monthTransactionsCount++;
          }
          if (p.created_at >= startOfToday && p.created_at <= endOfToday) {
            todayCollected += amt;
            todayTransactionsCount++;
          }

          const rawMode = (p.payment_method || 'CASH').toUpperCase();
          const normMode =
            rawMode === 'CASH'
              ? 'CASH'
              : rawMode.includes('CHEQUE') || rawMode.includes('DD')
                ? 'CHEQUE_DD'
                : rawMode.includes('UPI') || rawMode === 'ONLINE'
                  ? 'UPI_ONLINE'
                  : rawMode.includes('NEFT') || rawMode.includes('RTGS') || rawMode.includes('BANK')
                    ? 'BANK_TRANSFER'
                    : 'POS_CARD';

          if (!modeAccumulator[normMode]) {
            modeAccumulator[normMode] = { amount: 0, count: 0 };
          }
          modeAccumulator[normMode].amount += amt;
          modeAccumulator[normMode].count += 1;
        }

        const paymentModeBreakdown = Object.entries(modeAccumulator)
          .map(([mode, stats]) => ({
            mode,
            amount: Math.round(stats.amount * 100) / 100,
            count: stats.count,
          }))
          .sort((a, b) => b.amount - a.amount);

        // 4. Overdue / Pending Totals & Top Defaulters Watchlist
        const userMap = new Map(users.map((u) => [u.id, u]));
        const propMap = new Map(properties.map((p) => [p.id, p]));

        let totalOverdue = 0;
        let overdueBillsCount = 0;
        let paidBillsCount = 0;

        const defaulterMap = new Map<
          string,
          {
            tenantId: string;
            tenantCode: string;
            tenantName: string;
            mobile: string;
            shopNumber: string;
            location: string;
            unpaidMonthsCount: number;
            outstandingAmount: number;
            oldestPendingBillId: string;
            oldestBillingMonth: string;
          }
        >();

        const pendingByProp = new Map<string, number>();

        for (const b of allBills) {
          const resolved = resolveBillAmounts(b);
          if (b.status === 'PAID' || resolved.balanceDue <= 0) {
            paidBillsCount++;
            continue;
          }
          if (['OVERDUE', 'PENDING', 'PARTIALLY_PAID'].includes(b.status) && resolved.balanceDue > 0) {
            totalOverdue += resolved.balanceDue;
            overdueBillsCount++;
            pendingByProp.set(b.property_id, (pendingByProp.get(b.property_id) || 0) + resolved.balanceDue);

            const u = userMap.get(b.user_id);
            const prop = propMap.get(b.property_id);
            const existing = defaulterMap.get(b.user_id);
            if (!existing) {
              defaulterMap.set(b.user_id, {
                tenantId: b.user_id,
                tenantCode: u?.user_id || '—',
                tenantName: u?.full_name || '—',
                mobile: u?.mobile || '—',
                shopNumber: prop?.property_number || '—',
                location: prop?.location || '—',
                unpaidMonthsCount: 1,
                outstandingAmount: resolved.balanceDue,
                oldestPendingBillId: b.id,
                oldestBillingMonth: b.billing_month,
              });
            } else {
              existing.unpaidMonthsCount += 1;
              existing.outstandingAmount = Math.round((existing.outstandingAmount + resolved.balanceDue) * 100) / 100;
              if (b.billing_month < existing.oldestBillingMonth) {
                existing.oldestBillingMonth = b.billing_month;
                existing.oldestPendingBillId = b.id;
              }
            }
          }
        }

        const overdueTenantsCount = defaulterMap.size;
        const topDefaulters = Array.from(defaulterMap.values())
          .sort((a, b) => b.outstandingAmount - a.outstandingAmount)
          .slice(0, 8);

        const complianceRate =
          allBills.length > 0 ? Math.round((paidBillsCount / allBills.length) * 100) : 0;

        // 5. Lease Expiry Alerts (Expired or Expiring within 60 days)
        const msPerDay = 24 * 60 * 60 * 1000;
        const leaseAlerts: Array<{
          tenantId: string;
          tenantName: string;
          mobile: string;
          shopNumber: string;
          location: string;
          leaseEndDate: string;
          daysRemaining: number;
        }> = [];

        for (const a of activeAssignments) {
          if (!a.lease_end_date) continue;
          const endDt = new Date(a.lease_end_date);
          if (isNaN(endDt.getTime())) continue;
          const daysRemaining = Math.ceil((endDt.getTime() - startOfToday.getTime()) / msPerDay);
          if (daysRemaining <= 60) {
            leaseAlerts.push({
              tenantId: a.user_id,
              tenantName: a.user.full_name,
              mobile: a.user.mobile,
              shopNumber: a.property.property_number,
              location: a.property.location,
              leaseEndDate: endDt.toISOString(),
              daysRemaining,
            });
          }
        }
        leaseAlerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

        // 6. Market / Location-wise Summary
        const collectedByProp = new Map<string, number>();
        for (const p of allSuccessPayments) {
          collectedByProp.set(p.property_id, (collectedByProp.get(p.property_id) || 0) + Number(p.amount || 0));
        }

        const marketMap = new Map<
          string,
          {
            location: string;
            totalShops: number;
            allottedShops: number;
            vacantShops: number;
            collectedAmount: number;
            pendingAmount: number;
          }
        >();

        for (const prop of properties) {
          const loc = (prop.location || 'अन्य क्षेत्र').trim();
          const entry = marketMap.get(loc) || {
            location: loc,
            totalShops: 0,
            allottedShops: 0,
            vacantShops: 0,
            collectedAmount: 0,
            pendingAmount: 0,
          };
          entry.totalShops += 1;
          if (prop.status === 'ALLOTTED') entry.allottedShops += 1;
          if (prop.status === 'VACANT') entry.vacantShops += 1;
          entry.collectedAmount += collectedByProp.get(prop.id) || 0;
          entry.pendingAmount += pendingByProp.get(prop.id) || 0;
          marketMap.set(loc, entry);
        }

        const marketBreakdown = Array.from(marketMap.values())
          .map((m) => ({
            ...m,
            collectedAmount: Math.round(m.collectedAmount * 100) / 100,
            pendingAmount: Math.round(m.pendingAmount * 100) / 100,
          }))
          .sort((a, b) => b.totalShops - a.totalShops || b.pendingAmount - a.pendingAmount);

        // 7. Past 12 Months Real Trend + Year-wise (Jan–Dec) Target vs Achieved Breakdown
        const monthsBack = 12;
        const monthlyTrends = [];
        const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const hiMonths = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];
        const enFullMonths = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const hiFullMonths = [
          'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
          'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
        ];

        // Group bills by YYYY-MM once for fast lookup
        const monthAggMap = new Map<
          string,
          {
            baseBilled: number;
            gstBilled: number;
            totalBilled: number;
            paid: number;
            pending: number;
            pendingCurrent: number;
            overdueAmount: number;
          }
        >();

        const yearSet = new Set<number>([currentYear, currentYear - 1, currentYear - 2]);

        for (const b of allBills) {
          const mKey = b.billing_month;
          if (!mKey) continue;
          const yrNum = parseInt(mKey.slice(0, 4), 10);
          if (!isNaN(yrNum) && yrNum >= 2000 && yrNum <= 2100) {
            yearSet.add(yrNum);
          }
          const res = resolveBillAmounts(b);
          const cur = monthAggMap.get(mKey) || {
            baseBilled: 0,
            gstBilled: 0,
            totalBilled: 0,
            paid: 0,
            pending: 0,
            pendingCurrent: 0,
            overdueAmount: 0,
          };
          cur.baseBilled += res.rentAmount;
          cur.gstBilled += res.gstAmount;
          cur.totalBilled += res.totalAmountDue;
          cur.paid += res.amountPaid;
          cur.pending += res.balanceDue;

          if (res.balanceDue > 0) {
            const isPastMonthOverdue = mKey < currentMonthStr;
            if (isPastMonthOverdue) {
              cur.overdueAmount += res.balanceDue;
            } else {
              cur.pendingCurrent += res.balanceDue;
            }
          }

          monthAggMap.set(mKey, cur);
        }

        for (let i = monthsBack - 1; i >= 0; i--) {
          const d = new Date(currentYear, currentMonthNum - 1 - i, 1);
          const y = d.getFullYear();
          const mIdx = d.getMonth();
          const mStr = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
          const shortYr = String(y).slice(2);
          const agg = monthAggMap.get(mStr);

          monthlyTrends.push({
            month: mStr,
            year: y,
            monthNum: mIdx + 1,
            label: `${enMonths[mIdx]} '${shortYr}`,
            labelHi: `${hiMonths[mIdx]} '${shortYr}`,
            baseBilled: Math.round((agg?.baseBilled || 0) * 100) / 100,
            gstBilled: Math.round((agg?.gstBilled || 0) * 100) / 100,
            billed: Math.round((agg?.totalBilled || 0) * 100) / 100,
            collected: Math.round((agg?.paid || 0) * 100) / 100,
            overdue: Math.round((agg?.pending || 0) * 100) / 100,
          });
        }

        const availableYears = Array.from(yearSet).sort((a, b) => b - a);
        const yearlyTrends: Record<
          string,
          Array<{
            month: string;
            monthNum: number;
            label: string;
            labelHi: string;
            fullLabel: string;
            fullLabelHi: string;
            target: number;
            achieved: number;
            remaining: number;
            overdue: number;
            achievedPct: number;
          }>
        > = {};

        for (const yr of availableYears) {
          const points = [];
          for (let mIdx = 0; mIdx < 12; mIdx++) {
            const mStr = `${yr}-${String(mIdx + 1).padStart(2, '0')}`;
            const agg = monthAggMap.get(mStr);
            const target = Math.round((agg?.totalBilled || 0) * 100) / 100;
            const achieved = Math.round((agg?.paid || 0) * 100) / 100;
            const remaining = Math.round((agg?.pendingCurrent || 0) * 100) / 100;
            const overdue = Math.round((agg?.overdueAmount || 0) * 100) / 100;
            const achievedPct = target > 0 ? Math.min(100, Math.round((achieved / target) * 100)) : 0;

            points.push({
              month: mStr,
              monthNum: mIdx + 1,
              label: enMonths[mIdx],
              labelHi: hiMonths[mIdx],
              fullLabel: `${enFullMonths[mIdx]} ${yr}`,
              fullLabelHi: `${hiFullMonths[mIdx]} ${yr}`,
              target,
              achieved,
              remaining,
              overdue,
              achievedPct,
            });
          }
          yearlyTrends[String(yr)] = points;
        }

        // 8. Format Audit Payment Items (for Today & Recent tabs + Official Form 5 Receipt)
        const mapPaymentRecord = (p: (typeof recentRawPayments)[number]) => {
          const paidAmt = Number(p.amount || 0);
          const billBase = p.bill ? Number(p.bill.rent_amount || 0) : 0;
          const billGst = p.bill ? Number(p.bill.gst_amount || 0) : 0;
          const isFull = p.bill ? Number(p.bill.balance_due || 0) <= 0 || p.bill.status === 'PAID' : true;
          const billingMonth = p.receipt?.billing_period || p.bill?.billing_month || currentMonthStr;

          return {
            id: p.id,
            receiptNumber: p.receipt?.receipt_number || p.payment_reference || `REC-${p.id.slice(0, 6)}`,
            billId: p.bill?.id || null,
            billNumber: p.bill?.bill_number || `BL-${p.property?.property_number || '01'}-${billingMonth}`,
            tenantId: p.user?.id || null,
            tenantName: p.user?.full_name || '—',
            tenantMobile: p.user?.mobile || '—',
            tenantCode: p.user?.user_id || '—',
            shopNumber: p.property?.property_number || '—',
            location: p.property?.location || 'अल्मोड़ा',
            amount: paidAmt,
            baseRentAmount: billBase > 0 ? billBase : undefined,
            gstAmount: billGst > 0 ? billGst : undefined,
            isFullPayment: isFull,
            paymentMethod: p.payment_method || 'CASH',
            createdAt: p.created_at,
            billingMonth,
          };
        };

        const recentPayments = recentRawPayments.map(mapPaymentRecord);
        const todayAudit = recentRawPayments
          .filter((p) => p.created_at >= startOfToday && p.created_at <= endOfToday)
          .map(mapPaymentRecord);

        return {
          currentMonth: currentMonthStr,
          fiscalYearLabel,
          totalUsers,
          activeUsers,
          inactiveUsers,
          totalProperties,
          allottedProperties,
          vacantProperties,
          maintenanceProperties,
          occupancyRate,
          complianceRate,
          pendingDocsCount,
          expectedMonthlyBaseRent: Math.round(expectedMonthlyBaseRent * 100) / 100,
          expectedMonthlyGst: Math.round(expectedMonthlyGst * 100) / 100,
          expectedMonthlyRent: Math.round(expectedMonthlyRent * 100) / 100,
          collectedThisMonth: Math.round(collectedThisMonth * 100) / 100,
          monthTransactionsCount,
          fiscalYearCollected: Math.round(fiscalYearCollected * 100) / 100,
          totalAllTimeCollected: Math.round(totalAllTimeCollected * 100) / 100,
          totalOverdue: Math.round(totalOverdue * 100) / 100,
          overdueTenantsCount,
          overdueBillsCount,
          todayCollected: Math.round(todayCollected * 100) / 100,
          todayTransactionsCount,
          propertyByType,
          paymentModeBreakdown,
          topDefaulters,
          leaseAlerts: leaseAlerts.slice(0, 8),
          marketBreakdown,
          todayAudit,
          recentPayments,
          monthlyTrends,
          availableYears,
          yearlyTrends,
        };
      })
    );
  }
}

export const rentalBillingService = new RentalBillingService();
