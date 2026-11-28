import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { resolveBillAmounts } from '../utils/gst.util';
import { rentalCache } from '../utils/rentalCache.util';

export interface LedgerRow {
  id: string;
  date: Date;
  type: 'BILL' | 'PAYMENT' | 'ADJUSTMENT' | 'OPENING';
  documentNumber: string;
  description: string;
  shopNumber: string;
  billingPeriod?: string;
  debit: number;
  credit: number;
  runningBalance: number;
  paymentMethod?: string;
  transactionRef?: string;
  status: string;
}

export class RentalLedgerService {
  /**
   * 1. Financial Overview & KPIs (All-time, yearly, monthly, today, date-filtered)
   */
  async getOverview(params: {
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
  }) {
    const cacheKey = `ledger:overview:${params.date || ''}:${params.startDate || ''}:${params.endDate || ''}:${params.month || ''}:${params.year || ''}`;
    return rentalCache.getOrSet(cacheKey, 15_000, () =>
      withRentalDbRetry(async () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthNum = now.getMonth() + 1;
        const currentMonthStr = `${currentYear}-${currentMonthNum.toString().padStart(2, '0')}`;

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        const startOfMonth = new Date(currentYear, currentMonthNum - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonthNum, 0, 23, 59, 59);

        const fyStartYear = currentMonthNum >= 4 ? currentYear : currentYear - 1;
        const startOfFY = new Date(fyStartYear, 3, 1, 0, 0, 0);
        const endOfFY = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);

        let filterStart: Date | null = null;
        let filterEnd: Date | null = null;
        let hasCustomFilter = false;

        if (params.date) {
          hasCustomFilter = true;
          const d = new Date(params.date);
          filterStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
          filterEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        } else if (params.startDate && params.endDate) {
          hasCustomFilter = true;
          filterStart = new Date(params.startDate);
          filterEnd = new Date(params.endDate);
          filterEnd.setHours(23, 59, 59, 999);
        } else if (params.month) {
          hasCustomFilter = true;
          const [y, m] = params.month.split('-').map(Number);
          filterStart = new Date(y, m - 1, 1);
          filterEnd = new Date(y, m, 0, 23, 59, 59);
        } else if (params.year) {
          hasCustomFilter = true;
          const y = parseInt(params.year, 10);
          filterStart = new Date(y, 0, 1);
          filterEnd = new Date(y, 11, 31, 23, 59, 59);
        }

        const [allPayments, allBills, totalTenants, activeTenants, properties] = await Promise.all([
          rentalPrisma.rentalPayment.findMany({
            where: { status: 'SUCCESS' },
            select: { amount: true, created_at: true },
          }),
          rentalPrisma.rentalBill.findMany({
            select: {
              rent_amount: true,
              gst_amount: true,
              adjustment_amount: true,
              total_amount_due: true,
              amount_paid: true,
              balance_due: true,
              status: true,
            },
          }),
          rentalPrisma.rentalUser.count(),
          rentalPrisma.propertyAssignment.count({ where: { is_active: true } }),
          rentalPrisma.rentalProperty.findMany({
            select: { status: true },
          }),
        ]);

        const totalProperties = properties.length;
        const allottedProperties = properties.filter((p) => p.status === 'ALLOTTED').length;
        const vacantProperties = properties.filter((p) => p.status === 'VACANT').length;

        let totalRentCollectedAllTime = 0;
        let todayCollection = 0;
        let monthlyCollection = 0;
        let yearlyCollection = 0;
        let periodCollectionSum = 0;
        let periodCountVal = 0;

        for (const p of allPayments) {
          const amt = Number(p.amount);
          const dt = p.created_at;
          totalRentCollectedAllTime += amt;
          if (dt >= startOfToday && dt <= endOfToday) todayCollection += amt;
          if (dt >= startOfMonth && dt <= endOfMonth) monthlyCollection += amt;
          if (dt >= startOfFY && dt <= endOfFY) yearlyCollection += amt;
          if (hasCustomFilter && filterStart && filterEnd && dt >= filterStart && dt <= filterEnd) {
            periodCollectionSum += amt;
            periodCountVal++;
          }
        }

        const totalBilledAllTime = allBills.reduce((acc, b) => acc + resolveBillAmounts(b).totalAmountDue, 0);
        const totalRentDue = allBills.reduce((acc, b) => acc + resolveBillAmounts(b).balanceDue, 0);

        const periodCollection = hasCustomFilter ? periodCollectionSum : null;
        const periodCount = hasCustomFilter ? periodCountVal : null;

        return {
          fiscalYear: `${fyStartYear}-${(fyStartYear + 1).toString().slice(2)}`,
          currentMonth: currentMonthStr,
          totalRentCollectedAllTime,
          todayCollection,
          monthlyCollection,
          yearlyCollection,
          totalBilledAllTime,
          totalRentDue,
          totalTenants,
          activeTenants,
          totalProperties,
          allottedProperties,
          vacantProperties,
          hasCustomFilter,
          periodCollection,
          periodCount,
        };
      })
    );
  }

  /**
   * 2. General Master Ledger Transactions
   * Detailed audit entries with full tenant, shop, bill & receipt metadata.
   */
  async getTransactions(params: {
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    search?: string;
    paymentMethod?: string;
    limit?: number;
    page?: number;
  }) {
    return withRentalDbRetry(async () => {
      const {
        date,
        startDate,
        endDate,
        month,
        year,
        search,
        paymentMethod,
        limit = 50,
        page = 1,
      } = params;

      const where: any = { status: 'SUCCESS' };

      if (date) {
        const d = new Date(date);
        const s = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        const e = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        where.created_at = { gte: s, lte: e };
      } else if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        where.created_at = { gte: s, lte: e };
      } else if (month) {
        const [y, m] = month.split('-').map(Number);
        const s = new Date(y, m - 1, 1);
        const e = new Date(y, m, 0, 23, 59, 59);
        where.created_at = { gte: s, lte: e };
      } else if (year && year !== 'ALL') {
        const y = parseInt(year, 10);
        const s = new Date(y, 0, 1);
        const e = new Date(y, 11, 31, 23, 59, 59);
        where.created_at = { gte: s, lte: e };
      }

      if (paymentMethod && paymentMethod !== 'ALL') {
        where.payment_method = paymentMethod;
      }

      if (search && search.trim()) {
        const q = search.trim();
        where.OR = [
          { user: { full_name: { contains: q, mode: 'insensitive' } } },
          { user: { mobile: { contains: q } } },
          { user: { user_id: { contains: q, mode: 'insensitive' } } },
          { property: { property_number: { contains: q, mode: 'insensitive' } } },
          { property: { property_name: { contains: q, mode: 'insensitive' } } },
          { property: { location: { contains: q, mode: 'insensitive' } } },
          { receipt: { receipt_number: { contains: q, mode: 'insensitive' } } },
          { payment_reference: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [totalCount, payments] = await Promise.all([
        rentalPrisma.rentalPayment.count({ where }),
        rentalPrisma.rentalPayment.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                user_id: true,
                full_name: true,
                mobile: true,
                aadhaar_masked: true,
                gst_number: true,
                created_at: true,
              },
            },
            property: {
              select: {
                id: true,
                property_id: true,
                property_number: true,
                property_name: true,
                location: true,
                property_type: true,
              },
            },
            bill: {
              select: {
                id: true,
                bill_number: true,
                billing_month: true,
                total_amount_due: true,
                balance_due: true,
              },
            },
            receipt: true,
          },
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const totalFilteredAmount = payments.reduce((acc, p) => acc + Number(p.amount), 0);

      const records = payments.map((p) => ({
        id: p.id,
        date: p.created_at,
        receiptNumber: p.receipt?.receipt_number || `REC-${p.id.slice(0, 8).toUpperCase()}`,
        paymentReference: p.payment_reference,
        gatewayRef: p.gateway_payment_id || p.payment_reference,
        tenantId: p.user?.id || '',
        tenantCode: p.user?.user_id || 'N/A',
        tenantName: p.user?.full_name || 'N/A',
        tenantMobile: p.user?.mobile || 'N/A',
        tenantRegistrationDate: p.user?.created_at,
        shopNumber: p.property?.property_number || 'N/A',
        propertyName: p.property?.property_name || 'N/A',
        location: p.property?.location || 'N/A',
        propertyType: p.property?.property_type || 'COMMERCIAL_SHOP',
        billNumber: p.bill?.bill_number || 'N/A',
        billingMonth: p.bill?.billing_month || 'N/A',
        amount: Number(p.amount),
        remainingBalance: p.bill ? Number(p.bill.balance_due) : 0,
        paymentMethod: p.payment_method,
        status: p.status,
      }));

      return {
        totalCount,
        page,
        limit,
        totalFilteredAmount,
        records,
      };
    });
  }

  /**
   * 3. Individual Tenant 360-Degree Ledger Statement
   * Complete lifecycle history:
   * - Registration date (kisne kab register kiya)
   * - Lease validity (kab tak valid hai)
   * - All payments & receipts (usne kab kab payment kare)
   * - Chronological ledger with debits, credits and running balance.
   */
  async getTenantLedgerStatement(userId: string) {
    return withRentalDbRetry(async () => {
      // Find tenant by UUID or by user_id code (e.g. ALM-RENT-2026-0001)
      const user = await rentalPrisma.rentalUser.findFirst({
        where: {
          OR: [{ id: userId }, { user_id: userId }],
        },
        include: {
          assignments: {
            include: { property: true },
            orderBy: { created_at: 'desc' },
          },
          bills: {
            include: { property: true },
            orderBy: { created_at: 'asc' },
          },
          payments: {
            where: { status: 'SUCCESS' },
            include: { receipt: true, property: true, bill: true },
            orderBy: { created_at: 'asc' },
          },
          ledgerEntries: {
            orderBy: { created_at: 'asc' },
          },
        },
      });

      if (!user) {
        throw new Error('Tenant record not found.');
      }

      // Active or latest assignment
      const activeAssignment = user.assignments.find((a) => a.is_active) || user.assignments[0];

      // Calculate totals (including 18% GST on unpaid/new bills while keeping paid pre-GST bills intact)
      const resolvedBills = user.bills.map((b) => ({ raw: b, resolved: resolveBillAmounts(b) }));
      const totalBilled = resolvedBills.reduce((sum, item) => sum + item.resolved.totalAmountDue, 0);
      const totalPaid = user.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalOutstanding = resolvedBills.reduce((sum, item) => sum + item.resolved.balanceDue, 0);

      // Build unified chronological ledger book
      const rows: LedgerRow[] = [];
      let runningBal = 0;

      // Combine Bills and Payments
      const events: Array<{
        date: Date;
        kind: 'BILL' | 'PAYMENT';
        data: any;
      }> = [];

      user.bills.forEach((b) => {
        events.push({
          date: new Date(b.created_at),
          kind: 'BILL',
          data: b,
        });
      });

      user.payments.forEach((p) => {
        events.push({
          date: new Date(p.created_at),
          kind: 'PAYMENT',
          data: p,
        });
      });

      // Sort by date ascending
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      events.forEach((ev) => {
        if (ev.kind === 'BILL') {
          const b = ev.data;
          const resolved = resolveBillAmounts(b);
          const due = resolved.totalAmountDue;
          runningBal += due;
          rows.push({
            id: b.id,
            date: b.created_at,
            type: 'BILL',
            documentNumber: b.bill_number,
            description: resolved.gstAmount > 0
              ? `मासिक किराया + 18% GST — बिल माह ${b.billing_month} (Rent ₹${resolved.rentAmount} + GST ₹${resolved.gstAmount})`
              : `मासिक किराया देय — बिल माह ${b.billing_month} (Monthly Rent Demand)`,
            shopNumber: b.property?.property_number || activeAssignment?.property?.property_number || 'SHOP',
            billingPeriod: b.billing_month,
            debit: due,
            credit: 0,
            runningBalance: runningBal,
            status: b.status,
          });
        } else if (ev.kind === 'PAYMENT') {
          const p = ev.data;
          const paid = Number(p.amount);
          runningBal = Math.max(0, runningBal - paid);
          rows.push({
            id: p.id,
            date: p.created_at,
            type: 'PAYMENT',
            documentNumber: p.receipt?.receipt_number || p.payment_reference,
            description: `किराया भुगतान जमा (${p.payment_method}) — रसीद सं. ${p.receipt?.receipt_number || 'REC'}`,
            shopNumber: p.property?.property_number || activeAssignment?.property?.property_number || 'SHOP',
            billingPeriod: p.receipt?.billing_period || p.bill?.billing_month,
            debit: 0,
            credit: paid,
            runningBalance: runningBal,
            paymentMethod: p.payment_method,
            transactionRef: p.gateway_payment_id || p.payment_reference,
            status: p.status,
          });
        }
      });

      // Determine validity info
      const leaseStartDate = activeAssignment?.lease_start_date || null;
      const leaseEndDate = activeAssignment?.lease_end_date || null;
      const isExpired = leaseEndDate ? new Date(leaseEndDate).getTime() < Date.now() : false;

      return {
        tenant: {
          id: user.id,
          tenantCode: user.user_id,
          fullName: user.full_name,
          mobile: user.mobile,
          email: user.email || 'N/A',
          permanentAddress: user.permanent_address,
          currentAddress: user.current_address || user.permanent_address,
          aadhaarMasked: user.aadhaar_masked || 'XXXX-XXXX-XXXX',
          panMasked: user.pan_masked || 'XXXXX0000X',
          gstNumber: user.gst_number || 'N/A',
          status: user.status,
          registrationDate: user.created_at, // kisne kab register kiya
        },
        allotment: activeAssignment
          ? {
              assignmentId: activeAssignment.id,
              propertyId: activeAssignment.property.id,
              propertyCode: activeAssignment.property.property_id,
              propertyNumber: activeAssignment.property.property_number,
              propertyName: activeAssignment.property.property_name,
              location: activeAssignment.property.location,
              address: activeAssignment.property.address,
              propertyType: activeAssignment.property.property_type,
              dimensionsSqft: activeAssignment.property.dimensions_sqft,
              allotmentDate: activeAssignment.allotment_date,
              leaseStartDate: activeAssignment.lease_start_date,
              leaseEndDate: activeAssignment.lease_end_date, // kab tak valid hai
              isValid: !isExpired && activeAssignment.is_active,
              isExpired,
              monthlyRent: Number(activeAssignment.monthly_rent),
              isActive: activeAssignment.is_active,
            }
          : null,
        summary: {
          totalBilled,
          totalPaid,
          totalOutstanding,
          totalReceiptsIssued: user.payments.length,
          lastPaymentDate: user.payments.length > 0 ? user.payments[user.payments.length - 1].created_at : null,
          lastPaymentAmount: user.payments.length > 0 ? Number(user.payments[user.payments.length - 1].amount) : 0,
        },
        ledgerHistory: rows.reverse(), // Newest first for visual display, but retains calculations
        rawBills: resolvedBills.map(({ raw: b, resolved }) => ({
          id: b.id,
          billNumber: b.bill_number,
          billingMonth: b.billing_month,
          rentAmount: resolved.rentAmount,
          gstAmount: resolved.gstAmount,
          arrearsAmount: Number(b.adjustment_amount),
          totalAmountDue: resolved.totalAmountDue,
          amountPaid: resolved.amountPaid,
          balanceDue: resolved.balanceDue,
          dueDate: b.due_date,
          status: b.status,
          createdAt: b.created_at,
        })),
        rawPayments: user.payments
          .map((p) => ({
            id: p.id,
            paymentReference: p.payment_reference,
            receiptNumber: p.receipt?.receipt_number || `REC-${p.id.slice(0, 8).toUpperCase()}`,
            billingMonth: p.receipt?.billing_period || p.bill?.billing_month || 'N/A',
            shopNumber: p.property?.property_number || activeAssignment?.property?.property_number || 'N/A',
            amount: Number(p.amount),
            paymentMethod: p.payment_method,
            gatewayRef: p.gateway_payment_id || p.payment_reference,
            date: p.created_at,
            status: p.status,
          }))
          .reverse(),
      };
    });
  }

  /**
   * 4. Lightweight list of tenants for quick search & selector (flattened, fast)
   */
  async getTenantsList(search?: string) {
    const searchKey = (search || '').trim().toLowerCase();
    return rentalCache.getOrSet(`ledger:tenants:${searchKey}`, 15_000, () =>
      withRentalDbRetry(async () => {
        const where: any = {};
        if (search && search.trim()) {
          const q = search.trim();
          where.OR = [
            { full_name: { contains: q, mode: 'insensitive' } },
            { user_id: { contains: q, mode: 'insensitive' } },
            { mobile: { contains: q } },
          ];
        }

        const tenants = await rentalPrisma.rentalUser.findMany({
          where,
          select: {
            id: true,
            user_id: true,
            full_name: true,
            mobile: true,
            status: true,
            created_at: true,
          },
          orderBy: { full_name: 'asc' },
          take: 100,
        });

        const tenantIds = tenants.map((t) => t.id);
        const activeAssignments = tenantIds.length > 0
          ? await rentalPrisma.propertyAssignment.findMany({
              where: { user_id: { in: tenantIds }, is_active: true },
              select: {
                user_id: true,
                monthly_rent: true,
                lease_end_date: true,
                property: {
                  select: {
                    property_number: true,
                    location: true,
                  },
                },
              },
            })
          : [];

        const assignByUser = new Map(activeAssignments.map((a) => [a.user_id, a]));

        return tenants.map((t) => {
          const assignment = assignByUser.get(t.id);
          return {
            id: t.id,
            tenantCode: t.user_id,
            fullName: t.full_name,
            mobile: t.mobile,
            status: t.status,
            registeredAt: t.created_at,
            shopNumber: assignment?.property?.property_number || 'N/A',
            location: assignment?.property?.location || 'N/A',
            monthlyRent: assignment ? Number(assignment.monthly_rent) : 0,
            leaseEndDate: assignment?.lease_end_date || null,
          };
        });
      })
    );
  }
}

export const rentalLedgerService = new RentalLedgerService();
