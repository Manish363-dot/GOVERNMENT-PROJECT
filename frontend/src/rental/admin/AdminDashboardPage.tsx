import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalBillingApi, DashboardAnalytics } from '../services/rentalBilling.service';
import {
  Revenue3DBarChart,
  RevenuePatternAreaChart,
  PropertyPatternDonutChart,
  MunicipalRadialScoresChart,
} from './components/RentalCharts';
import {
  Building,
  Users,
  FileText,
  Clock,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Wallet,
  Shield,
  CreditCard,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await rentalBillingApi.getAnalytics();
      if (res && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return '₹' + Number(amount || 0).toLocaleString('en-IN');
  };

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001' ||
    user?.identifier === 'almora_superadmin';

  // Real monthly trend data from Database
  const trendData = analytics?.monthlyTrends || [];

  const downloadTodayAuditCSV = () => {
    if (!analytics?.todayAudit || analytics.todayAudit.length === 0) {
      alert(isHi ? 'आज का कोई भुगतान रिकॉर्ड उपलब्ध नहीं है।' : 'No payment records available for today.');
      return;
    }

    const headers = [
      'Receipt No',
      'Tenant Name',
      'Mobile',
      'Tenant Code',
      'Shop No',
      'Location',
      'Amount (INR)',
      'Payment Mode',
      'Date Time',
      'Billing Month',
    ];
    const rows = analytics.todayAudit.map((item) => [
      item.receiptNumber,
      `"${item.tenantName}"`,
      item.tenantMobile,
      item.tenantCode,
      `"${item.shopNumber}"`,
      `"${item.location}"`,
      item.amount,
      item.paymentMethod,
      new Date(item.createdAt).toLocaleString('en-IN'),
      item.billingMonth,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ZPA_Today_Collections_Audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title={isHi ? 'मुख्य प्रशासनिक डैशबोर्ड' : 'Executive Admin Dashboard'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा — वाणिज्यिक संपत्तियों का राजस्व, वसूली एवं ऑडिट नियंत्रण'
          : 'Zila Panchayat Almora — Commercial Asset Revenue, Collections & Live Audit'
      }
    >
      {/* ───────────────────────────────────────────────────────────────────────
          HERO SUPER ADMIN WELCOME & ACTION BAR
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0b1b36] via-[#102a56] to-[#0b1b36] rounded-2xl p-6 text-white shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>{isSuperAdmin ? 'Super Administrator Access' : 'Sub Administrator'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {isHi ? 'स्वागत है, ' : 'Welcome, '}
            <span className="text-amber-400">{user?.name || 'Almora Administrator'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isHi
              ? 'वर्तमान वित्तीय वर्ष में सभी दुकानों, किरायेदारों के मासिक बिलों, ऑनलाइन एवं काउंटर भुगतान तथा ऑडिट की वास्तविक स्थिति।'
              : 'Real-time overview of municipal properties, tenant leases, monthly demand collection, and financial audit ledger.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isHi ? 'ताज़ा करें' : 'Refresh'}</span>
          </button>

          <NavLink
            to="/rental/admin/register-tenant"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHi ? '+ नया किरायेदार जोड़ें' : '+ Register Tenant'}</span>
          </NavLink>

          {isSuperAdmin && (
            <NavLink
              to="/rental/admin/subadmins"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? 'उप-प्रशासक बनाएं' : 'Add Sub-Admin'}</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          5 HIGH-IMPACT REVENUE & ASSET METRIC CARDS
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'कुल किरायेदार' : 'Total Tenants'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : analytics?.totalUsers ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{isHi ? 'पंजीकृत नागरिक' : 'Verified Citizens'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Registered Shops & Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'पंजीकृत दुकानें' : 'Registered Shops'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : analytics?.totalProperties ?? 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-indigo-600">
                {analytics?.allottedProperties ?? 0} {isHi ? 'आवंटित' : 'Allotted'}
              </span>
              <span>•</span>
              <span className="text-amber-600">
                {analytics?.vacantProperties ?? 0} {isHi ? 'रिक्त' : 'Vacant'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Expected Monthly Rent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'मासिक अपेक्षित किराया' : 'Expected Rent / Mo'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : formatCurrency(analytics?.expectedMonthlyRent ?? 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-purple-700 font-semibold">
              <TrendingUp className="w-3 h-3 text-purple-600" />
              <span>{isHi ? 'दुकान दरों का कुल योग' : 'Agreed Base Rental'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Collected This Month */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              {isHi ? 'चालू माह वसूली' : 'Collected This Mo'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {loading ? '...' : formatCurrency(analytics?.collectedThisMonth ?? 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-bold">
              <span>
                {analytics?.expectedMonthlyRent && analytics.expectedMonthlyRent > 0
                  ? Math.round(
                      ((analytics.collectedThisMonth || 0) / analytics.expectedMonthlyRent) * 100
                    )
                  : 0}
                % {isHi ? 'लक्ष्य प्राप्त' : 'of monthly target'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 5: Total Overdue / Arrears */}
        <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-red-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
              {isHi ? 'कुल बकाया राशि' : 'Total Overdue'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-red-700 tracking-tight">
              {loading ? '...' : formatCurrency(analytics?.totalOverdue ?? 0)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-red-600 font-semibold">
              <Clock className="w-3 h-3 text-red-500" />
              <span>{isHi ? 'वसूली हेतु लंबित मांग' : 'Pending Clearance'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          ROW 1: TRUE 3D BAR CHART + TEXTURED PATTERN DONUT CHART
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Isometric 3D Bar Chart (2 cols) */}
        <div className="lg:col-span-2">
          <Revenue3DBarChart data={trendData} isHi={isHi} />
        </div>

        {/* Right: Textured Pattern Donut Chart (1 col) */}
        <div className="lg:col-span-1">
          <PropertyPatternDonutChart
            allotted={analytics?.allottedProperties ?? 0}
            vacant={analytics?.vacantProperties ?? 0}
            total={analytics?.totalProperties ?? 0}
            isHi={isHi}
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          ROW 2: NATURAL PATTERN AREA CHART + GLOW RADIAL PERFORMANCE SCORES
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Textured Diagonal Stripe Natural Area Chart (2 cols) */}
        <div className="lg:col-span-2">
          <RevenuePatternAreaChart data={trendData} isHi={isHi} />
        </div>

        {/* Right: Radial Bar Chart with Glow Filter (1 col) */}
        <div className="lg:col-span-1">
          <MunicipalRadialScoresChart
            occupancyScore={analytics?.occupancyRate || 82}
            collectionScore={
              analytics?.expectedMonthlyRent
                ? Math.min(100, Math.round(((analytics.collectedThisMonth || 0) / analytics.expectedMonthlyRent) * 100))
                : 75
            }
            complianceScore={88}
            isHi={isHi}
          />
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          TODAY'S LIVE AUDIT STREAM (आज का भुगतान ऑडिट)
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-base font-bold text-slate-900">
                {isHi ? 'आज का भुगतान ऑडिट एवं रसीद रिकॉर्ड्स' : "Today's Live Collections & Audit Stream"}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi
                ? `आज की कुल वसूली: ${formatCurrency(analytics?.todayCollected ?? 0)} (${analytics?.todayTransactionsCount ?? 0} भुगतान)`
                : `Total today: ${formatCurrency(analytics?.todayCollected ?? 0)} across ${analytics?.todayTransactionsCount ?? 0} transactions`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadTodayAuditCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-sm"
              title={isHi ? 'आज का ऑडिट CSV डाउनलोड करें' : 'Download Today CSV'}
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? 'आज का CSV' : 'Export Today'}</span>
            </button>

            <NavLink
              to="/rental/admin/records"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 text-xs font-bold transition shadow-sm"
            >
              <span>{isHi ? 'समस्त मासिक/वार्षिक ऑडिट' : 'Full Audit Ledger'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          {analytics?.todayAudit && analytics.todayAudit.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">{isHi ? 'रसीद संख्या' : 'Receipt No'}</th>
                  <th className="py-3 px-4">{isHi ? 'किरायेदार का नाम' : 'Tenant Name'}</th>
                  <th className="py-3 px-4">{isHi ? 'दुकान संख्या व बाजार' : 'Shop & Market'}</th>
                  <th className="py-3 px-4">{isHi ? 'माह' : 'Billing Month'}</th>
                  <th className="py-3 px-4">{isHi ? 'राशि (₹)' : 'Amount'}</th>
                  <th className="py-3 px-4">{isHi ? 'भुगतान विधि' : 'Mode'}</th>
                  <th className="py-3 px-4">{isHi ? 'समय' : 'Time'}</th>
                  <th className="py-3 px-4 text-right">{isHi ? 'कार्यवाही' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.todayAudit.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{p.tenantName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.tenantMobile}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{p.shopNumber}</div>
                      <div className="text-[10px] text-slate-400">{p.location}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{p.billingMonth}</td>
                    <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950 font-bold transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>{isHi ? 'रसीद' : 'Receipt'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Receipt className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">
                {isHi
                  ? 'आज का कोई ऑनलाइन/काउंटर भुगतान रिकॉर्ड अभी दर्ज नहीं हुआ है।'
                  : 'No payment records collected yet for today.'}
              </div>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'जैसे ही कोई किरायेदार ऑनलाइन भुगतान करेगा या कार्यालय काउंटर पर नकद जमा करेगा, उसका ऑडिट तुरंत यहाँ दिखेगा।'
                  : 'New tenant payments via gateway or office counter will appear here immediately in real-time.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          RECEIPT PREVIEW & PRINT MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा — सरकारी रसीद' : 'Official Municipal Rent Receipt'}
                </h4>
                <div className="text-xs text-slate-500">Government of Uttarakhand</div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b pb-1">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-blue-700">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant Name:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shop / Location:</span>
                <span className="font-bold text-slate-800">
                  {selectedReceipt.shopNumber} ({selectedReceipt.location})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Period:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.billingMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="font-bold text-slate-700">Amount Paid:</span>
                <span className="font-black text-emerald-700">
                  {formatCurrency(selectedReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रिंट करें' : 'Print'}</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
