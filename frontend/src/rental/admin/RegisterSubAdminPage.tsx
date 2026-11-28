import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalAuthApi } from '../services/rentalAuth.service';
import { toAsciiDigits, transliterateToHindiManual } from '../utils/transliterate';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react';

export const RegisterSubAdminPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001';

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    initialPassword: '',
    permissions: ['manage_tenants', 'view_bills', 'record_payments'],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [translatingName, setTranslatingName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTransliterateName = async () => {
    if (!formData.fullName.trim()) return;
    setTranslatingName(true);
    try {
      const converted = await transliterateToHindiManual(formData.fullName);
      setFormData((prev) => ({ ...prev, fullName: converted }));
    } finally {
      setTranslatingName(false);
    }
  };

  const handleTogglePermission = (perm: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== perm)
          : [...prev.permissions, perm],
      };
    });
  };

  const handleCopyCredentials = () => {
    if (!successData) return;
    const text = `Zila Panchayat Almora - Rental Admin Portal\nOfficer: ${successData.fullName}\nMobile (Login ID): ${successData.mobile}\nPassword: ${successData.initialPassword}\nPortal: ${window.location.origin}/rental/admin/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanFullName = toAsciiDigits(formData.fullName.trim());
    const cleanMobile = toAsciiDigits(formData.mobile).replace(/\D/g, '').slice(0, 10);
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.initialPassword;

    if (!cleanFullName || !cleanMobile || !cleanPassword) {
      setErrorMsg(
        isHi ? 'कृपया नाम, मोबाइल नंबर और पासवर्ड भरें।' : 'Please enter name, mobile number, and password.'
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg(
        isHi
          ? 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें (6-9 से शुरू)।'
          : 'Please enter a valid 10-digit mobile number starting with 6-9.'
      );
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg(isHi ? 'कृपया मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg(
        isHi ? 'पासवर्ड न्यूनतम 8 अक्षरों का होना चाहिए।' : 'Password must be at least 8 characters long.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await rentalAuthApi.createSubAdmin({
        fullName: cleanFullName,
        mobile: cleanMobile,
        email: cleanEmail || undefined,
        initialPassword: cleanPassword,
        permissions: formData.permissions,
      });

      if (res && res.success) {
        setSuccessData({
          fullName: cleanFullName,
          mobile: cleanMobile,
          email: cleanEmail,
          initialPassword: cleanPassword,
          permissions: formData.permissions,
        });
      } else {
        setErrorMsg(res?.message || (isHi ? 'पंजीकरण विफल रहा।' : 'Registration failed.'));
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || (isHi ? 'पंजीकरण विफल रहा।' : 'Registration failed.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      initialPassword: '',
      permissions: ['manage_tenants', 'view_bills', 'record_payments'],
    });
    setErrorMsg('');
  };

  if (!isSuperAdmin) {
    return (
      <AdminLayout
        title={isHi ? 'अनधिकृत पहुंच' : 'Access Restricted'}
        breadcrumbs={[{ label: isHi ? 'उप-प्रशासक' : 'Sub-Admins', to: '/rental/admin/subadmins' }]}
      >
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs text-center max-w-lg mx-auto space-y-4 my-8">
          <h2 className="text-lg font-bold text-slate-900">
            {isHi ? 'केवल मुख्य प्रशासनिक अधिकारी हेतु आरक्षित' : 'Super Admin Privileges Required'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isHi
              ? 'उप-प्रशासकों का नया पंजीकरण केवल ज़िला पंचायत अल्मोड़ा के मुख्य प्रशासनिक अधिकारी द्वारा ही किया जा सकता है।'
              : 'Sub-Administrator registration is restricted to the Super Administrator of Zila Panchayat Almora.'}
          </p>
          <div className="pt-2">
            <NavLink
              to="/rental/admin/subadmins"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHi ? 'वापस' : 'Back'}</span>
            </NavLink>
          </div>
        </div>
      </AdminLayout>
    );  
  }

  return (
    <AdminLayout
      title={isHi ? 'नया उप-प्रशासक पंजीकरण' : 'Register Sub-Administrator'}
      breadcrumbs={[
        { label: isHi ? 'उप-प्रशासक' : 'Sub-Admins', to: '/rental/admin/subadmins' },
        { label: isHi ? 'नया पंजीकरण' : 'New Registration' },
      ]}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <NavLink
            to="/rental/admin/subadmins"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1.5 px-2.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{isHi ? 'वापस' : 'Back'}</span>
          </NavLink>
        </div>

        {successData ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {isHi ? 'उप-प्रशासक सफलतापूर्वक पंजीकृत हो गया!' : 'Sub-Admin Registered Successfully!'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isHi
                  ? 'अधिकारी अपने मोबाइल नंबर और पासवर्ड से लॉगिन कर सकते हैं।'
                  : 'The officer can sign in using their 10-digit mobile number and password.'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-3 max-w-md mx-auto text-xs">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{isHi ? 'अधिकारी का नाम' : 'Full Name'}:</span>
                <span className="font-bold text-slate-900 text-right">{successData.fullName}</span>
              </div>
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">
                  {isHi ? 'मोबाइल नंबर' : 'Mobile'}:
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">{successData.mobile}</span>
              </div>
              {successData.email && (
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">{isHi ? 'ईमेल' : 'Email'}:</span>
                  <span className="text-slate-700 break-all text-right">{successData.email}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">{isHi ? 'पासवर्ड' : 'Password'}:</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 tabular-nums">
                  {successData.initialPassword}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>
                  {copied
                    ? isHi
                      ? 'कॉपी हो गया'
                      : 'Copied'
                    : isHi
                      ? 'लॉगिन विवरण कॉपी करें'
                      : 'Copy Credentials'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition cursor-pointer"
              >
                {isHi ? '+ एक और जोड़ें' : '+ Register Another'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/rental/admin/subadmins')}
                className="px-5 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isHi ? 'सूची देखें' : 'View Sub-Admins'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isHi ? 'नया उप-प्रशासक खाता' : 'New Sub-Admin Account'}
                </h2>
              </div>
            </div>

            {errorMsg && (
              <div className="mx-4 mt-4 sm:mx-6 sm:mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'अधिकारी का पूरा नाम' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] outline-none text-sm text-slate-900 transition placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={handleTransliterateName}
                      disabled={translatingName || !formData.fullName.trim()}
                      title={isHi ? 'English को हिंदी में बदलें' : 'Convert English text to Hindi'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-45 px-2 py-1 rounded font-semibold transition cursor-pointer"
                    >
                      {translatingName ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      ) : (
                        '🌐'
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile: toAsciiDigits(e.target.value).replace(/\D/g, '').slice(0, 10),
                      })
                    }
                    placeholder="9412000002"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] outline-none text-sm text-slate-900 tabular-nums transition placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'ईमेल (वैकल्पिक)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="subadmin@almora.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] outline-none text-sm text-slate-900 transition placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'पासवर्ड (न्यूनतम 8 अक्षर)' : 'Password (min 8 chars)'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.initialPassword}
                      onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                      placeholder="********"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B3B60] focus:ring-1 focus:ring-[#0B3B60] outline-none text-sm text-slate-900 transition placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-0.5 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {isHi ? 'प्रशासनिक अधिकार' : 'Administrative Permissions'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      key: 'manage_tenants',
                      labelHi: 'किरायेदार प्रबंधन',
                      labelEn: 'Tenant Management',
                    },
                    {
                      key: 'view_bills',
                      labelHi: 'बिलिंग व बकाया',
                      labelEn: 'Billing & Arrears',
                    },
                    {
                      key: 'record_payments',
                      labelHi: 'काउंटर वसूली',
                      labelEn: 'Counter Collections',
                    },
                  ].map((perm) => {
                    const active = formData.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`px-3.5 py-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center gap-2.5 select-none ${
                          active
                            ? 'bg-slate-900/5 border-[#0B3B60] text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleTogglePermission(perm.key)}
                          className="rounded text-[#0B3B60] focus:ring-0"
                        />
                        <span>{isHi ? perm.labelHi : perm.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <NavLink
                  to="/rental/admin/subadmins"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </NavLink>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold text-xs text-center transition cursor-pointer disabled:opacity-60"
                >
                  {submitting
                    ? isHi
                      ? 'सहेजा जा रहा है...'
                      : 'Creating...'
                    : isHi
                      ? 'उप-प्रशासक खाता बनाएं'
                      : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RegisterSubAdminPage;
