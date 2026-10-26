import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalPaymentApi, AuditRecord } from '../services/rentalPayment.service';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building,
  Users,
  Receipt,
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';

export const RecordsAuditPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = `${currentYear}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  const [yearFilter, setYearFilter] = useState(currentYear);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedReceipt, setSelectedReceipt] = useState<AuditRecord | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await rentalPaymentApi.getAuditLedger({
        year: dateFilter ? undefined : yearFilter !== 'ALL' ? yearFilter : undefined,
        month: dateFilter ? undefined : monthFilter !== 'ALL' ? monthFilter : undefined,
        date: dateFilter || undefined,
        search: searchTerm.trim() || undefined,
        limit: 100,
      });

      if (res && res.data) {
        setRecords(res.data.records);
        setTotalAmount(res.data.totalAmount);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load audit records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [yearFilter, monthFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const formatCurrency = (amt: number) => {
    return '₹' + Number(amt || 0).toLocaleString('en-IN');
  };

  // One-click CSV Export
  const exportToCSV = () => {
    if (records.length === 0) {
      alert(isHi ? 'डाउनलोड करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records available to export.');
      return;
    }

    const headers = [
      'Date & Time',
      'Receipt Number',
      'Tenant Name',
      'Tenant Mobile',
      'Tenant Code',
      'Shop Number',
      'Location',
      'Property Type',
      'Billing Period',
      'Bill Number',
      'Amount (INR)',
      'Payment Mode',
      'Payment Reference',
    ];

    const rows = records.map((r) => [
      `"${new Date(r.date).toLocaleString('en-IN')}"`,
      r.receiptNumber,
      `"${r.tenantName}"`,
      r.tenantMobile,
      r.tenantCode,
      `"${r.shopNumber}"`,
      `"${r.location}"`,
      r.propertyType,
      r.billingMonth,
      r.billNumber,
      r.amount,
      r.paymentMethod,
      `"${r.paymentReference}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const periodLabel = dateFilter || monthFilter || yearFilter || 'All';
    link.setAttribute('download', `ZPA_Financial_Audit_Ledger_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group by payment method
  const onlineCount = records.filter((r) => !['CASH', 'CHEQUE_DD'].includes(r.paymentMethod)).length;
  const counterCount = records.length - onlineCount;

  return (
    <AdminLayout
      title={isHi ? 'वित्तीय रिकॉर्ड्स एवं ऑडिट लेजर' : 'Financial Records & Audit Ledger'}
      breadcrumbs={[{ label: isHi ? 'ऑडिट रिकॉर्ड्स' : 'Audit Records' }]}
    >
      {/* ───────────────────────────────────────────────────────────────────────
          PERIOD SUMMARY METRIC CARDS
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'चयनित अवधि की कुल वसूली' : 'Total Revenue Collected'}
            </span>

          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {loading ? '...' : formatCurrency(totalAmount)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isHi ? 'कुल प्रमाणित सरकारी रसीदें' : 'Official municipal receipts issued'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'कुल भुगतान संख्या' : 'Total Transactions'}
            </span>

          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {loading ? '...' : totalCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isHi ? 'लेजर प्रविष्टियां' : 'Ledger Entries'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'ऑनलाइन गेटवे भुगतान' : 'Online Payments'}
            </span>

          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-700 tracking-tight">
              {loading ? '...' : onlineCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              UPI / NetBanking / Cards
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isHi ? 'कार्यालय काउंटर वसूली' : 'Counter Cash / DD'}
            </span>

          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {loading ? '...' : counterCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isHi ? 'नकद / चेक / डिमांड ड्राफ्ट' : 'Cash / Cheque / DD at office'}
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          FILTER CONTROLS & EXPORT BAR
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Year Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50">
              <span className="font-bold text-slate-600">{isHi ? 'वर्ष:' : 'Year:'}</span>
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setDateFilter('');
                }}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="ALL">{isHi ? 'सभी वर्ष' : 'All Years'}</option>
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50">
              <span className="font-bold text-slate-600">{isHi ? 'माह:' : 'Month:'}</span>
              <select
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setDateFilter('');
                }}
                className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value={`${yearFilter}-10`}>{isHi ? 'अक्टूबर (Oct)' : 'October'}</option>
                <option value={`${yearFilter}-09`}>{isHi ? 'सितंबर (Sep)' : 'September'}</option>
                <option value={`${yearFilter}-08`}>{isHi ? 'अगस्त (Aug)' : 'August'}</option>
                <option value={`${yearFilter}-07`}>{isHi ? 'जुलाई (Jul)' : 'July'}</option>
                <option value={`${yearFilter}-06`}>{isHi ? 'जून (Jun)' : 'June'}</option>
                <option value={`${yearFilter}-05`}>{isHi ? 'मई (May)' : 'May'}</option>
                <option value={`${yearFilter}-04`}>{isHi ? 'अप्रैल (Apr)' : 'April'}</option>
                <option value={`${yearFilter}-03`}>{isHi ? 'मार्च (Mar)' : 'March'}</option>
                <option value={`${yearFilter}-02`}>{isHi ? 'फ़रवरी (Feb)' : 'February'}</option>
                <option value={`${yearFilter}-01`}>{isHi ? 'जनवरी (Jan)' : 'January'}</option>
                <option value="ALL">{isHi ? 'संपूर्ण वर्ष' : 'Full Year'}</option>
              </select>
            </div>

            {/* Specific Date Picker */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-300 bg-slate-50">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 outline-none cursor-pointer font-mono"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-slate-400 hover:text-slate-700 ml-1 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => {
                const todayStr = new Date().toISOString().slice(0, 10);
                setDateFilter(todayStr);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 font-bold"
            >
              {isHi ? 'आज का देखें' : 'Today Only'}
            </button>
          </div>

          {/* Right: Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              title="Download Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{isHi ? 'CSV डाउनलोड करें' : 'Download CSV'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट करें' : 'Print Statement'}</span>
            </button>
          </div>
        </div>

        {/* Tenant Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isHi
                  ? 'किरायेदार का नाम, मोबाइल नंबर, दुकान संख्या या रसीद संख्या से खोजें...'
                  : 'Search by tenant name, mobile, shop no, or receipt no...'
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-amber-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            {isHi ? 'खोजें' : 'Search'}
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchRecords();
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          AUDIT LEDGER TABLE
      ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {records.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">{isHi ? 'दिनांक एवं समय' : 'Date & Time'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'रसीद संख्या' : 'Receipt Number'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'किरायेदार' : 'Tenant Name'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'दुकान व बाजार' : 'Shop & Location'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'बिल माह' : 'Period'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'राशि (₹)' : 'Amount (₹)'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'भुगतान विधि' : 'Mode'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'ट्रांजेक्शन संदर्भ' : 'Ref / Txn ID'}</th>
                  <th className="py-3.5 px-4 text-right">{isHi ? 'रसीद' : 'Receipt'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      {new Date(r.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.date).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.tenantName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {r.tenantMobile} • {r.tenantCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-semibold">{r.shopNumber}</div>
                      <div className="text-[10px] text-slate-500">{r.location}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 font-semibold">
                      {r.billingMonth}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 max-w-[120px] truncate" title={r.gatewayRef}>
                      {r.gatewayRef}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-700 hover:text-slate-950 font-bold transition text-xs"
                      >
                        <Printer className="w-3 h-3" />
                        <span>{isHi ? 'रसीद' : 'View'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <Receipt className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-base font-bold text-slate-700">
                {isHi ? 'इस अवधि में कोई ऑडिट रिकॉर्ड नहीं मिला।' : 'No audit records match the selected filters.'}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isHi
                  ? 'कृपया फ़िल्टर में माह, वर्ष या किरायेदार का नाम बदलकर पुनः प्रयास करें।'
                  : 'Try selecting a different month, year, or clearing the search keyword.'}
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
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा — सरकारी किराया रसीद' : 'Official Municipal Rent Receipt'}
                </h4>
                <div className="text-xs text-slate-500">Government of Uttarakhand (Commercial Assets)</div>
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
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-800">{new Date(selectedReceipt.date).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant Name:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.tenantName} ({selectedReceipt.tenantCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shop / Location:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.shopNumber} • {selectedReceipt.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.billingMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{selectedReceipt.gatewayRef}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm">
                <span className="font-bold text-slate-700">Total Amount Paid:</span>
                <span className="font-black text-emerald-700">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'रसीद प्रिंट करें' : 'Print Receipt'}</span>
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

export default RecordsAuditPage;
