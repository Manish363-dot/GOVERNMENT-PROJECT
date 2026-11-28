import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  rentalBillingApi,
  RentManagementMonthlyRecord,
  RentManagementTenantCard,
} from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import { useAuth } from '../context/AuthContext';
import {
  OfficialStatutoryReceipt,
  StatutoryReceiptData,
} from '../components/OfficialStatutoryReceipt';

type PaymentModeOption = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE_DD';

const HI_MONTHS = [
  'जनवरी',
  'फरवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

interface SelectableMonthRow {
  billingMonth: string; // YYYY-MM
  year: number;
  month: number;
  baseRent: number;
  gstAmount: number;
  amount: number;
  status: 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID' | 'UPCOMING';
  isUpcoming: boolean;
}

const formatINR = (amount: number): string =>
  `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

const formatDateNumeric = (iso?: string | null): string => {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return '—';
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatHindiMonthLabel = (yyyyMm: string): string => {
  const [yStr, mStr] = yyyyMm.split('-');
  const idx = parseInt(mStr, 10) - 1;
  const hi = HI_MONTHS[idx];
  if (!hi) return yyyyMm;
  return `${hi} ${yStr}`;
};

const formatBillingPeriodHindi = (period: string): string => {
  if (!period) return '';
  return period
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(formatHindiMonthLabel)
    .join(', ');
};

export const CollectMultiRentPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialTenantFromState = (location.state as { tenant?: RentManagementTenantCard } | null)
    ?.tenant;

  const [tenant, setTenant] = useState<RentManagementTenantCard | null>(
    initialTenantFromState || null
  );
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(!initialTenantFromState);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [loadingYear, setLoadingYear] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentModeOption>('CASH');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(
    () => `MULTI-${(tenantId || 'T').slice(0, 8)}-${Date.now()}`
  );
  const [submitting, setSubmitting] = useState(false);

  // Issued Official Receipt state (replaces form view cleanly once collected)
  const [issuedReceipt, setIssuedReceipt] = useState<StatutoryReceiptData | null>(null);

  const loadTenantRecord = useCallback(async (silent = false) => {
    if (!tenantId) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await rentalBillingApi.getRentManagementOverview({ tenantId });
      if (res.success) {
        setCurrentMonth(res.data.currentMonth);
        setSelectedYear(res.data.currentYear);
        const found = res.data.tenants[0] || null;
        if (!found) {
          setError('संबंधित किरायेदार विवरण प्राप्त नहीं हुआ।');
        }
        setTenant(found);
      }
    } catch (err: any) {
      setError(err?.message || 'किरायेदार विवरण लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    // If tenant card was passed via navigation state, render instantaneously without redundant blocking fetch
    if (!initialTenantFromState) {
      loadTenantRecord();
    }
  }, [initialTenantFromState, loadTenantRecord]);

  // Build month rows: all non-paid, non-NOT_ALLOTTED records from tenant's ledger
  // UPCOMING months are shown for clarity ONLY and are strictly unselectable
  const monthRows = useMemo((): SelectableMonthRow[] => {
    if (!tenant?.shop) return [];

    const existingMap = new Map<string, RentManagementMonthlyRecord>();
    tenant.monthlyRecords.forEach((r) => existingMap.set(r.billingMonth, r));

    const rows: SelectableMonthRow[] = [];
    tenant.monthlyRecords.forEach((rec) => {
      if (rec.status === 'PAID' || rec.status === 'NOT_ALLOTTED') return;
      const isUpcoming = rec.status === 'UPCOMING' || rec.billingMonth > currentMonth;
      const baseRent = rec.rentAmount || tenant.shop!.monthlyRent;
      const amount =
        rec.balanceDue > 0
          ? rec.balanceDue
          : rec.totalAmountDue || Math.round(baseRent * 118) / 100;
      const gstAmount =
        typeof rec.gstAmount === 'number'
          ? rec.gstAmount
          : Math.max(0, Math.round((amount - baseRent) * 100) / 100);
      rows.push({
        billingMonth: rec.billingMonth,
        year: rec.year,
        month: rec.month,
        baseRent,
        gstAmount,
        amount,
        status: isUpcoming
          ? 'UPCOMING'
          : (rec.status as 'OVERDUE' | 'UNPAID' | 'PARTIALLY_PAID'),
        isUpcoming,
      });
    });

    return rows.sort((a, b) => a.billingMonth.localeCompare(b.billingMonth));
  }, [tenant, currentMonth]);

  // Pre-select all due (non-upcoming) months automatically when rows load
  useEffect(() => {
    if (monthRows.length === 0) return;
    const dueOnly = monthRows.filter((r) => !r.isUpcoming).map((r) => r.billingMonth);
    setSelectedMonths((prev) => {
      const validSet = new Set(dueOnly);
      const kept = prev.filter((m) => validSet.has(m));
      return kept.length > 0 ? kept : dueOnly;
    });
  }, [monthRows]);

  const toggleMonth = (row: SelectableMonthRow) => {
    if (row.isUpcoming) return; // Upcoming months cannot be selected
    setSelectedMonths((prev) =>
      prev.includes(row.billingMonth)
        ? prev.filter((m) => m !== row.billingMonth)
        : [...prev, row.billingMonth].sort()
    );
  };

  const selectedTotals = useMemo(() => {
    const map = new Map(monthRows.map((r) => [r.billingMonth, r]));
    return selectedMonths.reduce(
      (acc, m) => {
        const r = map.get(m);
        if (!r) return acc;
        return {
          base: Math.round((acc.base + r.baseRent) * 100) / 100,
          gst: Math.round((acc.gst + r.gstAmount) * 100) / 100,
          total: Math.round((acc.total + r.amount) * 100) / 100,
        };
      },
      { base: 0, gst: 0, total: 0 }
    );
  }, [monthRows, selectedMonths]);
  const selectedTotalPayable = selectedTotals.total;

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    if (!tenantId || !tenant) return;
    const alreadyLoaded = tenant.monthlyRecords.some((r) => r.year === year);
    if (alreadyLoaded) return;

    setLoadingYear(true);
    try {
      const res = await rentalBillingApi.getRentManagementOverview({ tenantId, year });
      if (res.success && res.data.tenants[0]) {
        const fresh = res.data.tenants[0];
        setTenant((prev) => {
          if (!prev) return fresh;
          const map = new Map(prev.monthlyRecords.map((r) => [r.billingMonth, r]));
          fresh.monthlyRecords.forEach((r) => map.set(r.billingMonth, r));
          return {
            ...prev,
            availableYears: fresh.availableYears,
            monthlyRecords: Array.from(map.values()).sort((a, b) =>
              a.billingMonth.localeCompare(b.billingMonth)
            ),
          };
        });
      }
    } catch (err: any) {
      setError(err?.message || `${year} का विवरण लोड करने में त्रुटि हुई।`);
    } finally {
      setLoadingYear(false);
    }
  };

  const selectableDueMonths = useMemo(
    () => monthRows.filter((r) => !r.isUpcoming),
    [monthRows]
  );

  const visibleYearRows = useMemo(
    () => monthRows.filter((r) => r.year === selectedYear),
    [monthRows, selectedYear]
  );

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tenant?.shop) {
      setError('इस किरायेदार को कोई सक्रिय दुकान आवंटित नहीं है।');
      return;
    }

    const validSelected = selectedMonths.filter((m) =>
      selectableDueMonths.some((due) => due.billingMonth === m)
    );

    if (validSelected.length === 0) {
      setError('कृपया भुगतान हेतु कम से कम 1 बकाया या चालू माह चुनें।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await rentalPaymentApi.collectMultiMonthPayment({
        userId: tenant.tenantId,
        propertyId: tenant.shop.propertyId,
        months: [...validSelected].sort(),
        paymentMethod,
        idempotencyKey,
      });

      if (res.success) {
        const d = res.data;
        setIssuedReceipt({
          receiptNumber: d.receiptNumber,
          tenantName: d.tenantName,
          shopNumber: d.shopNumber,
          location: d.location,
          amount: d.amountPaid,
          baseRentAmount: d.baseRentAmount,
          gstAmount: d.gstAmount,
          isFullPayment: true,
          billNumber: d.billNumber,
          billingMonth: formatBillingPeriodHindi(d.billingPeriod),
          place: 'अल्मोड़ा',
          dateStr: formatDateNumeric(d.issuedAt),
          collectorName: d.collectorName || user?.name || 'अधिकारी / लिपिक',
        });
        setIdempotencyKey(`MULTI-${tenant.tenantId.slice(0, 8)}-${Date.now()}`);
        loadTenantRecord(true);
      }
    } catch (err: any) {
      setError(err?.message || 'किराया वसूली दर्ज करने में त्रुटि हुई।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="किराया वसूली चालान"
      subtitle="जिला पंचायत अल्मोड़ा आधिकारिक मांग पत्र एवं वसूली प्रपत्र"
      hideBreadcrumbs={true}
      hideFooter={true}
    >
      <div className="max-w-4xl mx-auto space-y-5 pb-14 font-sans">
        {/* Top Navigation Bar */}
        <div className="no-print flex items-center justify-between gap-3 bg-white border border-slate-300 rounded-lg px-4 py-2.5 shadow-2xs">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/billing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>किराया प्रबंधन पर वापस लौटें</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
            <RefreshCw className="w-7 h-7 animate-spin text-[#0B3B60] mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              किराया चालान विवरण लोड हो रहा है...
            </p>
          </div>
        ) : issuedReceipt ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-black">
                    किराया सफलतापूर्वक जमा हो गया! रसीद संख्या: #{issuedReceipt.receiptNumber}
                  </p>
                  <p className="text-xs font-semibold text-emerald-700">
                    जमा राशि: {formatINR(issuedReceipt.amount)} • माह: {issuedReceipt.billingMonth}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/rental/admin/billing')}
                className="px-4 py-2 bg-[#0B3B60] hover:bg-[#072942] text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
              >
                किराया प्रबंधन सूची देखें
              </button>
            </div>

            <OfficialStatutoryReceipt
              data={issuedReceipt}
              onClose={() => navigate('/rental/admin/billing')}
            />
          </div>
        ) : !tenant || !tenant.shop ? (
          <div className="p-10 text-center bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <p className="text-sm font-bold text-slate-800">
              {error || 'इस किरायेदार का सक्रिय दुकान आवंटन उपलब्ध नहीं है।'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/rental/admin/billing')}
              className="px-4 py-2 bg-[#0B3B60] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              वापस लौटें
            </button>
          </div>
        ) : (
          /* Official Government Demand & Collection Challan Document (Pure Hindi + 1, 2, 3 numerals) */
          <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden text-slate-900">
            {/* 1. Official Government Header */}
            <div className="bg-[#0B3B60] text-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src="/assets/logo1.webp"
                      alt="उत्तराखण्ड शासन प्रतीक"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase text-amber-300">
                      उत्तराखण्ड शासन • पंचायती राज विभाग
                    </div>
                    <h2 className="text-base sm:text-xl font-extrabold text-white">
                      कार्यालय जिला पंचायत अल्मोड़ा
                    </h2>
                    <p className="text-xs text-slate-200 font-medium">
                      वाणिज्यिक परिसंपत्ति एवं किराया वसूली प्रकोष्ठ
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex w-14 h-14 bg-white rounded-lg p-1 items-center justify-center shadow-xs shrink-0">
                  <img
                    src="/assets/logo2.webp"
                    alt="पंचायती राज प्रतीक"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold text-amber-300">
                  वाणिज्यिक किराया मांग पत्र एवं वसूली चालान
                </span>
                <span className="font-mono text-slate-200">शासकीय राजस्व प्रपत्र</span>
              </div>
            </div>

            {/* 2. Metadata Strip */}
            <div className="bg-slate-100 border-b border-slate-300 px-6 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">किरायेदार कोड:</span>
                <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                  {tenant.tenantCode}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">दुकान संख्या:</span>
                <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                  {tenant.shop.shopCode}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">वसूली दिनांक:</span>
                <strong className="font-mono text-slate-900">{formatDateNumeric(new Date().toISOString())}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3.5 bg-red-50 border-l-4 border-red-600 rounded-r-lg text-red-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* भाग 1: किरायेदार एवं आवंटित संपत्ति विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold text-slate-800">
                  1. किरायेदार एवं आवंटित संपत्ति विवरण
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 text-xs bg-white">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">किरायेदार का नाम:</span>
                      <strong className="text-slate-950 font-bold text-sm">{tenant.fullName}</strong>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">मोबाइल नंबर:</span>
                      <span className="font-mono text-slate-900 font-semibold">{tenant.mobile}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">आवंटन दिनांक:</span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {formatDateNumeric(tenant.shop.allotmentDate)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">आवंटित दुकान:</span>
                      <strong className="text-indigo-950 font-bold text-right">
                        {tenant.shop.shopName} ({tenant.shop.shopCode})
                      </strong>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">बाजार / पता:</span>
                      <span className="text-slate-900 font-semibold text-right">
                        {tenant.shop.address || tenant.shop.location}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500">मासिक किराया:</span>
                      <strong className="font-mono text-slate-950 font-black text-sm">
                        {formatINR(tenant.shop.monthlyRent)} / माह (+ 18% GST)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* भाग 2: मांग एवं माह चयन विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    2. मांग एवं माह चयन विवरण
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="collect-year-select" className="text-[11px] font-bold text-slate-600">
                        वर्ष:
                      </label>
                      <select
                        id="collect-year-select"
                        value={selectedYear}
                        disabled={loadingYear}
                        onChange={(e) => handleYearChange(Number(e.target.value))}
                        className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B60] cursor-pointer disabled:opacity-60"
                      >
                        {(tenant.availableYears.length > 0
                          ? tenant.availableYears
                          : [selectedYear]
                        ).map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectableDueMonths.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedMonths(selectableDueMonths.map((m) => m.billingMonth))
                          }
                          className="rounded border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                        >
                          सभी बकाया चुनें
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMonths([])}
                          className="rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                        >
                          हटाएं
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {loadingYear ? (
                  <div className="p-6 text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0B3B60]" />
                    {selectedYear} के माह लोड हो रहे हैं...
                  </div>
                ) : visibleYearRows.length === 0 ? (
                  <div className="p-6 text-center text-xs font-bold text-emerald-700 bg-emerald-50">
                    वर्ष {selectedYear} के सभी लागू माह पहले ही जमा हो चुके हैं।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                          <th className="px-3.5 py-2.5 w-12 text-center font-bold">चुनें</th>
                          <th className="px-3.5 py-2.5 font-bold">बिलिंग माह</th>
                          <th className="px-3.5 py-2.5 font-bold">स्थिति</th>
                          <th className="px-3.5 py-2.5 font-bold text-right">मासिक किराया</th>
                          <th className="px-3.5 py-2.5 font-bold text-right">18% GST</th>
                          <th className="px-3.5 py-2.5 font-bold text-right">कुल देय राशि</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {visibleYearRows.map((row) => {
                          const checked = !row.isUpcoming && selectedMonths.includes(row.billingMonth);
                          const isOverdue = row.status === 'OVERDUE';

                          return (
                            <tr
                              key={row.billingMonth}
                              onClick={() => !row.isUpcoming && toggleMonth(row)}
                              className={`transition ${
                                row.isUpcoming
                                  ? 'bg-slate-50/70 text-slate-400 cursor-not-allowed'
                                  : checked
                                  ? 'bg-indigo-50/70 cursor-pointer'
                                  : 'hover:bg-slate-50 cursor-pointer'
                              }`}
                            >
                              <td className="px-3.5 py-2.5 text-center">
                                <input
                                  type="checkbox"
                                  disabled={row.isUpcoming}
                                  checked={checked}
                                  onChange={() => toggleMonth(row)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 rounded border-slate-400 text-[#0B3B60] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                              </td>
                              <td
                                className={`px-3.5 py-2.5 font-bold ${
                                  row.isUpcoming ? 'text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {formatHindiMonthLabel(row.billingMonth)}
                              </td>
                              <td className="px-3.5 py-2.5">
                                {row.isUpcoming ? (
                                  <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    आगामी (चयन योग्य नहीं)
                                  </span>
                                ) : isOverdue ? (
                                  <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                                    अतिदेय
                                  </span>
                                ) : (
                                  <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    देय
                                  </span>
                                )}
                              </td>
                              <td
                                className={`px-3.5 py-2.5 text-right font-mono font-semibold ${
                                  row.isUpcoming ? 'text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                {formatINR(row.baseRent)}
                              </td>
                              <td
                                className={`px-3.5 py-2.5 text-right font-mono font-semibold ${
                                  row.isUpcoming ? 'text-slate-400' : 'text-slate-700'
                                }`}
                              >
                                {formatINR(row.gstAmount)}
                              </td>
                              <td
                                className={`px-3.5 py-2.5 text-right font-mono font-bold ${
                                  row.isUpcoming ? 'text-slate-400' : 'text-slate-950'
                                }`}
                              >
                                {formatINR(row.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                        <tr>
                          <td colSpan={3} className="px-3.5 py-3 font-extrabold text-slate-900 text-right">
                            चयनित माह ({selectedMonths.length}) • कुल देय:
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800">
                            {formatINR(selectedTotals.base)}
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-800">
                            {formatINR(selectedTotals.gst)}
                          </td>
                          <td className="px-3.5 py-3 text-right font-mono font-black text-base text-[#0B3B60]">
                            {formatINR(selectedTotalPayable)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* भाग 3: भुगतान विवरण (केवल भुगतान का माध्यम — कोई विवरण या ट्रांजैक्शन आईडी नहीं) */}
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/70 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-slate-800 border-b border-slate-300 pb-2">
                  3. भुगतान विवरण
                </div>

                <div className="max-w-md">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    भुगतान का माध्यम (कैसे भुगतान प्राप्त हुआ) *
                  </label>
                  <select
                    value={paymentMethod}
                    disabled={selectableDueMonths.length === 0}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentModeOption)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3B60] cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="CASH">नकद (काउंटर)</option>
                    <option value="UPI">यूपीआई (ऑनलाइन)</option>
                    <option value="BANK_TRANSFER">बैंक ट्रांसफर</option>
                    <option value="CHEQUE_DD">चेक / ड्राफ्ट</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">  
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => navigate('/rental/admin/billing')}
                    className="px-5 py-2.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedMonths.length === 0}
                    className="px-6 py-2.5 bg-[#0B3B60] hover:bg-[#072942] text-white rounded-lg text-xs font-extrabold transition shadow-sm disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitting
                      ? 'वसूली दर्ज हो रही है...'
                      : 'वसूली दर्ज करें एवं रसीद बनाएं'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CollectMultiRentPage;
