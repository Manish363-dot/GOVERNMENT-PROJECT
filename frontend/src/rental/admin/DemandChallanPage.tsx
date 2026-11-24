import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi } from '../services/rentalBilling.service';

export const DemandChallanPage: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBillDetails = async () => {
    if (!billId) return;
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.getBillDetails(billId);
      const data = (res as any)?.data || res;
      if (data && (data.id || data.billNumber || data.bill_number)) {
        setBill(data);
      } else {
        setError(isHi ? 'मांग बिल विवरण प्राप्त नहीं हुआ।' : 'Demand bill details not found.');
      }
    } catch (err: any) {
      console.error('Failed to load bill details:', err);
      setError(
        err.message ||
        (isHi
          ? 'शासकीय मांग चालान लोड करने में त्रुटि आई।'
          : 'Error loading official demand challan.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetails();
  }, [billId]);

  const handlePrint = () => {
    window.print();
  };

  const formatMonthDisplay = (monthStr: string) => {
    if (!monthStr) return '—';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const hiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${hiMonths[monthNum - 1]} ${year} (${monthStr})`;
    }
    return monthStr;
  };

  // Safe data extraction
  const tenant = bill?.tenant || bill?.user;
  const property = bill?.property;
  const receipts: any[] = bill?.receipts || [];
  const rentAmount = Number(bill?.rent_amount || bill?.rentAmount || 0);
  const arrearsAmount = Number(bill?.arrears_amount || bill?.arrearsAmount || 0);
  const totalDue = Number(bill?.total_amount_due || bill?.totalAmountDue || 0);
  const amountPaid = Number(bill?.amount_paid || bill?.amountPaid || 0);
  const balanceDue = Number(bill?.balance_due || bill?.balanceDue || 0);
  const billNumber = bill?.bill_number || bill?.billNumber || '—';
  const rawBillingMonth = bill?.billing_month || bill?.billingMonth || '';
  const billingMonthDisplay = formatMonthDisplay(rawBillingMonth);

  const dueDateStr = bill?.due_date || bill?.dueDate;
  const formattedDueDate = dueDateStr
    ? new Date(dueDateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '—';

  const isPaid = balanceDue <= 0;
  const isPartiallyPaid = amountPaid > 0 && balanceDue > 0;

  const getStatusText = () => {
    if (isPaid) return isHi ? 'पूर्ण चुकता (PAID)' : 'PAID';
    if (isPartiallyPaid) return isHi ? 'आंशिक भुगतान (PARTIALLY PAID)' : 'PARTIALLY PAID';
    return isHi ? 'अदत्त / बकाया (UNPAID)' : 'UNPAID';
  };

  return (
    <AdminLayout
      title={isHi ? 'व्यावसायिक किराया मांग चालान' : 'Commercial Rent Demand Challan'}
      breadcrumbs={[
        { label: isHi ? 'किराया प्रबंधन' : 'Rent Management', to: '/rental/admin/billing' },
        { label: isHi ? 'मांग चालान एवं समाधान' : 'Demand Challan & Settlement' },
      ]}
    >
      {/* ── PRINT MEDIA STYLES ───────────────────────────────── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-demand-challan-document, #official-demand-challan-document * {
            visibility: visible !important;
          }
          #official-demand-challan-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 4mm 8mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-5 pb-16 font-sans">
        {/* ── TOP ACTION BAR (No Print) ────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/billing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-900 bg-white border border-slate-300 px-3.5 py-2 rounded-lg shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <span>←</span>
            <span>{isHi ? 'किराया प्रबंधन पर वापस लौटें' : 'Back to Rent Management'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-mono font-bold px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-md">
              {isHi ? 'प्रारूप: जि.पं.अ. / मांग-०२' : 'FORM: ZPA / DEMAND-02'}
            </span>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>{isHi ? 'चालान प्रिंट करें (Print)' : 'Print Challan'}</span>
            </button>

            {balanceDue > 0 && billId && (
              <button
                type="button"
                onClick={() => navigate(`/rental/admin/collect-rent/${billId}`)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>💵</span>
                <span>{isHi ? 'किराया जमा करें' : 'Collect Rent'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── ERROR ALERT ───────────────────────────────────────── */}
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

        {/* ── LOADING SKELETON ─────────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'शासकीय मांग चालान लोड हो रहा है...' : 'Loading official demand challan...'}
            </p>
          </div>
        ) : !bill ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <p className="text-base font-bold text-slate-800">
              {isHi ? 'संबंधित मांग चालान अभिलेख उपलब्ध नहीं है।' : 'Demand challan record not found.'}
            </p>
            <button
              onClick={() => navigate('/rental/admin/billing')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              {isHi ? 'बिलिंग सूची पर लौटें' : 'Return to Billing List'}
            </button>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════
             OFFICIAL GOVERNMENT DEMAND CHALLAN DOCUMENT
             ═════════════════════════════════════════════════════════ */
          <div
            id="official-demand-challan-document"
            className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden text-slate-900"
          >
            {/* 1. Official Government Header (Exact match with CollectRentPage) */}
            <div className="bg-[#0B3B60] text-white p-6 relative">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Uttarakhand State Emblem */}
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

              {/* Title & Type Strip */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-300">
                  {isHi
                    ? 'वाणिज्यिक किराया मांग पत्र एवं समाधान चालान'
                    : 'Commercial Rent Demand Bill & Settlement Voucher'}
                </span>
                <span className="font-mono text-slate-200">
                  {isHi ? 'शासकीय राजस्व प्रपत्र' : 'Official Revenue Voucher'}
                </span>
              </div>
            </div>

            {/* 2. Metadata Strip */}
            <div className="bg-slate-100 border-b border-slate-300 px-6 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'मांग बिल संख्या:' : 'Bill No:'}</span>
                <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                  {billNumber}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'बिल माह:' : 'Billing Month:'}</span>
                <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                  {billingMonthDisplay}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'अंतिम देय तिथि:' : 'Due Date:'}</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                  {formattedDueDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'स्थिति:' : 'Status:'}</span>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${isPaid
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : isPartiallyPaid
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>

            {/* 3. Document Body (Clean, Official, No Extra Colors/Icons) */}
            <div className="p-6 sm:p-7 space-y-6">
              {/* भाग १: किरायेदार एवं आवंटित संपत्ति विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>{isHi ? '१. किरायेदार एवं आवंटित संपत्ति विवरण' : '1. Tenant & Property Particulars'}</span>
                  <span className="text-[11px] font-mono text-slate-600 font-normal">
                    ID: {tenant?.user_id || tenant?.userCode || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'किरायेदार का नाम:' : 'Tenant Name:'}</span>
                      <strong className="text-slate-900 text-sm font-bold">
                        {tenant?.full_name || tenant?.fullName || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                      <span className="font-mono font-bold text-slate-900">{tenant?.mobile || '—'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'किरायेदार पहचान कोड:' : 'Tenant Code:'}</span>
                      <span className="font-mono text-slate-800">{tenant?.user_id || tenant?.userCode || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'आवंटित दुकान / संपत्ति सं.:' : 'Property / Shop No:'}</span>
                      <strong className="text-slate-900 text-sm font-bold font-mono">
                        {property?.property_number || property?.propertyNumber || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'बाजार / स्थान:' : 'Market / Location:'}</span>
                      <span className="font-medium text-slate-900">{property?.location || 'अल्मोड़ा'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'अंतिम देय तिथि:' : 'Due Date:'}</span>
                      <span className="font-mono text-slate-900 font-medium">{formattedDueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* भाग २: मांग एवं अवशेष लेखा विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isHi ? '२. मांग एवं अवशेष लेखा विवरण' : '2. Demand & Balance Statement'}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-4 text-left">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'पूर्व अवशेष बकाया' : 'Past Arrears'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'कुल मांग राशि' : 'Total Demanded'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'पूर्व जमा' : 'Amount Paid'}</th>
                        <th className="py-2.5 px-4 text-right font-bold">{isHi ? 'वर्तमान अवशेष देय' : 'Current Outstanding'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₹{rentAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                          ₹{arrearsAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          ₹{totalDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                          ₹{amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded ${balanceDue > 0
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                          >
                            ₹{balanceDue.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* भाग ३: शासकीय राजस्व रसीदें एवं समाधान प्रविष्टि */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isHi ? '३. शासकीय राजस्व रसीदें एवं समाधान प्रविष्टि' : '3. Issued Receipts & Settlement History'}
                </div>

                {receipts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 text-left">{isHi ? 'रसीद संख्या' : 'Receipt No.'}</th>
                          <th className="py-2.5 px-4 text-left">{isHi ? 'प्रपत्र प्रकार' : 'Form Type'}</th>
                          <th className="py-2.5 px-4 text-center">{isHi ? 'जमा दिनांक' : 'Issued Date'}</th>
                          <th className="py-2.5 px-4 text-right">{isHi ? 'जमा राशि' : 'Amount Paid'}</th>
                          <th className="py-2.5 px-4 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {receipts.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                              {r.receipt_number || r.receiptNumber}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700">
                              {isHi ? 'प्रपत्र संख्या ५ (नियम ४१)' : 'Statutory Form 5'}
                            </td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-700">
                              {r.issued_at || r.issuedAt
                                ? new Date(r.issued_at || r.issuedAt).toLocaleDateString('en-IN')
                                : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₹{Number(r.amount_paid || r.amountPaid || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded">
                                {isHi ? 'शासकीय जमा' : 'CREDITED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                      {isHi
                        ? 'इस मांग चालान हेतु वर्तमान तक कोई शासकीय रसीद जारी नहीं हुई है (बकाया देय है)।'
                        : 'No official receipts issued yet for this demand (Dues pending).'}
                    </p>
                    {balanceDue > 0 && billId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/rental/admin/collect-rent/${billId}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <span>💵</span>
                        <span>{isHi ? 'कार्यालय काउंटर पर किराया जमा करें' : 'Accept Payment at Counter'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* भाग ४: शासकीय अधोहस्ताक्षर एवं मुहर खंड */}
              <div className="pt-6 border-t border-slate-300">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="space-y-8">
                    <div className="text-slate-400 font-mono text-[11px]">— हस्ताक्षर —</div>
                    <div className="font-bold text-slate-800">
                      {isHi ? 'मांग एवं वसूली लिपिक' : 'Demand & Recovery Clerk'}
                    </div>
                  </div>

                  <div className="space-y-6">

                    <div className="font-bold text-slate-800">
                      {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat'}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="text-slate-400 font-mono text-[11px]">— हस्ताक्षर —</div>
                    <div className="font-bold text-slate-800">
                      {isHi ? 'कर अधिकारी / मुख्य अधिकारी' : 'Tax Officer / In-Charge'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  {isHi
                    ? 'यह प्रपत्र जिला पंचायत अल्मोड़ा के व्यावसायिक संपत्ति एवं किराया प्रबंधन पोर्टल द्वारा डिजिटल रूप से संकलित एवं अभिलेखित शासकीय मांग अभिलेख है।'
                    : 'This document is a digitally compiled and verified demand record generated by Zila Panchayat Almora Commercial Rental Management System.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DemandChallanPage;
