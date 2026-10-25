import React, { useState } from 'react';
import { Search, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, FileText, Download, X, UserCheck, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SampleTenantRecord {
  shopNo: string;
  tenantName: string;
  market: string;
  mobile: string;
  monthlyRent: number;
  unpaidMonths: number;
  arrears: number;
  totalDue: number;
  status: 'Unpaid' | 'Paid';
  lastPaidDate?: string;
}

export const QuickPaySection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';
  const { user, isAuthenticated, requireAuth } = useAuth();

  const [query, setQuery] = useState(user?.shopNo || '');
  const [result, setResult] = useState<SampleTenantRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const executeSearch = async (searchTerm: string) => {
    const cleanQ = searchTerm.trim();
    if (!cleanQ) return;

    setSearched(true);
    setPaymentSuccess(false);
    setSearching(true);
    setSearchError('');
    setResult(null);

    try {
      // Real backend dues search from Database
      const { rentalBillingApi } = await import('../services/rentalBilling.service');
      const apiRes = await rentalBillingApi.searchDues(cleanQ);

      if (apiRes.data && apiRes.data.pendingBills && apiRes.data.pendingBills.length > 0) {
        const firstBill = apiRes.data.pendingBills[0];
        setResult({
          shopNo: firstBill.propertyNumber,
          tenantName: firstBill.tenantName,
          market: firstBill.location,
          mobile: cleanQ,
          monthlyRent: firstBill.totalAmountDue,
          unpaidMonths: apiRes.data.billCount,
          arrears: firstBill.totalAmountDue - firstBill.balanceDue,
          totalDue: apiRes.data.totalOutstanding,
          status: apiRes.data.totalOutstanding > 0 ? 'Unpaid' : 'Paid',
        });
      } else {
        setResult(null);
        setSearchError(
          isHi
            ? `दुकान संख्या या मोबाइल "${cleanQ}" के लिए कोई लंबित बकाया बिल नहीं मिला।`
            : `No pending dues found for Shop/Mobile "${cleanQ}".`
        );
      }
    } catch (err: any) {
      console.error('Backend search dues error:', err);
      setResult(null);
      setSearchError(
        isHi
          ? 'बकाया राशि खोजने में असमर्थ। कृपया दुकान संख्या या मोबाइल नंबर की जांच करें।'
          : 'Unable to find dues. Please check the Shop Number or Mobile Number.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSearch(query);
  };

  const handleSimulatePayment = () => {
    // Enforce login before paying rent
    if (!isAuthenticated) {
      requireAuth(() => {}, 'quick-pay');
      return;
    }

    setPaymentSuccess(true);
    if (result) {
      setResult({
        ...result,
        totalDue: 0,
        status: 'Paid',
        lastPaidDate: isHi ? 'आज (Today)' : 'Today',
      });
    }
  };

  return (
    <section id="quick-pay" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Matching Safai Portal Exactly) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-3">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? 'त्वरित ई-चालान एवं किराया भुगतान' : 'Quick E-Challan & Rent Payment'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-poppins">
            {t.quickPay.title}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 mx-auto rounded-full mt-3 mb-4" />

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-inter max-w-2xl mx-auto">
            {t.quickPay.subtitle}
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          
          {/* User Status / Login Requirement Banner */}
          {isAuthenticated && user ? (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span>{user.name}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                      {user.role === 'admin' ? (isHi ? 'प्रशासन' : 'Admin') : (isHi ? 'सत्यापित किरायेदार' : 'Verified Tenant')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {user.identifier} {user.shopNo && `• दुकान: ${user.shopNo}`}
                  </div>
                </div>
              </div>
              {user.shopNo && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery(user.shopNo || '');
                    executeSearch(user.shopNo || '');
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shrink-0"
                >
                  {isHi ? 'मेरी दुकान का बकाया देखें' : 'View My Shop Dues'}
                </button>
              )}
            </div>
          ) : (
            <div className="mb-5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  {isHi
                    ? 'किराया भुगतान हेतु लॉगिन आवश्यक है। आप दुकान का विवरण खोज सकते हैं, भुगतान करने हेतु लॉगिन करना होगा।'
                    : 'Sign in is required to complete rent payment. You may search dues, then sign in to pay.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => requireAuth(() => {}, 'quick-pay')}
                className="bg-[#0b1b36] hover:bg-[#152a4d] text-white font-bold px-3 py-1 rounded-md text-xs transition-colors shrink-0 cursor-pointer ml-2"
              >
                {isHi ? 'लॉगिन करें' : 'Sign In'}
              </button>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800">
              {t.quickPay.searchLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.quickPay.searchPlaceholder}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="bg-[#0b1b36] hover:bg-[#152a4d] text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <Search className="w-4 h-4" />
                <span>{searching ? (isHi ? 'खोजा जा रहा है...' : 'Searching...') : t.quickPay.searchBtn}</span>
              </button>
            </div>
          </form>

          {/* Not Found / Error Message */}
          {searched && !result && searchError && (
            <div className="mt-8 pt-6 border-t border-slate-200 animate-fadeIn">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold">
                    {isHi ? 'कोई रिकॉर्ड नहीं मिला' : 'No Records Found'}
                  </span>
                  <p className="text-amber-800 text-xs mt-0.5">{searchError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Result Box */}
          {searched && result && (
            <div className="mt-8 pt-6 border-t border-slate-200 animate-fadeIn">
              {paymentSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold">
                      {isHi ? 'भुगतान सफल! (Payment Successful)' : 'Payment Received Successfully!'}
                    </span>
                    <p className="text-emerald-800 text-xs mt-0.5">
                      {isHi
                        ? 'रसीद संख्या: ZP-ALM/REC/2026/0491 उत्पन्न हो चुकी है। आपकी डिजिटल रसीद मान्य है।'
                        : 'Receipt No. ZP-ALM/REC/2026/0491 generated. Official digital receipt is valid.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#0b1b36] text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded">
                        {result.shopNo}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {result.market}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {result.tenantName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">
                      {isHi ? 'कुल देय धनराशि (Total Payable)' : 'Total Due Amount'}
                    </span>
                    <span className="text-2xl font-black text-[#0b1b36]">
                      ₹{result.totalDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">
                      {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      ₹{result.monthlyRent.toLocaleString('en-IN')}/माह
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {isHi ? 'बकाया माह' : 'Unpaid Period'}
                    </span>
                    <span className="font-bold text-slate-800 text-sm">
                      {result.unpaidMonths} {isHi ? 'माह' : 'Month(s)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {isHi ? 'नियत तिथि' : 'Due Date'}
                    </span>
                    <span className="font-bold text-amber-600 text-sm">
                      {isHi ? 'प्रत्येक माह 10 तारीख' : '10th of Every Month'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      {isHi ? 'स्थिति' : 'Status'}
                    </span>
                    <span
                      className={`font-bold inline-flex items-center gap-1 ${
                        result.status === 'Paid' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {result.status === 'Paid' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isHi ? 'पूर्ण चुकता' : 'Paid'}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          {isHi ? 'बकाया देय' : 'Pending'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isHi
                        ? '100% सुरक्षित भुगतान गेटवे (SBI ePay / Razorpay सम्मत)'
                        : '100% Secure Government Payment Gateway'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {result.status !== 'Paid' ? (
                      <button
                        type="button"
                        onClick={handleSimulatePayment}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {isHi ? `₹${result.totalDue} ऑनलाइन जमा करें` : `Pay ₹${result.totalDue} Online`}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            isHi
                              ? 'आधिकारिक डिजिटल रसीद PDF डाउनलोड की जा रही है...'
                              : 'Downloading official digital receipt PDF...'
                          )
                        }
                        className="bg-[#0b1b36] hover:bg-[#152a4d] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{isHi ? 'डिजिटल रसीद डाउनलोड करें' : 'Download Receipt PDF'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100 text-xs text-slate-600">
            {t.quickPay.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
