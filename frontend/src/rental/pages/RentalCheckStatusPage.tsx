import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Download,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import { RentalNavbar } from '../components/RentalNavbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, DuesSearchResult } from '../services/rentalBilling.service';

export const RentalCheckStatusPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { t, language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DuesSearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle strictly 10-digit numeric mobile number input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setQuery(val);
    if (errorMsg) setErrorMsg('');
  };

  // Search dues & ledger strictly by 10-digit mobile number
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = query.replace(/\D/g, '').slice(0, 10);

    if (cleanMobile.length !== 10) {
      setErrorMsg(
        isHi
          ? 'कृपया पूरा 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें।'
          : 'Please enter a complete 10-digit registered mobile number.'
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg(
        isHi
          ? 'कृपया मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाला)।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    setSearched(true);
    setSearching(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await rentalBillingApi.searchDues(cleanMobile);
      if (res.data && (res.data.tenant || (res.data.allBills && res.data.allBills.length > 0))) {
        setResult(res.data);
      } else {
        setErrorMsg(
          isHi
            ? 'इस मोबाइल नंबर पर कोई पंजीकृत किरायेदार खाता नहीं मिला। कृपया अपने 10-अंकीय पंजीकृत मोबाइल नंबर की जांच करें या कार्यालय से संपर्क करें।'
            : 'No registered tenant account found for this mobile number. Please verify your registered mobile number or contact the office.'
        );
      }
    } catch (err: any) {
      console.error('Search dues error:', err);
      setErrorMsg(
        isHi
          ? 'बकाया राशि खोजने में असमर्थ। कृपया अपने पंजीकृत मोबाइल नंबर की जांच करें।'
          : 'Unable to fetch rental status. Please verify your registered mobile number.'
      );
    } finally {
      setSearching(false);
    }
  };

  // Direct Browser Print for Receipt Voucher
  const handlePrintReceipt = (receiptNo: string, month: string, amount: number) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rent Payment Receipt - ${receiptNo}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0b1b36; }
            .receipt-box { border: 2px solid #0b1b36; border-radius: 8px; padding: 25px; max-width: 650px; margin: 0 auto; position: relative; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
            .gov-title { font-size: 13px; font-weight: 700; color: #045928; text-transform: uppercase; letter-spacing: 1px; }
            .office-title { font-size: 20px; font-weight: 800; margin: 5px 0; color: #0b1b36; }
            .cell-title { font-size: 14px; font-weight: 600; color: #b45309; }
            .receipt-badge { display: inline-block; background: #0b1b36; color: #fff; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 20px; }
            .field label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block; margin-bottom: 2px; }
            .field value { font-weight: 700; color: #0f172a; }
            .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0; }
            .amount-val { font-size: 26px; font-weight: 800; color: #166534; }
            .footer-sig { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #475569; }
            .stamp-seal { border: 2px dashed #045928; color: #045928; padding: 6px 12px; border-radius: 6px; font-weight: 800; text-transform: uppercase; font-size: 11px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="gov-title">उत्तराखण्ड शासन • पंचायती राज विभाग</div>
              <div class="office-title">कार्यालय जिला पंचायत अल्मोड़ा</div>
              <div class="cell-title">वाणिज्यिक परिसंपत्ति एवं किराया प्रकोष्ठ (Rent Cell)</div>
              <div class="receipt-badge">OFFICIAL RENT PAYMENT RECEIPT</div>
            </div>

            <div class="grid">
              <div class="field">
                <label>रसीद संख्या (Receipt No.)</label>
                <value>${receiptNo}</value>
              </div>
              <div class="field">
                <label>जारी दिनांक (Date of Issue)</label>
                <value>${new Date().toLocaleDateString('en-IN')}</value>
              </div>
              <div class="field">
                <label>किरायेदार का नाम (Tenant Name)</label>
                <value>${result?.tenant?.name || 'Authorized Commercial Tenant'}</value>
              </div>
              <div class="field">
                <label>पंजीकृत मोबाइल (Mobile)</label>
                <value>${result?.tenant?.mobile || query}</value>
              </div>
              <div class="field">
                <label>दुकान / परिसर संख्या (Shop No.)</label>
                <value>${result?.tenant?.shopNo || 'Shop'}</value>
              </div>
              <div class="field">
                <label>बाजार / परिसर (Location)</label>
                <value>${result?.tenant?.location || 'Almora'}</value>
              </div>
              <div class="field">
                <label>किराया माह (Billing Month)</label>
                <value>${month}</value>
              </div>
              <div class="field">
                <label>भुगतान स्थिति (Status)</label>
                <value style="color: #166534; font-weight: 800;">पूर्ण भुगतान (PAID)</value>
              </div>
            </div>

            <div class="amount-box">
              <div style="font-size: 12px; color: #166534; font-weight: 700; text-transform: uppercase;">कुल प्राप्त धनराशि (Total Amount Received)</div>
              <div class="amount-val">₹${amount.toLocaleString('en-IN')}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">कंप्यूटरीकृत डिजिटल ई-रसीद (Computer Generated Receipt)</div>
            </div>

            <div class="footer-sig">
              <div class="stamp-seal">✓ VERIFIED & RECORDED</div>
              <div style="text-align: right;">
                <div style="font-weight: 700;">हस्ताक्षर प्राधिकृत अधिकारी / कर निरीक्षक</div>
                <div>जिला पंचायत अल्मोड़ा (उत्तराखंड)</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Direct Browser Print for Full Ledger Statement
  const handlePrintLedger = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) return;

    const rows = result?.allBills
      ?.map(
        (b, i) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${i + 1}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600;">${b.billingMonth}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${b.billNumber}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">₹${b.totalAmountDue.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: #166534; font-weight: 700;">₹${b.amountPaid.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; color: ${b.balanceDue > 0 ? '#b91c1c' : '#166534'}; font-weight: 700;">₹${b.balanceDue.toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${b.status === 'PAID' ? '#dcfce7; color: #166534;' : '#fef3c7; color: #92400e;'}">
            ${b.status}
          </span>
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 12px;">${b.receiptNumber || '-'}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rent Ledger Statement - ${result?.tenant?.shopNo || 'Tenant'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0b1b36; }
            .header { text-align: center; border-bottom: 2px solid #0b1b36; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
            th { background: #0b1b36; color: #ffffff; padding: 10px 8px; font-weight: 700; text-align: left; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="font-size: 12px; font-weight: bold; color: #045928;">उत्तराखण्ड शासन • जिला पंचायत अल्मोड़ा</div>
            <h2 style="margin: 4px 0; color: #0b1b36;">वाणिज्यिक संपत्ति किराया खाता बही (Rent Ledger Statement)</h2>
            <div style="font-size: 13px; color: #64748b;">Statement Generated on: ${new Date().toLocaleDateString('en-IN')}</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; margin-bottom: 15px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div><strong>किरायेदार का नाम (Tenant):</strong> ${result?.tenant?.name}</div>
            <div><strong>मोबाइल नंबर (Mobile):</strong> ${result?.tenant?.mobile}</div>
            <div><strong>दुकान संख्या (Shop No.):</strong> ${result?.tenant?.shopNo}</div>
            <div><strong>स्थान / बाजार (Location):</strong> ${result?.tenant?.location}</div>
            <div><strong>कुल बकाया राशि (Total Outstanding):</strong> <span style="color: ${Number(result?.totalOutstanding) > 0 ? '#b91c1c' : '#166534'}; font-weight: bold;">₹${Number(result?.totalOutstanding).toLocaleString('en-IN')}</span></div>
            <div><strong>चालू माह स्थिति (Current Month):</strong> <strong>${result?.isThisMonthComplete ? 'पूर्ण (Paid)' : 'लंबित (Pending)'}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">क्र.</th>
                <th>माह (Month)</th>
                <th>बिल संख्या (Bill No)</th>
                <th style="text-align: right;">देय (Due)</th>
                <th style="text-align: right;">जमा (Paid)</th>
                <th style="text-align: right;">बकाया (Balance)</th>
                <th style="text-align: center;">स्थिति (Status)</th>
                <th>रसीद संख्या (Receipt No)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #475569;">
            <div>* यह एक प्रमाणित कंप्यूटरीकृत विवरण है।</div>
            <div style="text-align: right; font-weight: bold;">प्राधिकृत हस्ताक्षरकर्ता, जिला पंचायत अल्मोड़ा</div>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isComplete = Boolean(result?.isThisMonthComplete);
  const totalOutstanding = Number(result?.totalOutstanding || 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] w-full overflow-x-hidden font-sans">
      {/* 🏛️ Master Government Navbar */}
      <RentalNavbar />

      <main className="flex-1 w-full py-6 sm:py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <Link
              to="/rental"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? 'किराया पोर्टल मुख्य पृष्ठ' : 'Back to Rental Portal'}</span>
            </Link>
          </div>

          {/* Page Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm mb-6 sm:mb-8 text-center relative overflow-hidden">
            <div className="uk-tricolor-line absolute top-0 left-0 right-0" />

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight leading-snug">
              {isHi
                ? 'मासिक किराया स्थिति एवं खाता बही'
                : 'Monthly Rent Status & Ledger Statement'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium px-1 sm:px-0 leading-relaxed">
              {isHi
                ? 'अपने 10-अंकीय पंजीकृत मोबाइल नंबर से अपने चालू माह के किराये की स्थिति जांचें और रसीद, खाता विवरण डाउनलोड करें।'
                : 'Enter your 10-digit registered mobile number to check rent status and download receipts or ledger.'}
            </p>

            {/* Search Input Form (Strictly 10-digit Mobile Number) */}
            <form onSubmit={handleSearch} className="mt-5 sm:mt-6 max-w-xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3 w-full">
                <div className="relative flex-1 flex items-center w-full min-w-0">
                  <div className="absolute left-3 sm:left-3.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-slate-500 select-none pointer-events-none">
                    <span className="text-slate-500 font-bold">+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={query}
                    onChange={handleMobileChange}
                    placeholder={
                      isHi
                        ? '10-अंकों का पंजीकृत मोबाइल नंबर'
                        : '10-digit registered mobile number'
                    }
                    className="w-full pr-14 sm:pr-16 py-3 sm:py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
                    style={{ paddingLeft: '5.25rem' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || query.length !== 10}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {searching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isHi ? 'खोज रहे हैं...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHi ? 'किराया स्थिति जांचें' : 'Check Status'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 max-w-xl mx-auto text-center px-4">
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Results Display */}
          {searched && result && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
              {/* 1. Tenant & Shop Overview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-navy-950 break-words">
                        {result.tenant?.name}
                      </h2>
                      <div className="text-xs text-slate-600 font-medium mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{result.tenant?.mobile || query}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Current Month Status Hero Box */}
                <div className="mt-4 sm:mt-5 p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-5 bg-gradient-to-r shadow-xs">
                  {isComplete ? (
                    // STATUS: COMPLETE / PAID
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                          {isHi
                            ? 'इस माह का किराया पूर्ण रूप से प्राप्त हो चुका है। कोई बकाया नहीं है।'
                            : 'Rent for this month has been fully cleared. Zero outstanding balance.'}
                        </p>
                        {result.currentMonthBill?.receipt && (
                          <div className="text-xs text-slate-500 mt-0.5 font-medium break-all">
                            {isHi ? 'रसीद संख्या:' : 'Receipt No:'}{' '}
                            <strong className="text-slate-800 font-mono">
                              {result.currentMonthBill.receipt.receipt_number}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // STATUS: PENDING / DUE
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase border border-amber-300">
                          {isHi ? 'चालू माह का किराया बकाया है' : 'Rent Pending'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-bold mt-1 break-words">
                          {isHi
                            ? `इस माह की बकाया राशि: ₹${totalOutstanding.toLocaleString('en-IN')}`
                            : `Current Outstanding Dues: ₹${totalOutstanding.toLocaleString('en-IN')}`}
                        </p>
                        <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                          {isHi
                            ? 'कृपया निर्धारित तिथि से पूर्व कार्यालय काउंटर पर नकद / चेक द्वारा भुगतान करें।'
                            : 'Please deposit the due amount at the Zila Panchayat office counter before due date.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Current Month */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    {/* If Paid: Download Receipt */}
                    {isComplete && result.currentMonthBill?.receipt && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePrintReceipt(
                            result.currentMonthBill!.receipt!.receipt_number,
                            result.currentMonthBill!.billingMonth,
                            result.currentMonthBill!.amountPaid
                          )
                        }
                        className="w-full sm:w-auto flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isHi ? 'रसीद डाउनलोड करें' : 'Download Receipt'}</span>
                      </button>
                    )}

                    {/* Download Full Statement / Ledger */}
                    <button
                      type="button"
                      onClick={handlePrintLedger}
                      className="w-full sm:w-auto flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isHi ? 'खाता विवरण डाउनलोड करें' : 'Download Ledger Statement'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Detailed Rent Ledger & Past Bills Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-navy-950 flex items-center gap-2">
                      <span>{isHi ? 'माहवार किराया खाता बही' : 'Monthly Rent Ledger Trail'}</span>
                    </h3>
                  </div>
                </div>

                {/* Table */}
                <div className="mt-4 -mx-4 sm:mx-0 overflow-x-auto px-4 sm:px-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] sm:text-[11px] tracking-wider">
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">{isHi ? 'माह' : 'Month'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">{isHi ? 'बिल संख्या' : 'Bill No'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'देय राशि' : 'Rent Due'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'जमा राशि' : 'Paid'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'बकाया' : 'Balance'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">{isHi ? 'स्थिति' : 'Status'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">{isHi ? 'रसीद' : 'Receipt'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium bg-white">
                          {result.allBills && result.allBills.length > 0 ? (
                            result.allBills.map((bill) => (
                              <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 font-bold text-navy-950 whitespace-nowrap">{bill.billingMonth}</td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">{bill.billNumber}</td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right text-slate-800 whitespace-nowrap">
                                  ₹{bill.totalAmountDue.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right text-emerald-700 font-bold whitespace-nowrap">
                                  ₹{bill.amountPaid.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                  ₹{bill.balanceDue.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">
                                  {bill.status === 'PAID' ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      {isHi ? 'पूर्ण' : 'PAID'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                      {isHi ? 'लंबित' : 'PENDING'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">
                                  {bill.status === 'PAID' && bill.receiptNumber ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePrintReceipt(bill.receiptNumber!, bill.billingMonth, bill.amountPaid)
                                      }
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>{bill.receiptNumber}</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-6 text-center text-slate-500">
                                {isHi ? 'कोई बिल रिकॉर्ड नहीं मिला' : 'No past bill history available'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Important Notice Footer Box */}
                <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                  <p>
                    {isHi
                      ? 'सूचना: जिला पंचायत अल्मोड़ा के नियमों के तहत मासिक किराया प्रत्येक माह की 20 तारीख तक कार्यालय काउंटर पर अनिवार्य रूप से जमा किया जाना चाहिए। किसी भी त्रुटि या संशोधन हेतु कर निरीक्षक से संपर्क करें।'
                      : 'Notice: Monthly commercial rents must be cleared by the 20th of every month at the municipal counter under Zila Panchayat Almora rules.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 🏛️ Official Website Footer */}
      <Footer />
    </div>
  );
};

export default RentalCheckStatusPage;
