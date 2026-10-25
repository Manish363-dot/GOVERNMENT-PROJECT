import React, { useState, useEffect } from 'react';
import { UserLayout } from './UserLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalAuthApi, TenantProfileResponse } from '../services/rentalAuth.service';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  FileCheck2,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [profile, setProfile] = useState<TenantProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password modal state
  const [showPassModal, setShowPassModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalAuthApi.getUserProfile();
      setProfile(res.data);
    } catch (err: any) {
      setError(err.message || (isHi ? 'प्रोफ़ाइल लोड करने में असमर्थ' : 'Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (newPassword.length < 8) {
      setPassError(
        isHi
          ? 'नया पासवर्ड कम से कम 8 वर्णों का होना चाहिए'
          : 'New password must be at least 8 characters long'
      );
      return;
    }

    setPassLoading(true);
    try {
      await rentalAuthApi.changeUserPassword(currentPassword, newPassword);
      setPassMsg(isHi ? 'पासवर्ड सफलतापूर्वक बदल दिया गया' : 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPassModal(false), 2000);
    } catch (err: any) {
      setPassError(err.message || (isHi ? 'पासवर्ड बदलने में विफल' : 'Failed to change password'));
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <UserLayout
      title={isHi ? 'किरायेदार प्रोफ़ाइल एवं पहचान दस्तावेज' : 'Tenant Profile & Identity Documents'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा के रिकॉर्ड में पंजीकृत आपकी आधिकारिक पहचान एवं आवंटन'
          : 'Your official verified credentials, municipal lease, and Section 9 Designated Officer assistance'
      }
    >
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p className="text-xs">{isHi ? 'प्रोफ़ाइल लोड हो रही है...' : 'Loading profile...'}</p>
        </div>
      ) : error || !profile ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error || 'Unable to load profile'}</span>
          </div>
          <button onClick={fetchProfile} className="font-bold underline text-xs">
            {isHi ? 'पुनः प्रयास करें' : 'Retry'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal info & documents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {profile.profilePhotoUrl ? (
                      <img
                        src={profile.profilePhotoUrl}
                        alt={profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{profile.fullName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {profile.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {isHi ? 'किरायेदार कोड' : 'Tenant ID'}:{' '}
                      <span className="font-bold text-slate-800">{profile.userCode}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{profile.mobile}</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowPassModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पासवर्ड बदलें' : 'Change Password'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block">{isHi ? 'स्थाई पता' : 'Permanent Address'}</span>
                  <span className="font-medium text-slate-800">{profile.permanentAddress}</span>
                </div>
                {profile.currentAddress && (
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'वर्तमान पता' : 'Current Address'}</span>
                    <span className="font-medium text-slate-800">{profile.currentAddress}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block">{isHi ? 'आधार संख्या' : 'Aadhaar (Masked)'}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {profile.aadhaarMasked || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">{isHi ? 'पैन संख्या' : 'PAN (Masked)'}</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {profile.panMasked || 'N/A'}
                  </span>
                </div>
                {profile.gstNumber && (
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'जीएसटी संख्या' : 'GST Number'}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {profile.gstNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* S3 Documents Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'सुरक्षित पहचान दस्तावेज (S3 Vault)' : 'Encrypted Identity Documents (S3 Vault)'}
                </h3>
                <span className="text-[11px] text-slate-400">Expiring 15-min Presigned URLs</span>
              </div>

              {profile.documents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  {isHi ? 'कोई दस्तावेज संलग्न नहीं है।' : 'No identity documents uploaded.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800 uppercase text-[11px] tracking-wide">
                          {doc.doc_type.replace('_', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Status: <span className="text-emerald-700 font-semibold">{doc.verification_status}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Section 9 Designated Officer Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    {isHi ? 'प्रोफ़ाइल संशोधन नियम (धारा 9)' : 'Profile Amendment Policy (Section 9)'}
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    {isHi
                      ? 'सुरक्षा, पहचान सत्यापन एवं नगरपालिका विधिक प्रक्रिया के तहत, किरायेदार का नाम, आधार, पैन या पता पोर्टल पर सीधे संशोधित नहीं किया जा सकता।'
                      : 'Under municipal integrity guidelines, tenant credentials cannot be changed self-service. Amendments must be authenticated by the Designated Officer.'}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-amber-200/80 space-y-3 text-xs">
                <div className="text-amber-900 font-bold border-b border-amber-100 pb-2">
                  {isHi ? 'नामित प्राधिकृत अधिकारी' : 'Designated Municipal Officer'}
                </div>

                <div className="space-y-2">
                  <div className="font-extrabold text-sm text-slate-900">
                    {profile.designatedOfficer.full_name}
                  </div>
                  <div className="text-slate-600 font-medium text-[11px]">
                    {profile.designatedOfficer.designation} • {profile.designatedOfficer.department}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-mono font-bold">{profile.designatedOfficer.office_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>{profile.designatedOfficer.official_email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{profile.designatedOfficer.office_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{profile.designatedOfficer.working_hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                {isHi ? 'पासवर्ड बदलें' : 'Change Security Password'}
              </h3>
              <button
                onClick={() => setShowPassModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                ×
              </button>
            </div>

            {passMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                {passMsg}
              </div>
            )}
            {passError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs border border-red-200">
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? 'वर्तमान पासवर्ड *' : 'Current Password *'}
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? 'नया पासवर्ड (न्यूनतम 8 वर्ण) *' : 'New Password (min 8 chars) *'}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowPassModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition disabled:opacity-50"
                >
                  {passLoading ? 'Updating...' : isHi ? 'पासवर्ड अपडेट करें' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UserLayout>
  );
};
