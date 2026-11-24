import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, BillListItem } from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import { OfficialStatutoryReceipt } from '../components/OfficialStatutoryReceipt';
import { PaymentCelebrationCard, PaymentSuccessIllustration } from '../components/PaymentSuccessBadge';

export const CollectRentPage: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [bill, setBill] = useState<any | null>(null);
  const [tenantBills, setTenantBills] = useState<BillListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Success Confirmation State (Separate from receipt)
  const [paymentStage, setPaymentStage] = useState<'form' | 'celebrating' | 'receipt'>('form');
  const [recordedResult, setRecordedResult] = useState<{
    success: boolean;
    receiptNumber: string;
    billingMonth: string;
    billNumber: string;
    amountPaid: number;
    remainingBalance: number;
  } | null>(null);

  const formatMonthDisplay = (monthStr: string, hindi: boolean) => {
    if (!monthStr) return '';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const hiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    const enMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const idx = monthNum - 1;
    if (idx >= 0 && idx < 12) {
      return hindi ? `${hiMonths[idx]} ${year} (${monthStr})` : `${enMonths[idx]} ${year} (${monthStr})`;
    }
    return monthStr;
  };

  const loadBillAndTenantBills = async (targetBillId: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.getBillDetails(targetBillId);
      const data = res.data;
      setBill(data);
      const balance = Number(data.balanceDue ?? data.balance_due ?? 0);
      setPaymentAmount(balance);

      // Fetch all bills for this tenant so user can pick / switch any month
      const tenantId = data.tenant?.id || data.user?.id || data.user_id;
      if (tenantId) {
        try {
          const listRes = await rentalBillingApi.listBills({ userId: tenantId, limit: 50 });
          if (listRes.data && listRes.data.data) {
            setTenantBills(listRes.data.data);
          }
        } catch (tErr) {
          console.error('Failed to load other tenant bills:', tErr);
        }
      }
    } catch (err: any) {
      setError(err.message || (isHi ? 'बिल विवरण लोड करने में असमर्थ।' : 'Failed to load bill details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (billId) {
      loadBillAndTenantBills(billId);
    }
  }, [billId]);

  const handleBillMonthChange = async (targetBillId: string) => {
    if (targetBillId === bill?.id) return;
    setIsVerified(false);
    setRecordedResult(null);
    navigate(`/rental/admin/collect-rent/${targetBillId}`, { replace: true });
  };

  const tenant = bill?.tenant || bill?.user;
  const property = bill?.property;
  const currentBalance = Number(bill?.balanceDue ?? bill?.balance_due ?? 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !isVerified) return;

    if (currentBalance <= 0) {
      setError(isHi ? 'यह बिल पहले से ही पूर्ण जमा (PAID) है।' : 'This bill is already settled in full.');
      return;
    }

    if (paymentAmount <= 0) {
      setError(isHi ? 'कृपया मान्य वसूली राशि दर्ज करें।' : 'Please enter a valid payment amount.');
      return;
    }

    if (paymentAmount > currentBalance) {
      setError(
        isHi
          ? `दर्ज राशि (₹${paymentAmount.toLocaleString('en-IN')}) कुल अवशेष बकाया (₹${currentBalance.toLocaleString('en-IN')}) से अधिक नहीं हो सकती।`
          : `Entered amount exceeds current balance due of ₹${currentBalance.toLocaleString('en-IN')}.`
      );
      return;
    }

    if (paymentMethod === 'CHEQUE_DD' && !referenceNumber.trim()) {
      setError(isHi ? 'कृपया चेक / ड्राफ्ट संख्या दर्ज करें।' : 'Please enter cheque / draft number.');
      return;
    }

    if (paymentMethod === 'NEFT_RTGS' && !referenceNumber.trim()) {
      setError(isHi ? 'कृपया बैंक लेन-देन (UTR / Ref) संख्या दर्ज करें।' : 'Please enter bank transaction UTR/reference number.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await rentalPaymentApi.recordCounterPayment({
        billId: bill.id,
        amount: Number(paymentAmount),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
      });

      const receiptNo = res.data?.receiptNumber || 'RCP-' + Date.now().toString().slice(-6);
      const newRemaining = Math.max(0, currentBalance - Number(paymentAmount));

      setRecordedResult({
        success: true,
        receiptNumber: receiptNo,
        billingMonth: formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi),
        billNumber: bill.billNumber || bill.bill_number,
        amountPaid: Number(paymentAmount),
        remainingBalance: newRemaining,
      });
      setPaymentStage('celebrating');

      // Refresh bill state to update real DB view
      const updatedBill = await rentalBillingApi.getBillDetails(bill.id);
      setBill(updatedBill.data);
      const tenantId = updatedBill.data.tenant?.id || updatedBill.data.user?.id || updatedBill.data.user_id;
      if (tenantId) {
        const listRes = await rentalBillingApi.listBills({ userId: tenantId, limit: 50 });
        if (listRes.data && listRes.data.data) {
          setTenantBills(listRes.data.data);
        }
      }
    } catch (err: any) {
      setError(err.message || (isHi ? 'वसूली दर्ज करने में त्रुटि आई।' : 'Failed to record payment collection.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'कार्यालय काउंटर किराया वसूली' : 'Office Counter Rent Collection'}
      breadcrumbs={[
        { label: isHi ? 'किराया प्रबंधन' : 'Rent Management', to: '/rental/admin/billing' },
        { label: isHi ? 'काउंटर वसूली चालान' : 'Collection Voucher' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-5 pb-16 font-sans">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/billing')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-indigo-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <span>←</span>
            <span>{isHi ? 'किराया प्रबंधन पर वापस लौटें' : 'Back to Rent Management'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md">
              {isHi ? 'प्रारूप: जि.पं.अ. / राजस्व-०१' : 'FORM: ZPA / REV-01'}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg text-red-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-950 font-black text-lg px-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'शासकीय मांग चालान विवरण लोड हो रहा है...' : 'Loading official demand voucher...'}
            </p>
          </div>
        ) : !bill ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <p className="text-base font-bold text-slate-800">
              {isHi ? 'संबंधित मांग बिल संख्या उपलब्ध नहीं है।' : 'Demand bill record not found.'}
            </p>
            <button
              onClick={() => navigate('/rental/admin/billing')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              {isHi ? 'बिलिंग सूची पर लौटें' : 'Return to Billing List'}
            </button>
          </div>
        ) : paymentStage === 'celebrating' && recordedResult ? (
          /* ════════ STAGE 1: FULL SUCCESS CELEBRATION ANIMATION ════════ */
          <div className="py-8 sm:py-12 flex justify-center items-center">
            <PaymentCelebrationCard
              amount={recordedResult.amountPaid}
              receiptNumber={recordedResult.receiptNumber}
              billNumber={recordedResult.billNumber}
              isHi={isHi}
              autoTransitionMs={2500}
              onContinue={() => setPaymentStage('receipt')}
            />
          </div>
        ) : paymentStage === 'receipt' && recordedResult ? (
          /* ════════ STAGE 2: BADGE SLIDES UP TO TOP BANNER + RECEIPT REVEALS FROM UNDERNEATH ════════ */
          <div className="space-y-6">
            {/* Sleek Top Banner (Badge has moved up to top) */}
            <div className="no-print bg-emerald-50/90 border border-emerald-300/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs transition-all duration-700 ease-out animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3.5">
                <PaymentSuccessIllustration size={46} className="shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>{isHi ? 'वसूली सफलतापूर्वक दर्ज की गई!' : 'Payment Successfully Recorded!'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded font-semibold">
                      {recordedResult.receiptNumber}
                    </span>
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {isHi
                      ? `राशि ₹${recordedResult.amountPaid.toLocaleString('en-IN')} शासकीय राजस्व में क्रेडिट • आधिकारिक प्रपत्र संख्या ५ जनरेटेड`
                      : `Amount ₹${recordedResult.amountPaid.toLocaleString('en-IN')} credited to revenue • Statutory Form 5 generated`}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="text-[11px] font-bold px-3 py-1 bg-emerald-600 text-white rounded-md tracking-wider shadow-2xs">
                  PAID
                </span>
              </div>
            </div>

            {/* Official Statutory Receipt (Reveals by sliding up from underneath!) */}
            <div className="transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-8">
              <OfficialStatutoryReceipt
                data={{
                  receiptNumber: recordedResult.receiptNumber,
                  bookNumber: `B-${new Date().getFullYear()}/${property?.property_number || '01'}`,
                  demandRegisterNumber: tenant?.user_id || tenant?.userCode || 'TENANT',
                  tenantName: tenant?.full_name || tenant?.fullName || '—',
                  shopNumber: property?.property_number || property?.propertyNumber,
                  location: property?.location,
                  amount: recordedResult.amountPaid,
                  isFullPayment: recordedResult.remainingBalance <= 0,
                  billNumber: recordedResult.billNumber,
                  billingMonth: recordedResult.billingMonth,
                  place: 'अल्मोड़ा',
                  dateStr: new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }),
                }}
                onClose={() => {
                  setRecordedResult(null);
                  setPaymentStage('form');
                  setIsVerified(false);
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 no-print border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/rental/admin/billing')}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {isHi ? '← किराया प्रबंधन सूची पर लौटें' : '← Return to Billing Management'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRecordedResult(null);
                  setPaymentStage('form');
                  setIsVerified(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {isHi ? 'अन्य बिल का चालान देखें' : 'View Another Voucher'}
              </button>
            </div>
          </div>
        ) : (
          /* ════════ MAIN DEDICATED OFFICIAL COLLECTION PAGE ════════ */
          <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
            {/* Government Official Header */}
            <div className="bg-[#0B3B60] text-white p-6 relative">
              <div className="flex items-center justify-between gap-4">
                {/* Left: State Emblem */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src="/assets/logo1.webp"
                      alt="Emblem of Uttarakhand"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                      {isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'Govt. of Uttarakhand • Panchayati Raj'}
                    </div>
                    <h2 className="text-base sm:text-xl font-extrabold tracking-wide text-white">
                      {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                    </h2>
                    <p className="text-xs text-slate-200 font-medium">
                      {isHi
                        ? 'वाणिज्यिक परिसंपत्ति एवं किराया वसूली प्रकोष्ठ'
                        : 'Commercial Asset & Rental Management Cell'}
                    </p>
                  </div>
                </div>

                {/* Right: Panchayati Raj Logo */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src="/assets/logo2.webp"
                      alt="Panchayati Raj Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Title Strip */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-300">
                  {isHi ? 'कार्यालय काउंटर किराया वसूली चालान' : 'Office Counter Rent Collection Challan'}
                </span>
                <span className="font-mono text-slate-200">
                  {isHi ? 'शासकीय राजस्व प्रपत्र' : 'Official Revenue Voucher'}
                </span>
              </div>
            </div>

            {/* Challan Metadata Strip */}
            <div className="bg-slate-100 border-b border-slate-300 px-6 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'मांग बिल संख्या:' : 'Bill No:'}</span>
                <strong className="font-mono text-indigo-900 bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">
                  {bill.billNumber || bill.bill_number}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'बिल माह:' : 'Billing Month:'}</span>
                <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 font-bold">
                  {formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'दिनांक:' : 'Date:'}</span>
                <span className="font-mono text-slate-800 font-semibold">
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-6">
              {/* भाग १: किरायेदार एवं आवंटित संपत्ति विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>{isHi ? '१. किरायेदार एवं आवंटित संपत्ति विवरण' : '1. Tenant & Property Particulars'}</span>
                  <span className="text-[11px] font-mono text-slate-500 font-normal">
                    ID: {tenant?.user_id || tenant?.userCode || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'किरायेदार का नाम:' : 'Tenant Name:'}</span>
                      <strong className="text-slate-900 text-sm font-bold">
                        {tenant?.full_name || tenant?.fullName || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                      <span className="font-mono text-slate-900 font-semibold">{tenant?.mobile || '—'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'किरायेदार पहचान कोड:' : 'Tenant Code:'}</span>
                      <span className="font-mono font-bold text-slate-800">{tenant?.user_id || tenant?.userCode || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'आवंटित दुकान / संपत्ति सं.:' : 'Shop / Property No:'}</span>
                      <strong className="font-mono text-indigo-900 text-sm font-bold">
                        {property?.property_number || property?.propertyNumber || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'बाजार / स्थान:' : 'Market / Location:'}</span>
                      <span className="text-slate-900 font-semibold">{property?.location || '—'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{isHi ? 'अंतिम देय तिथि:' : 'Due Date:'}</span>
                      <span className="font-mono text-slate-700">
                        {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* भाग २: मांग एवं अवशेष लेखा विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>{isHi ? '२. मांग एवं अवशेष लेखा विवरण' : '2. Demand & Dues Assessment'}</span>
                  <span className="text-[11px] font-mono text-slate-600 font-semibold">
                    {formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-300 text-slate-700">
                        <th className="p-3 font-semibold">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</th>
                        <th className="p-3 font-semibold">{isHi ? 'पूर्व अवशेष बकाया' : 'Past Arrears'}</th>
                        <th className="p-3 font-semibold">{isHi ? 'कुल मांग राशि' : 'Total Demand'}</th>
                        <th className="p-3 font-semibold">{isHi ? 'पूर्व जमा' : 'Paid'}</th>
                        <th className="p-3 font-bold text-right text-slate-950">{isHi ? 'वर्तमान अवशेष देय' : 'Current Due'}</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-medium">₹{Number(bill.rentAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-medium text-amber-800">₹{Number(bill.arrearsAmount || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold text-slate-900">₹{Number(bill.totalAmountDue || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 font-medium text-emerald-800">₹{Number(bill.amountPaid || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-3 py-1 rounded font-black text-sm border ${currentBalance > 0
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}>
                            ₹{currentBalance.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* भाग ३: काउंटर वसूली प्रविष्टि फॉर्म */}
              <form onSubmit={handleRecordPayment} className="space-y-5">
                <div className="border border-slate-300 rounded-lg p-5 bg-slate-50/70 space-y-4 shadow-2xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-2">
                    {isHi ? '३. काउंटर वसूली प्रविष्टि (PAYMENT ENTRY)' : '3. Counter Payment Entry'}
                  </div>

                  {/* ── MONTH SELECTION DROPDOWN (As Requested by User) ── */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>{isHi ? 'किस माह का किराया जमा करना है (Billing Month) *' : 'Select Billing Month to Pay *'}</span>
                      {tenantBills.length > 0 && (
                        <span className="text-[11px] font-normal text-slate-500">
                          ({tenantBills.length} {isHi ? 'माह के बिल उपलब्ध' : 'bills on record'})
                        </span>
                      )}
                    </label>

                    {tenantBills.length > 1 ? (
                      <select
                        value={bill.id}
                        onChange={(e) => handleBillMonthChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-lg text-sm font-bold text-slate-900 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      >
                        {tenantBills.map((b) => (
                          <option key={b.id} value={b.id}>
                            {formatMonthDisplay(b.billingMonth, isHi)} — {b.status === 'PAID' ? (isHi ? '✓ पूर्ण जमा (PAID)' : '✓ Settled (PAID)') : `${isHi ? 'अवशेष देय' : 'Due'}: ₹${b.balanceDue.toLocaleString('en-IN')}`} {b.status === 'OVERDUE' ? '⚠️ OVERDUE' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 flex items-center justify-between shadow-2xs">
                        <span className="text-indigo-950 font-bold font-mono">
                          {formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-bold uppercase ${bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                          {bill.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* If Bill is already Paid */}
                  {currentBalance <= 0 ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 flex items-center gap-2">
                      <span className="text-base">✓</span>
                      <span>
                        {isHi
                          ? `यह बिल (${formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)}) पूर्व में ही पूर्ण रूप से जमा हो चुका है। वर्तमान अवशेष देय ₹0 है।`
                          : `This bill (${formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)}) is already settled in full. Balance is ₹0.`}
                      </span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount Received Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isHi ? 'प्राप्त राशि (रुपये में) *' : 'Amount Received (INR) *'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-mono text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          required
                          disabled={currentBalance <= 0}
                          min="1"
                          max={currentBalance}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition font-mono shadow-2xs disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        {isHi ? `अधिकतम देय बकाया: ₹${currentBalance.toLocaleString('en-IN')}` : `Max payable: ₹${currentBalance.toLocaleString('en-IN')}`}
                      </span>
                    </div>

                    {/* Payment Mode Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {isHi ? 'भुगतान का माध्यम *' : 'Payment Mode *'}
                      </label>
                      <select
                        value={paymentMethod}
                        disabled={currentBalance <= 0}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition shadow-2xs cursor-pointer disabled:bg-slate-100"
                      >
                        <option value="CASH">{isHi ? 'नकद काउंटर (Cash Counter)' : 'Cash Counter'}</option>
                        <option value="CHEQUE_DD">{isHi ? 'चेक / डिमांड ड्राफ्ट (Cheque / DD)' : 'Cheque / DD'}</option>
                        <option value="NEFT_RTGS">{isHi ? 'बैंक अंतरण (NEFT / RTGS / IMPS)' : 'Bank Transfer (NEFT / RTGS)'}</option>
                        <option value="POS_MACHINE">{isHi ? 'पीओएस मशीन / कार्ड स्वाइप (POS)' : 'POS Card Swipe'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Reference Number Field (Shown ONLY when payment method is NOT CASH) */}
                  {paymentMethod !== 'CASH' && currentBalance > 0 && (
                    <div className="pt-2 animate-in fade-in duration-150">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        {paymentMethod === 'CHEQUE_DD'
                          ? isHi ? 'चेक / ड्राफ्ट संख्या (Cheque / DD No.) *' : 'Cheque / DD Number *'
                          : isHi ? 'बैंक लेन-देन संदर्भ संख्या (Bank UTR / Ref No.) *' : 'Bank Reference Number (UTR) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder={paymentMethod === 'CHEQUE_DD' ? 'उदा. CHQ-928312' : 'उदा. UTR-1029482749'}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition font-mono shadow-2xs"
                      />
                    </div>
                  )}
                </div>

                {/* भाग ४: अनिवार्य विभागीय प्रमाणीकरण चेकबॉक्स */}
                <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-lg shadow-2xs">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      disabled={currentBalance <= 0}
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600 cursor-pointer shrink-0 disabled:opacity-50"
                    />
                    <span className="text-xs text-slate-900 leading-relaxed font-semibold">
                      {isHi
                        ? `प्रमाणीकरण: मैं प्रमाणित करता/करती हूँ कि किरायेदार से माह ${formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)} हेतु कुल ₹${paymentAmount.toLocaleString('en-IN')} की राशि कार्यालय काउंटर पर भौतिक रूप से प्राप्त कर ली गई है एवं शासकीय राजस्व लेखा में प्रविष्टि हेतु अधिकृत की जाती है।`
                        : `Certification: I hereby verify that the amount of ₹${paymentAmount.toLocaleString('en-IN')} for month ${formatMonthDisplay(bill.billingMonth || bill.billing_month, isHi)} has been physically collected at the counter and is authorized for entry into the government revenue ledger.`}
                    </span>
                  </label>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => navigate('/rental/admin/billing')}
                    className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={!isVerified || submitting || currentBalance <= 0 || paymentAmount <= 0}
                    className="px-6 py-2.5 bg-[#0B3B60] hover:bg-[#072942] text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
                  >
                    {submitting
                      ? isHi ? 'वसूली दर्ज हो रही है...' : 'Recording...'
                      : isHi ? 'वसूली दर्ज करें' : 'Record Counter Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CollectRentPage;
