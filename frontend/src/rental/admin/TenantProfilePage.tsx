import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
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
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const TenantProfilePage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

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

  useEffect(() => {
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

    fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (newPassword.length < 8) {
      setPassError(isHi ? 'नया पासवर्ड न्यूनतम 8 अक्षरों का होना चाहिए।' : 'New password must be at least 8 characters.');
      return;
    }

    setPassLoading(true);
    try {
      await rentalAuthApi.changeUserPassword(currentPassword, newPassword);
      setPassMsg(isHi ? 'पासवर्ड सफलतापूर्वक बदल दिया गया!' : 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPassModal(false), 1500);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-bold text-slate-600">{isHi ? 'प्रोफ़ाइल लोड हो रही है...' : 'Loading profile...'}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">{isHi ? 'सत्र समाप्त या अनधिकृत' : 'Session Expired'}</h2>
          <p className="text-xs text-slate-500 mb-6">{error || 'Please sign in to view your profile.'}</p>
          <button
            type="button"
            onClick={() => navigate('/rental/signin')}
            className="w-full py-2.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800"
          >
            {isHi ? 'लॉगिन करें' : 'Sign In'}
          </button>
        </div>
      </div>
    );
  }

  const officer = profile.designatedOfficer;

  return (
    <AdminLayout
      title={isHi ? 'किरायेदार विस्तृत विवरण (Profile)' : 'Tenant Dossier & Profile'}
      subtitle={profile.fullName ? `${profile.fullName} (${profile.userCode})` : undefined}
      breadcrumbs={[
        { label: isHi ? 'किरायेदार' : 'Tenants', to: '/rental/admin/tenants' },
        { label: profile.fullName || 'Tenant' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/tenants')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'किरायेदार सूची पर वापस जाएं' : 'Back to Tenants List'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPassModal(true)}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isHi ? 'पासवर्ड बदलें' : 'Change Password'}</span>
          </button>
        </div>

        {/* 1. Tenant Overview Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          {profile.profilePhotoUrl ? (
            <img
              src={profile.profilePhotoUrl}
              alt={profile.fullName}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-900 font-extrabold text-2xl flex items-center justify-center border-4 border-slate-100">
              {profile.fullName.charAt(0)}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isHi ? 'सत्यापित किरायेदार खाता' : 'Verified Tenant Account'}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{profile.fullName}</h1>
            <p className="font-mono text-xs font-bold text-navy-900 mt-0.5">
              User ID: <span className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300">{profile.userCode}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {profile.mobile} {profile.email ? `• ${profile.email}` : ''}
            </p>
          </div>
        </div>

        {/* 2. Official Assigned Property */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            {isHi ? 'आवंटित जिला पंचायत दुकान / परिसंपत्ति' : 'Allocated Commercial Asset'}
          </h2>

          {profile.activeProperty ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'दुकान संख्या:' : 'Shop / Property ID:'}</span>
                <span className="text-sm font-extrabold text-navy-950">{profile.activeProperty.propertyId}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'परिसर / स्थान:' : 'Market Location:'}</span>
                <span className="text-sm font-bold text-slate-800">{profile.activeProperty.location}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-medium block">{isHi ? 'मासिक किराया दर:' : 'Monthly Rent:'}</span>
                <span className="text-sm font-extrabold text-emerald-700">₹{profile.activeProperty.monthlyRent.toLocaleString('en-IN')}/माह</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">{isHi ? 'वर्तमान में कोई सक्रिय दुकान आवंटित नहीं है।' : 'No active property currently allocated.'}</p>
          )}
        </div>

        {/* 3. Address & Masked Identifiers */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {isHi ? 'सत्यापित पहचान एवं पता विवरण' : 'Verified Identity & Address'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold mb-0.5">{isHi ? 'स्थायी पता:' : 'Permanent Address:'}</span>
              <span className="font-bold text-slate-900">{profile.permanentAddress}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold mb-0.5">{isHi ? 'वर्तमान पत्राचार पता:' : 'Current Address:'}</span>
              <span className="font-bold text-slate-900">{profile.currentAddress || profile.permanentAddress}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Aadhaar (Masked):</span>
              <span className="font-mono font-bold text-slate-900">{profile.aadhaarMasked || 'XXXX-XXXX-****'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">PAN (Masked):</span>
              <span className="font-mono font-bold text-slate-900">{profile.panMasked || 'XXXXX****X'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-slate-500 block font-semibold">GSTIN:</span>
              <span className="font-mono font-bold text-slate-900">{profile.gstNumber || 'Not Applicable'}</span>
            </div>
          </div>
        </div>

        {/* 4. ⭐ MANDATORY SECTION: Contact the Designated Officer for Profile Changes */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-500 text-navy-950 shrink-0 font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-navy-950">
                {isHi
                  ? 'अपनी प्रोफ़ाइल में बदलाव करना चाहते हैं? संबंधित अधिकारी से संपर्क करें।'
                  : 'Need to Edit Your Profile? Contact the Designated Officer.'}
              </h2>
              <p className="text-xs text-slate-700 mt-1">
                {isHi
                  ? 'शासकीय सुरक्षा एवं ऑडिट नियमों के अनुसार, नाम, पंजीकृत मोबाइल नंबर, आवंटित दुकान या पते में किसी भी परिवर्तन हेतु संबंधित अधिकृत अधिकारी से संपर्क अनिवार्य है।'
                  : 'In compliance with official audit rules, updates to tenant name, mobile number, shop allotment, or address require authorized administrative review.'}
              </p>
            </div>
          </div>

          {/* Officer Details Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">{isHi ? 'अधिकृत अधिकारी का नाम:' : 'Designated Officer:'}</span>
              <span className="text-sm font-extrabold text-slate-900 block">{officer.full_name}</span>
              <span className="text-xs text-amber-800 font-bold">{officer.designation} • {officer.department}</span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">{isHi ? 'कार्यालय संपर्क नंबर:' : 'Official Phone:'}</span>
              <a href={`tel:${officer.office_phone}`} className="text-sm font-bold text-blue-700 hover:underline flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{officer.office_phone}</span>
              </a>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">{isHi ? 'कार्यालय का पता:' : 'Office Address:'}</span>
              <p className="text-slate-700 font-medium flex items-start gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{officer.office_address}</span>
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">{isHi ? 'कार्य समय व निर्देश:' : 'Working Hours:'}</span>
              <p className="text-slate-700 font-medium flex items-start gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{officer.working_hours}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPassModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl animate-scale-in">
              <h3 className="text-lg font-extrabold text-navy-950 mb-1">{isHi ? 'पासवर्ड बदलें' : 'Change Password'}</h3>
              <p className="text-xs text-slate-500 mb-4">{isHi ? 'नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।' : 'New password must be at least 8 characters.'}</p>

              {passMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold mb-4">
                  {passMsg}
                </div>
              )}

              {passError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold mb-4">
                  {passError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isHi ? 'वर्तमान पासवर्ड *' : 'Current Password *'}</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isHi ? 'नया पासवर्ड *' : 'New Password *'}</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassModal(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="flex-1 py-2 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 disabled:opacity-50"
                  >
                    {passLoading ? '...' : isHi ? 'सुरक्षित करें' : 'Update'}
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
