import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminConfirmModal } from './AdminConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { rentalUserApi, TenantListItem } from '../services/rentalUser.service';
import { rentalPropertyApi, PropertyListItem } from '../services/rentalProperty.service';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  FileText,
  RefreshCw,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Store,
  Lock,
  User,
  ShieldCheck,
  Edit3,
  ZoomIn,
  Calendar,
  IndianRupee,
  BookOpen,
} from 'lucide-react';

export const TenantListPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<TenantListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected tenant state
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Full-screen image preview lightbox
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Form edit states
  const [availableProperties, setAvailableProperties] = useState<PropertyListItem[]>([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  const [editFormData, setEditFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    permanentAddress: '',
    currentAddress: '',
    aadhaarNumber: '',
    panNumber: '',
    gstNumber: '',
    propertyId: '',
    monthlyRent: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    password: '',
    profilePhotoFile: null as File | null,
    aadhaarFile: null as File | null,
    panFile: null as File | null,
    domicileFile: null as File | null,
    gstFile: null as File | null,
  });

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalUserApi.listTenants({
        search,
        status: statusFilter,
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
    fetchTenants();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTenants();
  };

  const handleViewDetails = async (tenantId: string) => {
    setLoadingDetails(true);
    setSelectedTenant(null);
    setIsEditMode(false); // Default to read-only profile view mode
    setSaveSuccessMsg('');
    setSaveErrorMsg('');
    try {
      // Fetch tenant details (now includes pre-signed inline image URLs) and vacant properties concurrently
      const [tenantRes, propsRes] = await Promise.all([
        rentalUserApi.getTenantDetails(tenantId),
        rentalPropertyApi.listProperties({ status: 'VACANT', limit: 100 }),
      ]);

      const user = tenantRes.data;
      setSelectedTenant(user);

      if (propsRes && propsRes.data && Array.isArray(propsRes.data.data)) {
        setAvailableProperties(propsRes.data.data);
      }

      const activeAssignment = user.assignments?.find((a: any) => a.is_active) || user.assignments?.[0];

      setEditFormData({
        fullName: user.full_name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        permanentAddress: user.permanent_address || '',
        currentAddress: user.current_address || '',
        aadhaarNumber: '', // Left blank to keep current masked
        panNumber: '', // Left blank to keep current masked
        gstNumber: user.gst_number || '',
        propertyId: activeAssignment?.property?.id || activeAssignment?.property_id || '',
        monthlyRent: activeAssignment?.monthly_rent ? String(activeAssignment.monthly_rent) : '',
        status: user.status || 'ACTIVE',
        password: '',
        profilePhotoFile: null,
        aadhaarFile: null,
        panFile: null,
        domicileFile: null,
        gstFile: null,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to fetch tenant profile');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePropertyChange = (newPropertyId: string) => {
    setEditFormData((prev) => {
      const matched = availableProperties.find((p) => p.id === newPropertyId || p.propertyId === newPropertyId);
      return {
        ...prev,
        propertyId: newPropertyId,
        monthlyRent: matched ? String(matched.baseMonthlyRent) : prev.monthlyRent,
      };
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    if (!editFormData.fullName.trim()) {
      setSaveErrorMsg(isHi ? 'कृपया किरायेदार का पूरा नाम दर्ज करें' : 'Full name is required');
      return;
    }
    if (!editFormData.mobile.trim() || !/^\d{10}$/.test(editFormData.mobile.trim())) {
      setSaveErrorMsg(isHi ? 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें' : 'Valid 10-digit mobile number is required');
      return;
    }
    if (!editFormData.permanentAddress.trim()) {
      setSaveErrorMsg(isHi ? 'स्थायी पता अनिवार्य है' : 'Permanent address is required');
      return;
    }
    if (editFormData.aadhaarNumber && !/^\d{12}$/.test(editFormData.aadhaarNumber.trim())) {
      setSaveErrorMsg(isHi ? 'आधार संख्या 12 अंकों की होनी चाहिए' : 'Aadhaar must be 12 digits');
      return;
    }
    if (editFormData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(editFormData.panNumber.trim())) {
      setSaveErrorMsg(isHi ? 'अमान्य पैन संख्या (उदा. ABCDE1234F)' : 'Invalid PAN number (e.g. ABCDE1234F)');
      return;
    }

    setSavingChanges(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    try {
      await rentalUserApi.updateTenantProfile(selectedTenant.id, {
        fullName: editFormData.fullName,
        mobile: editFormData.mobile,
        email: editFormData.email,
        permanentAddress: editFormData.permanentAddress,
        currentAddress: editFormData.currentAddress,
        aadhaarNumber: editFormData.aadhaarNumber || undefined,
        panNumber: editFormData.panNumber || undefined,
        gstNumber: editFormData.gstNumber,
        propertyId: editFormData.propertyId,
        monthlyRent: editFormData.monthlyRent ? Number(editFormData.monthlyRent) : undefined,
        status: editFormData.status,
        password: editFormData.password || undefined,
        profilePhotoFile: editFormData.profilePhotoFile,
        aadhaarFile: editFormData.aadhaarFile,
        panFile: editFormData.panFile,
        domicileFile: editFormData.domicileFile,
        gstFile: editFormData.gstFile,
      });

      setSaveSuccessMsg(
        isHi
          ? 'किरायेदार प्रोफ़ाइल एवं सभी विवरण सफलतापूर्वक अपडेट हो गए!'
          : 'Tenant profile and records updated successfully!'
      );

      // Refresh table list
      fetchTenants();

      // Refetch updated tenant details
      const updated = await rentalUserApi.getTenantDetails(selectedTenant.id);
      setSelectedTenant(updated.data);

      // Clear file uploads & password
      setEditFormData((prev) => ({
        ...prev,
        aadhaarNumber: '',
        panNumber: '',
        password: '',
        profilePhotoFile: null,
        aadhaarFile: null,
        panFile: null,
        domicileFile: null,
        gstFile: null,
      }));

      // Return to read-only view after save
      setIsEditMode(false);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update tenant profile');
    } finally {
      setSavingChanges(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    tenant: TenantListItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    tenant: null,
    loading: false,
  });

  const requestToggleStatus = (tenant: TenantListItem) => {
    setConfirmModal({
      isOpen: true,
      tenant,
      loading: false,
    });
  };

  const handleConfirmToggleStatus = async () => {
    if (!confirmModal.tenant) return;
    const { id, status } = confirmModal.tenant;
    const nextStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await rentalUserApi.updateTenantStatus(id, nextStatus as any);
      setConfirmModal({ isOpen: false, tenant: null, loading: false });
      fetchTenants();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const currentTenantAssignment =
    selectedTenant?.assignments?.find((a: any) => a.is_active) || selectedTenant?.assignments?.[0];

  return (
    <AdminLayout
      title={isHi ? 'किरायेदार (Users)' : 'Tenants (Users)'}
      breadcrumbs={[{ label: isHi ? 'किरायेदार' : 'Tenants' }]}
    >
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950">
              {isHi ? 'पंजीकृत किरायेदार निर्देशिका' : 'Registered Tenants Directory'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/rental/admin/properties')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-xs shrink-0 cursor-pointer"
            >

              <span>{isHi ? 'संपत्ति रजिस्टर' : 'Property Assets'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/rental/admin/register-tenant')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-ukgreen-600 to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:from-ukgreen-700 hover:to-emerald-700 shadow-md shadow-ukgreen-600/20 shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isHi ? 'नया किरायेदार पंजीकृत करें' : 'Register New Tenant'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? 'नाम, मोबाइल, कोड या दुकान से खोजें...' : 'Search by name, mobile, code, shop...'}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 transition-all bg-slate-50/50"
            />
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20"
            >
              <option value="ALL">{isHi ? 'सभी स्थिति (All)' : 'All Status'}</option>
              <option value="ACTIVE">{isHi ? 'सक्रिय (Active)' : 'Active Only'}</option>
              <option value="INACTIVE">{isHi ? 'निष्क्रिय (Inactive)' : 'Inactive Only'}</option>
              <option value="SUSPENDED">{isHi ? 'निलंबित (Suspended)' : 'Suspended'}</option>
            </select>

            <button
              type="button"
              onClick={fetchTenants}
              title={isHi ? 'ताज़ा करें' : 'Refresh'}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={fetchTenants}
              className="font-bold underline text-xs ml-4 hover:text-rose-950 cursor-pointer"
            >
              {isHi ? 'पुनः प्रयास करें' : 'Retry'}
            </button>
          </div>
        )}

        {/* Tenants Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading && tenants.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-navy-600" />
              <p className="text-sm font-semibold">{isHi ? 'किरायेदार लोड हो रहे हैं...' : 'Loading tenants...'}</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">
                {isHi ? 'कोई किरायेदार नहीं मिला' : 'No tenants found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {isHi
                  ? 'दिए गए फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।'
                  : 'There are no tenant records matching the current search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="px-5 py-3.5">{isHi ? 'किरायेदार (Tenant)' : 'Tenant'}</th>
                    <th className="px-4 py-3.5">{isHi ? 'यूजर कोड (Code)' : 'User Code'}</th>
                    <th className="px-4 py-3.5">{isHi ? 'आवंटित दुकान (Shop)' : 'Allocated Shop'}</th>
                    <th className="px-4 py-3.5">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</th>
                    <th className="px-4 py-3.5">{isHi ? 'बकाया (Dues)' : 'Dues'}</th>
                    <th className="px-4 py-3.5">{isHi ? 'स्थिति' : 'Status'}</th>
                    <th className="px-5 py-3.5 text-right">{isHi ? 'कार्रवाई (Actions)' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {t.profilePhotoUrl ? (
                            <img
                              src={t.profilePhotoUrl}
                              alt={t.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-navy-100 text-navy-800 font-extrabold text-xs flex items-center justify-center border border-navy-200">
                              {t.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-navy-950">{t.fullName}</div>
                            <div className="text-slate-400 text-xs font-normal">{t.mobile}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-slate-700">
                        {t.userCode}
                      </td>

                      <td className="px-4 py-3.5">
                        {t.assignedProperty ? (
                          <div>
                            <div className="font-bold text-slate-900">{t.assignedProperty.propertyNumber}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                              {t.assignedProperty.location}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                            {isHi ? 'आवंटित नहीं' : 'Unallotted'}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {t.assignedProperty ? `₹${t.assignedProperty.monthlyRent.toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="px-4 py-3.5">
                        {t.outstandingBalance > 0 ? (
                          <span className="font-bold text-rose-600">
                            ₹{t.outstandingBalance.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-600">₹0</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {t.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {isHi ? 'सक्रिय' : 'Active'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {isHi ? 'निष्क्रिय' : 'Inactive'}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        {/* LEDGER BUTTON */}
                        <NavLink
                          to={`/rental/admin/ledger?tenantId=${t.id}`}
                          className="px-2.5 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                          title={isHi ? 'बहीखाता / लेजर देखें' : 'View Ledger'}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isHi ? 'लेजर' : 'Ledger'}</span>
                        </NavLink>

                        {/* VIEW BUTTON (OPENS PROFILE) */}
                        <button
                          type="button"
                          onClick={() => handleViewDetails(t.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          title={isHi ? 'किरायेदार प्रोफ़ाइल देखें' : 'View Tenant Profile'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isHi ? 'देखें' : 'View'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => requestToggleStatus(t)}
                          className={`px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${t.status === 'ACTIVE'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                            }`}
                        >
                          {t.status === 'ACTIVE' ? (isHi ? 'निष्क्रिय' : 'Deactivate') : (isHi ? 'सक्रिय' : 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Loading details indicator */}
        {loadingDetails && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-navy-800" />
              <span className="font-bold text-slate-800 text-sm">
                {isHi ? 'किरायेदार प्रोफ़ाइल विवरण लोड हो रहा है...' : 'Loading tenant profile...'}
              </span>
            </div>
          </div>
        )}

        {/* ── TENANT FULL PROFILE MODAL (READ-ONLY VIEW + TOP EDIT BUTTON + INLINE IMAGES) ── */}
        {selectedTenant && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full my-auto max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-5 sm:p-6 flex items-center justify-between shrink-0 border-b border-navy-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  {selectedTenant.profile_photo_url ? (
                    <img
                      src={selectedTenant.profile_photo_url}
                      alt={selectedTenant.full_name}
                      onClick={() =>
                        setPreviewImage({
                          url: selectedTenant.profile_photo_url,
                          title: selectedTenant.full_name,
                        })
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      title={isHi ? 'बड़ा करके देखें' : 'Click to enlarge'}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-navy-800 text-amber-400 font-extrabold text-lg flex items-center justify-center border-2 border-amber-400/60 shadow-md">
                      {selectedTenant.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                        {selectedTenant.full_name}
                      </h3>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {selectedTenant.user_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                      <span>
                        {isEditMode
                          ? isHi
                            ? 'संपादन मोड: सभी फ़ील्ड संपादन योग्य हैं'
                            : 'Edit Mode: Every field is editable'
                          : isHi
                            ? 'किरायेदार प्रोफ़ाइल विवरण'
                            : 'Tenant Profile Details'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* VIEW LEDGER BUTTON */}
                  <NavLink
                    to={`/rental/admin/ledger?tenantId=${selectedTenant.id}`}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{isHi ? 'बहीखाता / लेजर' : 'View Ledger'}</span>
                  </NavLink>

                  {/* TOP EDIT BUTTON */}
                  {!isEditMode ? (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 rounded-xl bg-white/15 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 hover:bg-white/25 transition-colors shadow-md cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isHi ? 'विवरण संपादित करें' : 'Edit Profile'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white font-bold text-xs hover:bg-white/25 transition-colors cursor-pointer"
                    >
                      {isHi ? 'संपादन रद्द करें' : 'Cancel Edit'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTenant(null);
                      setIsEditMode(false);
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Feedback Alerts */}
              {saveSuccessMsg && (
                <div className="mx-6 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              {/* ── READ-ONLY PROFILE VIEW (WHEN NOT IN EDIT MODE) ── */}
              {!isEditMode ? (
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                  {/* Top Key Stats Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                        {isHi ? 'आवंटित दुकान / संपत्ति' : 'Allocated Shop'}
                      </span>
                      <div className="text-base font-black text-navy-950 mt-1 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-navy-700" />
                        <span>{currentTenantAssignment?.property?.property_number || 'Unallotted'}</span>
                      </div>
                      <span className="text-xs text-slate-500 truncate block mt-0.5">
                        {currentTenantAssignment?.property?.location || 'No location allotted'}
                      </span>
                    </div>

                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60">
                      <span className="text-[11px] font-extrabold uppercase text-emerald-800 block tracking-wider">
                        {isHi ? 'मासिक किराया दर' : 'Monthly Rent'}
                      </span>
                      <div className="text-base font-black text-emerald-950 mt-1 flex items-center gap-1">
                        <IndianRupee className="w-4 h-4 text-emerald-700" />
                        <span>
                          {currentTenantAssignment?.monthly_rent
                            ? `₹${Number(currentTenantAssignment.monthly_rent).toLocaleString('en-IN')}`
                            : '—'}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">/ माह</span>
                      </div>
                      <span className="text-xs text-emerald-600 block mt-0.5 font-medium">
                        {isHi ? 'नियमित किराया' : 'Active base rent'}
                      </span>
                    </div>

                    <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60">
                      <span className="text-[11px] font-extrabold uppercase text-amber-800 block tracking-wider">
                        {isHi ? 'खाता स्थिति' : 'Account Status'}
                      </span>
                      <div className="mt-1.5">
                        {selectedTenant.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {isHi ? 'सक्रिय (Active)' : 'Active Account'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            {isHi ? 'निष्क्रिय (Inactive)' : 'Inactive Account'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal & Address Details Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? 'व्यक्तिगत एवं संपर्क विवरण' : 'Personal & Contact Details'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block">{isHi ? 'पूरा नाम:' : 'Full Name:'}</span>
                        <span className="text-sm font-bold text-slate-900">{selectedTenant.full_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                        <span className="text-sm font-bold text-slate-900 font-mono">{selectedTenant.mobile}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">{isHi ? 'ईमेल आईडी:' : 'Email Address:'}</span>
                        <span className="text-sm font-medium text-slate-900">{selectedTenant.email || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 font-semibold block">{isHi ? 'स्थायी पता:' : 'Permanent Address:'}</span>
                        <span className="text-xs font-medium text-slate-800">{selectedTenant.permanent_address || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">{isHi ? 'वर्तमान / दुकान का पता:' : 'Current / Shop Address:'}</span>
                        <span className="text-xs font-medium text-slate-800">{selectedTenant.current_address || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Identity & Tax Records */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? 'पहचान एवं कर अभिलेख' : 'Identity & Tax Records'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-semibold block">{isHi ? 'आधार संख्या (मास्क):' : 'Aadhaar (Masked):'}</span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {selectedTenant.aadhaar_masked || 'Not Provided'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-semibold block">{isHi ? 'पैन संख्या (मास्क):' : 'PAN (Masked):'}</span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {selectedTenant.pan_masked || 'Not Provided'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-semibold block">{isHi ? 'जीएसटी नंबर (GSTIN):' : 'GST Number:'}</span>
                        <span className="text-sm font-mono font-bold text-slate-900">
                          {selectedTenant.gst_number || 'Not Registered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── INLINE ATTACHED IMAGES & DOCUMENTS (NO VIEW S3 BUTTON) ── */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-navy-700" />
                        <span>{isHi ? 'संलग्न पहचान दस्तावेज (प्रत्यक्ष चित्र)' : 'Attached Identity Documents'}</span>
                      </h4>
                      <span className="text-[11px] font-bold text-slate-400">
                        {isHi ? 'चित्र पर क्लिक करके बड़ा देखें' : 'Click any image to enlarge'}
                      </span>
                    </div>

                    {(!selectedTenant.documents || selectedTenant.documents.length === 0) ? (
                      <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                        {isHi ? 'इस किरायेदार के कोई दस्तावेज संलग्न नहीं हैं।' : 'No identity documents uploaded for this tenant.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedTenant.documents.map((doc: any) => {
                          const imageUrl = doc.presigned_url || doc.file_url;
                          const isPdf = doc.mime_type === 'application/pdf' || doc.file_name?.toLowerCase().endsWith('.pdf');

                          return (
                            <div
                              key={doc.id}
                              className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 hover:shadow-md transition-shadow group flex flex-col"
                            >
                              {/* Document Header */}
                              <div className="px-3.5 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                                <span className="font-extrabold text-xs text-navy-950 uppercase tracking-wide">
                                  {doc.doc_type}
                                </span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                                  {doc.verification_status || 'VERIFIED'}
                                </span>
                              </div>

                              {/* Document Inline Image Display */}
                              <div className="p-3 flex-1 flex flex-col items-center justify-center">
                                {!isPdf && imageUrl ? (
                                  <div
                                    className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                                    onClick={() => setPreviewImage({ url: imageUrl, title: `${doc.doc_type} - ${selectedTenant.full_name}` })}
                                  >
                                    <img
                                      src={imageUrl}
                                      alt={doc.doc_type}
                                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                                      <ZoomIn className="w-4 h-4" />
                                      <span>{isHi ? 'बड़ा देखें' : 'Enlarge'}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className="w-full h-44 rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => imageUrl && window.open(imageUrl, '_blank')}
                                  >
                                    <FileText className="w-10 h-10 text-red-500" />
                                    <span className="text-xs font-bold text-slate-800 text-center line-clamp-1">
                                      {doc.file_name}
                                    </span>
                                    <span className="text-[10px] text-blue-600 font-bold underline">
                                      {isHi ? 'पीडीएफ खोलें' : 'Open PDF'}
                                    </span>
                                  </div>
                                )}

                                <span className="text-[11px] text-slate-400 mt-2 truncate w-full text-center">
                                  {doc.file_name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* ── FULL EDITABLE PROFILE FORM (TRIGGERED BY TOP EDIT BUTTON) ── */
                <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
                  {/* Section 1: Basic & Personal Info */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? '1. व्यक्तिगत विवरण (Personal Details)' : '1. Personal Details'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'पूरा नाम' : 'Full Name'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editFormData.fullName}
                          onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-semibold text-slate-900"
                          placeholder="e.g. Manish Paliwal"
                        />
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={editFormData.mobile}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })
                            }
                            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-semibold text-slate-900"
                            placeholder="e.g. 9870722406"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'ईमेल आईडी' : 'Email Address'} <span className="text-slate-400 font-normal">({isHi ? 'वैकल्पिक' : 'Optional'})</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-semibold text-slate-900"
                            placeholder="e.g. tenant@gmail.com"
                          />
                        </div>
                      </div>

                      {/* Account Status */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'खाता स्थिति (Account Status)' : 'Account Status'} <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-bold text-slate-900"
                        >
                          <option value="ACTIVE">{isHi ? 'सक्रिय (ACTIVE)' : 'ACTIVE'}</option>
                          <option value="INACTIVE">{isHi ? 'निष्क्रिय (INACTIVE)' : 'INACTIVE'}</option>
                          <option value="SUSPENDED">{isHi ? 'निलंबित (SUSPENDED)' : 'SUSPENDED'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Address Information */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? '2. पता विवरण (Address Details)' : '2. Address Details'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Permanent Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'स्थायी पता' : 'Permanent Address'} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={editFormData.permanentAddress}
                          onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-medium text-slate-900 resize-none"
                          placeholder="Village/Mohalla, Post, District, State, PIN"
                        />
                      </div>

                      {/* Current Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'वर्तमान / दुकान का पता' : 'Current / Shop Address'}
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.currentAddress}
                          onChange={(e) => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-medium text-slate-900 resize-none"
                          placeholder="Current shop or local residence address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Identity & Tax Details */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? '3. पहचान एवं कर विवरण (Identity & Tax Details)' : '3. Identity & Tax Details'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Aadhaar Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            {isHi ? 'आधार संख्या' : 'Aadhaar Number'}
                          </label>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {selectedTenant.aadhaar_masked || 'None'}
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={12}
                          value={editFormData.aadhaarNumber}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 12),
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-mono text-slate-900"
                          placeholder={isHi ? 'नया 12 अंक दर्ज करें' : 'Enter 12 digits to update'}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isHi ? 'खाली छोड़ने पर पुराना आधार रहेगा' : 'Leave empty to keep existing'}
                        </p>
                      </div>

                      {/* PAN Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            {isHi ? 'पैन संख्या' : 'PAN Number'}
                          </label>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                            {selectedTenant.pan_masked || 'None'}
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={10}
                          value={editFormData.panNumber}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              panNumber: e.target.value.toUpperCase().slice(0, 10),
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-mono text-slate-900"
                          placeholder={isHi ? 'नया 10 अक्षर दर्ज करें' : 'Enter 10 chars to update'}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isHi ? 'खाली छोड़ने पर पुराना पैन रहेगा' : 'Leave empty to keep existing'}
                        </p>
                      </div>

                      {/* GST Number */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            {isHi ? 'जीएसटी नंबर' : 'GST Number'} <span className="text-slate-400 font-normal">({isHi ? 'वैकल्पिक' : 'Optional'})</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          maxLength={15}
                          value={editFormData.gstNumber}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              gstNumber: e.target.value.toUpperCase().slice(0, 15),
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-mono text-slate-900"
                          placeholder="e.g. 05AAAAA0000A1Z5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Shop Allotment & Monthly Rent */}
                  <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 space-y-4">
                    <h4 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-700" />
                      <span>{isHi ? '4. दुकान आवंटन एवं मासिक किराया (Shop Allotment & Rent)' : '4. Shop Allotment & Rent'}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Property / Shop Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'आवंटित दुकान / संपत्ति' : 'Allocated Shop / Property'}
                        </label>
                        <select
                          value={editFormData.propertyId}
                          onChange={(e) => handlePropertyChange(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-bold text-slate-900"
                        >
                          <option value="">{isHi ? '-- कोई दुकान आवंटित नहीं --' : '-- No Shop Allocated --'}</option>

                          {/* Current tenant property if assigned */}
                          {currentTenantAssignment?.property && (
                            <option value={currentTenantAssignment.property.id}>
                              [वर्तमान आवंटित / Current] {currentTenantAssignment.property.property_number} —{' '}
                              {currentTenantAssignment.property.property_name || currentTenantAssignment.property.location} (₹
                              {currentTenantAssignment.monthly_rent}/माह)
                            </option>
                          )}

                          {/* Available Vacant Properties */}
                          {availableProperties.map((prop) => {
                            if (prop.id === currentTenantAssignment?.property?.id) return null;
                            return (
                              <option key={prop.id} value={prop.id}>
                                [खाली दुकान] {prop.propertyNumber} — {prop.propertyName || prop.location} (मूल किराया: ₹
                                {prop.baseMonthlyRent}/माह)
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-[10px] text-amber-700 font-medium mt-1">
                          {isHi
                            ? 'दुकान बदलने पर पुरानी दुकान स्वतः खाली (Vacant) हो जाएगी और नई दुकान आवंटित हो जाएगी।'
                            : 'Changing shop will automatically vacate previous shop and allot the newly chosen one.'}
                        </p>
                      </div>

                      {/* Monthly Rent */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {isHi ? 'मासिक किराया (₹)' : 'Monthly Rent (₹)'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={editFormData.monthlyRent}
                            onChange={(e) => setEditFormData({ ...editFormData, monthlyRent: e.target.value })}
                            className="w-full pl-8 pr-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-extrabold text-slate-900"
                            placeholder="e.g. 2500"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {isHi
                            ? 'किराया संशोधन आधिकारिक रेंट चेंज रजिस्टर में दर्ज होगा।'
                            : 'Rent changes are logged with full administrative audit trail.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Security / Password Reset by Admin */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4 text-navy-700" />
                      <span>{isHi ? '5. सुरक्षा एवं पासवर्ड रीसेट (Security & Password)' : '5. Security & Password'}</span>
                    </h4>

                    <div className="max-w-md">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isHi ? 'नया पासवर्ड निर्धारित करें' : 'Reset Tenant Login Password'}
                      </label>
                      <input
                        type="password"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-mono text-slate-900"
                        placeholder={isHi ? 'न्यूनतम 6 अक्षर (खाली रखने पर पासवर्ड नहीं बदलेगा)' : 'Min 6 characters (Leave empty to keep current)'}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        {isHi
                          ? 'प्रशासक सीधे किरायेदार का पासवर्ड रीसेट कर सकते हैं।'
                          : 'Admin can directly update tenant portal password here.'}
                      </p>
                    </div>
                  </div>

                  {/* Section 6: Documents & File Vault (Inline images + File replacers) */}
                  <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-navy-950 tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4 text-navy-700" />
                        <span>{isHi ? '6. दस्तावेज बदलें या नया अपलोड करें (Upload Documents)' : '6. Documents Vault & Updates'}</span>
                      </h4>
                      <span className="text-[11px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        Auto .WebP S3 Storage
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Profile Photo */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isHi ? 'प्रोफ़ाइल फोटो' : 'Profile Photo'}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, profilePhotoFile: e.target.files?.[0] || null })
                          }
                          className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        />
                      </div>

                      {/* Aadhaar Card */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isHi ? 'आधार कार्ड' : 'Aadhaar Card'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, aadhaarFile: e.target.files?.[0] || null })
                          }
                          className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        />
                      </div>

                      {/* PAN Card */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isHi ? 'पैन कार्ड' : 'PAN Card'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, panFile: e.target.files?.[0] || null })
                          }
                          className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        />
                      </div>

                      {/* Domicile Certificate */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isHi ? 'निवास प्रमाण पत्र' : 'Domicile Certificate'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, domicileFile: e.target.files?.[0] || null })
                          }
                          className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        />
                      </div>

                      {/* GST Certificate */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {isHi ? 'जीएसटी प्रमाण पत्र' : 'GST Certificate'}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, gstFile: e.target.files?.[0] || null })
                          }
                          className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {isHi ? 'रद्द करें' : 'Cancel'}
                    </button>

                    <button
                      type="submit"
                      disabled={savingChanges}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-ukgreen-600 to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:from-ukgreen-700 hover:to-emerald-700 shadow-md shadow-ukgreen-600/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {savingChanges ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isHi ? 'संशोधन सहेजें (Save Changes)' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ── FULL SCREEN IMAGE LIGHTBOX / PREVIEW ── */}
        {previewImage && (
          <div
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-navy-950 text-white flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm truncate">{previewImage.title}</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 overflow-auto flex items-center justify-center bg-slate-900">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        <AdminConfirmModal
          isOpen={confirmModal.isOpen}
          title={
            confirmModal.tenant?.status === 'ACTIVE'
              ? isHi ? 'किरायेदार खाता निष्क्रिय करें' : 'Deactivate Tenant Account'
              : isHi ? 'किरायेदार खाता सक्रिय करें' : 'Activate Tenant Account'
          }
          message={
            confirmModal.tenant?.status === 'ACTIVE'
              ? isHi
                ? 'क्या आप वाकई इस किरायेदार का खाता निष्क्रिय (Inactive) करना चाहते हैं? निष्क्रिय स्थिति में किरायेदार पोर्टल सेवाओं का उपयोग नहीं कर सकेंगे।'
                : 'Are you sure you want to deactivate this tenant? They will not be able to log in to the tenant portal until reactivated.'
              : isHi
                ? 'क्या आप इस किरायेदार का खाता पुनः सक्रिय (Active) करना चाहते हैं?'
                : 'Are you sure you want to reactivate this tenant account?'
          }
          subject={
            confirmModal.tenant
              ? `${confirmModal.tenant.fullName} (${confirmModal.tenant.userCode}) • ${confirmModal.tenant.mobile}`
              : undefined
          }
          variant={confirmModal.tenant?.status === 'ACTIVE' ? 'danger' : 'success'}
          iconType={confirmModal.tenant?.status === 'ACTIVE' ? 'userX' : 'check'}
          confirmText={
            confirmModal.tenant?.status === 'ACTIVE'
              ? isHi ? 'हां, निष्क्रिय करें' : 'Deactivate'
              : isHi ? 'हां, सक्रिय करें' : 'Activate'
          }
          denyText={isHi ? 'रद्द करें (Cancel)' : 'Cancel'}
          loading={confirmModal.loading}
          onConfirm={handleConfirmToggleStatus}
          onDeny={() => setConfirmModal({ isOpen: false, tenant: null, loading: false })}
        />
      </div>
    </AdminLayout>
  );
};
