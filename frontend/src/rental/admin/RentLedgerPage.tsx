import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Phone, RefreshCw, Search, Store, X } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import {
  rentalBillingApi,
  RentManagementOverviewResponse,
  RentManagementTenantCard,
} from '../services/rentalBilling.service';
import {
  OfficialLedgerData,
  OfficialRentLedgerDocument,
} from '../components/OfficialRentLedgerDocument';

const formatINR = (amount: number): string =>
  `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

export const RentLedgerPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [searchParams, setSearchParams] = useSearchParams();

  const initialLedgerOverview = api.peekCache<{ success: boolean; data: RentManagementOverviewResponse }>(
    '/rental/bills/management-overview'
  )?.data;
  const [tenants, setTenants] = useState<RentManagementTenantCard[]>(initialLedgerOverview?.tenants || []);
  const [currentMonth, setCurrentMonth] = useState(initialLedgerOverview?.currentMonth || '');
  const [loading, setLoading] = useState(!initialLedgerOverview);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<RentManagementTenantCard | null>(null);

  const loadTenants = useCallback(async (silent = false) => {
    if (silent) {
      api.invalidateCache('/rental/bills/management-overview');
      setRefreshing(true);
    } else if (tenants.length === 0) {
      setLoading(true);
    }
    setError('');
    try {
      const res = await rentalBillingApi.getRentManagementOverview();
      if (res.success) {
        setTenants(res.data.tenants);
        setCurrentMonth(res.data.currentMonth);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          (isHi ? 'किरायेदार सूची लोड करने में त्रुटि हुई।' : 'Failed to load tenants list.')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isHi]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  // If ?tenantId=... is passed in URL, automatically open that tenant's ledger
  useEffect(() => {
    const qId = searchParams.get('tenantId');
    if (qId && tenants.length > 0 && !selectedTenant) {
      const found = tenants.find((t) => t.tenantId === qId);
      if (found) setSelectedTenant(found);
    }
  }, [searchParams, tenants, selectedTenant]);

  const filteredTenants = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.mobile.toLowerCase().includes(q) ||
        (t.shop?.shopName || '').toLowerCase().includes(q) ||
        (t.shop?.shopCode || '').toLowerCase().includes(q)
    );
  }, [tenants, searchTerm]);

  const toOfficialLedgerData = (tenant: RentManagementTenantCard): OfficialLedgerData => {
    const bills = tenant.monthlyRecords
      .filter((r) => Boolean(r.billId && r.billNumber))
      .map((r) => ({
        billNumber: r.billNumber || `BL-${r.billingMonth}`,
        billingMonth: r.billingMonth,
        rentAmount: r.rentAmount,
        gstAmount: r.gstAmount || 0,
        totalAmountDue: r.totalAmountDue,
        amountPaid: r.amountPaid,
        balanceDue: r.balanceDue,
        status: r.status,
        receiptNumber: r.receipt?.receiptNumber || null,
      }));

    const currentBill = tenant.monthlyRecords.find((r) => r.billingMonth === currentMonth);
    const isCurrentMonthPaid = currentBill ? currentBill.status === 'PAID' : tenant.summary.outstandingAmount <= 0;

    return {
      tenantName: tenant.fullName,
      tenantCode: tenant.tenantCode,
      mobile: tenant.mobile,
      shopNumber: tenant.shop?.shopCode || '—',
      location: tenant.shop?.address || tenant.shop?.location || 'अल्मोड़ा',
      totalOutstanding: tenant.summary.outstandingAmount,
      isCurrentMonthPaid,
      bills,
    };
  };

  const handleCloseLedger = () => {
    setSelectedTenant(null);
    if (searchParams.has('tenantId')) {
      searchParams.delete('tenantId');
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'राजस्व बहीखाता' : 'Rent Ledger'}
      subtitle={isHi ? 'किरायेदार-वार खाता बही एवं पीडीएफ डाउनलोड' : 'Tenant-wise official ledger & PDF download'}
      hideBreadcrumbs={true}
      hideFooter={true}
    >
      <div className="space-y-5 pb-10">
        {/* Simple Navy Header */}
        <div className="rounded-xl bg-[#0B1B36] p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              {isHi ? 'किराया खाता बही' : 'Rent Ledger'}
            </h1>
          </div>
        </div>

        {/* Search Input */}
        <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isHi
                  ? 'किरायेदार का नाम, मोबाइल नंबर या दुकान संख्या से खोजें...'
                  : 'Search by tenant name, phone number or shop code...'
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-9 py-2 text-sm text-slate-800 focus:border-[#0B1B36] focus:bg-white focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        {/* Tenants List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-slate-200 p-4 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="h-3 w-28 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-9 w-28 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-10 text-center text-sm font-semibold text-slate-500">
            {isHi ? 'कोई किरायेदार रिकॉर्ड नहीं मिला।' : 'No tenant records found.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.tenantId}
                className="rounded-xl bg-white border border-slate-200 px-4 py-3.5 shadow-2xs hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {tenant.profilePhotoUrl ? (
                    <img
                      src={tenant.profilePhotoUrl}
                      alt={tenant.fullName}
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-[#0B1B36] text-white flex items-center justify-center font-black text-base shrink-0">
                      {(tenant.fullName || 'T').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-[#0B1B36] truncate">
                      {tenant.fullName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-600 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {tenant.mobile}
                      </span>
                      {tenant.shop && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          {tenant.shop.shopName} ({tenant.shop.shopCode})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedTenant(tenant)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1B36] hover:bg-[#142D57] text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    {isHi ? 'View Ledger' : 'View Ledger'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Ledger Preview & Download Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl my-auto">
            <OfficialRentLedgerDocument
              data={toOfficialLedgerData(selectedTenant)}
              onClose={handleCloseLedger}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RentLedgerPage;
