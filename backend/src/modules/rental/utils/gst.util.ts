export const RENTAL_GST_RATE = 18;
export const RENTAL_CGST_RATE = 9;
export const RENTAL_SGST_RATE = 9;

export interface RentalGstBreakdown {
  rentAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  totalWithGst: number;
}

/**
 * Computes exclusive 18% GST (9% CGST + 9% SGST) on top of base monthly rent.
 * Example: baseRent = 1000 -> gstAmount = 180, totalWithGst = 1180.
 */
export function calculateRentWithGst(baseRent: number): RentalGstBreakdown {
  const rentAmount = Math.round(Number(baseRent || 0) * 100) / 100;
  const gstAmount = Math.round(rentAmount * RENTAL_GST_RATE) / 100;
  const cgstAmount = Math.round(rentAmount * RENTAL_CGST_RATE) / 100;
  const sgstAmount = Math.round((gstAmount - cgstAmount) * 100) / 100;
  const totalWithGst = Math.round((rentAmount + gstAmount) * 100) / 100;

  return {
    rentAmount,
    gstRate: RENTAL_GST_RATE,
    cgstAmount,
    sgstAmount,
    gstAmount,
    totalWithGst,
  };
}

/**
 * Resolves effective bill totals preserving legacy already-paid pre-GST bills,
 * while applying exclusive 18% GST to all unpaid/pending/overdue bills and bills that already store GST.
 */
export function resolveBillAmounts(bill: {
  rent_amount: any;
  gst_amount?: any;
  adjustment_amount?: any;
  total_amount_due: any;
  amount_paid: any;
  status: string;
}) {
  const rentAmount = Math.round(Number(bill.rent_amount || 0) * 100) / 100;
  const storedGst = Math.round(Number(bill.gst_amount || 0) * 100) / 100;
  const adjustment = Math.round(Number(bill.adjustment_amount || 0) * 100) / 100;
  const amountPaidRaw = Math.round(Number(bill.amount_paid || 0) * 100) / 100;
  const storedTotalRaw = Math.round(Number(bill.total_amount_due || 0) * 100) / 100;

  // Legacy rolled-over arrears bills used total_amount_due = rent + previous arrears; cap display to single month if needed
  const isPaid = bill.status === 'PAID' || (storedTotalRaw > 0 && amountPaidRaw >= storedTotalRaw);

  if (isPaid && storedGst === 0) {
    // Keep already-paid pre-GST receipts & bills strictly untouched
    const paidTotal = adjustment > 0 ? Math.min(rentAmount, amountPaidRaw || rentAmount) : storedTotalRaw;
    const paidAmt = Math.min(paidTotal, amountPaidRaw);
    return {
      rentAmount,
      gstAmount: 0,
      totalAmountDue: paidTotal,
      amountPaid: paidAmt,
      balanceDue: Math.max(0, Math.round((paidTotal - paidAmt) * 100) / 100),
      needsGstSync: false,
    };
  }

  // Already has GST stored (paid or unpaid)
  if (storedGst > 0) {
    const basePlusGst = Math.round((rentAmount + storedGst) * 100) / 100;
    const effectiveTotal = adjustment > 0 ? basePlusGst : Math.max(basePlusGst, storedTotalRaw);
    const paidAmt = Math.min(effectiveTotal, amountPaidRaw);
    return {
      rentAmount,
      gstAmount: storedGst,
      totalAmountDue: effectiveTotal,
      amountPaid: paidAmt,
      balanceDue: Math.max(0, Math.round((effectiveTotal - paidAmt) * 100) / 100),
      needsGstSync: false,
    };
  }

  // Unpaid / pending / overdue / partially paid pre-GST bill -> apply 18% GST automatically
  const { gstAmount, totalWithGst } = calculateRentWithGst(rentAmount);
  const effectiveTotal = adjustment > 0 ? totalWithGst : totalWithGst;
  const paidAmt = Math.min(effectiveTotal, amountPaidRaw);
  const balanceDue = Math.max(0, Math.round((effectiveTotal - paidAmt) * 100) / 100);

  return {
    rentAmount,
    gstAmount,
    totalAmountDue: effectiveTotal,
    amountPaid: paidAmt,
    balanceDue,
    needsGstSync: !isPaid && amountPaidRaw === 0,
  };
}
