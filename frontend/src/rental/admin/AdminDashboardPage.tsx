import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';
import {
  rentalBillingApi,
  DashboardAnalytics,
  DashboardAuditPaymentItem,
} from '../services/rentalBilling.service';
import { YearlyTargetGraphChart, Yearly3DBarChart } from './components/RentalCharts';
import { OfficialStatutoryReceipt } from '../components/OfficialStatutoryReceipt';
import { formatAdminDisplayName } from '../utils/transliterate';
import { RefreshCw, Download, ArrowRight } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialAnalytics =
    api.peekCache<{ data: DashboardAnalytics }>('/rental/bills/analytics')?.data ?? null;
  const [loading, setLoading] = useState(!initialAnalytics);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(initialAnalytics);
  const [collectionTab, setCollectionTab] = useState<'TODAY' | 'RECENT'>('TODAY');
  const [selectedReceipt, setSelectedReceipt] = useState<DashboardAuditPaymentItem | null>(null);

  const fetchDashboardData = async (force = false) => {
    if (force) {
      api.invalidateCache('/rental/bills/analytics');
      setLoading(true);
    } else if (!analytics) {
      setLoading(true);
    }
    try {
      const res = await rentalBillingApi.getAnalytics();
      if (res && res.data) {
        setAnalytics(res.data);
        if (
          (!res.data.todayAudit || res.data.todayAudit.length === 0) &&
          res.data.recentPayments &&
          res.data.recentPayments.length > 0
        ) {
          setCollectionTab('RECENT');
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const formatCurrency = (amount: number | undefined | null) =>
    '₹' + Number(amount || 0).toLocaleString('en-IN');

  const formatMonthLabel = (monthStr: string) => {
    if (!monthStr) return '—';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const m = parseInt(parts[1], 10);
    const hiMonths = [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
    ];
    const enMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    if (m >= 1 && m <= 12) {
      return isHi ? `${hiMonths[m - 1]} ${year}` : `${enMonths[m - 1]} ${year}`;
    }
    return monthStr;
  };

  const formatModeLabel = (mode: string) => {
    const m = (mode || 'CASH').toUpperCase();
    if (m === 'CASH') return isHi ? 'नकद काउंटर' : 'Cash Counter';
    if (m === 'CHEQUE_DD' || m.includes('CHEQUE')) return isHi ? 'चेक / डिमांड ड्राफ्ट' : 'Cheque / DD';
    if (m === 'UPI_ONLINE' || m.includes('UPI') || m === 'ONLINE')
      return isHi ? 'यूपीआई / ऑनलाइन' : 'UPI / Online';
    if (m === 'BANK_TRANSFER' || m.includes('NEFT') || m.includes('BANK'))
      return isHi ? 'बैंक अंतरण' : 'Bank Transfer';
    return isHi ? 'पीओएस / कार्ड' : 'POS / Card';
  };

  const activeCollectionRows: DashboardAuditPaymentItem[] =
    collectionTab === 'TODAY'
      ? analytics?.todayAudit || []
      : analytics?.recentPayments || analytics?.todayAudit || [];

  const handleExportExcel = () => {
    if (!activeCollectionRows || activeCollectionRows.length === 0) {
      alert(
        isHi
          ? 'निर्यात करने के लिए कोई भुगतान अभिलेख उपलब्ध नहीं है।'
          : 'No payment records available to export.'
      );
      return;
    }

    const wb = XLSX.utils.book_new();
    const sheetData: any[][] = [
      [
        isHi
          ? 'कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड शासन)'
          : 'OFFICE OF ZILA PANCHAYAT ALMORA (GOVT. OF UTTARAKHAND)',
      ],
      [
        isHi
          ? collectionTab === 'TODAY'
            ? 'दैनिक किराया वसूली ऑडिट विवरण'
            : 'हाल के किराया भुगतान अभिलेख'
          : collectionTab === 'TODAY'
            ? "Today's Rent Collection Audit Report"
            : 'Recent Rent Payment Audit Report',
      ],
      [
        isHi ? 'रिपोर्ट दिनांक:' : 'Generated On:',
        new Date().toLocaleString('en-IN'),
      ],
      [],
      isHi
        ? [
          'क्र.सं.',
          'रसीद संख्या',
          'बिल संख्या',
          'किरायेदार का नाम',
          'मोबाइल नंबर',
          'किरायेदार कोड',
          'दुकान संख्या',
          'बाजार / स्थान',
          'बिल माह',
          'जमा राशि (₹)',
          'भुगतान माध्यम',
          'दिनांक एवं समय',
        ]
        : [
          'S.No.',
          'Receipt No.',
          'Bill No.',
          'Tenant Name',
          'Mobile',
          'Tenant Code',
          'Shop No.',
          'Market / Location',
          'Billing Month',
          'Amount Paid (INR)',
          'Payment Mode',
          'Date & Time',
        ],
      ...activeCollectionRows.map((item, idx) => [
        idx + 1,
        item.receiptNumber,
        item.billNumber || '—',
        item.tenantName,
        item.tenantMobile,
        item.tenantCode,
        item.shopNumber,
        item.location,
        item.billingMonth,
        Number(item.amount || 0),
        formatModeLabel(item.paymentMethod),
        new Date(item.createdAt).toLocaleString('en-IN'),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 15 },
      { wch: 20 },
      { wch: 14 },
      { wch: 20 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Rent_Collections');
    const dateTag = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(
      wb,
      `ZPA_${collectionTab === 'TODAY' ? 'Today' : 'Recent'}_Collections_${dateTag}.xlsx`
    );
  };

  const trendData = analytics?.monthlyTrends || [];
  const defaulters = analytics?.topDefaulters || [];
  const leaseAlerts = analytics?.leaseAlerts || [];
  const paymentModes = analytics?.paymentModeBreakdown || [];
  const totalModeSum = paymentModes.reduce((s, m) => s + m.amount, 0);

  const resolvedAdminName = formatAdminDisplayName(
    user?.name,
    isHi,
    user?.role === 'SUB_ADMIN'
  );

  return (
    <AdminLayout
      title={isHi ? 'मुख्य प्रशासनिक डैशबोर्ड' : 'Executive Admin Dashboard'}
      breadcrumbs={[{ label: isHi ? 'डैशबोर्ड' : 'Dashboard' }]}
    >
      {/* Print media rules for isolated Form 5 Receipt OR Yearly Graph Report */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-statutory-receipt-print,
          #official-statutory-receipt-print *,
          #official-yearly-graph-report-print,
          #official-yearly-graph-report-print *,
          #official-yearly-3dbar-report-print,
          #official-yearly-3dbar-report-print * {
            visibility: visible !important;
          }
          #official-statutory-receipt-print,
          #official-yearly-graph-report-print,
          #official-yearly-3dbar-report-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8mm 10mm !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-4 sm:space-y-5">
        {/* ── 1. OFFICIAL GOVERNMENT HEADER STRIP & QUICK ACTIONS ── */}
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
          <div className="bg-[#0B3B60] text-white px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-extrabold text-white leading-snug break-words">
                {isHi
                  ? `स्वागत है ${resolvedAdminName}`
                  : `Welcome ${resolvedAdminName}`}
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/10 border border-white/20 text-[11px] sm:text-xs font-mono font-semibold text-white">
                {isHi
                  ? `वित्तीय वर्ष: ${analytics?.fiscalYearLabel || '2026-27'}`
                  : `Financial Year: ${analytics?.fiscalYearLabel || '2026-27'}`}
              </div>
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] sm:text-xs font-semibold text-white transition cursor-pointer disabled:opacity-60"
                title={isHi ? 'डेटा ताज़ा करें' : 'Refresh'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline sm:inline">
                  {isHi ? 'ताज़ा करें' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. FIVE DISTINCT MONOCHROME KPI CARDS (Zero Duplicate Numbers, Zero Extra Colors) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {/* Card 1: Total Tenants */}
          <div
            onClick={() => navigate('/rental/admin/tenants')}
            className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-500 shadow-2xs cursor-pointer transition min-w-0"
          >
            <p className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-tight">
              {isHi ? 'कुल किरायेदार' : 'Total Tenants'}
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 font-mono truncate">
              {loading ? '—' : analytics?.totalUsers ?? 0}
            </p>
          </div>

          {/* Card 2: Total Shops & Properties */}
          <div
            onClick={() => navigate('/rental/admin/properties')}
            className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-500 shadow-2xs cursor-pointer transition min-w-0"
          >
            <p className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-tight">
              {isHi ? 'कुल दुकानें व संपत्ति' : 'Total Properties'}
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 font-mono truncate">
              {loading ? '—' : analytics?.totalProperties ?? 0}
            </p>
          </div>

          {/* Card 3: Monthly Rent Target */}
          <div
            onClick={() => navigate('/rental/admin/billing')}
            className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-500 shadow-2xs cursor-pointer transition min-w-0"
          >
            <p className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-tight">
              {isHi ? 'मासिक किराया लक्ष्य' : 'Monthly Rent Target'}
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 font-mono break-all">
              {loading ? '—' : formatCurrency(analytics?.expectedMonthlyRent)}
            </p>
          </div>

          {/* Card 4: Total Collected Revenue */}
          <div
            onClick={() => navigate('/rental/admin/ledger')}
            className="bg-white rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-500 shadow-2xs cursor-pointer transition min-w-0"
          >
            <p className="text-[10.5px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-tight">
              {isHi ? 'कुल प्राप्त वसूली' : 'Total Collected'}
            </p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 font-mono break-all">
              {loading ? '—' : formatCurrency(analytics?.fiscalYearCollected)}
            </p>
          </div>

          {/* Card 5: Total Outstanding Dues */}
          <div
            onClick={() => navigate('/rental/admin/billing')}
            className="col-span-2 md:col-span-1 bg-white rounded-xl p-3 sm:p-4 border border-slate-300 hover:border-slate-500 shadow-2xs cursor-pointer transition min-w-0 flex items-center justify-between md:block"
          >
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide leading-tight">
              {isHi ? 'कुल लंबित बकाया' : 'Total Pending Dues'}
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 md:mt-1.5 font-mono">
              {loading ? '—' : formatCurrency(analytics?.totalOverdue)}
            </p>
          </div>
        </div>

        {/* ── 3. OFFICIAL CHARTS ROW: YEARLY TARGET GRAPH + 3D YEARLY BAR CHART ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <YearlyTargetGraphChart
            monthlyTarget={analytics?.expectedMonthlyRent ?? 0}
            currentMonth={analytics?.currentMonth}
            availableYears={analytics?.availableYears}
            yearlyTrends={analytics?.yearlyTrends}
            fallbackTrends={trendData}
            isHi={isHi}
          />
          <Yearly3DBarChart
            currentMonth={analytics?.currentMonth}
            availableYears={analytics?.availableYears}
            yearlyTrends={analytics?.yearlyTrends}
            fallbackTrends={trendData}
            isHi={isHi}
          />
        </div>

        {/* ── 4. PENDING RENT LIST + PAYMENT MODES (Zero Repeated Shop Counts, Pure Black Data) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Pending Rent Tenants List (8 columns) */}
          <div className="lg:col-span-8 bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? 'बकाया किराया सूची' : 'Pending Rent List'}
                </h3>
              </div>
              <NavLink
                to="/rental/admin/billing"
                className="text-xs font-bold text-slate-900 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>{isHi ? 'सभी बिल देखें' : 'All Bills'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {defaulters.length === 0 ? (
              <div className="p-6 sm:p-8 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-md">
                  {isHi
                    ? 'सभी किरायेदारों का किराया जमा है। कोई बकाया शेष नहीं है।'
                    : 'All tenants are settled up to date. Zero pending dues.'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Responsive Cards (<md) */}
                <div className="md:hidden divide-y divide-slate-200">
                  {defaulters.map((d) => (
                    <div key={d.tenantId} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 break-words">
                            {d.tenantName}
                          </div>
                          <div className="text-xs font-mono text-slate-600 mt-0.5">
                            {d.mobile}
                          </div>
                          <div className="text-xs text-slate-700 mt-1 break-words">
                            <span className="font-mono font-bold text-slate-900">{d.shopNumber}</span>
                            {d.location ? ` • ${d.location}` : ''}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-mono font-black text-slate-900">
                            {formatCurrency(d.outstandingAmount)}
                          </div>
                          <span className="inline-block font-mono font-bold text-[10.5px] px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300 mt-1">
                            {d.unpaidMonthsCount} {isHi ? 'माह' : 'mo'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <NavLink
                          to={`/rental/admin/ledger?tenantId=${d.tenantId}`}
                          className="py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold text-center transition"
                        >
                          {isHi ? 'बहीखाता' : 'Ledger'}
                        </NavLink>
                        <button
                          type="button"
                          onClick={() => navigate(`/rental/admin/collect-multi/${d.tenantId}`)}
                          className="py-2 px-3 rounded-lg bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold text-center transition cursor-pointer"
                        >
                          {isHi ? 'वसूली करें' : 'Collect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>=md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                        <th className="py-2.5 px-4">{isHi ? 'किरायेदार व मोबाइल' : 'Tenant & Mobile'}</th>
                        <th className="py-2.5 px-3">{isHi ? 'दुकान व बाजार' : 'Shop & Market'}</th>
                        <th className="py-2.5 px-3 text-center">{isHi ? 'बाकी माह' : 'Months Due'}</th>
                        <th className="py-2.5 px-3 text-right">{isHi ? 'बकाया राशि' : 'Pending Amount'}</th>
                        <th className="py-2.5 px-4 text-right">{isHi ? 'कार्यवाही' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {defaulters.map((d) => (
                        <tr key={d.tenantId} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-slate-900">{d.tenantName}</div>
                            <div className="text-[11px] font-mono text-slate-600">{d.mobile}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-mono font-bold text-slate-900">{d.shopNumber}</div>
                            <div className="text-[11px] text-slate-600 truncate max-w-[160px]">
                              {d.location}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-300">
                              {d.unpaidMonthsCount} {isHi ? 'माह' : 'mo'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                            {formatCurrency(d.outstandingAmount)}
                          </td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <NavLink
                                to={`/rental/admin/ledger?tenantId=${d.tenantId}`}
                                className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-[11px] font-semibold transition"
                              >
                                {isHi ? 'बहीखाता' : 'Ledger'}
                              </NavLink>
                              <button
                                type="button"
                                onClick={() => navigate(`/rental/admin/collect-multi/${d.tenantId}`)}
                                className="px-2.5 py-1 rounded bg-[#0B3B60] hover:bg-slate-900 text-white text-[11px] font-bold transition cursor-pointer"
                              >
                                {isHi ? 'वसूली करें' : 'Collect'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Payment Mode Summary (4 columns — Non-duplicated, Pure Black) */}
          <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isHi ? 'भुगतान माध्यम विवरण' : 'Payment Mode Summary'}
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {paymentModes.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    {isHi ? 'अभी कोई भुगतान दर्ज नहीं हुआ है।' : 'No payments recorded yet.'}
                  </p>
                ) : (
                  paymentModes.map((pm) => {
                    const share =
                      totalModeSum > 0 ? Math.round((pm.amount / totalModeSum) * 100) : 0;
                    return (
                      <div
                        key={pm.mode}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs py-2 px-3 rounded bg-slate-50 border border-slate-200"
                      >
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900">
                            {formatModeLabel(pm.mode)}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                            ({pm.count})
                          </span>
                        </div>
                        <span className="font-mono font-black text-slate-900 shrink-0">
                          {formatCurrency(pm.amount)}{' '}
                          <span className="text-[10.5px] font-normal text-slate-600">
                            ({share}%)
                          </span>
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {leaseAlerts.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                    {isHi ? 'पट्टा समाप्ति सूचना:' : 'Lease Expiry Alert:'}
                  </div>
                  {leaseAlerts.slice(0, 3).map((la, idx) => {
                    const isExpired = la.daysRemaining < 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => navigate(`/rental/admin/tenants/${la.tenantId}`)}
                        className="py-1.5 px-2.5 rounded bg-slate-50 border border-slate-300 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-100 transition"
                      >
                        <span className="font-semibold text-slate-900 truncate min-w-0">
                          {la.tenantName} ({la.shopNumber})
                        </span>
                        <span className="font-mono text-[10.5px] font-bold text-slate-900 shrink-0">
                          {isExpired
                            ? isHi
                              ? 'अवधि समाप्त'
                              : 'Expired'
                            : isHi
                              ? `${la.daysRemaining} दिन शेष`
                              : `${la.daysRemaining}d left`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 5. TODAY'S & RECENT COLLECTIONS AUDIT TABLE + OFFICIAL FORM 5 RECEIPT ── */}
        <div className="bg-white rounded-xl border border-slate-300 shadow-2xs overflow-hidden">
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCollectionTab('TODAY')}
                className={`px-3 py-1.5 rounded transition cursor-pointer text-center ${collectionTab === 'TODAY'
                  ? 'bg-[#0B3B60] text-white'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                {isHi
                  ? `आज की वसूली (${analytics?.todayAudit?.length ?? 0})`
                  : `Today's (${analytics?.todayAudit?.length ?? 0})`}
              </button>
              <button
                type="button"
                onClick={() => setCollectionTab('RECENT')}
                className={`px-3 py-1.5 rounded transition cursor-pointer text-center ${collectionTab === 'RECENT'
                  ? 'bg-[#0B3B60] text-white'
                  : 'text-slate-700 hover:text-slate-900'
                  }`}
              >
                {isHi
                  ? `हाल के भुगतान (${analytics?.recentPayments?.length ?? 0})`
                  : `Recent (${analytics?.recentPayments?.length ?? 0})`}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isHi ? 'एक्सेल डाउनलोड' : 'Export Excel'}</span>
              </button>
              <NavLink
                to="/rental/admin/records"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                <span className="truncate">{isHi ? 'सभी ऑडिट रिकॉर्ड' : 'All Records'}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </NavLink>
            </div>
          </div>

          {activeCollectionRows.length > 0 ? (
            <>
              {/* Mobile Responsive Cards (<md) */}
              <div className="md:hidden divide-y divide-slate-200">
                {activeCollectionRows.map((p) => (
                  <div key={p.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-[#0B3B60]">
                          {p.receiptNumber}
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5 break-words">
                          {p.tenantName}
                        </div>
                        <div className="text-xs font-mono text-slate-600">{p.tenantMobile}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-black text-slate-900">
                          {formatCurrency(p.amount)}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-900 border border-slate-300">
                          {formatModeLabel(p.paymentMethod)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span>
                        <span className="font-mono font-bold text-slate-800">{p.shopNumber}</span>
                        {' • '}
                        {formatMonthLabel(p.billingMonth)}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(p.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(p)}
                      className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      {isHi ? 'रसीद देखें' : 'View Receipt'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>=md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-4">{isHi ? 'रसीद संख्या' : 'Receipt No.'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'किरायेदार' : 'Tenant'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'दुकान व स्थान' : 'Shop & Market'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'बिल माह' : 'Billing Month'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'भुगतान माध्यम' : 'Mode'}</th>
                      <th className="py-2.5 px-3 text-right">{isHi ? 'जमा राशि' : 'Amount'}</th>
                      <th className="py-2.5 px-3">{isHi ? 'दिनांक व समय' : 'Date & Time'}</th>
                      <th className="py-2.5 px-4 text-right">{isHi ? 'रसीद प्रपत्र' : 'Receipt'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeCollectionRows.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                          {p.receiptNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{p.tenantName}</div>
                          <div className="text-[11px] font-mono text-slate-600">{p.tenantMobile}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold text-slate-900">{p.shopNumber}</div>
                          <div className="text-[11px] text-slate-600">{p.location}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {formatMonthLabel(p.billingMonth)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-900 border border-slate-300">
                            {formatModeLabel(p.paymentMethod)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="px-3 py-1 rounded-md bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
                          >
                            {isHi ? 'रसीद देखें' : 'View Receipt'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-10 px-4 text-center">
              <p className="text-xs font-semibold text-slate-600">
                {collectionTab === 'TODAY'
                  ? isHi
                    ? 'आज की तिथि में अभी तक कोई किराया भुगतान दर्ज नहीं हुआ है।'
                    : 'No rent payments have been recorded today yet.'
                  : isHi
                    ? 'अभी तक कोई भुगतान अभिलेख उपलब्ध नहीं है।'
                    : 'No payment records available yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── OFFICIAL STATUTORY FORM 5 RECEIPT MODAL ── */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="bg-slate-100 rounded-xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl border border-slate-300 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <OfficialStatutoryReceipt
              data={{
                receiptNumber: selectedReceipt.receiptNumber,
                bookNumber: `B-${new Date(selectedReceipt.createdAt).getFullYear()}/${selectedReceipt.shopNumber || '01'}`,
                demandRegisterNumber: selectedReceipt.tenantCode,
                tenantName: selectedReceipt.tenantName,
                shopNumber: selectedReceipt.shopNumber,
                location: selectedReceipt.location,
                amount: selectedReceipt.amount,
                baseRentAmount: selectedReceipt.baseRentAmount,
                gstAmount: selectedReceipt.gstAmount,
                isFullPayment: selectedReceipt.isFullPayment !== false,
                billNumber:
                  selectedReceipt.billNumber ||
                  `BL-${selectedReceipt.shopNumber}-${selectedReceipt.billingMonth}`,
                billingMonth: formatMonthLabel(selectedReceipt.billingMonth),
                place: 'अल्मोड़ा',
                dateStr: new Date(selectedReceipt.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }),
              }}
              onClose={() => setSelectedReceipt(null)}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
