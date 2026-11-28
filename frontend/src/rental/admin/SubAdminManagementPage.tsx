import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminConfirmModal } from './AdminConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';
import { rentalAuthApi } from '../services/rentalAuth.service';
import { toAsciiDigits, transliterateToHindiManual } from '../utils/transliterate';
import { Search, RefreshCw, Lock, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

interface SubAdmin {
  id: string;
  fullName?: string;
  full_name?: string;
  mobile: string;
  email?: string | null;
  role: 'SUB_ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
  createdAt?: string;
  created_at?: string;
}

const getAdminName = (a?: SubAdmin | null) => {
  const raw = (a && (a.fullName || a.full_name || a.mobile)) || 'Officer';
  return raw
    .replace(/\s*\(\s*सहायक\s+कर\s+अधीक्षक\s*\/\s*उप-प्रशासक\s*\)\s*/gi, '')
    .trim();
};
const getAdminDate = (a?: SubAdmin | null) =>
  (a && (a.createdAt || a.created_at)) || new Date().toISOString();

const PERMISSION_OPTIONS = [
  { key: 'manage_tenants', labelHi: 'किरायेदार प्रबंधन', labelEn: 'Tenant Management' },
  { key: 'view_bills', labelHi: 'बिलिंग व बकाया', labelEn: 'Billing & Arrears' },
  { key: 'record_payments', labelHi: 'काउंटर वसूली', labelEn: 'Counter Collections' },
];

export const SubAdminManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  const initialAdminsCache = api.peekCache<{ data: SubAdmin[] }>('/rental/auth/admin/subadmins')?.data;
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>(
    Array.isArray(initialAdminsCache) ? initialAdminsCache : []
  );
  const [loading, setLoading] = useState(!initialAdminsCache);
  const [search, setSearch] = useState('');

  // Status / Delete confirmation modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'status' | 'delete';
    admin: SubAdmin | null;
    loading: boolean;
  }>({
    isOpen: false,
    mode: 'status',
    admin: null,
    loading: false,
  });

  // Edit profile modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    admin: SubAdmin | null;
    fullName: string;
    mobile: string;
    email: string;
    password: string;
    permissions: string[];
    showPassword: boolean;
    translatingName: boolean;
    saving: boolean;
    error: string;
  }>({
    isOpen: false,
    admin: null,
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    permissions: ['manage_tenants', 'view_bills', 'record_payments'],
    showPassword: false,
    translatingName: false,
    saving: false,
    error: '',
  });

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001';

  const fetchSubAdmins = async () => {
    if (subAdmins.length === 0) setLoading(true);
    try {
      const res = await rentalAuthApi.listSubAdmins();
      if (res && Array.isArray(res.data)) {
        setSubAdmins(res.data);
      }
    } catch (err: any) {
      console.error('Failed to list sub-admins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSubAdmins();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const requestToggleStatus = (admin: SubAdmin) => {
    setConfirmModal({
      isOpen: true,
      mode: 'status',
      admin,
      loading: false,
    });
  };

  const requestDeleteSubAdmin = (admin: SubAdmin) => {
    setConfirmModal({
      isOpen: true,
      mode: 'delete',
      admin,
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.admin) return;
    const admin = confirmModal.admin;
    setConfirmModal((prev) => ({ ...prev, loading: true }));

    if (confirmModal.mode === 'delete') {
      try {
        await rentalAuthApi.deleteSubAdmin(admin.id);
        setSubAdmins((prev) => prev.filter((a) => a.id !== admin.id));
        setConfirmModal({ isOpen: false, mode: 'status', admin: null, loading: false });
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Delete failed');
        setConfirmModal((prev) => ({ ...prev, loading: false }));
      }
      return;
    }

    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await rentalAuthApi.toggleSubAdminStatus(admin.id, newStatus);
      setSubAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
      );
      setConfirmModal({ isOpen: false, mode: 'status', admin: null, loading: false });
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Status update failed');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openEditProfileModal = (admin: SubAdmin) => {
    setEditModal({
      isOpen: true,
      admin,
      fullName: getAdminName(admin),
      mobile: admin.mobile || '',
      email: admin.email || '',
      password: '',
      permissions:
        Array.isArray(admin.permissions) && admin.permissions.length > 0
          ? admin.permissions
          : ['manage_tenants', 'view_bills', 'record_payments'],
      showPassword: false,
      translatingName: false,
      saving: false,
      error: '',
    });
  };

  const handleTransliterateEditName = async () => {
    if (!editModal.fullName.trim()) return;
    setEditModal((p) => ({ ...p, translatingName: true }));
    try {
      const converted = await transliterateToHindiManual(editModal.fullName);
      setEditModal((p) => ({ ...p, fullName: converted, translatingName: false }));
    } catch {
      setEditModal((p) => ({ ...p, translatingName: false }));
    }
  };

  const closeEditProfileModal = () => {
    if (editModal.saving) return;
    setEditModal((prev) => ({ ...prev, isOpen: false, admin: null, error: '' }));
  };

  const handleToggleEditPerm = (permKey: string) => {
    setEditModal((prev) => {
      const exists = prev.permissions.includes(permKey);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permKey)
          : [...prev.permissions, permKey],
      };
    });
  };

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.admin) return;

    const cleanName = toAsciiDigits(editModal.fullName.trim());
    const cleanMobile = toAsciiDigits(editModal.mobile).replace(/\D/g, '').slice(0, 10);
    const cleanEmail = editModal.email.trim();
    const cleanPassword = editModal.password;

    if (!cleanName || cleanName.length < 2) {
      setEditModal((prev) => ({
        ...prev,
        error: isHi ? 'कृपया अधिकारी का मान्य नाम दर्ज करें।' : 'Please enter a valid full name.',
      }));
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setEditModal((prev) => ({
        ...prev,
        error: isHi
          ? 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (6-9 से शुरू)।'
          : 'Please enter a valid 10-digit mobile number starting with 6-9.',
      }));
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEditModal((prev) => ({
        ...prev,
        error: isHi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.',
      }));
      return;
    }

    if (cleanPassword && cleanPassword.length < 8) {
      setEditModal((prev) => ({
        ...prev,
        error: isHi
          ? 'नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'
          : 'New password must be at least 8 characters.',
      }));
      return;
    }

    setEditModal((prev) => ({ ...prev, saving: true, error: '' }));

    try {
      const res = await rentalAuthApi.updateSubAdmin(editModal.admin.id, {
        fullName: cleanName,
        mobile: cleanMobile,
        email: cleanEmail || null,
        password: cleanPassword || undefined,
        permissions: editModal.permissions,
      });

      const updated = res?.data;
      setSubAdmins((prev) =>
        prev.map((a) =>
          a.id === editModal.admin?.id
            ? {
                ...a,
                fullName: updated?.fullName ?? cleanName,
                full_name: updated?.full_name ?? cleanName,
                mobile: updated?.mobile ?? cleanMobile,
                email: updated?.email !== undefined ? updated.email : cleanEmail || null,
                permissions: updated?.permissions ?? editModal.permissions,
              }
            : a
        )
      );
      setEditModal((prev) => ({ ...prev, isOpen: false, admin: null, saving: false, error: '' }));
    } catch (err: any) {
      setEditModal((prev) => ({
        ...prev,
        saving: false,
        error:
          err.response?.data?.message ||
          err.message ||
          (isHi ? 'प्रोफ़ाइल अपडेट करने में त्रुटि हुई।' : 'Failed to update profile.'),
      }));
    }
  };

  const filteredAdmins = (subAdmins || []).filter((a) => {
    if (!a) return false;
    const name = getAdminName(a).toLowerCase();
    const mob = (a.mobile || '').toLowerCase();
    const email = (a.email || '').toLowerCase();
    const q = toAsciiDigits(search || '').trim().toLowerCase();
    if (!q) return true;
    return name.includes(q) || mob.includes(q) || email.includes(q);
  });

  if (!isSuperAdmin) {
    return (
      <AdminLayout
        title={isHi ? 'अनधिकृत पहुंच' : 'Restricted Access'}
        breadcrumbs={[{ label: isHi ? 'उप-प्रशासक' : 'Sub-Admins' }]}
      >
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {isHi ? 'केवल मुख्य प्रशासनिक अधिकारी हेतु आरक्षित' : 'Super Admin Privileges Required'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'उप-प्रशासकों का नया पंजीकरण, प्रोफ़ाइल संशोधन एवं निलंबन केवल ज़िला पंचायत अल्मोड़ा के मुख्य प्रशासनिक अधिकारी द्वारा ही किया जा सकता है।'
              : 'Registration, profile editing, and account status controls are restricted to the Super Administrator of Zila Panchayat Almora.'}
          </p>
          <div className="pt-2 flex justify-center">
            <NavLink
              to="/rental/admin/dashboard"
              className="px-5 py-2.5 bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition"
            >
              {isHi ? '← डैशबोर्ड पर लौटें' : '← Return to Dashboard'}
            </NavLink>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isHi ? 'उप-प्रशासक प्रबंधन' : 'Sub-Admin Management'}
      breadcrumbs={[{ label: isHi ? 'उप-प्रशासक' : 'Sub-Admins' }]}
    >
      {/* Top Action Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {isHi ? 'उप-प्रशासक सूची' : 'Sub-Administrators Lists'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/register-subadmin')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 text-xs font-bold transition cursor-pointer text-center"
          >
            {isHi ? 'नया उप-प्रशासक जोड़ें' : 'Register Sub-Admin'}
          </button>
        </div>
      </div>
      {/* Directory Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAdmins.length === 0 ? (
          <div className="p-8 sm:p-10 text-center text-slate-400 space-y-2">
            <div className="text-sm font-semibold text-slate-700">
              {loading
                ? isHi
                  ? 'लोड हो रहा है...'
                  : 'Loading...'
                : isHi
                  ? 'कोई उप-प्रशासक नहीं मिला।'
                  : 'No Sub-Admins Found.'}
            </div>
            {!loading && (
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'नया खाता बनाने के लिए "+ नया उप-प्रशासक जोड़ें" बटन का उपयोग करें।'
                  : 'Click "+ Register Sub-Admin" above to create a sub-administrator account.'}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Responsive List View */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredAdmins.map((admin) => {
                const adminName = getAdminName(admin);
                const adminDateStr = getAdminDate(admin);
                return (
                  <div key={admin.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 break-words">{adminName}</h3>
                        <p className="text-xs font-semibold text-slate-700 tabular-nums mt-0.5">
                          {admin.mobile || '—'}
                        </p>
                        {admin.email && (
                          <p className="text-xs text-slate-500 break-all mt-0.5">{admin.email}</p>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                          admin.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {admin.status === 'ACTIVE'
                          ? isHi
                            ? 'सक्रिय'
                            : 'Active'
                          : isHi
                            ? 'निलंबित'
                            : 'Suspended'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {isHi ? 'पंजीकरण तिथि:' : 'Created:'}{' '}
                      {new Date(adminDateStr).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditProfileModal(admin)}
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
                      >
                        {isHi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
                      </button>

                      <button
                        type="button"
                        onClick={() => requestToggleStatus(admin)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                          admin.status === 'ACTIVE'
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {admin.status === 'ACTIVE'
                          ? isHi
                            ? 'निलंबित करें'
                            : 'Suspend'
                          : isHi
                            ? 'सक्रिय करें'
                            : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => requestDeleteSubAdmin(admin)}
                        className="col-span-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer"
                      >
                        {isHi ? 'खाता हटाएं (Delete)' : 'Delete Account'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <th className="py-3.5 px-4">{isHi ? 'अधिकारी का नाम' : 'Officer Name'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'मोबाइल नंबर' : 'Mobile'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'ईमेल' : 'Email'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'स्थिति' : 'Status'}</th>
                    <th className="py-3.5 px-4">{isHi ? 'पंजीकरण तिथि' : 'Created Date'}</th>
                    <th className="py-3.5 px-4 text-right">{isHi ? 'कार्यवाही' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdmins.map((admin) => {
                    const adminName = getAdminName(admin);
                    const adminDateStr = getAdminDate(admin);
                    return (
                      <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{adminName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800 tabular-nums">
                          {admin.mobile || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {admin.email || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              admin.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            {admin.status === 'ACTIVE'
                              ? isHi
                                ? 'सक्रिय'
                                : 'Active'
                              : isHi
                                ? 'निलंबित'
                                : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                          {new Date(adminDateStr).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProfileModal(admin)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
                            >
                              {isHi ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile'}
                            </button>

                            <button
                              type="button"
                              onClick={() => requestToggleStatus(admin)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                admin.status === 'ACTIVE'
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {admin.status === 'ACTIVE'
                                ? isHi
                                  ? 'निलंबित करें'
                                  : 'Suspend'
                                : isHi
                                  ? 'सक्रिय करें'
                                  : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => requestDeleteSubAdmin(admin)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer"
                            >
                              {isHi ? 'हटाएं' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModal.isOpen && editModal.admin && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={closeEditProfileModal}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#0b1b36] text-white flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  {isHi ? 'उप-प्रशासक प्रोफ़ाइल संपादन' : 'Edit Sub-Admin Profile'}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {getAdminName(editModal.admin)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditProfileModal}
                disabled={editModal.saving}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="p-4 sm:p-6 space-y-4">
              {editModal.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{editModal.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'अधिकारी का पूरा नाम ' : 'Full Name '}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={editModal.fullName}
                      onChange={(e) => setEditModal((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 focus:border-[#0B3B60] outline-none text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={handleTransliterateEditName}
                      disabled={editModal.translatingName || !editModal.fullName.trim()}
                      title={isHi ? 'English को हिंदी में बदलें' : 'Convert English text to Hindi'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-45 px-1.5 py-0.5 rounded font-semibold transition cursor-pointer"
                    >
                      {editModal.translatingName ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        '🌐'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editModal.mobile}
                    onChange={(e) =>
                      setEditModal((p) => ({
                        ...p,
                        mobile: toAsciiDigits(e.target.value).replace(/\D/g, '').slice(0, 10),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0B3B60] outline-none text-sm text-slate-900 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={editModal.email}
                    onChange={(e) => setEditModal((p) => ({ ...p, email: e.target.value }))}
                    placeholder="subadmin@almora.gov.in"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#0B3B60] outline-none text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'नया पासवर्ड (वैकल्पिक)' : 'New Password (Optional)'}
                  </label>
                  <div className="relative">
                    <input
                      type={editModal.showPassword ? 'text' : 'password'}
                      value={editModal.password}
                      onChange={(e) => setEditModal((p) => ({ ...p, password: e.target.value }))}
                      placeholder={isHi ? 'बदलने के लिए दर्ज करें' : 'Leave blank to keep'}
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-300 focus:border-[#0B3B60] outline-none text-sm text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setEditModal((p) => ({ ...p, showPassword: !p.showPassword }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label={editModal.showPassword ? 'Hide password' : 'Show password'}
                    >
                      {editModal.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? 'प्रशासनिक अधिकार' : 'Administrative Permissions'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const checked = editModal.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`px-3 py-2 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2 select-none ${
                          checked
                            ? 'bg-slate-900/5 border-[#0B3B60] text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleEditPerm(perm.key)}
                          className="rounded text-[#0B3B60] focus:ring-0"
                        />
                        <span>{isHi ? perm.labelHi : perm.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditProfileModal}
                  disabled={editModal.saving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="px-5 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold text-xs cursor-pointer disabled:opacity-60"
                >
                  {editModal.saving
                    ? isHi
                      ? 'अपडेट हो रहा है...'
                      : 'Saving...'
                    : isHi
                      ? 'परिवर्तन सहेजें'
                      : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status / Delete Confirmation Dialog */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.mode === 'delete'
            ? isHi
              ? 'उप-प्रशासक हटाने की पुष्टि'
              : 'Delete Sub-Administrator'
            : confirmModal.admin?.status === 'ACTIVE'
              ? isHi
                ? 'उप-प्रशासक निलंबन की पुष्टि'
                : 'Suspend Sub-Administrator'
              : isHi
                ? 'उप-प्रशासक सक्रिय करने की पुष्टि'
                : 'Activate Sub-Administrator'
        }
        message={
          confirmModal.mode === 'delete'
            ? isHi
              ? 'क्या आप वाकई इस उप-प्रशासक खाते को स्थायी रूप से हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।'
              : 'Are you sure you want to permanently delete this sub-administrator account? This action cannot be undone.'
            : confirmModal.admin?.status === 'ACTIVE'
              ? isHi
                ? 'क्या आप वाकई इस उप-प्रशासक को निलंबित करना चाहते हैं? निलंबन के बाद यह अधिकारी पोर्टल पर लॉगिन नहीं कर पाएंगे।'
                : 'Are you sure you want to suspend this sub-administrator? They will lose access until reactivated.'
              : isHi
                ? 'क्या आप इस उप-प्रशासक का खाता पुनः सक्रिय करना चाहते हैं?'
                : 'Are you sure you want to reactivate this sub-administrator account?'
        }
        subject={
          confirmModal.admin
            ? `${getAdminName(confirmModal.admin)} • ${confirmModal.admin.mobile}`
            : undefined
        }
        variant={
          confirmModal.mode === 'delete'
            ? 'danger'
            : confirmModal.admin?.status === 'ACTIVE'
              ? 'warning'
              : 'success'
        }
        iconType={
          confirmModal.mode === 'delete'
            ? 'trash'
            : confirmModal.admin?.status === 'ACTIVE'
              ? 'userX'
              : 'check'
        }
        confirmText={
          confirmModal.mode === 'delete'
            ? isHi
              ? 'हां, स्थायी रूप से हटाएं'
              : 'Yes, Delete Permanently'
            : confirmModal.admin?.status === 'ACTIVE'
              ? isHi
                ? 'हां, निलंबित करें'
                : 'Suspend Account'
              : isHi
                ? 'हां, सक्रिय करें'
                : 'Activate Account'
        }
        denyText={isHi ? 'रद्द करें' : 'Cancel'}
        loading={confirmModal.loading}
        onConfirm={handleConfirmAction}
        onDeny={() =>
          setConfirmModal({ isOpen: false, mode: 'status', admin: null, loading: false })
        }
      />
    </AdminLayout>
  );
};

export default SubAdminManagementPage;
