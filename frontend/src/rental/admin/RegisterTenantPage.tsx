import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import { rentalUserApi } from '../services/rentalUser.service';
import { rentalPropertyApi, PropertyListItem } from '../services/rentalProperty.service';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Converts any uploaded image format (JPEG, PNG, AVIF, BMP, GIF, etc.) into WebP
const convertImageToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
          resolve(webpFile);
        },
        'image/webp',
        0.88
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
};

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
  const [transliterating, setTransliterating] = useState<string | null>(null);

  // Auto-transliterates English names and addresses into Hindi
  const handleAutoTransliterate = async (
    field: 'fullName' | 'permanentAddress' | 'currentAddress',
    value: string
  ) => {
    if (!value || !value.trim() || !/[a-zA-Z]/.test(value)) return;
    setTransliterating(field);
    try {
      const res = await api.post<{ success: boolean; hindi: string }>('/rental/transliterate', {
        text: value.trim(),
      });
      if (res && res.hindi && res.hindi.trim()) {
        if (field === 'fullName') setFullName(res.hindi);
        else if (field === 'permanentAddress') setPermanentAddress(res.hindi);
        else if (field === 'currentAddress') setCurrentAddress(res.hindi);
      }
    } catch (err) {
      console.warn('Transliteration failed', err);
    } finally {
      setTransliterating(null);
    }
  };

  // Properties State
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

  // File states
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const [shopPhoto, setShopPhoto] = useState<File | null>(null);
  const [shopPhotoPreview, setShopPhotoPreview] = useState<string | null>(null);

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [domicileFile, setDomicileFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any | null>(null);

  // 1. Profile Photo: accept all image extensions, convert to WebP, max 5MB
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        isHi
          ? 'प्रोफ़ाइल फोटो केवल इमेज फॉर्मेट (JPG, PNG, WEBP, आदि) में होनी चाहिए।'
          : 'Profile photo must be an image format (JPG, PNG, WEBP, etc.).'
      );
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        isHi
          ? 'प्रोफ़ाइल फोटो का आकार 5 MB से कम होना चाहिए।'
          : 'Profile photo size must be under 5 MB.'
      );
      e.target.value = '';
      return;
    }

    try {
      const converted = await convertImageToWebP(file);
      setProfilePhoto(converted);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
      reader.readAsDataURL(converted);
    } catch {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. Shop Photo: accept all image extensions, convert to WebP, max 5MB
  const handleShopPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        isHi
          ? 'दुकान की फोटो केवल इमेज फॉर्मेट (JPG, PNG, WEBP, आदि) में होनी चाहिए।'
          : 'Shop photo must be an image format (JPG, PNG, WEBP, etc.).'
      );
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        isHi
          ? 'दुकान की फोटो का आकार 5 MB से कम होना चाहिए।'
          : 'Shop photo size must be under 5 MB.'
      );
      e.target.value = '';
      return;
    }

    try {
      const converted = await convertImageToWebP(file);
      setShopPhoto(converted);
      const reader = new FileReader();
      reader.onloadend = () => setShopPhotoPreview(reader.result as string);
      reader.readAsDataURL(converted);
    } catch {
      setShopPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setShopPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 3. Aadhaar File: ONLY PDF, max 2MB
  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError(
        isHi
          ? 'आधार दस्तावेज़ केवल PDF फॉर्मेट में होना चाहिए।'
          : 'Aadhaar document must be only in PDF format.'
      );
      e.target.value = '';
      setAadhaarFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        isHi
          ? 'फ़ाइल का आकार 2 MB से कम होना चाहिए'
          : 'File size must be under 2 MB.'
      );
      e.target.value = '';
      setAadhaarFile(null);
      return;
    }

    setAadhaarFile(file);
  };

  // 4. Domicile File: ONLY PDF, max 2MB
  const handleDomicileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError(
        isHi
          ? 'निवास प्रमाण पत्र केवल PDF फॉर्मेट में होना चाहिए।'
          : 'Domicile document must be only in PDF format.'
      );
      e.target.value = '';
      setDomicileFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        isHi
          ? 'फ़ाइल का आकार 2 MB से कम होना चाहिए'
          : 'File size must be under 2 MB.'
      );
      e.target.value = '';
      setDomicileFile(null);
      return;
    }

    setDomicileFile(file);
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
      setError(isHi ? 'कृपया स्थायी पता अनिवार्य रूप से भरें।' : 'Please enter permanent address.');
      return;
    }

    if (!currentAddress.trim()) {
      setError(isHi ? 'कृपया वर्तमान पता अनिवार्य रूप से भरें।' : 'Please enter current address.');
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setError(
        isHi
          ? 'कृपया 12-अंकीय आधार संख्या दर्ज करें।'
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

    if (gstNumber.trim() && gstNumber.trim().length !== 15) {
      setError(
        isHi
          ? `जीएसटी नंबर ठीक 15 अक्षरों का होना चाहिए। (आपने ${gstNumber.trim().length} अक्षर दर्ज किए हैं)`
          : `GST number must be exactly 15 characters.`
      );
      return;
    }

    if (!propertyId) {
      setError(
        isHi
          ? 'कृपया ड्रॉपडाउन से रिक्त दुकान / परिसंपत्ति का चयन करें।'
          : 'Please select a vacant shop / property from the dropdown.'
      );
      return;
    }

    const selectedProp = allProperties.find((p) => p.id === propertyId);
    if (selectedProp && selectedProp.status !== 'VACANT') {
      setError(
        isHi
          ? `दुकान संख्या ${selectedProp.propertyNumber} पहले से आवंटित है। केवल रिक्त दुकान चुनें।`
          : `Shop ${selectedProp.propertyNumber} is currently allotted. Please select a vacant shop.`
      );
      return;
    }

    if (!monthlyRent || parseFloat(monthlyRent) <= 0) {
      setError(
        isHi
          ? 'कृपया मासिक निर्धारित किराया दर्ज करें।'
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
        shopPhotoFile: shopPhoto,
        aadhaarFile,
        domicileFile,
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
        { label: isHi ? 'किरायेदार सूची' : 'Tenants', to: '/rental/admin/tenants' },
        { label: isHi ? 'नया पंजीकरण' : 'New Registration' },
      ]}
    >
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* Success View */}
        {successData ? (
          <div className="bg-white rounded-xl shadow-xs border border-emerald-200 p-6 sm:p-10 text-center">
      <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
              {isHi ? '✓ पंजीकरण सफल' : '✓ Registration Successful'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {isHi ? 'किरायेदार सफलतापूर्वक पंजीकृत हो गया!' : 'Tenant Registered Successfully!'}
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-2.5 mb-6 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{isHi ? 'किरायेदार कोड:' : 'Tenant ID:'}</span>
                <span className="font-mono font-bold text-slate-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {successData.userCode}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{isHi ? 'नाम:' : 'Name:'}</span>
                <span className="font-bold text-slate-800">{successData.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">{isHi ? 'मोबाइल:' : 'Mobile:'}</span>
                <span className="font-bold text-slate-800">{successData.mobile}</span>
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
                  setCurrentAddress('');
                  setAadhaarNumber('');
                  setPanNumber('');
                  setGstNumber('');
                  setProfilePhoto(null);
                  setProfilePhotoPreview(null);
                  setShopPhoto(null);
                  setShopPhotoPreview(null);
                  setAadhaarFile(null);
                  setDomicileFile(null);
                  setPropertyId('');
                  setMonthlyRent('');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#0b1b36] text-white hover:bg-[#132c56] transition"
              >
                {isHi ? 'अन्य नया पंजीकरण करें' : 'Register Another Tenant'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/rental/admin/tenants')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                {isHi ? 'किरायेदार सूची देखें' : 'View Tenant List'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Form Top Title Bar */}
            <div className="bg-[#0b1b36] text-white px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-700">
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                {isHi ? 'नया किरायेदार एवं दुकान आवंटन पंजीकरण' : 'New Tenant Registration & Shop Allotment'}
              </h1>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="m-4 sm:m-6 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium">
                {error}
              </div>
            )}

            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
              
              {/* ──────────────────────────────────────────────────────────
                  SECTION 1: व्यक्तिगत विवरण (Personal Details)
              ────────────────────────────────────────────────────────── */}
              <div>
                <div className="pb-3 mb-4 border-b border-slate-200">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                    {isHi ? '1. व्यक्तिगत विवरण' : '1. Personal Details'}
                  </h2>
                </div>

                {/* Name, Mobile, Email - 3 Columns Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isHi ? 'पूरा नाम' : 'Full Name'}
                      </label>
                      {transliterating === 'fullName' ? (
                        <span className="text-[10px] text-amber-700 font-semibold animate-pulse">
                          {isHi ? 'अनुवाद हो रहा है...' : 'Translating...'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAutoTransliterate('fullName', fullName)}
                          className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition"
                          title="English नाम को हिंदी में बदलें"
                        >
                          🌐
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onBlur={() => handleAutoTransliterate('fullName', fullName)}
                      placeholder={isHi ? 'Ramesh Chandra Joshi' : 'Ramesh Chandra Joshi'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="94120XXXXX"
                        className="w-full pl-11 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono bg-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'ईमेल पता (वैकल्पिक)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenant@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    />
                  </div>
                </div>

                {/* Permanent and Current Address - 2 Columns Responsive */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Permanent Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isHi ? 'स्थायी पता' : 'Permanent Address'}
                      </label>
                      {transliterating === 'permanentAddress' ? (
                        <span className="text-[10px] text-amber-700 font-semibold animate-pulse">
                          {isHi ? 'अनुवाद हो रहा है...' : 'Translating...'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAutoTransliterate('permanentAddress', permanentAddress)}
                          className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition"
                          title="English पते को हिंदी में बदलें"
                        >
                          🌐
                        </button>
                      )}
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      onBlur={() => handleAutoTransliterate('permanentAddress', permanentAddress)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    />
                  </div>

                  {/* Current Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        {isHi ? 'वर्तमान पता' : 'Current Address'}
                      </label>
                      {transliterating === 'currentAddress' ? (
                        <span className="text-[10px] text-amber-700 font-semibold animate-pulse">
                          {isHi ? 'अनुवाद हो रहा है...' : 'Translating...'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAutoTransliterate('currentAddress', currentAddress)}
                          className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition"
                          title="English पते को हिंदी में बदलें"
                        >
                          🌐
                        </button>
                      )}
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      onBlur={() => handleAutoTransliterate('currentAddress', currentAddress)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
                    />
                  </div>
                </div>
              </div>


              {/* ──────────────────────────────────────────────────────────
                  SECTION 2: पहचान संख्या एवं दस्तावेज़ (Identity & Docs)
              ────────────────────────────────────────────────────────── */}
              <div>
                <div className="pb-3 mb-4 border-b border-slate-200">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                    {isHi ? '2. पहचान एवं दस्तावेज़' : '2. Identity & Documents'}
                  </h2>
                </div>

                {/* Aadhaar, PAN, GST - 3 Columns Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'आधार संख्या' : 'Aadhaar Number'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXX XXXX 1234"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono tracking-wider bg-white"
                    />
                  </div>

                  {/* PAN Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'पैन नंबर' : 'PAN Number'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono uppercase tracking-wider bg-white"
                    />
                  </div>

                  {/* GST Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'जीएसटी नंबर (वैकल्पिक)' : 'GST Number (Optional)'}
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        if (val.length <= 15) setGstNumber(val);
                      }}
                      placeholder="05AAAAA0000A1Z5"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono uppercase tracking-wider bg-white"
                    />
                  </div>
                </div>

                {/* 4 Document Upload Cards - 4 Columns Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
                  
                  {/* 1. Profile Photo (All image formats) */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {isHi ? 'प्रोफ़ाइल फोटो' : 'Profile Photo'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          {isHi ? 'वैकल्पिक' : 'Optional'}
                        </span>
                      </div>

                      {profilePhotoPreview && (
                        <div className="mb-2 flex items-center gap-2">
                          <img
                            src={profilePhotoPreview}
                            alt="Profile"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                          />
                          <div className="text-[11px] truncate flex-1">
                            <p className="font-semibold text-slate-800 truncate">{profilePhoto?.name}</p>
                            <p className="text-slate-500">{profilePhoto ? formatFileSize(profilePhoto.size) : ''}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setProfilePhoto(null);
                                setProfilePhotoPreview(null);
                              }}
                              className="text-[10px] text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
                      onChange={handlePhotoChange}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>

                  {/* 2. Shop Photo (All image formats) */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {isHi ? 'दुकान की फोटो' : 'Shop Photo'}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          {isHi ? 'वैकल्पिक' : 'Optional'}
                        </span>
                      </div>
                      {shopPhotoPreview && (
                        <div className="mb-2 flex items-center gap-2">
                          <img
                            src={shopPhotoPreview}
                            alt="Shop"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                          />
                          <div className="text-[11px] truncate flex-1">
                            <p className="font-semibold text-slate-800 truncate">{shopPhoto?.name}</p>
                            <p className="text-slate-500">{shopPhoto ? formatFileSize(shopPhoto.size) : ''}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setShopPhoto(null);
                                setShopPhotoPreview(null);
                              }}
                              className="text-[10px] text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
                      onChange={handleShopPhotoChange}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
                    />
                  </div>

                  {/* 3. Aadhaar PDF (ONLY PDF <= 2MB) */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {isHi ? 'आधार कार्ड प्रति' : 'Aadhaar Document'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {isHi ? 'केवल PDF फ़ाइल (अधिकतम 2 MB)' : 'PDF only (Max 2 MB)'}
                      </p>

                      {aadhaarFile && (
                        <div className="mb-2 p-1.5 bg-white rounded border border-slate-200 text-[11px]">
                          <p className="font-semibold text-slate-800 truncate">{aadhaarFile.name}</p>
                          <div className="flex items-center justify-between text-slate-500 mt-0.5">
                            <span>{formatFileSize(aadhaarFile.size)}</span>
                            <button
                              type="button"
                              onClick={() => setAadhaarFile(null)}
                              className="text-[10px] text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleAadhaarChange}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>

                  {/* 4. Domicile Certificate (ONLY PDF <= 2MB) */}
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          {isHi ? 'निवास प्रमाण पत्र' : 'Domicile Certificate'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {isHi ? 'केवल PDF फ़ाइल (अधिकतम 2 MB)' : 'PDF only (Max 2 MB)'}
                      </p>

                      {domicileFile && (
                        <div className="mb-2 p-1.5 bg-white rounded border border-slate-200 text-[11px]">
                          <p className="font-semibold text-slate-800 truncate">{domicileFile.name}</p>
                          <div className="flex items-center justify-between text-slate-500 mt-0.5">
                            <span>{formatFileSize(domicileFile.size)}</span>
                            <button
                              type="button"
                              onClick={() => setDomicileFile(null)}
                              className="text-[10px] text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handleDomicileChange}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>


              {/* ──────────────────────────────────────────────────────────
                  SECTION 3: दुकान एवं किराया आवंटन (Shop & Rent Allotment)
              ────────────────────────────────────────────────────────── */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
                      {isHi ? '3. दुकान एवं किराया आवंटन' : '3. Shop & Rent Allotment'}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={fetchAvailableProperties}
                      disabled={loadingProperties}
                      className="text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      {loadingProperties ? (isHi ? 'लोड हो रहा है...' : 'Loading...') : (isHi ? 'ताज़ा करें' : 'Refresh')}
                    </button>
                    <span className="text-slate-300">|</span>
                    <NavLink
                      to="/rental/admin/properties"
                      target="_blank"
                      className="text-amber-800 hover:text-amber-950 font-bold hover:underline"
                    >
                      {isHi ? '+ नई दुकान जोड़ें' : '+ Add New Shop'}
                    </NavLink>
                  </div>
                </div>

                {/* Shop availability status notice if any */}
                {!loadingProperties && allProperties.length > 0 && vacantProperties.length === 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                    <strong>{isHi ? 'सूचना:' : 'Notice:'}</strong>{' '}
                    {isHi
                      ? 'वर्तमान में कोई भी दुकान रिक्त नहीं है। नये किरायेदार को आवंटन हेतु पहले कोई दुकान रिक्त कराएं या नई दुकान पंजीकृत करें।'
                      : 'No shops are currently vacant. Please register a new shop or vacate an existing one.'}
                  </div>
                )}

                {/* 3 Columns Responsive: Shop Select, Monthly Rent, Effective Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Select Vacant Shop */}
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'दुकान चुनें' : 'Select Shop'}
                    </label>
                    <select
                      value={propertyId}
                      onChange={(e) => handlePropertyChange(e.target.value)}
                      disabled={loadingProperties}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">
                        {loadingProperties
                          ? (isHi ? 'दुकानें लोड हो रही हैं...' : 'Loading shops...')
                          : allProperties.length === 0
                          ? (isHi ? '-- कोई दुकान पंजीकृत नहीं है --' : '-- No shops registered --')
                          : vacantProperties.length === 0
                          ? (isHi ? '-- सभी दुकानें आवंटित हैं --' : '-- All shops allotted --')
                          : (isHi ? '-- रिक्त दुकान चुनें --' : '-- Select Vacant Shop --')}
                      </option>
                      {vacantProperties.length > 0 && (
                        <optgroup label={isHi ? 'रिक्त दुकानें' : 'Vacant Shops'}>
                          {vacantProperties.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.propertyNumber} — {p.propertyName} ({p.location}) [₹{Number(p.baseMonthlyRent).toLocaleString('en-IN')}/माह]
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {allottedProperties.length > 0 && (
                        <optgroup label={isHi ? 'पहले से आवंटित (अचयनित)' : 'Already Allotted (Disabled)'}>
                          {allottedProperties.map((p) => (
                            <option key={p.id} value={p.id} disabled style={{ color: '#9ca3af' }}>
                              {p.propertyNumber} — {p.propertyName} [{p.currentTenant?.fullName ?? (isHi ? 'आवंटित' : 'ALLOTTED')}]
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* Monthly Rent */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'मासिक निर्धारित किराया (₹)' : 'Monthly Rent (₹)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="1500"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-semibold bg-white"
                      />
                    </div>
                  </div>

                  {/* Effective Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isHi ? 'आवंटन प्रभावी तिथि' : 'Effective Date'}
                    </label>
                    <input
                      type="date"
                      required
                      value={rentEffectiveDate}
                      onChange={(e) => setRentEffectiveDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                {/* Selected Shop Summary Details Box */}
                {selectedPropertyDetails && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {selectedPropertyDetails.propertyNumber} — {selectedPropertyDetails.propertyName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {isHi ? 'रिक्त' : 'VACANT'}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span><strong>{isHi ? 'स्थान:' : 'Location:'}</strong> {selectedPropertyDetails.location}</span>
                        <span>•</span>
                        <span><strong>{isHi ? 'पता:' : 'Address:'}</strong> {selectedPropertyDetails.address}</span>
                        {selectedPropertyDetails.dimensionsSqft && (
                          <>
                            <span>•</span>
                            <span><strong>{isHi ? 'क्षेत्रफल:' : 'Area:'}</strong> {selectedPropertyDetails.dimensionsSqft} sq.ft.</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div className="text-[11px] text-slate-500 font-medium">
                        {isHi ? 'आधार मासिक किराया' : 'Base Monthly Rent'}
                      </div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        ₹{Number(selectedPropertyDetails.baseMonthlyRent).toLocaleString('en-IN')}/माह
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/rental/admin/tenants')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-100 transition text-center"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold bg-[#0b1b36] hover:bg-[#132c56] text-white transition text-center disabled:opacity-50"
              >
                {loading
                  ? (isHi ? 'पंजीकरण हो रहा है...' : 'Registering...')
                  : (isHi ? 'किरायेदार पंजीकृत करें' : 'Register Tenant')}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};
