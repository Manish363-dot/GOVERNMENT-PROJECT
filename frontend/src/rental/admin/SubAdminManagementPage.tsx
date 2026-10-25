import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalAuthApi } from '../services/rentalAuth.service';
import {
  Shield,
  UserPlus,
  CheckCircle2,
  XCircle,
  Search,
  Key,
  Phone,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SubAdmin {
  id: string;
  username: string;
  fullName?: string;
  full_name?: string;
  mobile: string;
  email?: string;
  role: 'SUB_ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
  createdAt?: string;
  created_at?: string;
}

const getAdminName = (a?: SubAdmin | null) => (a && (a.fullName || a.full_name || a.username)) || 'Officer';
const getAdminDate = (a?: SubAdmin | null) => (a && (a.createdAt || a.created_at)) || new Date().toISOString();

export const SubAdminManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();

  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    mobile: '',
    email: '',
    initialPassword: '',
    permissions: ['manage_tenants', 'view_bills', 'record_payments'],
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchSubAdmins = async () => {
    setLoading(true);
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

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001' ||
    user?.identifier === 'almora_superadmin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSubAdmins();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const handleToggleStatus = async (admin: SubAdmin) => {
    const adminName = getAdminName(admin);
    const newStatus = admin.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = isHi
      ? `क्या आप वाकई ${adminName} (${admin.username}) को ${newStatus === 'ACTIVE' ? 'सक्रिय' : 'निलंबित'} करना चाहते हैं?`
      : `Are you sure you want to mark ${adminName} as ${newStatus}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await rentalAuthApi.toggleSubAdminStatus(admin.id, newStatus);
      setSubAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Status update failed');
    }
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.username.trim() || !formData.fullName.trim() || !formData.mobile.trim() || !formData.initialPassword) {
      setErrorMsg(isHi ? 'कृपया सभी अनिवार्य फ़ील्ड भरें।' : 'Please fill all mandatory fields.');
      return;
    }

    if (formData.mobile.length !== 10) {
      setErrorMsg(isHi ? 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (formData.initialPassword.length < 8) {
      setErrorMsg(isHi ? 'पासवर्ड न्यूनतम 8 अक्षरों का होना चाहिए।' : 'Password must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await rentalAuthApi.createSubAdmin({
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || undefined,
        initialPassword: formData.initialPassword,
        permissions: formData.permissions,
      });

      if (res && res.success) {
        setSuccessMsg(
          isHi
            ? `उप-प्रशासक "${formData.fullName}" सफलतापूर्वक पंजीकृत हो गया है!`
            : `Sub-Admin "${formData.fullName}" registered successfully!`
        );
        setFormData({
          username: '',
          fullName: '',
          mobile: '',
          email: '',
          initialPassword: '',
          permissions: ['manage_tenants', 'view_bills', 'record_payments'],
        });
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg('');
          fetchSubAdmins();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || (isHi ? 'पंजीकरण विफल रहा।' : 'Registration failed.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = (subAdmins || []).filter((a) => {
    if (!a) return false;
    const name = getAdminName(a);
    const uName = a.username || '';
    const mob = a.mobile || '';
    const q = (search || '').trim().toLowerCase();
    if (!q) return true;
    return (
      name.toLowerCase().includes(q) ||
      uName.toLowerCase().includes(q) ||
      mob.includes(q)
    );
  });

  if (!isSuperAdmin) {
    return (
      <AdminLayout
        title={isHi ? 'अनधिकृत पहुंच (Access Denied)' : 'Restricted Access'}
        breadcrumbs={[{ label: isHi ? 'उप-प्रशासक' : 'Sub-Admins' }]}
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {isHi ? 'केवल मुख्य प्रशासनिक अधिकारी (Super Admin) हेतु आरक्षित' : 'Super Admin Privileges Required'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isHi
              ? 'उप-प्रशासकों (Sub-Admins) का नया पंजीकरण, अधिकार संशोधन एवं निलंबन केवल ज़िला पंचायत अल्मोड़ा के मुख्य प्रशासनिक अधिकारी द्वारा ही किया जा सकता है।'
              : 'Registration, privilege delegation, and account suspension of sub-administrators is strictly restricted to the Super Administrator of Zila Panchayat Almora.'}
          </p>
          <div className="pt-4 flex justify-center">
            <NavLink
              to="/rental/admin/dashboard"
              className="px-5 py-2.5 bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition shadow-sm"
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
      title={isHi ? 'उप-प्रशासक प्रबंधन (Sub-Admins)' : 'Sub-Admin Management'}
      subtitle={
        isHi
          ? 'सुपर एडमिन नियंत्रण — ज़िला पंचायत अल्मोड़ा के राजस्व अधिकारियों व उप-प्रशासकों का पंजीकरण एवं अधिकार'
          : 'Super Admin Authority — Register sub-administrators, tax inspectors, and manage system roles'
      }
      breadcrumbs={[{ label: isHi ? 'उप-प्रशासक' : 'Sub-Admins' }]}
    >
      {/* Top Privilege Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isHi ? 'उप-प्रशासक एवं राजस्व निरीक्षक रोस्टर' : 'Sub-Administrators & Officers Roster'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30 text-[10px] font-bold uppercase">
                Super Admin Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isHi
                ? 'उप-प्रशासक केवल किरायेदार जोड़ सकते हैं और काउंटर पर किराया रसीद काट सकते हैं।'
                : 'Sub-admins have role-based permissions to manage allotments and collect municipal counter payments.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubAdmins}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isHi ? '+ नया उप-प्रशासक जोड़ें' : '+ Register Sub-Admin'}</span>
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isHi ? 'नाम, यूजरनेम या मोबाइल नंबर से खोजें...' : 'Search by full name, username, or mobile...'}
          className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
            Clear
          </button>
        )}
      </div>

      {/* Sub-Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredAdmins.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">{isHi ? 'अधिकारी का नाम' : 'Officer Name'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'यूजरनेम' : 'Username'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'मोबाइल नंबर' : 'Mobile'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'ईमेल' : 'Email'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'स्थिति' : 'Status'}</th>
                  <th className="py-3.5 px-4">{isHi ? 'पंजीकरण तिथि' : 'Created Date'}</th>
                  <th className="py-3.5 px-4 text-right">{isHi ? 'कार्यवाही' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((admin) => {
                  const adminName = getAdminName(admin);
                  const adminDateStr = getAdminDate(admin);
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs uppercase">
                          {adminName.slice(0, 2)}
                        </div>
                        <div>
                          <div>{adminName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Sub-Administrator</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                        @{admin.username || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {admin.mobile || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {admin.email || '—'}
                      </td>
                      <td className="py-3 px-4">
                        {admin.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isHi ? 'सक्रिय' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>{isHi ? 'निलंबित' : 'Suspended'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(adminDateStr).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          admin.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
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
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Shield className="w-10 h-10 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">
                {isHi ? 'कोई उप-प्रशासक नहीं मिला।' : 'No Sub-Admins Found.'}
              </div>
              <p className="text-xs text-slate-400">
                {isHi
                  ? 'आप "+ नया उप-प्रशासक जोड़ें" बटन दबाकर राजस्व कर्मियों के खाते बना सकते हैं।'
                  : 'Click the button above to register a new sub-administrator.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          REGISTER SUB-ADMIN MODAL
      ──────────────────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isHi ? 'नया उप-प्रशासक खाता बनाएं' : 'Register New Sub-Admin'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isHi
                    ? 'जिला पंचायत अल्मोड़ा — वाणिज्यिक रेंटल प्रबंधन'
                    : 'Zila Panchayat Almora — Commercial Asset Management'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHi ? 'अधिकारी का पूरा नाम *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={isHi ? 'उदा. हरीश सिंह कार्की' : 'e.g. Harish Singh Karki'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHi ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Number (10 digits) *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="9412000002"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isHi ? 'यूजरनेम *' : 'Username *'}
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-mono absolute left-3 top-2 text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      placeholder="almora_subadmin1"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHi ? 'शासकीय ईमेल (वैकल्पिक)' : 'Official Email (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="subadmin@almora.gov.in"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isHi ? 'प्रारंभिक पासवर्ड * (न्यूनतम 8 अक्षर)' : 'Initial Password * (min 8 chars)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={formData.initialPassword}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    placeholder="Almora@2026#Sub"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold flex items-center gap-1.5 shadow"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isHi ? 'उप-प्रशासक बनाएं' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SubAdminManagementPage;
