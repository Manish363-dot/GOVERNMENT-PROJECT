import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  rentalBillingApi,
  BillListItem,
} from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import { rentalUserApi, TenantListItem } from '../services/rentalUser.service';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  Printer,
  Receipt,
  UserCheck,
  ShieldCheck,
  DollarSign,
  PlusCircle,
  Clock,
  User,
  Store,
  X,
  ChevronRight,
  Wallet,
} from 'lucide-react';

export const BillingManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const [bills, setBills] = useState<BillListItem[]>([]);
  const [allRawBills, setAllRawBills] = useState<BillListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [billingMonthFilter, setBillingMonthFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Generate Bills Form
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [generateMonth, setGenerateMonth] = useState(currentMonthStr);
  const [generating, setGenerating] = useState(false);

  // Tenant Counter Search & Selection State
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [tenantSearchResults, setTenantSearchResults] = useState<TenantListItem[]>([]);
  const [searchingTenants, setSearchingTenants] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | null>(null);
  const [tenantBills, setTenantBills] = useState<BillListItem[]>([]);
  const [loadingTenantBills, setLoadingTenantBills] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.listBills({
        search,
        status: 'ALL',
        billingMonth: billingMonthFilter || undefined,
        page: 1,
        limit: 100,
      });
      const rawBills = res.data.data || [];
      setAllRawBills(rawBills);

      // Group bills by tenant so that:
      // 1. If a tenant has ANY unpaid month up to the current month, their already-paid monthly rows are NOT shown,
      //    and their status remains PENDING / DUE until all months up to current month are collected.
      // 2. Only when ALL months of a tenant up to the current month are paid does the tenant show as PAID.
      const byTenant = new Map<string, BillListItem[]>();
      for (const b of rawBills) {
        const tId = b.tenant?.id || b.id;
        if (!byTenant.has(tId)) byTenant.set(tId, []);
        byTenant.get(tId)!.push(b);
      }

      const consolidated: BillListItem[] = [];
      for (const [, tBills] of byTenant.entries()) {
        const unpaidList = tBills.filter((b) => b.balanceDue > 0 || b.status !== 'PAID');
        if (unpaidList.length > 0) {
          // Tenant still has unpaid month(s) — do NOT show their paid months!
          // Show only their unpaid bill(s) with status forced to PENDING/PARTIALLY_PAID/OVERDUE
          for (const ub of unpaidList) {
            consolidated.push({
              ...ub,
              status: ub.status === 'PAID' ? 'PENDING' : ub.status,
            });
          }
        } else if (tBills.length > 0) {
          // Every single month up to current month is PAID — show 1 consolidated PAID row (latest month)
          consolidated.push(tBills[0]);
        }
      }

      const filtered =
        statusFilter === 'ALL'
          ? consolidated
          : consolidated.filter((b) => b.status === statusFilter);

      setBills(filtered);
      setTotal(filtered.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, statusFilter, billingMonthFilter]);

  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    try {
      const res = await rentalBillingApi.generateMonthlyBills(generateMonth);
      setSuccessMsg(res.message);
      setIsGenerateModalOpen(false);
      fetchBills();
    } catch (err: any) {
      setError(err.message || 'Failed to generate monthly bills.');
    } finally {
      setGenerating(false);
    }
  };



  const handleSearchTenants = async (q: string) => {
    setTenantSearchQuery(q);
    if (!q.trim() || q.trim().length < 2) {
      setTenantSearchResults([]);
      return;
    }
    setSearchingTenants(true);
    try {
      const res = await rentalUserApi.listTenants({ search: q.trim(), limit: 10, page: 1 });
      setTenantSearchResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingTenants(false);
    }
  };

  const filterTenantBillsForDisplay = (allList: BillListItem[]): BillListItem[] => {
    const unpaid = allList.filter((b) => b.balanceDue > 0 || b.status !== 'PAID');
    // If tenant still has unpaid months, hide already-paid months so status stays PENDING/DUE until all months are collected
    if (unpaid.length > 0) {
      return unpaid;
    }
    return allList.slice(0, 1);
  };

  const handleSelectTenant = async (tenant: TenantListItem) => {
    setSelectedTenant(tenant);
    setTenantSearchResults([]);
    setTenantSearchQuery('');
    setLoadingTenantBills(true);
    try {
      const res = await rentalBillingApi.listBills({ userId: tenant.id, limit: 50 });
      setTenantBills(filterTenantBillsForDisplay(res.data.data || []));
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant bills.');
    } finally {
      setLoadingTenantBills(false);
    }
  };

  const refreshSelectedTenantBills = async (userId: string) => {
    try {
      const res = await rentalBillingApi.listBills({ userId, limit: 50 });
      setTenantBills(filterTenantBillsForDisplay(res.data.data || []));
      const updatedTenant = await rentalUserApi.getTenantDetails(userId);
      if (updatedTenant && updatedTenant.data) {
        setSelectedTenant((prev) =>
          prev
            ? {
              ...prev,
              outstandingBalance: updatedTenant.data.outstanding_balance ?? prev.outstandingBalance,
            }
            : null
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSelectedTenant = () => {
    setSelectedTenant(null);
    setTenantBills([]);
    setTenantSearchQuery('');
    setTenantSearchResults([]);
  };

  const handleOpenInvoiceModal = (bill: BillListItem) => {
    navigate(`/rental/admin/demand-challan/${bill.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  // KPI Calculations (from all raw bills so Total Collected & Demanded remain accurate)
  const kpiSource = allRawBills.length > 0 ? allRawBills : bills;
  const totalDemanded = kpiSource.reduce((acc, b) => acc + b.totalAmountDue, 0);
  const totalCollected = kpiSource.reduce((acc, b) => acc + b.amountPaid, 0);
  const totalBalanceDue = kpiSource.reduce((acc, b) => acc + b.balanceDue, 0);

  return (
    <AdminLayout
      title={isHi ? 'मासिक किराया बिलिंग एवं राजस्व वसूली' : 'Commercial Billing & Invoices'}
      breadcrumbs={[{ label: isHi ? 'बिलिंग' : 'Billing' }]}
    >
      <div className="space-y-6">
        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold">
              ×
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल जारी बिल' : 'Total Bills'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
            </div>

          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल मांग (राजस्व)' : 'Total Demanded'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalDemanded.toLocaleString('en-IN')}</h3>
            </div>

          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल प्राप्त राशि' : 'Total Collected'}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
            </div>

          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'अवशेष बकाया राशि' : 'Outstanding Balance'}
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">₹{totalBalanceDue.toLocaleString('en-IN')}</h3>
            </div>

          </div>
        </div>

        {/* =========================================================================
            कार्यालय काउंटर किराया वसूली (Office Counter Rent Collection)
            Step 1: Search Tenant -> Step 2: Select Tenant -> Step 3: Select Month & Pay
            ========================================================================= */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200/90 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">

              <div>
                <h3 className="text-base font-extrabold tracking-wide flex items-center gap-2">
                  <span>{isHi ? 'कार्यालय काउंटर किराया वसूली' : 'Office Counter Rent Collection'}</span>

                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isHi
                    ? 'किरायेदार खोजें, उसका चयन करें एवं जिस माह का किराया आया है उस माह के आगे वसूली दर्ज करें।'
                    : 'Search & select tenant, view monthly dues, and record payment for the specific month.'}
                </p>
              </div>
            </div>

            {selectedTenant && (
              <button
                type="button"
                onClick={handleClearSelectedTenant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 self-start sm:self-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isHi ? 'अन्य किरायेदार खोजें' : 'Change Tenant'}</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* ── STEP 1: SEARCH & SELECT TENANT (When none selected) ── */}
            {!selectedTenant ? (
              <div className="max-w-2xl mx-auto space-y-3 py-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {isHi ? '१. किरायेदार खोजें (नाम, मोबाइल नंबर, या दुकान संख्या):' : '1. Search Tenant (Name, Mobile, or Shop Number):'}
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tenantSearchQuery}
                    onChange={(e) => handleSearchTenants(e.target.value)}
                    placeholder={
                      isHi
                        ? 'किरायेदार का नाम, मोबाइल नंबर, दुकान सं. (जैसे S-102) या कोड लिखें...'
                        : 'Type tenant name, 10-digit mobile, shop number, or code...'
                    }
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition"
                  />
                  {searchingTenants && (
                    <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  {tenantSearchQuery && !searchingTenants && (
                    <button
                      type="button"
                      onClick={() => {
                        setTenantSearchQuery('');
                        setTenantSearchResults([]);
                      }}
                      className="w-6 h-6 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Instant Search Results Dropdown List */}
                {tenantSearchResults.length > 0 && (
                  <div className="border border-slate-200 rounded-xl bg-white shadow-xl overflow-hidden divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {isHi ? `मिले परिणाम (${tenantSearchResults.length}) — कृपया किरायेदार पर क्लिक करें:` : `Matches (${tenantSearchResults.length}) — Click to select:`}
                    </div>
                    {tenantSearchResults.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTenant(t)}
                        className="p-3.5 hover:bg-indigo-50/80 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-700 group-hover:text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                            {t.fullName ? t.fullName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                              {t.fullName}
                              <span className="text-xs text-slate-500 font-mono font-normal ml-2">({t.userCode})</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{t.mobile}</span>
                              {t.assignedProperty && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold text-slate-700">
                                    {t.assignedProperty.propertyNumber} ({t.assignedProperty.location})
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-slate-400 font-semibold">{isHi ? 'कुल बकाया:' : 'Dues:'}</div>
                          <div className={`text-sm font-extrabold font-mono ${t.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            ₹{Number(t.outstandingBalance || 0).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-bold group-hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                            <span>{isHi ? 'चयन करें' : 'Select'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tenantSearchQuery.trim().length >= 2 && !searchingTenants && tenantSearchResults.length === 0 && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    {isHi ? 'इस नाम, मोबाइल या दुकान सं. से कोई किरायेदार नहीं मिला।' : 'No tenant found matching this search.'}
                  </div>
                )}
              </div>
            ) : (
              /* ── STEP 2 & 3: SELECTED TENANT SUMMARY & MONTHLY BILLS ── */
              <div className="space-y-5">
                {/* Selected Tenant Profile Header Card */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
                      {selectedTenant.fullName ? selectedTenant.fullName[0].toUpperCase() : 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-slate-900">{selectedTenant.fullName}</h4>
                        <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">
                          {selectedTenant.userCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {selectedTenant.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 mt-1">
                        <span>{isHi ? 'मोबाइल:' : 'Mobile:'} <strong className="font-mono">{selectedTenant.mobile}</strong></span>
                        {selectedTenant.assignedProperty && (
                          <span>
                            {isHi ? 'दुकान:' : 'Shop:'} <strong className="text-slate-900">{selectedTenant.assignedProperty.propertyNumber}</strong> • {selectedTenant.assignedProperty.location}
                          </span>
                        )}
                        {selectedTenant.assignedProperty?.monthlyRent && (
                          <span>
                            {isHi ? 'मासिक किराया:' : 'Base Rent:'} <strong className="font-mono text-emerald-700">₹{Number(selectedTenant.assignedProperty.monthlyRent).toLocaleString('en-IN')}</strong> / {isHi ? 'माह' : 'mo'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs shrink-0 justify-between md:justify-end">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        {isHi ? 'वर्तमान कुल बकाया' : 'Total Outstanding'}
                      </span>
                      <span className={`text-xl font-black font-mono ${selectedTenant.outstandingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        ₹{Number(selectedTenant.outstandingBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => refreshSelectedTenantBills(selectedTenant.id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                      title={isHi ? 'ताज़ा करें' : 'Refresh'}
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingTenantBills ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Monthly Bills Breakdown Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isHi ? 'माहवार देय किराया विवरण एवं वसूली:' : 'Monthly Rent Demand & Collection:'}
                    </h5>
                    <span className="text-xs text-slate-500 font-medium">
                      {isHi ? `कुल जारी बिल: ${tenantBills.length}` : `Total Bills: ${tenantBills.length}`}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                    {loadingTenantBills ? (
                      <div className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        <span className="text-xs">{isHi ? 'बिलों की सूची लोड हो रही है...' : 'Loading monthly bills...'}</span>
                      </div>
                    ) : tenantBills.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-700">{isHi ? 'इस किरायेदार का कोई बिल उपलब्ध नहीं है।' : 'No bills found for this tenant.'}</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase">
                              <th className="py-3 px-4">{isHi ? 'बिल संख्या एवं माह' : 'Bill No. & Month'}</th>
                              <th className="py-3 px-4">{isHi ? 'किराया मांग (₹)' : 'Demand (₹)'}</th>
                              <th className="py-3 px-4">{isHi ? 'जमा राशि (₹)' : 'Paid (₹)'}</th>
                              <th className="py-3 px-4">{isHi ? 'अवशेष बकाया (₹)' : 'Balance Due (₹)'}</th>
                              <th className="py-3 px-4">{isHi ? 'अंतिम तिथि' : 'Due Date'}</th>
                              <th className="py-3 px-4 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                              <th className="py-3 px-4 text-right">{isHi ? 'वसूली कार्यवाही' : 'Action'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {tenantBills.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-50/70 transition">
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <div className="font-bold text-indigo-700 font-mono">{b.billNumber}</div>
                                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                                    {b.billingMonth}
                                  </div>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap">
                                  <div className="font-bold text-slate-900 font-mono">₹{b.totalAmountDue.toLocaleString('en-IN')}</div>
                                  <div className="text-[10px] text-slate-400">
                                    {isHi ? 'किराया:' : 'Rent:'} ₹{b.rentAmount.toLocaleString('en-IN')}{b.arrearsAmount > 0 ? ` + ${isHi ? 'बकाया:' : 'Arr:'} ₹${b.arrearsAmount.toLocaleString('en-IN')}` : ''}
                                  </div>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap font-bold text-emerald-700 font-mono">
                                  ₹{b.amountPaid.toLocaleString('en-IN')}
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap font-black font-mono">
                                  <span className={b.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'}>
                                    ₹{b.balanceDue.toLocaleString('en-IN')}
                                  </span>
                                </td>

                                <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                                  {new Date(b.dueDate).toLocaleDateString()}
                                </td>

                                <td className="py-3 px-4 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/rental/admin/demand-challan/${b.id}`)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition hover:opacity-85 ${b.status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : b.status === 'PARTIALLY_PAID'
                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                        : b.status === 'OVERDUE'
                                          ? 'bg-red-100 text-red-800 border border-red-300'
                                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                                      }`}
                                    title={isHi ? 'मांग चालान एवं स्थिति देखें' : 'View Demand Challan'}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${b.status === 'PAID'
                                        ? 'bg-emerald-600'
                                        : b.status === 'PARTIALLY_PAID'
                                          ? 'bg-blue-600'
                                          : b.status === 'OVERDUE'
                                            ? 'bg-red-600'
                                            : 'bg-amber-600'
                                        }`}
                                    />
                                    {b.status === 'PAID'
                                      ? (isHi ? 'पूर्ण चुकता' : 'PAID')
                                      : b.status === 'PARTIALLY_PAID'
                                        ? (isHi ? 'आंशिक भुगतान' : 'PARTIALLY PAID')
                                        : b.status === 'OVERDUE'
                                          ? (isHi ? 'अतिदेय' : 'OVERDUE')
                                          : (isHi ? 'लंबित' : 'PENDING')}
                                  </button>
                                </td>

                                <td className="py-3 px-4 text-right whitespace-nowrap">
                                  <div className="inline-flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenInvoiceModal(b)}
                                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition shadow-2xs cursor-pointer"
                                    >
                                      {isHi ? 'चालान' : 'Challan'}
                                    </button>

                                    {b.balanceDue > 0 ? (
                                      <button
                                        type="button"
                                        onClick={() => navigate(`/rental/admin/collect-rent/${b.id}`)}
                                        className="px-3.5 py-1.5 bg-[#0B3B60] hover:bg-slate-900 text-white border border-[#0B3B60] rounded-md text-xs font-bold transition shadow-2xs cursor-pointer"
                                      >
                                        {isHi ? 'किराया जमा करें' : 'Accept Payment'}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                                        {isHi ? 'पूर्ण जमा' : 'Paid'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            समग्र बिल रजिस्टर (All Municipal Bills Overview & Master Filter)
            ========================================================================= */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              {isHi ? 'समग्र जारी बिल रजिस्टर' : 'All Issued Municipal Bills'}
            </h4>
            <span className="text-xs text-slate-500">
              {isHi ? `कुल रिकॉर्ड्स: ${total}` : `Total Records: ${total}`}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchBills();
            }}
            className="flex-1 w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isHi
                    ? 'बिल संख्या, किरायेदार का नाम, दुकान या मोबाइल से खोजें...'
                    : 'Search by bill number, tenant name, mobile, or shop number...'
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition"
            >
              {isHi ? 'खोजें' : 'Search'}
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">{isHi ? 'सभी स्थितियाँ' : 'All Statuses'}</option>
                <option value="PENDING">{isHi ? 'लंबित' : 'Pending'}</option>
                <option value="PARTIALLY_PAID">{isHi ? 'आंशिक भुगतान' : 'Partially Paid'}</option>
                <option value="PAID">{isHi ? 'पूर्ण भुगतान' : 'Paid'}</option>
                <option value="OVERDUE">{isHi ? 'अतिदेय' : 'Overdue'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="month"
                value={billingMonthFilter}
                onChange={(e) => {
                  setBillingMonthFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p>{isHi ? 'बिल लोड हो रहे हैं...' : 'Loading rental bills...'}</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">
                {isHi ? 'कोई बिल नहीं मिला' : 'No bills found'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {isHi
                  ? 'चयनित माह के लिए बिल जारी करने हेतु "मासिक बिल जारी करें" बटन दबाएं।'
                  : 'Click "Generate Monthly Bills" to create bills for active leases.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'बिल संख्या एवं माह' : 'Bill No. & Month'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'किरायेदार एवं दुकान' : 'Tenant & Property'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'मांग विवरण (किराया + बकाया)' : 'Demand Breakdown'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'भुगतान / अवशेष' : 'Paid / Balance'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'स्थिति' : 'Status'}
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'कार्यवाही' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/rental/admin/demand-challan/${bill.id}`)}
                          className="text-sm font-bold text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer text-left block"
                          title={isHi ? 'मांग चालान एवं स्थिति देखें' : 'View Demand Challan'}
                        >
                          {bill.billNumber}
                        </button>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {bill.billingMonth} • {isHi ? 'अंतिम तिथि:' : 'Due:'} {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{bill.tenant.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {bill.property.propertyNumber} • {bill.property.location}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{bill.totalAmountDue.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {isHi ? 'किराया:' : 'Rent:'} ₹{bill.rentAmount.toLocaleString('en-IN')}{' '}
                          {bill.arrearsAmount > 0 && (
                            <span className="text-amber-600 font-semibold">
                              + {isHi ? 'बकाया:' : 'Arrears:'} ₹{bill.arrearsAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-700">
                          ₹{bill.amountPaid.toLocaleString('en-IN')}
                        </div>
                        <div
                          className={`text-xs font-semibold ${bill.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'
                            }`}
                        >
                          {isHi ? 'देय:' : 'Due:'} ₹{bill.balanceDue.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/rental/admin/demand-challan/${bill.id}`)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition hover:opacity-85 ${bill.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : bill.status === 'PARTIALLY_PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : bill.status === 'OVERDUE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          title={isHi ? 'मांग चालान एवं स्थिति देखें' : 'View Status Challan'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${bill.status === 'PAID'
                              ? 'bg-emerald-600'
                              : bill.status === 'PARTIALLY_PAID'
                                ? 'bg-blue-600'
                                : bill.status === 'OVERDUE'
                                  ? 'bg-red-600'
                                  : 'bg-amber-600'
                              }`}
                          />
                          {bill.status === 'PAID'
                            ? (isHi ? 'पूर्ण चुकता' : 'PAID')
                            : bill.status === 'PARTIALLY_PAID'
                              ? (isHi ? 'आंशिक भुगतान' : 'PARTIALLY PAID')
                              : bill.status === 'OVERDUE'
                                ? (isHi ? 'अतिदेय' : 'OVERDUE')
                                : (isHi ? 'लंबित' : 'PENDING')}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenInvoiceModal(bill)}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-semibold transition shadow-2xs cursor-pointer"
                          >
                            {isHi ? 'चालान' : 'Challan'}
                          </button>

                          {bill.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => navigate(`/rental/admin/collect-rent/${bill.id}`)}
                              className="px-3.5 py-1.5 bg-[#0B3B60] hover:bg-slate-900 text-white border border-[#0B3B60] rounded-md text-xs font-bold transition shadow-2xs cursor-pointer"
                            >
                              {isHi ? 'किराया जमा करें' : 'Accept Payment'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal 1: Generate Monthly Bills */}
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'मासिक किराया बिल जारी करें' : 'Generate Monthly Bills'}
                </h3>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {isHi ? 'स्वचालित बिलिंग एवं बकाया समायोजन' : 'Automated Arrears Roll-Forward'}
                </div>
                <div>
                  {isHi
                    ? 'यह प्रणाली सभी सक्रिय पट्टों के लिए चालान तैयार करेगी। यदि किसी किरायेदार का पिछला बकाया है, तो वह स्वचालित रूप से वर्तमान चालान में जुड़ जाएगा।'
                    : 'Generates monthly rent bills for all active commercial leases. Any unsettled balances from prior months will automatically be rolled forward into this bill.'}
                </div>
              </div>

              <form onSubmit={handleGenerateBills} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'बिलिंग माह चुनें *' : 'Select Billing Month (YYYY-MM) *'}
                  </label>
                  <input
                    type="month"
                    required
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {generating
                      ? isHi
                        ? 'बिल तैयार हो रहे हैं...'
                        : 'Generating...'
                      : isHi
                        ? 'बिल जारी करें'
                        : 'Generate Bills'}
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
