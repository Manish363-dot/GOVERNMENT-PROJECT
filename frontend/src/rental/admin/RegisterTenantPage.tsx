import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalUserApi } from '../services/rentalUser.service';
import { rentalPropertyApi, PropertyListItem } from '../services/rentalProperty.service';
import {
  UserPlus,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Building2,
  Calendar,
  Lock,
  ArrowLeft,
  Shield,
  Eye,
  RefreshCw,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';

export const RegisterTenantPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [rentEffectiveDate, setRentEffectiveDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [initialPassword, setInitialPassword] = useState('');

  // All Properties State (vacant + allotted)
  const [allProperties, setAllProperties] = useState<PropertyListItem[]>([]);
  const [vacantProperties, setVacantProperties] = useState<PropertyListItem[]>([]);
  const [allottedProperties, setAllottedProperties] = useState<PropertyListItem[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<PropertyListItem | null>(null);

  const fetchAvailableProperties = async () => {
    setLoadingProperties(true);
    try {
      const res = await rentalPropertyApi.listProperties({ limit: 200 });
      if (res && res.data && Array.isArray(res.data.data)) {
        const all = res.data.data;
        setAllProperties(all);
        setVacantProperties(all.filter((p) => p.status === 'VACANT'));
        setAllottedProperties(all.filter((p) => p.status !== 'VACANT'));
      }
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    fetchAvailableProperties();
  }, []);

  const handlePropertyChange = (selectedId: string) => {
    setPropertyId(selectedId);
    const selected = allProperties.find((p) => p.id === selectedId);
    if (selected) {
      setSelectedPropertyDetails(selected);
      if (selected.baseMonthlyRent) {
        setMonthlyRent(String(selected.baseMonthlyRent));
      }
    } else {
      setSelectedPropertyDetails(null);
    }
  };

  // File states for S3
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [domicileFile, setDomicileFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError(isHi ? 'कृपया किरायेदार का पूरा नाम अनिवार्य रूप से भरें।' : 'Please enter full name.');
      return;
    }

    if (!mobile.trim() || !/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError(
        isHi
          ? 'कृपया मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    const effectivePassword = initialPassword.trim() || `Almora@${mobile.slice(-4)}`;

    if (!permanentAddress.trim()) {
      setError(isHi ? 'कृपया स्थायी पता (Permanent Address) अनिवार्य रूप से भरें।' : 'Please enter permanent address.');
      return;
    }

    if (!currentAddress.trim()) {
      setError(isHi ? 'कृपया वर्तमान पत्राचार पता (Current Address) अनिवार्य रूप से भरें।' : 'Please enter current address.');
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError(
        isHi
          ? 'कृपया 12-अंकीय आधार संख्या अनिवार्य रूप से दर्ज करें।'
          : 'Please enter a valid 12-digit Aadhaar number.'
      );
      return;
    }

    const cleanPan = panNumber.trim().toUpperCase();
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setError(
        isHi
          ? 'कृपया 10-अक्षरों का मान्य पैन नंबर दर्ज करें (उदा. ABCDE1234F)।'
          : 'Please enter a valid 10-character PAN number (e.g. ABCDE1234F).'
      );
      return;
    }

    if (!propertyId) {
      setError(
        isHi
          ? 'कृपया ड्रॉपडाउन से रिक्त दुकान / परिसंपत्ति का चयन अनिवार्य रूप से करें।'
          : 'Please select a vacant shop / property from the dropdown.'
      );
      return;
    }

    // GST format validation — if provided must be exactly 15 chars
    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      setError(
        isHi
          ? `जीएसटी नंबर ठीक 15 अक्षरों का होना चाहिए। आपने ${gstNumber.trim().length} अक्षर दर्ज किए हैं।`
          : `GST number must be exactly 15 characters. You entered ${gstNumber.trim().length} characters.`
      );
      return;
    }

    // Block if selected property is not VACANT
    const selectedProp = allProperties.find((p) => p.id === propertyId);
    if (selectedProp && selectedProp.status !== 'VACANT') {
      setError(
        isHi
          ? `दुकान संख्या ${selectedProp.propertyNumber} वर्तमान में पहले से किसी किरायेदार को आवंटित है। कृपया केवल रिक्त (VACANT) दुकान चुनें।`
          : `Shop ${selectedProp.propertyNumber} is currently allotted to another tenant. Please select a VACANT shop only.`
      );
      return;
    }

    if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
      setError(
        isHi
          ? 'कृपया मासिक निर्धारित किराया दर्ज करें (₹0 से अधिक)।'
          : 'Please enter a valid monthly rent amount.'
      );
      return;
    }

    if (!rentEffectiveDate) {
      setError(
        isHi
          ? 'कृपया आवंटन प्रभावी तिथि दर्ज करें।'
          : 'Please select lease effective date.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await rentalUserApi.registerTenant({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        permanentAddress: permanentAddress.trim(),
        currentAddress: currentAddress.trim(),
        aadhaarNumber: cleanAadhaar,
        panNumber: cleanPan,
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        propertyId,
        monthlyRent: parseFloat(monthlyRent),
        rentEffectiveDate,
        initialPassword: effectivePassword,
        profilePhotoFile: profilePhoto,
        aadhaarFile,
        panFile,
        domicileFile,
        gstFile,
      });

      setSuccessData(res.data);
    } catch (err: any) {
      setError(
        err.message ||
          (isHi
            ? 'पंजीकरण विफल रहा। कृपया विवरण पुनः जांचें।'
            : 'Tenant registration failed. Please review your input.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'नया किरायेदार पंजीकरण' : 'Register New Tenant'}
      breadcrumbs={[
        { label: isHi ? 'किरायेदार' : 'Tenants', to: '/rental/admin/tenants' },
        { label: isHi ? 'नया पंजीकरण' : 'New Registration' },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Success Modal / Banner */}
        {successData ? (
          <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 p-8 sm:p-10 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {isHi ? 'किरायेदार सफलतापूर्वक पंजीकृत हो गया!' : 'Tenant Registered Successfully!'}
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
              {isHi
                ? 'किरायेदार का खाता सक्रिय हो गया है और दस्तावेज सुरक्षित रूप से S3 पर अपलोड हो चुके हैं।'
                : 'The tenant account has been provisioned and documents saved securely on S3.'}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{isHi ? 'किरायेदार कोड (User ID):' : 'Tenant ID:'}</span>
                <span className="font-mono font-extrabold text-navy-950 text-base bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-300">
                  {successData.userCode}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{isHi ? 'नाम:' : 'Name:'}</span>
                <span className="font-bold text-slate-800">{successData.fullName}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{isHi ? 'मोबाइल नंबर:' : 'Mobile:'}</span>
                <span className="font-bold text-slate-800">{successData.mobile}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{isHi ? 'प्रारंभिक पासवर्ड:' : 'Initial Password:'}</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {successData.initialPassword}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSuccessData(null);
                  setFullName('');
                  setMobile('');
                  setEmail('');
                  setPermanentAddress('');
                  setProfilePhoto(null);
                  setProfilePhotoPreview(null);
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
              >
                {isHi ? 'अन्य किरायेदार पंजीकृत करें' : 'Register Another Tenant'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/rental/admin/tenants')}
                className="px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {isHi ? 'किरायेदार सूची देखें' : 'View Tenant List'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-navy-950 font-bold">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold">
                    {isHi ? 'नया किरायेदार / आवंटन पंजीकरण' : 'New Tenant Allotment & Registration'}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                    {isHi
                      ? 'जिला पंचायत परिसंपत्ति (दुकान/प्रतिष्ठान) आवंटन व नागरिक विवरण फॉर्म'
                      : 'Official tenant registry & commercial shop allotment record'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-900 text-sm font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-8 divide-y divide-slate-100">
              {/* Section 1: Tenant Information */}
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {isHi ? '1. व्यक्तिगत एवं संपर्क विवरण' : '1. Personal & Contact Details'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'किरायेदार का पूरा नाम *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isHi ? 'उदा. रमेश चंद्र जोशी' : 'e.g. Ramesh Chandra Joshi'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'पंजीकृत मोबाइल नंबर (10 अंक) *' : 'Registered Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="94120XXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'ईमेल पता (वैकल्पिक)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenant@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'प्रारंभिक पोर्टल पासवर्ड *' : 'Initial Portal Password *'}
                    </label>
                    <input
                      type="text"
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      placeholder={isHi ? 'डिफ़ॉल्ट: Almora@XXXX (न्यूनतम 6 अक्षर)' : 'Default: Almora@XXXX (Min 6 chars)'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {isHi ? '* खाली रखने पर Almora@मोबाइल के अंतिम 4 अंक बनेगा' : '* If blank, defaults to Almora@last 4 digits of mobile'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'स्थायी पता (Permanent Address) *' : 'Permanent Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      placeholder={isHi ? 'ग्राम/मोहल्ला, पोस्ट, अल्मोड़ा' : 'Village/Street, Post Office, Almora'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'वर्तमान पत्राचार पता (Current Address) *' : 'Current Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder={isHi ? 'वर्तमान आवास/दुकान का पूरा पता' : 'Current residence/commercial address'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Identity Documents & S3 Upload */}
              <div className="pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {isHi ? '2. पहचान व पंजीकरण दस्तावेज (S3 सुरक्षित संग्रह — ऑटो WebP)' : '2. Identity Documents (S3 Vault — Auto WebP)'}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    {isHi ? 'दस्तावेज अपलोड: वैकल्पिक' : 'Uploads: Optional'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Profile Photo */}
                  <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      {isHi ? 'प्रोफ़ाइल फोटो (वैकल्पिक)' : 'Profile Photo (Optional)'}
                    </label>
                    {profilePhotoPreview ? (
                      <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-blue-600">
                        <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isHi ? 'कोई भी छवि (JPG, PNG आदि) S3 में स्वतः WebP बनेगी' : 'Any image is saved directly to S3 as WebP'}
                    </p>
                  </div>

                  {/* Aadhaar Card */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'आधार संख्या (12 अंक) *' : 'Aadhaar Number (12 digits) *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXX-XXXX-1234"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs mb-2 font-mono"
                    />
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isHi ? 'आधार कार्ड प्रति (वैकल्पिक - PDF / Image)' : 'Aadhaar File (Optional - PDF / Image)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800"
                    />
                  </div>

                  {/* PAN Card */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'पैन संख्या (PAN Number) *' : 'PAN Number (10 chars) *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs mb-2 font-mono uppercase"
                    />
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isHi ? 'पैन कार्ड प्रति (वैकल्पिक - PDF / Image)' : 'PAN File (Optional - PDF / Image)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800"
                    />
                  </div>
                </div>

                {/* Additional Docs: Domicile & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'उत्तराखंड स्थायी निवास प्रमाण पत्र (वैकल्पिक - Domicile)' : 'Uttarakhand Domicile Certificate (Optional)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setDomicileFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'जीएसटी नंबर (GST Number — वैकल्पिक)' : 'GST Number (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={gstNumber}
                      maxLength={15}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        if (val.length <= 15) setGstNumber(val);
                      }}
                      placeholder="05AAAAA0000A1Z5"
                      className={`w-full px-3 py-2 rounded-lg border text-xs mb-1 font-mono uppercase tracking-widest ${
                        gstNumber.length > 0 && gstNumber.length < 15
                          ? 'border-amber-400 bg-amber-50 focus:ring-amber-400'
                          : gstNumber.length === 15
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-slate-300'
                      } focus:outline-none focus:ring-2`}
                    />
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-medium ${
                        gstNumber.length === 0 ? 'text-slate-400' :
                        gstNumber.length < 15 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {gstNumber.length === 0
                          ? (isHi ? 'सरकारी मानक: ठीक 15 अक्षर (GSTIN)' : 'Govt standard: Exactly 15 characters (GSTIN)')
                          : gstNumber.length < 15
                          ? (isHi ? `${gstNumber.length}/15 — ${15 - gstNumber.length} और अक्षर चाहिए` : `${gstNumber.length}/15 — ${15 - gstNumber.length} more characters needed`)
                          : (isHi ? '✓ 15/15 — मान्य GSTIN प्रारूप' : '✓ 15/15 — Valid GSTIN format')}
                      </span>
                    </div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      {isHi ? 'जीएसटी प्रमाणपत्र प्रति (वैकल्पिक - PDF / Image)' : 'GST Certificate (Optional - PDF / Image)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setGstFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Commercial Property Allotment */}
              <div className="pt-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-5 rounded-sm bg-amber-500 inline-block" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                      {isHi ? '3. दुकान / परिसंपत्ति आवंटन' : '3. Shop / Property Allotment'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={fetchAvailableProperties}
                      disabled={loadingProperties}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loadingProperties ? (isHi ? 'लोड हो रहा है...' : 'Loading...') : (isHi ? 'सूची ताज़ा करें' : 'Refresh List')}
                    </button>
                    <span className="text-slate-300">|</span>
                    <NavLink
                      to="/rental/admin/properties"
                      target="_blank"
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 transition border-b border-amber-400 hover:border-amber-700 pb-px"
                    >
                      {isHi ? 'नई दुकान पंजीकृत करें →' : 'Register New Shop →'}
                    </NavLink>
                  </div>
                </div>

                {/* STATUS NOTICE: No shops registered at all */}
                {!loadingProperties && allProperties.length === 0 && (
                  <div className="mb-5 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3.5">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">
                      {isHi ? 'कोई दुकान पंजीकृत नहीं है' : 'No Properties Registered'}
                    </p>
                    <p className="text-xs text-red-700 leading-relaxed mb-2.5">
                      {isHi
                        ? 'किरायेदार को दुकान आवंटित करने से पहले जिला पंचायत रिकॉर्ड में दुकान पंजीकृत होनी अनिवार्य है। कृपया पहले संपत्ति प्रबंधन में जाकर नई दुकान/परिसंपत्ति पंजीकृत करें।'
                        : 'Before allotting a shop to a tenant, the property must first be registered in the system. Please register a new shop/property in Property Management.'}
                    </p>
                    <NavLink
                      to="/rental/admin/properties"
                      target="_blank"
                      className="inline-block text-xs font-bold text-red-700 border border-red-400 hover:bg-red-100 rounded-lg px-3 py-1.5 transition"
                    >
                      {isHi ? 'संपत्ति प्रबंधन — नई दुकान पंजीकृत करें' : 'Property Management — Register New Shop'}
                    </NavLink>
                  </div>
                )}

                {/* STATUS NOTICE: All shops allotted */}
                {!loadingProperties && allProperties.length > 0 && vacantProperties.length === 0 && (
                  <div className="mb-5 rounded-xl border-l-4 border-amber-500 bg-amber-50 px-4 py-3.5">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                      {isHi ? 'सभी पंजीकृत दुकानें आवंटित हैं' : 'All Registered Shops Are Allotted'}
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed mb-2.5">
                      {isHi
                        ? `कुल ${allProperties.length} पंजीकृत दुकान में से कोई भी वर्तमान में रिक्त नहीं है। नये किरायेदार को आवंटन हेतु कोई दुकान रिक्त कराएं या नई दुकान पंजीकृत करें।`
                        : `All ${allProperties.length} registered shop(s) are currently allotted. To allot a shop to this tenant, vacate an existing shop or register a new one.`}
                    </p>
                    <NavLink
                      to="/rental/admin/properties"
                      target="_blank"
                      className="inline-block text-xs font-bold text-amber-800 border border-amber-400 hover:bg-amber-100 rounded-lg px-3 py-1.5 transition"
                    >
                      {isHi ? 'संपत्ति प्रबंधन पेज खोलें' : 'Open Property Management'}
                    </NavLink>
                  </div>
                )}

                {/* INFO BAR: Vacant shops available */}
                {!loadingProperties && vacantProperties.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
                    <span className="font-semibold text-emerald-700">{vacantProperties.length} {isHi ? 'रिक्त दुकान उपलब्ध' : 'vacant shop(s) available'}</span>
                    {allottedProperties.length > 0 && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span>{allottedProperties.length} {isHi ? 'आवंटित (अचयनित)' : 'allotted (disabled)'}</span>
                      </>
                    )}
                    <span className="text-slate-300">|</span>
                    <span>{isHi ? 'दुकान सूची में नहीं?' : 'Shop missing?'}</span>
                    <NavLink to="/rental/admin/properties" target="_blank" className="font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2">
                      {isHi ? 'यहाँ पंजीकृत करें' : 'Register here'}
                    </NavLink>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'दुकान चुनें (केवल रिक्त / उपलब्ध) *' : 'Select Shop (Vacant Only) *'}
                    </label>
                    <div className="relative">
                      <select
                        value={propertyId}
                        onChange={(e) => handlePropertyChange(e.target.value)}
                        disabled={loadingProperties}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs appearance-none pr-8 truncate cursor-pointer"
                      >
                        <option value="">
                          {loadingProperties
                            ? (isHi ? 'लोड हो रहा है...' : 'Loading shops...')
                            : allProperties.length === 0
                            ? (isHi ? '-- कोई दुकान पंजीकृत नहीं है --' : '-- No shops registered --')
                            : vacantProperties.length === 0
                            ? (isHi ? '-- सभी दुकानें आवंटित हैं --' : '-- All shops are allotted --')
                            : (isHi ? '-- रिक्त दुकान चुनें --' : '-- Select Vacant Shop --')}
                        </option>
                        {/* Vacant shops (selectable) */}
                        {vacantProperties.length > 0 && (
                          <optgroup label={isHi ? '🟢 रिक्त / उपलब्ध दुकानें' : '🟢 Vacant / Available Shops'}>
                            {vacantProperties.map((p) => (
                              <option key={p.id} value={p.id}>
                                🟢 {p.propertyNumber} — {p.propertyName} ({p.location}) [₹{Number(p.baseMonthlyRent).toLocaleString('en-IN')}/माह]
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {/* Allotted shops (disabled, informational) */}
                        {allottedProperties.length > 0 && (
                          <optgroup label={isHi ? '🔴 पहले से आवंटित (चयन नहीं होगा)' : '🔴 Already Allotted (Not selectable)'}>
                            {allottedProperties.map((p) => (
                              <option key={p.id} value={p.id} disabled style={{ color: '#9ca3af' }}>
                                🔴 {p.propertyNumber} — {p.propertyName} [{p.currentTenant?.fullName ?? (isHi ? 'आवंटित' : 'ALLOTTED')}]
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                        <Building2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'मासिक निर्धारित किराया (₹) *' : 'Monthly Rent (₹) *'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(e.target.value)}
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-semibold"
                    />
                    {selectedPropertyDetails && (
                      <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                        {isHi ? 'मूल आधार किराया: ' : 'Base Rent: '}₹{Number(selectedPropertyDetails.baseMonthlyRent).toLocaleString('en-IN')}/माह
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {isHi ? 'आवंटन प्रभावी तिथि (Effective Date)' : 'Lease Effective Date'}
                    </label>
                    <input
                      type="date"
                      value={rentEffectiveDate}
                      onChange={(e) => setRentEffectiveDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>


                {/* Selected Shop Preview Card */}
                {selectedPropertyDetails && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-amber-100/40 to-slate-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            {selectedPropertyDetails.propertyNumber} — {selectedPropertyDetails.propertyName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            {isHi ? 'रिक्त / उपलब्ध' : 'VACANT'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>📍 {selectedPropertyDetails.location}</span>
                          <span>•</span>
                          <span>{selectedPropertyDetails.address}</span>
                          {selectedPropertyDetails.dimensionsSqft && (
                            <>
                              <span>•</span>
                              <span>📐 {selectedPropertyDetails.dimensionsSqft} वर्ग फीट (Sq. Ft.)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        {isHi ? 'आधार किराया' : 'Base Monthly Rent'}
                      </div>
                      <div className="text-base font-black text-slate-900 font-mono">
                        ₹{Number(selectedPropertyDetails.baseMonthlyRent).toLocaleString('en-IN')}
                        <span className="text-xs text-slate-500 font-normal">/माह</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/rental/admin')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 rounded-xl text-sm font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>{isHi ? 'पंजीकृत हो रहा है...' : 'Registering...'}</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span>{isHi ? 'किरायेदार पंजीकृत करें' : 'Register Tenant'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
