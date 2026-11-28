import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminConfirmModal } from './AdminConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import { rentalUserApi, TenantListItem, TenantListResponse } from '../services/rentalUser.service';
import {
  Search,
  Eye,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export const TenantListPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const initialListCache = api.peekCache<{ data: TenantListResponse }>('/rental/users/admin/list?page=1&limit=15')?.data;
  const [tenants, setTenants] = useState<TenantListItem[]>(initialListCache?.data || []);
  const [total, setTotal] = useState(initialListCache?.total || 0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(!initialListCache);
  const [error, setError] = useState('');

  const fetchTenants = async (force = false) => {
    if (force) {
      api.invalidateCache('/rental/users/admin/list');
    }
    if (force || tenants.length === 0) {
      setLoading(true);
    }
    setError('');
    try {
      const res = await rentalUserApi.listTenants({
        search,
        page,
        limit: 15,
      });
      setTenants(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants(false);
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants(true);
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    tenant: TenantListItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    tenant: null,
    loading: false,
  });

  const requestDeleteTenant = (tenant: TenantListItem) => {
    setDeleteModal({
      isOpen: true,
      tenant,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.tenant) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await rentalUserApi.deleteTenant(deleteModal.tenant.id);
      setDeleteModal({ isOpen: false, tenant: null, loading: false });
      fetchTenants(true);
    } catch (err: any) {
      alert(err.message || 'Failed to delete tenant');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 15));

  return (
    <AdminLayout
      title={isHi ? 'पंजीकृत किरायेदार' : 'Registered Tenants'}
      hideBreadcrumbs={true}
      hideFooter={true}
    >
      <div className="space-y-5">
        {/* Top Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/rental/admin/register-tenant')}
              className="px-4 py-2 rounded-lg bg-[#0b1b36] hover:bg-[#132c56] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>{isHi ? 'नया किरायेदार पंजीकृत करें' : 'Register New Tenant'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar - Responsive */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? 'नाम, मोबाइल या दुकान से खोजें...' : 'Search by name, mobile, shop...'}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />
          </form>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => fetchTenants(true)}
              title={isHi ? 'ताज़ा करें' : 'Refresh'}
              className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => fetchTenants(true)}
              className="font-bold underline text-xs ml-4 hover:text-red-950 cursor-pointer"
            >
              {isHi ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
          </div>
        )}

        {/* Tenants Container - Desktop Table & Mobile Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading && tenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin mb-3 text-slate-600" />
              <p className="text-xs sm:text-sm font-semibold">{isHi ? 'किरायेदार लोड हो रहे हैं...' : 'Loading tenants...'}</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-base font-bold text-slate-800">
                {isHi ? 'कोई किरायेदार नहीं मिला' : 'No tenants found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isHi
                  ? 'दिए गए फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।'
                  : 'There are no tenant records matching the current filter.'}
              </p>
            </div>
          ) : (
            <>
              {/* 🖥️ DESKTOP / TABLET VIEW: Streamlined Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[16px] font-bold uppercase">
                      <th className="px-4 py-3">{isHi ? 'किरायेदार' : 'Tenant'}</th>
                      <th className="px-4 py-3">{isHi ? 'दुकान संख्या व पता' : 'Shop No. & Address'}</th>
                      <th className="px-4 py-3">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</th>
                      <th className="px-4 py-3 text-right">{isHi ? 'कार्रवाई' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Column 1: Profile Photo + Name & Mobile */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {t.profilePhotoUrl ? (
                              <img
                                src={t.profilePhotoUrl}
                                alt={t.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-100 text-[#0b1b36] font-bold text-sm flex items-center justify-center border border-slate-300 shrink-0">
                                {t.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm truncate">{t.fullName}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                {t.mobile}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Only Shop Number & Address */}
                        <td className="px-4 py-3">
                          {t.assignedProperty ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-900 text-xs font-mono inline-block bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                                {t.assignedProperty.propertyNumber}
                              </span>
                              <div className="text-xs text-slate-600 truncate max-w-[280px]">
                                {t.assignedProperty.address || t.assignedProperty.location}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              {isHi ? 'आवंटन नहीं हुआ' : 'Unallotted'}
                            </span>
                          )}
                        </td>

                        {/* Column 3: Monthly Rent */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-xs font-mono">
                            {t.assignedProperty ? `₹${t.assignedProperty.monthlyRent.toLocaleString('en-IN')}/माह` : '—'}
                          </div>
                          {t.outstandingBalance > 0 && (
                            <div className="text-[11px] font-bold text-red-600 mt-0.5">
                              बकाया: ₹{t.outstandingBalance.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Column 4: Actions - View & Delete */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/rental/admin/tenants/${t.id}`)}
                              className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              title={isHi ? 'किरायेदार प्रोफ़ाइल देखें' : 'View Tenant Profile'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isHi ? 'देखें' : 'View'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => requestDeleteTenant(t)}
                              className="px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-semibold text-xs transition inline-flex items-center gap-1 cursor-pointer"
                              title={isHi ? 'किरायेदार हटाएं' : 'Delete Tenant'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isHi ? 'हटाएं' : 'Delete'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 📱 MOBILE VIEW: Clean Responsive Cards (No Table) */}
              <div className="md:hidden divide-y divide-slate-100">
                {tenants.map((t) => (
                  <div key={t.id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                    {/* Header: Profile Photo + Tenant Name & Mobile */}
                    <div className="flex items-center gap-3">
                      {t.profilePhotoUrl ? (
                        <img
                          src={t.profilePhotoUrl}
                          alt={t.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 text-[#0b1b36] font-bold text-sm flex items-center justify-center border border-slate-300 shrink-0">
                          {t.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{t.fullName}</h3>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {t.mobile}
                        </div>
                      </div>
                    </div>

                    {/* Info Grid: Shop No & Address, Monthly Rent */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          {isHi ? 'दुकान संख्या व पता' : 'Shop No & Address'}
                        </span>
                        {t.assignedProperty ? (
                          <div>
                            <span className="font-bold text-slate-900 text-xs font-mono inline-block bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded mb-0.5">
                              {t.assignedProperty.propertyNumber}
                            </span>
                            <p className="text-slate-600 text-xs line-clamp-2">
                              {t.assignedProperty.address || t.assignedProperty.location}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            {isHi ? 'आवंटन नहीं हुआ' : 'Unallotted'}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                        </span>
                        <div className="font-bold text-slate-900 text-xs font-mono">
                          {t.assignedProperty ? `₹${t.assignedProperty.monthlyRent.toLocaleString('en-IN')}/माह` : '—'}
                        </div>
                        {t.outstandingBalance > 0 && (
                          <div className="text-[11px] font-bold text-red-600 mt-0.5">
                            बकाया: ₹{t.outstandingBalance.toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions: View and Delete */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/rental/admin/tenants/${t.id}`)}
                        className="flex-1 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-semibold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isHi ? 'देखें' : 'View'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteTenant(t)}
                        className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-semibold text-xs transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isHi ? 'हटाएं' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    {isHi ? `पृष्ठ ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-50 cursor-pointer"
                    >
                      {isHi ? 'पिछला' : 'Prev'}
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1 rounded border border-slate-300 bg-white disabled:opacity-50 cursor-pointer"
                    >
                      {isHi ? 'अगला' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Tenant Confirmation Dialog */}
        <AdminConfirmModal
          isOpen={deleteModal.isOpen}
          title={isHi ? 'किरायेदार स्थायी रूप से हटाएं' : 'Delete Tenant Account'}
          message={
            isHi
              ? 'क्या आप वाकई इस किरायेदार को स्थायी रूप से हटाना चाहते हैं? यदि इस किरायेदार को कोई दुकान आवंटित है, तो वह दुकान स्वतः रिक्त हो जाएगी। यह कार्रवाई वापस नहीं ली जा सकती।'
              : 'Are you sure you want to permanently delete this tenant? Any assigned shop will be reset to VACANT. This action cannot be undone.'
          }
          subject={
            deleteModal.tenant
              ? `${deleteModal.tenant.fullName}`
              : undefined
          }
          variant="danger"
          iconType="trash"
          confirmText={isHi ? 'हां, किरायेदार हटाएं' : 'Delete Tenant'}
          denyText={isHi ? 'रद्द करें' : 'Cancel'}
          loading={deleteModal.loading}
          onConfirm={handleConfirmDelete}
          onDeny={() => setDeleteModal({ isOpen: false, tenant: null, loading: false })}
        />
      </div>
    </AdminLayout>
  );
};
export default TenantListPage;
