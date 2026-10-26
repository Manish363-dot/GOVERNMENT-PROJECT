import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalAuthApi } from '../services/rentalAuth.service';
import {
  Shield,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const RegisterSubAdminPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  // Super Admin validation
  const isSuperAdmin =
    user?.role === 'SUPER_ADMIN' ||
    user?.adminRole === 'SUPER_ADMIN' ||
    user?.mobile === '9412000001' ||
    user?.identifier === '9412000001' ||
    user?.identifier === 'almora_superadmin';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    username: '',
    email: '',
    initialPassword: '',
    permissions: ['manage_tenants', 'view_bills', 'record_payments'],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Toggle single permission checkbox
  const handleTogglePermission = (perm: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== perm) };
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] };
      }
    });
  };

  const handleCopyCredentials = () => {
    if (!successData) return;
    const text = `Zila Panchayat Almora - Rental Portal\nUsername: ${successData.username}\nPassword: ${successData.initialPassword}\nPortal: ${window.location.origin}/rental/admin/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanFullName = formData.fullName.trim();
    const cleanUsername = formData.username.trim().toLowerCase();
    const cleanMobile = formData.mobile.trim();
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.initialPassword;

    if (!cleanFullName || !cleanUsername || !cleanMobile || !cleanPassword) {
      setErrorMsg(isHi ? 'कृपया सभी अनिवार्य (*) फ़ील्ड भरें।' : 'Please fill all mandatory (*) fields.');
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

    if (cleanUsername.length < 3) {
      setErrorMsg(
        isHi ? 'यूजरनेम न्यूनतम 3 अक्षरों का होना चाहिए।' : 'Username must be at least 3 characters long.'
      );
      return;
    }

    if (cleanPassword.length < 8) {
      setErrorMsg(
        isHi ? 'प्रारंभिक पासवर्ड न्यूनतम 8 अक्षरों का होना चाहिए।' : 'Password must be at least 8 characters long.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await rentalAuthApi.createSubAdmin({
        username: cleanUsername,
        fullName: cleanFullName,
        mobile: cleanMobile,
        email: cleanEmail || undefined,
        initialPassword: cleanPassword,
        permissions: formData.permissions,
      });

      if (res && res.success) {
        setSuccessData({
          fullName: cleanFullName,
          username: cleanUsername,
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
      username: '',
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
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200/80">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isHi ? 'केवल मुख्य प्रशासनिक अधिकारी (Super Admin) हेतु आरक्षित' : 'Super Admin Privileges Required'}
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
              <span>{isHi ? 'उप-प्रशासक सूची पर लौटें' : 'Back to Sub-Admins'}</span>
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
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <NavLink
            to="/rental/admin/subadmins"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1.5 px-3 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{isHi ? 'उप-प्रशासक सूची पर वापस जाएं' : 'Back to Sub-Admins List'}</span>
          </NavLink>
          <span className="text-[11px] font-medium text-slate-400">
            {isHi ? 'ज़िला पंचायत अल्मोड़ा • आधिकारिक पोर्टल' : 'Zila Panchayat Almora • Official Admin Portal'}
          </span>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isHi ? 'उप-प्रशासक सफलतापूर्वक पंजीकृत हो गया!' : 'Sub-Admin Registered Successfully!'}
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isHi
                  ? 'अधिकारी का खाता सक्रिय कर दिया गया है। कृपया नीचे दिए गए लॉगिन क्रेडेंशियल्स सुरक्षित साझा करें।'
                  : 'Account has been activated. Please securely share the login credentials below.'}
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">{isHi ? 'अधिकारी का नाम' : 'Officer Name'}:</span>
                <span className="font-bold text-slate-800">{successData.fullName}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">{isHi ? 'मोबाइल नंबर' : 'Mobile Number'}:</span>
                <span className="font-mono font-semibold text-slate-800">{successData.mobile}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">{isHi ? 'लॉगिन यूजरनेम' : 'Login Username'}:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  @{successData.username}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs">
                <span className="text-slate-500 font-medium">{isHi ? 'प्रारंभिक पासवर्ड' : 'Initial Password'}:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {successData.initialPassword}
                </span>
              </div>
              {successData.email && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{isHi ? 'शासकीय ईमेल' : 'Official Email'}:</span>
                  <span className="text-slate-700">{successData.email}</span>
                </div>
              )}
            </div>

            {/* Copy Button & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'क्रेडेंशियल्स कॉपी करें' : 'Copy Credentials')}</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-slate-600" />
                <span>{isHi ? '+ अन्य उप-प्रशासक जोड़ें' : '+ Register Another'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/rental/admin/subadmins')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>{isHi ? 'उप-प्रशासक सूची देखें' : 'View Sub-Admins List'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Registration Form Card */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header Strip */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isHi ? 'अधिकारी विवरण एवं खाता निर्माण' : 'Officer Details & Account Creation'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isHi ? 'ज़िला पंचायत अल्मोड़ा के अधिकृत राजस्व निरीक्षक / उप-प्रशासक' : 'Authorized Revenue Inspector / Sub-Administrator'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {isHi ? 'अनिवार्य फ़ील्ड (*)' : 'Mandatory Fields (*)'}
              </span>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="m-5 sm:m-6 mb-0 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'अधिकारी का पूरा नाम *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder={isHi ? 'उदा. हरीश सिंह कार्की' : 'e.g. Harish Singh Karki'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs text-slate-800 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Number (10 digits) *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="9412000002"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs text-slate-800 font-mono transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'पोर्टल यूजरनेम *' : 'Portal Username *'}
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-mono absolute left-3.5 top-2.5 text-xs pointer-events-none">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        })
                      }
                      placeholder="almora_subadmin1"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs text-slate-800 font-mono transition placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHi ? 'केवल छोटे अक्षर, संख्याएं एवं underscore (_) मान्य' : 'Only lowercase letters, numbers, and underscore (_)'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {isHi ? 'शासकीय ईमेल (वैकल्पिक)' : 'Official Email (Optional)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="subadmin@almora.gov.in"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs text-slate-800 transition placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHi ? 'अधिसूचनाओं हेतु यदि उपलब्ध हो' : 'For official alerts if available'}
                  </p>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isHi ? 'प्रारंभिक पासवर्ड * (न्यूनतम 8 अक्षर)' : 'Initial Password * (min 8 chars)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={formData.initialPassword}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    placeholder="Almora@2026#Sub"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-xs text-slate-800 font-mono transition placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {isHi
                    ? 'अधिकारी इस पासवर्ड से प्रथम लॉगिन कर बाद में पासवर्ड बदल सकेंगे।'
                    : 'The officer will use this password for initial login and can change it later.'}
                </p>
              </div>

              {/* Permissions Section */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {isHi ? 'प्रशासनिक अनुमतियां एवं अधिकार' : 'Administrative Roles & Privileges'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => handleTogglePermission('manage_tenants')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      formData.permissions.includes('manage_tenants')
                        ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('manage_tenants')}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        {isHi ? 'किरायेदार प्रबंधन' : 'Tenant Management'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isHi ? 'आवंटन व किरायेदार विवरण' : 'Allotment & tenant profiles'}
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => handleTogglePermission('view_bills')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      formData.permissions.includes('view_bills')
                        ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('view_bills')}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        {isHi ? 'बिलिंग व बकाया' : 'Billing & Arrears'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isHi ? 'मासिक मांग व चालान विवरण' : 'Demand bills & balances'}
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => handleTogglePermission('record_payments')}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      formData.permissions.includes('record_payments')
                        ? 'bg-blue-50/60 border-blue-200 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes('record_payments')}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-blue-600 focus:ring-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900">
                        {isHi ? 'काउंटर भुगतान' : 'Counter Collections'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isHi ? 'वसूली प्रविष्टि व रसीद' : 'Record payments & receipts'}
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <NavLink
                  to="/rental/admin/subadmins"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </NavLink>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0b1b36] hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  <span>{isHi ? 'उप-प्रशासक खाता बनाएं' : 'Create Sub-Admin Account'}</span>
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
