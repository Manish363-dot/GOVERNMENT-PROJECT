import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  History,
  Phone,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import {
  rentalBillingApi,
  RentManagementMonthlyRecord,
  RentManagementOverviewResponse,
  RentManagementPaymentHistoryItem,
  RentManagementReceiptRef,
  RentManagementTenantCard,
} from '../services/rentalBilling.service';
import {
  OfficialStatutoryReceipt,
  StatutoryReceiptData,
} from '../components/OfficialStatutoryReceipt';

const MONTH_META = [
  { num: 1, short: 'Jan', hi: 'जनवरी' },
  { num: 2, short: 'Feb', hi: 'फरवरी' },
  { num: 3, short: 'Mar', hi: 'मार्च' },
  { num: 4, short: 'Apr', hi: 'अप्रैल' },
  { num: 5, short: 'May', hi: 'मई' },
  { num: 6, short: 'Jun', hi: 'जून' },
  { num: 7, short: 'Jul', hi: 'जुलाई' },
  { num: 8, short: 'Aug', hi: 'अगस्त' },
  { num: 9, short: 'Sep', hi: 'सितंबर' },
  { num: 10, short: 'Oct', hi: 'अक्टूबर' },
  { num: 11, short: 'Nov', hi: 'नवंबर' },
  { num: 12, short: 'Dec', hi: 'दिसंबर' },
];

const formatINR = (amount: number): string =>
  `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

const formatDate = (iso?: string | null, isHi?: boolean): string => {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatMonthLabel = (yyyyMm: string, isHi: boolean): string => {
  const [yStr, mStr] = yyyyMm.split('-');
  const mIdx = parseInt(mStr, 10) - 1;
  const meta = MONTH_META[mIdx];
  if (!meta) return yyyyMm;
  return `${isHi ? meta.hi : meta.short} ${yStr}`;
};

const formatBillingPeriodDisplay = (period: string, isHi: boolean): string => {
  if (!period) return '';
  return period
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => formatMonthLabel(p, isHi))
    .join(', ');
};

const formatPaymentMethodLabel = (method: string, isHi: boolean): string => {
  switch (method) {
    case 'CASH':
      return isHi ? 'नकद' : 'Cash';
    case 'UPI':
      return isHi ? 'यूपीआई' : 'UPI';
    case 'BANK_TRANSFER':
    case 'NEFT_RTGS':
      return isHi ? 'बैंक ट्रांसफर' : 'Bank Transfer';
    case 'CHEQUE_DD':
      return isHi ? 'चेक / डीडी' : 'Cheque / DD';
    case 'POS_MACHINE':
      return isHi ? 'पीओएस कार्ड' : 'POS Card';
    default:
      return method;
  }
};

export const BillingManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const canCollectRent = Boolean(
    user && (user.role === 'SUPER_ADMIN' || user.role === 'SUB_ADMIN' || user.adminRole)
  );

  const initialOverview = api.peekCache<{ success: boolean; data: RentManagementOverviewResponse }>(
    '/rental/bills/management-overview'
  )?.data ?? null;
  const [overview, setOverview] = useState<RentManagementOverviewResponse | null>(initialOverview);
  const [loading, setLoading] = useState(!initialOverview);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Card UI state
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [activeTabByTenant, setActiveTabByTenant] = useState<
    Record<string, 'LEDGER' | 'HISTORY'>
  >({});
  const [selectedYearByTenant, setSelectedYearByTenant] = useState<Record<string, number>>({});
  const [loadingYearByTenant, setLoadingYearByTenant] = useState<Record<string, boolean>>({});

  // Generate Monthly Bills Modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genMonth, setGenMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [generating, setGenerating] = useState(false);

  // Official Receipt Modal (uses exact portal OfficialStatutoryReceipt)
  const [receiptModalData, setReceiptModalData] = useState<StatutoryReceiptData | null>(null);

  // Notification banner
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const fetchOverview = useCallback(
    async (silent = false) => {
      if (silent) {
        api.invalidateCache('/rental/bills/management-overview');
        setRefreshing(true);
      } else if (!overview) {
        setLoading(true);
      }
      try {
        const res = await rentalBillingApi.getRentManagementOverview();
        if (res.success) {
          const data = res.data;
          setOverview(data);

          setExpandedCards((prev) => {
            const next = { ...prev };
            data.tenants.forEach((t) => {
              if (next[t.tenantId] === undefined) {
                next[t.tenantId] = false;
              }
            });
            return next;
          });

          setSelectedYearByTenant((prev) => {
            const next = { ...prev };
            data.tenants.forEach((t) => {
              const prevYr = next[t.tenantId];
              const hasPrevLoaded = prevYr && t.monthlyRecords.some((r) => r.year === prevYr);
              if (!hasPrevLoaded) {
                next[t.tenantId] = t.availableYears.includes(data.currentYear)
                  ? data.currentYear
                  : t.availableYears[0] || data.currentYear;
              }
            });
            return next;
          });
        }
      } catch (err: any) {
        showNotice(
          'error',
          err?.message || (isHi ? 'किराया डेटा लोड करने में त्रुटि हुई' : 'Failed to load rent records')
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showNotice, isHi]
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Instantaneous 0ms client-side search & status filtering
  const filteredTenants = useMemo(() => {
    if (!overview) return [];
    let list = overview.tenants;
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.mobile.toLowerCase().includes(q) ||
          t.tenantCode.toLowerCase().includes(q) ||
          (t.shop?.shopCode || '').toLowerCase().includes(q) ||
          (t.shop?.shopName || '').toLowerCase().includes(q) ||
          (t.shop?.address || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter((t) => {
        if (statusFilter === 'UNPAID') {
          return ['UNPAID', 'OVERDUE', 'PARTIALLY_PAID'].includes(t.summary.paymentStatus);
        }
        return t.summary.paymentStatus === statusFilter;
      });
    }
    return list;
  }, [overview, searchTerm, statusFilter]);

  const filteredSummary = useMemo(() => {
    return {
      totalTenants: filteredTenants.length,
      totalRent: filteredTenants.reduce((s, t) => s + t.summary.totalRent, 0),
      totalPaid: filteredTenants.reduce((s, t) => s + t.summary.totalPaid, 0),
      totalOutstanding: filteredTenants.reduce((s, t) => s + t.summary.outstandingAmount, 0),
      overdueTenantsCount: filteredTenants.filter((t) => t.summary.overdueMonthsCount > 0).length,
    };
  }, [filteredTenants]);

  const handleSelectYear = useCallback(
    async (tenantId: string, year: number) => {
      setSelectedYearByTenant((prev) => ({
        ...prev,
        [tenantId]: year,
      }));

      const targetTenant = overview?.tenants.find((t) => t.tenantId === tenantId);
      const alreadyLoaded = targetTenant?.monthlyRecords.some((r) => r.year === year);
      if (alreadyLoaded) return;

      setLoadingYearByTenant((prev) => ({ ...prev, [tenantId]: true }));
      try {
        const res = await rentalBillingApi.getRentManagementOverview({
          tenantId,
          year,
        });
        if (res.success) {
          const freshTenant = res.data.tenants.find((t) => t.tenantId === tenantId);
          if (freshTenant) {
            setOverview((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                tenants: prev.tenants.map((t) => {
                  if (t.tenantId !== tenantId) return t;
                  const existingMap = new Map(t.monthlyRecords.map((r) => [r.billingMonth, r]));
                  freshTenant.monthlyRecords.forEach((r) => {
                    existingMap.set(r.billingMonth, r);
                  });
                  return {
                    ...t,
                    availableYears: freshTenant.availableYears,
                    monthlyRecords: Array.from(existingMap.values()).sort((a, b) =>
                      a.billingMonth.localeCompare(b.billingMonth)
                    ),
                  };
                }),
              };
            });
          }
        }
      } catch (err: any) {
        showNotice(
          'error',
          err?.message ||
            (isHi ? `${year} का लेजर लोड करने में त्रुटि हुई` : `Failed to load ${year} ledger`)
        );
      } finally {
        setLoadingYearByTenant((prev) => ({ ...prev, [tenantId]: false }));
      }
    },
    [overview, showNotice, isHi]
  );

  const handleGenerateBills = async () => {
    if (!genMonth) return;
    setGenerating(true);
    try {
      const res = await rentalBillingApi.generateMonthlyBills(genMonth);
      showNotice(
        'success',
        res.message ||
          (isHi
            ? `${formatMonthLabel(genMonth, true)} के बिल जनरेट हो गए`
            : `Bills generated for ${formatMonthLabel(genMonth, false)}`)
      );
      setShowGenModal(false);
      await fetchOverview(true);
    } catch (err: any) {
      showNotice(
        'error',
        err?.message || (isHi ? 'मासिक बिल जनरेट करने में त्रुटि' : 'Failed to generate monthly bills')
      );
    } finally {
      setGenerating(false);
    }
  };

  const openReceiptFromRef = (
    tenant: RentManagementTenantCard,
    receipt: RentManagementReceiptRef
  ) => {
    setReceiptModalData({
      receiptNumber: receipt.receiptNumber,
      tenantName: tenant.fullName,
      shopNumber: tenant.shop?.shopCode || '—',
      location: tenant.shop?.address || tenant.shop?.location || 'अल्मोड़ा',
      amount: receipt.amountPaid,
      baseRentAmount: receipt.baseRentAmount,
      gstAmount: receipt.gstAmount,
      isFullPayment: true,
      billNumber: receipt.billNumber,
      billingMonth: formatBillingPeriodDisplay(receipt.billingPeriod, isHi),
      place: 'अल्मोड़ा',
      dateStr: formatDate(receipt.issuedAt, isHi),
      collectorName: receipt.collectorName || (isHi ? 'जिला पंचायत कार्यालय' : 'Zila Panchayat Office'),
    });
  };

  const openReceiptFromHistory = (
    tenant: RentManagementTenantCard,
    item: RentManagementPaymentHistoryItem
  ) => {
    setReceiptModalData({
      receiptNumber: item.receiptNumber,
      tenantName: tenant.fullName,
      shopNumber: tenant.shop?.shopCode || '—',
      location: tenant.shop?.address || tenant.shop?.location || 'अल्मोड़ा',
      amount: item.amountPaid,
      baseRentAmount: item.baseRentAmount,
      gstAmount: item.gstAmount,
      isFullPayment: true,
      billNumber: item.billNumber,
      billingMonth: formatBillingPeriodDisplay(item.billingPeriod, isHi),
      place: 'अल्मोड़ा',
      dateStr: formatDate(item.paidAt, isHi),
      collectorName: item.collectorName || (isHi ? 'जिला पंचायत कार्यालय' : 'Zila Panchayat Office'),
    });
  };

  const toggleAllCards = (expand: boolean) => {
    if (!overview) return;
    const next: Record<string, boolean> = {};
    overview.tenants.forEach((t) => {
      next[t.tenantId] = expand;
    });
    setExpandedCards(next);
  };

  return (
    <AdminLayout
      title={isHi ? 'किराया प्रबंधन पोर्टल' : 'Rent Management'}
      subtitle={
        isHi
          ? 'किरायेदार-वार मासिक लेजर, बहु-मासिक किराया संग्रह एवं स्थायी पीडीएफ रसीद प्रणाली'
          : 'Tenant-wise monthly rent ledger, multi-month collection & permanent PDF receipts'
      }
      hideBreadcrumbs={true}
      hideFooter={true}
    >
      <div className="space-y-6 pb-10">
        {notice && (
          <div
            className={`rounded-xl border px-4 py-3 text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
              notice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="text-current opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Navy Header Banner (#0B1B36 theme) */}
        <div className="rounded-xl bg-[#0B1B36] p-5 sm:p-6 text-white shadow-sm border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {isHi ? 'किराया प्रबंधन एवं मासिक डेटा' : 'Rent Management & Monthly Data'}
              </h1>
            </div>
          </div>

          {/* Executive Summary KPI Strip */}
          {overview && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="rounded-lg bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-slate-300">
                  {isHi ? 'कुल किरायेदार' : 'Total Tenants'}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {filteredSummary.totalTenants}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-slate-300">
                  {isHi ? 'कुल देय किराया' : 'Total Rent'}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {formatINR(filteredSummary.totalRent)}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-slate-300">
                  {isHi ? 'कुल प्राप्त राशि' : 'Total Paid'}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {formatINR(filteredSummary.totalPaid)}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-slate-300">
                  {isHi ? 'कुल बकाया राशि' : 'Outstanding Dues'}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {formatINR(filteredSummary.totalOutstanding)}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-lg bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-[11px] font-bold uppercase text-slate-300">
                  {isHi ? 'अतिदेय खाते' : 'Overdue Accounts'}
                </p>
                <p className="mt-1 text-xl sm:text-2xl font-black text-white">
                  {filteredSummary.overdueTenantsCount}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search & Status Filter Bar */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isHi
                  ? 'किरायेदार नाम, मोबाइल, आईडी, दुकान नाम या दुकान कोड से खोजें...'
                  : 'Search by tenant name, phone, tenant ID, shop name or shop code...'
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#0B1B36] focus:bg-white focus:outline-none transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                title={isHi ? 'खोज हटाएं' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filteredTenants.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                <button
                  type="button"
                  onClick={() => toggleAllCards(true)}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isHi ? 'सभी खोलें' : 'Expand All'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllCards(false)}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {isHi ? 'सभी बंद करें' : 'Collapse All'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-slate-200 p-6 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-slate-200 rounded" />
                      <div className="h-3 w-32 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-36 bg-slate-200 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-16 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !overview || filteredTenants.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-base font-extrabold text-slate-800">
              {isHi ? 'कोई किरायेदार रिकॉर्ड नहीं मिला' : 'No Tenant Rent Records Found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              {isHi
                ? 'खोज शब्द या फ़िल्टर बदलें, या नया किरायेदार और दुकान आवंटन पंजीकृत करें।'
                : 'Adjust your search query or filters, or register a tenant and shop allotment.'}
            </p>
          </div>
        ) : (
          /* Tenant Cards Stack */
          <div className="space-y-5">
            {filteredTenants.map((tenant) => {
              const isExpanded = expandedCards[tenant.tenantId] ?? false;
              const activeTab = activeTabByTenant[tenant.tenantId] || 'LEDGER';
              const activeYear = selectedYearByTenant[tenant.tenantId] || overview.currentYear;

              const yearMonths = tenant.monthlyRecords
                .filter((m) => m.year === activeYear)
                .sort((a, b) => a.month - b.month);

              return (
                <div
                  key={tenant.tenantId}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Top Card Band */}
                  <div className="border-b border-slate-200 bg-white p-5">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      {/* Tenant Identity & Shop Details */}
                      <div className="flex items-start gap-4">
                        {tenant.profilePhotoUrl ? (
                          <img
                            src={tenant.profilePhotoUrl}
                            alt={tenant.fullName}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#0B1B36] text-white flex items-center justify-center text-lg font-black shrink-0">
                            {(tenant.fullName || 'T').charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="space-y-1 min-w-0">
                          <h2 className="text-lg font-black text-[#0B1B36]">
                            {tenant.fullName}
                          </h2>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {tenant.mobile}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {canCollectRent && tenant.shop && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/rental/admin/collect-multi/${tenant.tenantId}`, {
                                state: { tenant },
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B36] hover:bg-[#142D57] text-white px-4 py-2.5 text-[16px] font-extrabold shadow-md shadow-slate-900/15 transition cursor-pointer"
                          >
                            {isHi ? 'किराया जमा करें' : 'Collect Rent'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCards((prev) => ({
                              ...prev,
                              [tenant.tenantId]: !isExpanded,
                            }))
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-[16px] font-bold text-slate-700 transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <>
                              {isHi ? 'छुपाएं' : 'Hide'}{' '}
                              <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              {isHi ? 'इतिहास' : 'History'}{' '}
                              <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Financial Summary Strip */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          {isHi ? 'कुल किराया' : 'Total Rent'}
                        </p>
                        <p className="mt-0.5 text-base font-black text-slate-900">
                          {formatINR(tenant.summary.totalRent)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          {isHi ? 'कुल जमा' : 'Total Paid'}
                        </p>
                        <p className="mt-0.5 text-base font-black text-slate-900">
                          {formatINR(tenant.summary.totalPaid)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          {isHi ? 'बकाया राशि' : 'Outstanding'}
                        </p>
                        <p
                          className={`mt-0.5 text-base font-black ${
                            tenant.summary.outstandingAmount > 0
                              ? 'text-red-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {formatINR(tenant.summary.outstandingAmount)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5">
                        <p className="text-[11px] font-bold uppercase text-slate-500">
                          {isHi ? 'अतिदेय माह' : 'Overdue Months'}
                        </p>
                        <p
                          className={`mt-0.5 text-base font-black ${
                            tenant.summary.overdueMonthsCount > 0
                              ? 'text-red-700'
                              : 'text-slate-900'
                          }`}
                        >
                          {tenant.summary.overdueMonthsCount} {isHi ? 'माह' : 'months'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Year-Wise Ledger & Payment History Section */}
                  {isExpanded && (
                    <div className="p-5 bg-white space-y-4">
                      {/* Sub-navigation Tabs + Year Dropdown */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveTabByTenant((prev) => ({
                                ...prev,
                                [tenant.tenantId]: 'LEDGER',
                              }))
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                              activeTab === 'LEDGER'
                                ? 'bg-[#0B1B36] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isHi
                              ? `मासिक किराया डेटा`
                              : `Monthly-Wise Data`}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveTabByTenant((prev) => ({
                                ...prev,
                                [tenant.tenantId]: 'HISTORY',
                              }))
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition cursor-pointer ${
                              activeTab === 'HISTORY'
                                ? 'bg-[#0B1B36] text-white shadow-sm'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {isHi
                              ? `भुगतान इतिहास`
                              : `Payment History`}
                          </button>
                        </div>

                        {activeTab === 'LEDGER' && (
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`year-select-${tenant.tenantId}`}
                              className="text-[11px] font-bold text-slate-500"
                            >
                              {isHi ? 'वर्ष:' : 'Year:'}
                            </label>
                            <select
                              id={`year-select-${tenant.tenantId}`}
                              value={activeYear}
                              onChange={(e) =>
                                handleSelectYear(tenant.tenantId, Number(e.target.value))
                              }
                              disabled={Boolean(loadingYearByTenant[tenant.tenantId])}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-[#0B1B36] focus:border-[#0B1B36] focus:bg-white focus:outline-none cursor-pointer disabled:opacity-60"
                            >
                              {tenant.availableYears.map((yr) => (
                                <option key={yr} value={yr}>
                                  {yr}
                                </option>
                              ))}
                            </select>
                            {loadingYearByTenant[tenant.tenantId] && (
                              <RefreshCw className="w-3.5 h-3.5 text-[#0B1B36] animate-spin" />
                            )}
                          </div>
                        )}
                      </div>

                      {activeTab === 'LEDGER' ? (
                        loadingYearByTenant[tenant.tenantId] ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#0B1B36]" />
                            {isHi
                              ? `${activeYear} का मासिक लेजर लोड हो रहा है...`
                              : `Loading ${activeYear} monthly ledger...`}
                          </div>
                        ) : (
                          (() => {
                            const visibleYearMonths = MONTH_META.map((meta) => ({
                              meta,
                              rec: yearMonths.find((r) => r.month === meta.num),
                            })).filter(
                              (
                                item
                              ): item is {
                                meta: (typeof MONTH_META)[number];
                                rec: RentManagementMonthlyRecord;
                              } => Boolean(item.rec && item.rec.status !== 'NOT_ALLOTTED')
                            );

                            if (visibleYearMonths.length === 0) {
                              return (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs font-semibold text-slate-500">
                                  {isHi
                                    ? `वर्ष ${activeYear} के लिए कोई सक्रिय बिलिंग माह उपलब्ध नहीं है`
                                    : `No active billing months for ${activeYear}`}
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                {visibleYearMonths.map(({ meta, rec }) => {
                                  const isPaid = rec.status === 'PAID';
                                  const isOverdue = rec.status === 'OVERDUE';
                                  const isUnpaid =
                                    rec.status === 'UNPAID' || rec.status === 'PARTIALLY_PAID';
                                  const isUpcoming = rec.status === 'UPCOMING';

                                  let cardTheme = 'border-slate-200 bg-white';
                                  let badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                                  let statusLabel = isHi ? 'आगामी' : 'Upcoming';

                                  if (isPaid) {
                                    cardTheme = 'border-slate-200 bg-white';
                                    badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                                    statusLabel = isHi ? 'जमा' : 'Paid';
                                  } else if (isOverdue) {
                                    cardTheme = 'border-slate-200 bg-white';
                                    badgeClass = 'bg-red-50 text-red-700 border border-red-200';
                                    statusLabel = isHi ? 'अतिदेय' : 'Overdue';
                                  } else if (isUnpaid) {
                                    cardTheme = 'border-slate-200 bg-white';
                                    badgeClass = 'bg-slate-100 text-slate-700 border border-slate-300';
                                    statusLabel =
                                      rec.status === 'PARTIALLY_PAID'
                                        ? isHi
                                          ? 'आंशिक'
                                          : 'Partial'
                                        : isHi
                                        ? 'देय'
                                        : 'Unpaid';
                                  } else if (isUpcoming) {
                                    cardTheme = 'border-slate-200 bg-slate-50';
                                    badgeClass = 'bg-slate-100 text-slate-500 border border-slate-200';
                                    statusLabel = isHi ? 'आगामी' : 'Upcoming';
                                  }

                                  return (
                                    <div
                                      key={rec.billingMonth}
                                      className={`rounded-lg border p-2.5 flex flex-col justify-between gap-1.5 ${cardTheme}`}
                                    >
                                      <div>
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[11px] font-bold text-[#0B1B36] leading-tight">
                                            {isHi ? meta.hi : meta.short} {String(activeYear).slice(-2)}
                                          </span>
                                          <span
                                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold leading-none ${badgeClass}`}
                                          >
                                            {statusLabel}
                                          </span>
                                        </div>

                                        <div className="mt-1.5 flex flex-col gap-0.5">
                                          <span className="text-xs font-black text-slate-900">
                                            {isPaid
                                              ? formatINR(rec.amountPaid || rec.rentAmount)
                                              : formatINR(rec.balanceDue || rec.totalAmountDue || rec.rentAmount)}
                                          </span>
                                          {(rec.gstAmount ?? 0) > 0 && (
                                            <span className="text-[9px] font-semibold text-slate-500 leading-tight">
                                              ({formatINR(rec.rentAmount)} + 18% GST)
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Calendar cards never show Pay Now button — only Paid months provide permanent PDF Receipt */}
                                      {isPaid && rec.receipt ? (
                                        <button
                                          type="button"
                                          onClick={() => openReceiptFromRef(tenant, rec.receipt!)}
                                          className="w-full inline-flex items-center justify-center gap-1 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 px-1.5 py-1 text-[10px] font-bold transition cursor-pointer truncate"
                                          title={
                                            isHi
                                              ? `पीडीएफ रसीद #${rec.receipt.receiptNumber} डाउनलोड करें`
                                              : `Download PDF Receipt #${rec.receipt.receiptNumber}`
                                          }
                                        >
                                          <Download className="w-2.5 h-2.5 shrink-0 text-slate-600" />
                                          <span className="truncate">
                                            #{rec.receipt.receiptNumber}
                                          </span>
                                        </button>
                                      ) : isUpcoming ? (
                                        <span className="text-[10px] font-medium text-slate-400">
                                          {isHi ? 'आगामी माह' : 'Scheduled'}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-medium text-slate-500">
                                          {isHi ? 'भुगतान शेष' : 'Pending'}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()
                        )
                      ) : /* Payment History Tab */
                      tenant.paymentHistory.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                          <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-600">
                            {isHi
                              ? 'अभी तक कोई भुगतान रिकॉर्ड नहीं है'
                              : 'No Payments Recorded Yet'}
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#0B1B36] text-white">
                              <tr>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">
                                  {isHi ? 'रसीद संख्या' : 'Receipt No.'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">
                                  {isHi ? 'दिनांक' : 'Date'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">
                                  {isHi ? 'भुगतान माह' : 'Months Paid'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">
                                  {isHi ? 'भुगतान माध्यम' : 'Payment Mode'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider">
                                  {isHi ? 'संग्रहकर्ता' : 'Collector'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">
                                  {isHi ? 'राशि' : 'Amount'}
                                </th>
                                <th className="px-4 py-3 font-bold uppercase tracking-wider text-center">
                                  {isHi ? 'पीडीएफ रसीद' : 'PDF Receipt'}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {tenant.paymentHistory.map((item) => (
                                <tr key={item.paymentId} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-3 font-extrabold text-[#0B1B36] font-mono">
                                    #{item.receiptNumber}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                                    {formatDate(item.paidAt, isHi)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {item.paidMonths.length > 0 ? (
                                        item.paidMonths.map((pm) => (
                                          <span
                                            key={pm}
                                            className="rounded bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 text-[11px] font-semibold"
                                          >
                                            {formatMonthLabel(pm, isHi)}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-slate-500">—</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                      {formatPaymentMethodLabel(item.paymentMethod, isHi)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-slate-600">
                                    {item.collectorName || (isHi ? 'प्रशासक' : 'Admin')}
                                  </td>
                                  <td className="px-4 py-3 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                                    {formatINR(item.amountPaid)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => openReceiptFromHistory(tenant, item)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1B36] hover:bg-[#142D57] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition cursor-pointer"
                                    >
                                      {isHi ? 'रसीद / PDF' : 'View / PDF'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Monthly Bills Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0B1B36] px-6 py-4 text-white flex items-center justify-between">
              <h3 className="text-base font-black">
                {isHi ? 'मासिक बिल जनरेट करें' : 'Generate Monthly Bills'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                {isHi
                  ? 'आवंटित किरायेदारों के लिए चयनित माह का अलग मासिक बिल बनाएं। पहले से बने बिल दोबारा नहीं बनेंगे।'
                  : 'Create separate monthly rent bills for active allotted tenants for the chosen month. Existing bills are skipped automatically.'}
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? 'बिलिंग माह चुनें' : 'Select Billing Month'}
                </label>
                <input
                  type="month"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-[#0B1B36] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={generating}
                  onClick={handleGenerateBills}
                  className="rounded-xl bg-[#0B1B36] hover:bg-[#142D57] text-white px-5 py-2 text-xs font-extrabold cursor-pointer disabled:opacity-60"
                >
                  {generating
                    ? isHi
                      ? 'जनरेट हो रहा है...'
                      : 'Generating...'
                    : isHi
                    ? 'बिल जनरेट करें'
                    : 'Generate Bills'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Statutory Receipt Modal (Exact Form 5 Portal Receipt with PDF Download) */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto">
            <OfficialStatutoryReceipt
              data={receiptModalData}
              onClose={() => setReceiptModalData(null)}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
