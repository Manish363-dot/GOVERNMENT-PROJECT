import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import { rentalUserApi } from '../services/rentalUser.service';
import { rentalPropertyApi, PropertyListItem } from '../services/rentalProperty.service';
import {
  Phone,
  Mail,
  FileCheck2,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  X,
  ZoomIn,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const formatDateForInput = (val?: string | Date | null): string => {
  if (!val) return '';
  const d = new Date(val);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const formatDisplayDate = (val?: string | Date | null, locale = 'en-IN'): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Converts any uploaded image format (JPEG, PNG, AVIF, BMP, GIF, etc.) into WebP before uploading
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

export const TenantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const initialTenant = id ? api.peekCache<{ data: any }>(`/rental/users/admin/${id}`)?.data ?? null : null;
  const [tenant, setTenant] = useState<any | null>(initialTenant);
  const [loading, setLoading] = useState(!initialTenant);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Edit Mode states
  const [isEditMode, setIsEditMode] = useState(searchParams.get('edit') === 'true');
  const [availableProperties, setAvailableProperties] = useState<PropertyListItem[]>([]);
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');
  const [transliterating, setTransliterating] = useState<string | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [shopPhotoPreview, setShopPhotoPreview] = useState<string | null>(null);

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
    allotmentDate: '',
    leaseEndDate: '',
    profilePhotoFile: null as File | null,
    shopPhotoFile: null as File | null,
    aadhaarFile: null as File | null,
    domicileFile: null as File | null,
  });

  const handleAutoTransliterate = async (
    field: 'fullName' | 'permanentAddress' | 'currentAddress',
    value: string
  ) => {
    if (!value || !value.trim()) return;
    setTransliterating(field);
    try {
      const res = await api.post<{ success: boolean; hindi: string }>('/rental/transliterate', {
        text: value.trim(),
      });
      if (res && res.hindi && res.hindi.trim()) {
        const cleanHindi = res.hindi.replace(/[\u0966-\u096F]/g, (c) =>
          String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48)
        );
        setEditFormData((prev) => ({ ...prev, [field]: cleanHindi }));
      }
    } catch (err) {
      console.warn('Transliteration failed', err);
    } finally {
      setTransliterating(null);
    }
  };

  const handlePdfDocChange = (
    field: 'aadhaarFile' | 'domicileFile',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSaveErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setSaveErrorMsg(
        isHi
          ? field === 'aadhaarFile'
            ? 'आधार कार्ड केवल PDF फॉर्मेट में होना चाहिए।'
            : 'निवास प्रमाण पत्र केवल PDF फॉर्मेट में होना चाहिए।'
          : field === 'aadhaarFile'
          ? 'Aadhaar document must be strictly in PDF format.'
          : 'Domicile certificate must be strictly in PDF format.'
      );
      e.target.value = '';
      setEditFormData((prev) => ({ ...prev, [field]: null }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSaveErrorMsg(
        isHi ? 'PDF फ़ाइल का आकार 2 MB से कम होना चाहिए।' : 'PDF file size must be under 2 MB.'
      );
      e.target.value = '';
      setEditFormData((prev) => ({ ...prev, [field]: null }));
      return;
    }

    setEditFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleImageFileChange = async (
    field: 'profilePhotoFile' | 'shopPhotoFile',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSaveErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const setPreview = field === 'profilePhotoFile' ? setProfilePhotoPreview : setShopPhotoPreview;

    if (!file.type.startsWith('image/')) {
      setSaveErrorMsg(
        isHi
          ? 'फ़ोटो केवल इमेज फॉर्मेट (JPG, PNG, WEBP, आदि) में होनी चाहिए।'
          : 'Photo must be an image file (JPG, PNG, WEBP, etc.).'
      );
      e.target.value = '';
      setEditFormData((prev) => ({ ...prev, [field]: null }));
      setPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveErrorMsg(
        isHi ? 'फ़ोटो का आकार 5 MB से कम होना चाहिए।' : 'Photo size must be under 5 MB.'
      );
      e.target.value = '';
      setEditFormData((prev) => ({ ...prev, [field]: null }));
      setPreview(null);
      return;
    }

    try {
      const converted = await convertImageToWebP(file);
      setEditFormData((prev) => ({ ...prev, [field]: converted }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(converted);
    } catch {
      setEditFormData((prev) => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const loadData = async (force = false) => {
    if (!id) return;
    if (force) api.invalidateCache(`/rental/users/admin/${id}`);
    if (force || !tenant) setLoading(true);
    setError('');
    try {
      const res = await rentalUserApi.getTenantDetails(id);

      const user = res.data;
      setTenant(user);

      const activeAssignment = user.assignments?.find((a: any) => a.is_active) || user.assignments?.[0];

      setEditFormData({
        fullName: user.full_name || user.fullName || '',
        mobile: user.mobile || '',
        email: user.email || '',
        permanentAddress: user.permanent_address || user.permanentAddress || '',
        currentAddress: user.current_address || user.currentAddress || user.permanent_address || '',
        aadhaarNumber: '',
        panNumber: '',
        gstNumber: user.gst_number || '',
        propertyId: activeAssignment?.property?.id || activeAssignment?.property_id || '',
        monthlyRent: activeAssignment?.monthly_rent ? String(activeAssignment.monthly_rent) : '',
        allotmentDate: formatDateForInput(activeAssignment?.allotment_date || activeAssignment?.lease_start_date),
        leaseEndDate: formatDateForInput(activeAssignment?.lease_end_date),
        profilePhotoFile: null,
        shopPhotoFile: null,
        aadhaarFile: null,
        domicileFile: null,
      });
    } catch (err: any) {
      setError(err.message || (isHi ? 'किरायेदार विवरण लोड करने में असमर्थ' : 'Failed to load tenant details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Lazy-load properties dropdown ONLY when Edit Mode is opened
  useEffect(() => {
    if (!isEditMode || availableProperties.length > 0) return;
    rentalPropertyApi
      .listProperties({ limit: 100 })
      .then((propsRes) => {
        if (propsRes?.data && Array.isArray(propsRes.data.data)) {
          setAvailableProperties(propsRes.data.data);
        }
      })
      .catch(() => {});
  }, [isEditMode, availableProperties.length]);

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
    if (!tenant || !id) return;

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
    if (editFormData.allotmentDate && editFormData.leaseEndDate && editFormData.leaseEndDate < editFormData.allotmentDate) {
      setSaveErrorMsg(
        isHi
          ? 'दुकान आवंटन समाप्ति तिथि, आवंटन तिथि से पहले नहीं हो सकती'
          : 'Allotment end date cannot be earlier than allotment date'
      );
      return;
    }

    setSavingChanges(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');

    try {
      await rentalUserApi.updateTenantProfile(id, {
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
        allotmentDate: editFormData.allotmentDate || undefined,
        leaseEndDate: editFormData.leaseEndDate,
        profilePhotoFile: editFormData.profilePhotoFile,
        shopPhotoFile: editFormData.shopPhotoFile,
        aadhaarFile: editFormData.aadhaarFile,
        domicileFile: editFormData.domicileFile,
      });

      setSaveSuccessMsg(
        isHi
          ? 'किरायेदार प्रोफ़ाइल एवं सभी विवरण सफलतापूर्वक अपडेट हो गए!'
          : 'Tenant profile and records updated successfully!'
      );

      // Reload tenant details
      const updated = await rentalUserApi.getTenantDetails(id);
      setTenant(updated.data);
      const updatedAssignment = updated.data?.assignments?.find((a: any) => a.is_active) || updated.data?.assignments?.[0];

      // Reset upload files and sync updated assignment dates
      setEditFormData((prev) => ({
        ...prev,
        aadhaarNumber: '',
        panNumber: '',
        allotmentDate: formatDateForInput(updatedAssignment?.allotment_date || updatedAssignment?.lease_start_date),
        leaseEndDate: formatDateForInput(updatedAssignment?.lease_end_date),
        profilePhotoFile: null,
        shopPhotoFile: null,
        aadhaarFile: null,
        domicileFile: null,
      }));
      setProfilePhotoPreview(null);
      setShopPhotoPreview(null);

      // Switch back to view mode
      setIsEditMode(false);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to update tenant profile');
    } finally {
      setSavingChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm font-bold text-slate-600">{isHi ? 'विवरण लोड हो रहा है...' : 'Loading tenant details...'}</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <AdminLayout
        title={isHi ? 'किरायेदार विवरण' : 'Tenant Details'}
        breadcrumbs={[
          { label: isHi ? 'किरायेदार' : 'Tenants', to: '/rental/admin/tenants' },
          { label: 'Not Found' },
        ]}
      >
        <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-2xl text-center border border-slate-200">
          <p className="text-sm text-rose-600 font-bold mb-4">{error || 'Tenant not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/rental/admin/tenants')}
            className="px-4 py-2 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800"
          >
            {isHi ? 'किरायेदार सूची पर वापस जाएं' : 'Back to Tenant List'}
          </button>
        </div>
      </AdminLayout>
    );
  }

  const activeAssignment = tenant.assignments?.find((a: any) => a.is_active) || tenant.assignments?.[0];

  return (
    <AdminLayout
      title={isHi ? 'किरायेदार प्रोफ़ाइल विवरण' : 'Tenant Profile & Asset Details'}
      breadcrumbs={[
        { label: isHi ? 'किरायेदार प्रबंधन' : 'Tenants', to: '/rental/admin/tenants' },
        { label: tenant.full_name || tenant.fullName || 'Tenant' },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/tenants')}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-navy-900 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'वापस जाएं' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit / View Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSaveSuccessMsg('');
                setSaveErrorMsg('');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isEditMode
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isEditMode ? (
                <>
                  <span>{isHi ? 'विवरण देखें' : 'View Details'}</span>
                </>
              ) : (
                <>
                  <span>{isHi ? 'संपादित करें' : 'Edit Tenant'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {saveSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        {/* ── 1. READ-ONLY VIEW (DEFAULT) ── */}
        {!isEditMode ? (
          <div className="space-y-6">
            {/* Tenant Overview Banner */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
              {tenant.profile_photo_url ? (
                <div
                  className="relative group cursor-pointer shrink-0"
                  onClick={() =>
                    setPreviewImage({
                      url: tenant.profile_photo_url,
                      title: tenant.full_name || tenant.fullName || 'Tenant Photo',
                    })
                  }
                  title={isHi ? 'बड़ा करके देखें' : 'Click to enlarge'}
                >
                  <img
                    src={tenant.profile_photo_url}
                    alt={tenant.full_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 text-blue-900 font-extrabold text-2xl flex items-center justify-center border-4 border-slate-100 shrink-0">
                  {(tenant.full_name || tenant.fullName || 'T').charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 truncate">
                  {tenant.full_name || tenant.fullName}
                </h1>

                <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {tenant.mobile}
                  </span>
                  {tenant.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {tenant.email}
                    </span>
                  )}
                  <span>•</span>
                  <span>
                    कुल बकाया:{' '}
                    <strong className="text-rose-600 font-bold">
                      ₹{Number(tenant.outstanding_balance ?? tenant.outstandingBalance ?? 0).toLocaleString('en-IN')}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Assigned Property */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
                <span>{isHi ? 'आवंटित दुकान / संपत्ति विवरण' : 'Allocated Commercial Shop / Asset'}</span>
              </h2>

              {activeAssignment?.property ? (
                <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">{isHi ? 'दुकान संख्या:' : 'Shop Number:'}</span>
                      <span className="text-sm font-extrabold text-navy-950 font-mono inline-block bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded mt-0.5">
                        {activeAssignment.property.property_number || activeAssignment.property.property_id}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">{isHi ? 'बाजार / स्थान:' : 'Market Location:'}</span>
                      <span className="text-sm font-bold text-slate-800 block mt-0.5">{activeAssignment.property.location}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium block">{isHi ? 'मासिक किराया दर:' : 'Monthly Rent:'}</span>
                      <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">
                        ₹{Number(activeAssignment.monthly_rent || activeAssignment.property.base_monthly_rent || 0).toLocaleString('en-IN')}/माह
                      </span>
                    </div>
                  </div>

                  {/* Allotment Start & End Validity Dates */}
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5">
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">
                          {isHi ? 'दुकान आवंटन तिथि:' : 'Shop Allotment Date:'}
                        </span>
                        <span className="text-sm font-bold text-slate-900 block mt-0.5">
                          {formatDisplayDate(activeAssignment.allotment_date || activeAssignment.lease_start_date) || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">
                          {isHi ? 'समाप्ति तिथि:' : 'End Date:'}
                        </span>
                        {activeAssignment.lease_end_date ? (
                          <span className="text-sm font-bold text-slate-900 block mt-0.5">
                            {formatDisplayDate(activeAssignment.lease_end_date)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 italic block mt-0.5">
                            {isHi ? 'निर्धारित नहीं' : 'Not specified'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                  {isHi ? 'वर्तमान में कोई सक्रिय दुकान आवंटित नहीं है।' : 'No property currently assigned.'}
                </div>
              )}
            </div>

            {/* Address & Identity Information */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
                <span>{isHi ? 'पता एवं पहचान विवरण' : 'Address & Identification'}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold mb-1">{isHi ? 'स्थायी पता:' : 'Permanent Address:'}</span>
                  <span className="font-bold text-slate-900 leading-relaxed block">{tenant.permanent_address || tenant.permanentAddress || '—'}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold mb-1">{isHi ? 'वर्तमान पता:' : 'Current Address:'}</span>
                  <span className="font-bold text-slate-900 leading-relaxed block">
                    {tenant.current_address || tenant.currentAddress || tenant.permanent_address || '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">{isHi ? 'आधार संख्या:': 'Aadhaar Number:'}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{tenant.aadhaar_masked || 'XXXX-XXXX-****'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">{isHi ? 'पैन संख्या:' : 'PAN Number:'}</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{tenant.pan_masked || 'XXXXX****X'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block font-semibold">GSTIN:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{tenant.gst_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Uploaded Verification Documents */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-950 mb-4 flex items-center gap-2">
                <span>{isHi ? 'अपलोड किए गए पहचान व अनुबंध दस्तावेज़' : 'Uploaded Verification Documents'}</span>
              </h2>

              {tenant.documents && tenant.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tenant.documents.map((doc: any) => (
                    <div key={doc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {doc.file_name?.toLowerCase().includes('shop')
                              ? (isHi ? 'दुकान की फोटो ' : 'Shop Photo')
                              : (doc.doc_type || 'DOCUMENT')}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{doc.file_name}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const urlRes = await rentalUserApi.getSecureDocumentUrl(doc.id);
                            const fileUrl = urlRes?.data?.presignedUrl;
                            if (fileUrl) {
                              const isImg = /\.(jpe?g|png|webp|gif)(\?|$)/i.test(fileUrl) || /\.(jpe?g|png|webp|gif)$/i.test(doc.file_name || '');
                              if (isImg) {
                                setPreviewImage({ url: fileUrl, title: doc.doc_type || doc.file_name });
                              } else {
                                window.open(fileUrl, '_blank');
                              }
                            }
                          } catch {
                            alert(isHi ? 'दस्तावेज़ लोड करने में असमर्थ' : 'Unable to load document url');
                          }
                        }}
                        className="p-2 hover:bg-slate-200 rounded-lg text-blue-700 transition-colors shrink-0 cursor-pointer"
                        title={isHi ? 'दस्तावेज़ देखें' : 'View Document'}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">{isHi ? 'कोई दस्तावेज़ अपलोड नहीं है।' : 'No documents uploaded.'}</p>
              )}
            </div>
          </div>
        ) : (
          /* ── 2. FULL EDITABLE PROFILE FORM (EDIT MODE) ── */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Section 1: Basic & Personal Info */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-navy-950  flex items-center gap-2">
                <span>{isHi ? '1. व्यक्तिगत विवरण' : '1. Personal Details'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Full Name with Hindi Transliteration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                        onClick={() => handleAutoTransliterate('fullName', editFormData.fullName)}
                        className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                        title={isHi ? 'अंग्रेज़ी नाम को हिंदी में बदलें' : 'Convert English name to Hindi'}
                      >
                        🌐
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-semibold text-slate-900"
                    placeholder="e.g. Ramesh Chandra Joshi"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'मोबाइल नंबर' : 'Mobile Number'}
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
              </div>
            </div>

            {/* Section 2: Address Information */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-navy-950 flex items-center gap-2">
                <span>{isHi ? '2. पता विवरण' : '2. Address Details'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Permanent Address with Hindi Transliteration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
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
                        onClick={() => handleAutoTransliterate('permanentAddress', editFormData.permanentAddress)}
                        className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                        title={isHi ? 'अंग्रेज़ी पते को हिंदी में बदलें' : 'Convert English address to Hindi'}
                      >
                        🌐
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.permanentAddress}
                    onChange={(e) => setEditFormData({ ...editFormData, permanentAddress: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-navy-600/20 focus:border-navy-600 font-medium text-slate-900 resize-none"
                    placeholder="Village/Mohalla, Post, District, State, PIN"
                  />
                </div>

                {/* Current Address with Hindi Transliteration */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {isHi ? 'वर्तमान / दुकान का पता' : 'Current / Shop Address'}
                    </label>
                    {transliterating === 'currentAddress' ? (
                      <span className="text-[10px] text-amber-700 font-semibold animate-pulse">
                        {isHi ? 'अनुवाद हो रहा है...' : 'Translating...'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAutoTransliterate('currentAddress', editFormData.currentAddress)}
                        className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-semibold transition cursor-pointer"
                        title={isHi ? 'अंग्रेज़ी पते को हिंदी में बदलें' : 'Convert English address to Hindi'}
                      >
                        🌐
                      </button>
                    )}
                  </div>
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
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-navy-950 flex items-center gap-2">
              
                <span>{isHi ? '3. पहचान एवं कर विवरण' : '3. Identity & Tax Details'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Aadhaar Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isHi ? 'आधार संख्या' : 'Aadhaar Number'}
                    </label>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {tenant.aadhaar_masked || 'None'}
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
                </div>

                {/* PAN Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {isHi ? 'पैन संख्या' : 'PAN Number'}
                    </label>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {tenant.pan_masked || 'None'}
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
            <div className="bg-amber-50/60 p-5 sm:p-6 rounded-2xl border border-amber-200 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-amber-950 flex items-center gap-2">
                <span>{isHi ? '4. दुकान आवंटन एवं मासिक किराया' : '4. Shop Allotment & Rent'}</span>
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
                    {activeAssignment?.property && (
                      <option value={activeAssignment.property.id}>
                        [वर्तमान आवंटित] {activeAssignment.property.property_number} —{' '}
                        {activeAssignment.property.property_name || activeAssignment.property.location} (₹
                        {activeAssignment.monthly_rent || activeAssignment.property.base_monthly_rent}/माह)
                      </option>
                    )}

                    {/* Available Vacant Properties */}
                    {availableProperties.map((prop) => {
                      if (prop.id === activeAssignment?.property?.id) return null;
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
                      ? 'दुकान बदलने पर पुरानी दुकान स्वतः खाली हो जाएगी और नई दुकान आवंटित हो जाएगी।'
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
                </div>

                {/* Shop Allotment Date (From) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isHi ? 'दुकान आवंटन तिथि' : 'Shop Allotment Date'}
                  </label>
                  <input
                    type="date"
                    value={editFormData.allotmentDate}
                    onChange={(e) => setEditFormData({ ...editFormData, allotmentDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-semibold text-slate-900"
                  />
                </div>

                {/* Shop Allotment End Date (Until) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {isHi ? 'समाप्ति तिथि' : 'End Date'}
                    </label>
                    {editFormData.leaseEndDate && (
                      <button
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, leaseEndDate: '' })}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        {isHi ? 'हटाएं' : 'Clear'}
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    min={editFormData.allotmentDate || undefined}
                    value={editFormData.leaseEndDate}
                    onChange={(e) => setEditFormData({ ...editFormData, leaseEndDate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-semibold text-slate-900"
                  />
                  <p className="text-[10px] text-amber-700 font-medium mt-1">
                    {isHi ? 'खाली छोड़ने पर अनिश्चितकालीन माना जाएगा।' : 'Leave empty if open-ended.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Documents & File Vault */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-navy-950 flex items-center gap-2">
                  <span>{isHi ? '5. दस्तावेज बदलें या नया अपलोड करें' : '5. Documents Vault & Updates'}</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Profile Photo (Any Image -> Auto WebP, max 5MB) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {isHi ? 'प्रोफ़ाइल फोटो' : 'Profile Photo'}
                    </label>
                   <p className="text-[10px] text-slate-500 mb-1.5">
                      {isHi ? 'अधिकतम 5 MB' : 'Max 5 MB'}
                    </p>
                    {editFormData.profilePhotoFile && (
                      <div className="mb-2 flex items-center gap-2 p-1.5 bg-white rounded border border-slate-200">
                        {profilePhotoPreview && (
                          <img
                            src={profilePhotoPreview}
                            alt="Profile preview"
                            className="w-10 h-10 rounded object-cover border border-slate-300 shrink-0"
                          />
                        )}
                        <div className="text-[10px] truncate flex-1">
                          <p className="font-semibold text-slate-800 truncate">{editFormData.profilePhotoFile.name}</p>
                          <div className="flex items-center justify-between text-slate-500 mt-0.5">
                            <span>{formatFileSize(editFormData.profilePhotoFile.size)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData({ ...editFormData, profilePhotoFile: null });
                                setProfilePhotoPreview(null);
                              }}
                              className="text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
                    onChange={(e) => handleImageFileChange('profilePhotoFile', e)}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer"
                  />
                </div>

                {/* Shop Photo (Any Image -> Auto WebP, max 5MB) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {isHi ? 'दुकान की फोटो' : 'Shop Photo'}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      {isHi ? 'अधिकतम 5 MB' : 'Max 5 MB'}
                    </p>
                    {editFormData.shopPhotoFile && (
                      <div className="mb-2 flex items-center gap-2 p-1.5 bg-white rounded border border-slate-200">
                        {shopPhotoPreview && (
                          <img
                            src={shopPhotoPreview}
                            alt="Shop preview"
                            className="w-10 h-10 rounded object-cover border border-slate-300 shrink-0"
                          />
                        )}
                        <div className="text-[10px] truncate flex-1">
                          <p className="font-semibold text-slate-800 truncate">{editFormData.shopPhotoFile.name}</p>
                          <div className="flex items-center justify-between text-slate-500 mt-0.5">
                            <span>{formatFileSize(editFormData.shopPhotoFile.size)}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditFormData({ ...editFormData, shopPhotoFile: null });
                                setShopPhotoPreview(null);
                              }}
                              className="text-red-600 hover:underline font-semibold"
                            >
                              {isHi ? 'हटाएं' : 'Remove'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp"
                    onChange={(e) => handleImageFileChange('shopPhotoFile', e)}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer"
                  />
                </div>

                {/* Aadhaar Card (ONLY PDF <= 2MB) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {isHi ? 'आधार कार्ड' : 'Aadhaar Card'}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      {isHi ? 'केवल PDF फ़ाइल (अधिकतम 2 MB)' : 'PDF only (Max 2 MB)'}
                    </p>
                    {editFormData.aadhaarFile && (
                      <div className="mb-2 p-1.5 bg-white rounded border border-slate-200 text-[10px]">
                        <p className="font-semibold text-slate-800 truncate">{editFormData.aadhaarFile.name}</p>
                        <div className="flex items-center justify-between text-slate-500 mt-0.5">
                          <span>{formatFileSize(editFormData.aadhaarFile.size)}</span>
                          <button
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, aadhaarFile: null })}
                            className="text-red-600 hover:underline font-semibold"
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
                    onChange={(e) => handlePdfDocChange('aadhaarFile', e)}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                {/* Domicile Certificate (ONLY PDF <= 2MB) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      {isHi ? 'निवास प्रमाण पत्र' : 'Domicile Certificate'}
                    </label>
                    <p className="text-[10px] text-slate-500 mb-1.5">
                      {isHi ? 'केवल PDF फ़ाइल (अधिकतम 2 MB)' : 'PDF only (Max 2 MB)'}
                    </p>
                    {editFormData.domicileFile && (
                      <div className="mb-2 p-1.5 bg-white rounded border border-slate-200 text-[10px]">
                        <p className="font-semibold text-slate-800 truncate">{editFormData.domicileFile.name}</p>
                        <div className="flex items-center justify-between text-slate-500 mt-0.5">
                          <span>{formatFileSize(editFormData.domicileFile.size)}</span>
                          <button
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, domicileFile: null })}
                            className="text-red-600 hover:underline font-semibold"
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
                    onChange={(e) => handlePdfDocChange('domicileFile', e)}
                    className="w-full text-[11px] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer Action Buttons */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
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
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {savingChanges ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isHi ? 'सहेजा जा रहा है...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHi ? 'परिवर्तन सहेजें' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── 3. FULLSCREEN IMAGE LIGHTBOX PREVIEW ── */}
        {previewImage && (
          <div
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
                <span className="text-sm font-bold truncate max-w-md">{previewImage.title}</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-black/70 overflow-auto max-h-[calc(90vh-70px)]">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TenantProfilePage;
