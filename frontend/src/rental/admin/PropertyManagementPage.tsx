import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminConfirmModal } from './AdminConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import {
  rentalPropertyApi,
  PropertyListItem,
  PropertyListResponse,
  RentHistoryEntry,
  CreatePropertyInput,
} from '../services/rentalProperty.service';
import { rentalUserApi, TenantListItem } from '../services/rentalUser.service';
import {
  Building,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  History,
  UserCheck,
  Trash2,
  X,
  Store,
  Phone,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

export const PropertyManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const initialPropsCache = api.peekCache<{ data: PropertyListResponse }>('/rental/properties?status=ALL&type=ALL&page=1&limit=15')?.data;
  const [properties, setProperties] = useState<PropertyListItem[]>(initialPropsCache?.data || []);
  const [total, setTotal] = useState(initialPropsCache?.total || 0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(!initialPropsCache);
  const [translatingSearch, setTranslatingSearch] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep numbers strictly in 123 (ASCII) format even if stored with Devanagari digits
  const toAsciiDigits = (val?: string | null) =>
    (val || '').replace(/[\u0966-\u096F]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48));

  const getStatusLabel = (status: string) => {
    if (!isHi) return status;
    if (status === 'VACANT') return 'रिक्त';
    if (status === 'ALLOTTED') return 'आवंटित';
    if (status === 'MAINTENANCE') return 'रखरखाव';
    return status;
  };

  const getPropertyTypeLabel = (type: string) => {
    const map: Record<string, { hi: string; en: string }> = {
      COMMERCIAL_SHOP: { hi: 'व्यावसायिक दुकान', en: 'Commercial Shop' },
      ROADSIDE_STALL: { hi: 'सड़क किनारे स्टॉल', en: 'Roadside Stall' },
      WAREHOUSE_GODOWN: { hi: 'गोदाम / वेयरहाउस', en: 'Warehouse / Godown' },
      LAND_PARCEL: { hi: 'भूखंड / भूमि', en: 'Land Parcel' },
      OFFICE_SPACE: { hi: 'कार्यालय', en: 'Office Space' },
      OTHER: { hi: 'अन्य', en: 'Other' },
    };
    const item = map[type];
    if (item) return isHi ? item.hi : item.en;
    return type.replace(/_/g, ' ').toLowerCase();
  };

  // Explicit click-only Hindi transliteration for the upper search filter box
  const handleTransliterateSearch = async () => {
    const raw = search.trim();
    if (!raw) return;
    setTranslatingSearch(true);
    try {
      const res = await api.post<{ success: boolean; hindi: string }>('/rental/transliterate', {
        text: raw,
      });
      if (res && res.hindi && res.hindi.trim()) {
        setSearch(toAsciiDigits(res.hindi.trim()));
      } else {
        setSearch(toAsciiDigits(raw));
      }
    } catch (err) {
      console.warn('Search transliteration failed', err);
    } finally {
      setTranslatingSearch(false);
    }
  };

  // Modals & Master-Detail Inspector state
  const [inspectorProp, setInspectorProp] = useState<PropertyListItem | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListItem | null>(null);

  // New Property Form
  const [newProp, setNewProp] = useState<CreatePropertyInput>({
    propertyName: '',
    propertyType: 'COMMERCIAL_SHOP',
    propertyNumber: '',
    address: '',
    dimensionsSqft: undefined,
    baseMonthlyRent: 2500,
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Assignment Form
  const [activeTenants, setActiveTenants] = useState<TenantListItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [assignRent, setAssignRent] = useState<number>(0);
  const [leaseStartDate, setLeaseStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaseEndDate, setLeaseEndDate] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Rent Revision Form
  const [newRentAmount, setNewRentAmount] = useState<number>(0);
  const [rentEffectiveDate, setRentEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [rentChangeReason, setRentChangeReason] = useState('');
  const [requestedBy, setRequestedBy] = useState('Zila Panchayat Board Almora');
  const [submittingRent, setSubmittingRent] = useState(false);

  // History state
  const [rentHistory, setRentHistory] = useState<RentHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Shop Photos Management Modal State (up to 3 photos)
  const [photoModalProp, setPhotoModalProp] = useState<PropertyListItem | null>(null);
  const [keptPhotoUrls, setKeptPhotoUrls] = useState<string[]>([]);
  const [newPhotoItems, setNewPhotoItems] = useState<Array<{ file: File; previewUrl: string }>>([]);
  const [savingPhotos, setSavingPhotos] = useState(false);

  const handleOpenPhotoModal = (prop: PropertyListItem) => {
    newPhotoItems.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setNewPhotoItems([]);
    setKeptPhotoUrls(prop.photoUrls ? [...prop.photoUrls] : []);
    setPhotoModalProp(prop);
  };

  useEffect(() => {
    if (properties.length === 0) {
      setInspectorProp(null);
      setMobileShowDetail(false);
      return;
    }
    setInspectorProp((prev) => {
      if (prev) {
        const match = properties.find((p) => p.id === prev.id);
        if (match) return match;
      }
      return properties[0];
    });
  }, [properties]);

  const handlePickModalPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const slots = 3 - (keptPhotoUrls.length + newPhotoItems.length);
    if (slots <= 0) {
      e.target.value = '';
      return;
    }
    const added = files.slice(0, slots).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewPhotoItems((prev) => [...prev, ...added]);
    e.target.value = '';
  };

  const handleSaveShopPhotos = async () => {
    if (!photoModalProp) return;
    setSavingPhotos(true);
    setError('');
    try {
      await rentalPropertyApi.updatePropertyPhotos(
        photoModalProp.id,
        keptPhotoUrls,
        newPhotoItems.map((p) => p.file)
      );
      newPhotoItems.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setNewPhotoItems([]);
      setPhotoModalProp(null);
      setSuccessMsg(
        isHi
          ? 'दुकान की फोटो सफलतापूर्वक अपडेट कर दी गई हैं।'
          : 'Shop photos updated successfully.'
      );
      fetchProperties(true);
    } catch (err: any) {
      setError(err.message || (isHi ? 'फोटो अपडेट करने में त्रुटि हुई।' : 'Failed to update shop photos.'));
    } finally {
      setSavingPhotos(false);
    }
  };

  const fetchProperties = async (force = false) => {
    if (force) {
      api.invalidateCache('/rental/properties');
    }
    if (force || properties.length === 0) {
      setLoading(true);
    }
    setError('');
    try {
      const res = await rentalPropertyApi.listProperties({
        search,
        status: statusFilter,
        type: typeFilter,
        page,
        limit: 15,
      });
      setProperties(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(false);
  }, [page, statusFilter, typeFilter]);

  const loadTenantsForAssignment = async () => {
    try {
      const res = await rentalUserApi.listTenants({ limit: 100 });
      setActiveTenants(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedTenantId(res.data.data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load tenants for assignment:', err);
    }
  };

  const handleOpenAssignModal = (prop: PropertyListItem) => {
    setSelectedProperty(prop);
    setAssignRent(prop.baseMonthlyRent);
    loadTenantsForAssignment();
    setIsAssignModalOpen(true);
  };

  const handleOpenRentModal = (prop: PropertyListItem) => {
    setSelectedProperty(prop);
    const currentRent = prop.currentTenant?.activeRent || prop.baseMonthlyRent;
    setNewRentAmount(currentRent);
    setRentChangeReason('');
    setIsRentModalOpen(true);
  };

  const handleOpenHistoryModal = async (prop: PropertyListItem) => {
    setSelectedProperty(prop);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const res = await rentalPropertyApi.getRentHistory(prop.id);
      setRentHistory(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rent revision history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    setError('');
    try {
      await rentalPropertyApi.createProperty(newProp);
      setSuccessMsg(isHi ? 'नई व्यावसायिक संपत्ति सफलतापूर्वक जोड़ी गई।' : 'Commercial property registered successfully.');
      setIsAddModalOpen(false);
      fetchProperties();
      setNewProp({
        propertyName: '',
        propertyType: 'COMMERCIAL_SHOP',
        propertyNumber: '',
        address: '',
        dimensionsSqft: undefined,
        baseMonthlyRent: 2500,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add property.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleAssignProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !selectedTenantId) return;
    setSubmittingAssign(true);
    setError('');
    try {
      await rentalPropertyApi.assignProperty(selectedProperty.id, {
        userId: selectedTenantId,
        monthlyRent: assignRent,
        leaseStartDate,
        leaseEndDate: leaseEndDate || undefined,
      });
      setSuccessMsg(isHi ? 'दुकान किरायेदार को आवंटित कर दी गई है।' : 'Property allotted to tenant successfully.');
      setIsAssignModalOpen(false);
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to allot property.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const [vacateModal, setVacateModal] = useState<{
    isOpen: boolean;
    property: PropertyListItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    property: null,
    loading: false,
  });

  const requestVacateProperty = (prop: PropertyListItem) => {
    setVacateModal({
      isOpen: true,
      property: prop,
      loading: false,
    });
  };

  const handleConfirmVacateProperty = async () => {
    if (!vacateModal.property) return;
    setVacateModal((prev) => ({ ...prev, loading: true }));
    try {
      await rentalPropertyApi.unassignProperty(vacateModal.property.id, 'Lease term completed / Official vacating');
      setSuccessMsg(isHi ? 'दुकान खाली कर दी गई है और रिक्त स्थिति में है।' : 'Property vacated successfully.');
      setVacateModal({ isOpen: false, property: null, loading: false });
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to vacate property.');
      setVacateModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    property: PropertyListItem | null;
    loading: boolean;
  }>({
    isOpen: false,
    property: null,
    loading: false,
  });

  const requestDeleteProperty = (prop: PropertyListItem) => {
    setDeleteModal({
      isOpen: true,
      property: prop,
      loading: false,
    });
  };

  const handleConfirmDeleteProperty = async () => {
    if (!deleteModal.property) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await rentalPropertyApi.deleteProperty(deleteModal.property.id);
      setSuccessMsg(isHi ? 'दुकान / संपत्ति सफलतापूर्वक हटा दी गई।' : 'Property deleted successfully.');
      setDeleteModal({ isOpen: false, property: null, loading: false });
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to delete property.');
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleReviseRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !selectedProperty.currentTenant) return;
    setSubmittingRent(true);
    setError('');
    try {
      await rentalPropertyApi.changeRent(selectedProperty.id, {
        userId: selectedProperty.currentTenant.userId,
        newRent: newRentAmount,
        effectiveDate: rentEffectiveDate,
        reason: rentChangeReason,
        requestedBy,
      });
      setSuccessMsg(
        isHi
          ? 'मासिक किराया सफलतापूर्वक संशोधित कर ऑडिट रजिस्टर में दर्ज कर दिया गया।'
          : 'Monthly rent revised and permanently logged in audit register.'
      );
      setIsRentModalOpen(false);
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to revise rent.');
    } finally {
      setSubmittingRent(false);
    }
  };

  // Quick stats calculation
  const vacantCount = properties.filter((p) => p.status === 'VACANT').length;
  const allottedCount = properties.filter((p) => p.status === 'ALLOTTED').length;
  const totalRentAccrued = properties.reduce(
    (acc, p) => acc + (p.currentTenant?.activeRent || p.baseMonthlyRent),
    0
  );

  return (
    <AdminLayout
      title={isHi ? 'व्यावसायिक संपत्ति एवं परिसंपत्ति रजिस्टर' : 'Commercial Property & Asset Registry'}
      breadcrumbs={[{ label: isHi ? 'दुकानें व संपत्तियां' : 'Properties' }]}
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/rental/admin/register-property')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-sm sm:text-base font-bold shadow-sm transition cursor-pointer"
          >
            {isHi ? 'नई संपत्ति पंजीकृत करें' : 'Register New Shop'}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold shrink-0">
              ×
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="break-words">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 font-bold shrink-0">
              ×
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">
                {isHi ? 'कुल संपत्तियां' : 'Total Assets'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{total}</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">
                {isHi ? 'रिक्त संपत्तियां' : 'Vacant Assets'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{vacantCount}</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">
                {isHi ? 'आवंटित दुकानें' : 'Allotted Shops'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{allottedCount}</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase truncate">
                {isHi ? 'मासिक राजस्व क्षमता' : 'Monthly Potential'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 truncate">
                ₹{totalRentAccrued.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-3 lg:gap-4 justify-between items-stretch lg:items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchProperties();
            }}
            className="flex-1 w-full flex items-center gap-2 min-w-0"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isHi
                    ? 'दुकान संख्या, नाम या स्थान से खोजें...'
                    : 'Search by shop number, location, or name...'
                }
                className="w-full pl-9 pr-11 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleTransliterateSearch}
                disabled={translatingSearch || !search.trim()}
                title={isHi ? 'English शब्द को हिंदी में बदलें' : 'Convert English search text to Hindi'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 disabled:opacity-45 px-2 py-1 rounded font-semibold transition cursor-pointer"
              >
                {translatingSearch ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  '🌐'
                )}
              </button>
            </div>
            <button
              type="submit"
              className="px-3.5 sm:px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition shrink-0 cursor-pointer"
            >
              {isHi ? 'खोजें' : 'Search'}
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full lg:w-auto min-w-0 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">{isHi ? 'सभी स्थितियाँ' : 'All Statuses'}</option>
                <option value="VACANT">{isHi ? 'रिक्त' : 'Vacant'}</option>
                <option value="ALLOTTED">{isHi ? 'आवंटित' : 'Allotted'}</option>
                <option value="MAINTENANCE">{isHi ? 'रखरखाव' : 'Maintenance'}</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full lg:w-auto min-w-0 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">{isHi ? 'सभी प्रकार' : 'All Types'}</option>
              <option value="COMMERCIAL_SHOP">{isHi ? 'दुकान' : 'Commercial Shop'}</option>
              <option value="ROADSIDE_STALL">{isHi ? 'स्टॉल' : 'Roadside Stall'}</option>
              <option value="WAREHOUSE_GODOWN">{isHi ? 'गोदाम' : 'Warehouse/Godown'}</option>
              <option value="LAND_PARCEL">{isHi ? 'भूमि' : 'Land Parcel'}</option>
              <option value="OFFICE_SPACE">{isHi ? 'कार्यालय' : 'Office Space'}</option>
              <option value="OTHER">{isHi ? 'अन्य' : 'Other'}</option>
            </select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p>{isHi ? 'परिसंपत्तियां लोड हो रही हैं...' : 'Loading commercial properties...'}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">
                {isHi ? 'कोई संपत्ति नहीं मिली' : 'No commercial properties found'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {isHi ? 'खोज फ़िल्टर बदलें या नई संपत्ति जोड़ें।' : 'Try adjusting filters or add a new property asset.'}
              </p>
            </div>
          ) : (
            <>
              {/* Master–Detail Split View (Gmail / File Explorer Style) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] bg-white">
                {/* Left Master List Pane */}
                <div
                  className={`lg:col-span-5 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/40 ${
                    mobileShowDetail ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700 truncate">
                        {isHi ? 'संपत्ति सूची ' :'Properties'}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-y-auto max-h-[680px] flex-1 bg-white">
                    {properties.map((prop) => {
                      const effectiveRent = prop.currentTenant?.activeRent || prop.baseMonthlyRent;
                      const isActive = inspectorProp?.id === prop.id;
                      const thumbUrl = prop.photoUrls?.[0];
                      const statusDot =
                        prop.status === 'VACANT'
                          ? 'bg-emerald-500'
                          : prop.status === 'ALLOTTED'
                            ? 'bg-blue-600'
                            : 'bg-amber-500';

                      return (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => {
                            setInspectorProp(prop);
                            setMobileShowDetail(true);
                          }}
                          className={`w-full text-left px-3.5 py-3 border-l-4 transition-colors cursor-pointer flex items-center gap-3 ${
                            isActive
                              ? 'border-l-[#0B3B60] bg-indigo-50/70'
                              : 'border-l-transparent hover:bg-slate-50'
                          }`}
                        >
                          {/* Compact Thumbnail */}
                          <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {thumbUrl ? (
                              <img src={thumbUrl} alt={prop.propertyNumber} className="w-full h-full object-cover" />
                            ) : (
                              <Store className="w-4 h-4 text-slate-500" />
                            )}
                          </div>

                          {/* Code + Name + Subline */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                                {toAsciiDigits(prop.propertyNumber)}
                              </span>
                              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {toAsciiDigits(
                                  prop.propertyName && prop.propertyName !== prop.propertyNumber
                                    ? prop.propertyName
                                    : prop.address || prop.location
                                )}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-1">
                              {prop.currentTenant
                                ? `${toAsciiDigits(prop.currentTenant.fullName)} • ${prop.currentTenant.mobile}`
                                : toAsciiDigits(prop.address || prop.location)}
                            </div>
                          </div>

                          {/* Right Rent + Status Dot */}
                          <div className="text-right shrink-0 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${statusDot}`} title={prop.status} />
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 lg:hidden" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Detail Inspector Pane */}
                <div
                  className={`lg:col-span-7 xl:col-span-8 flex flex-col justify-between bg-white ${
                    mobileShowDetail ? 'flex' : 'hidden lg:flex'
                  }`}
                >
                  {inspectorProp ? (
                    <>
                      {/* Detail Header */}
                      <div className="px-5 py-4 bg-gradient-to-r from-[#0B3B60] to-[#134d7a] text-white flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => setMobileShowDetail(false)}
                            className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white mb-2 cursor-pointer"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{isHi ? 'सभी दुकानों की सूची पर लौटें' : 'Back to Properties'}</span>
                          </button>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-md bg-white/15 border border-white/25 font-mono font-bold text-xs">
                              {toAsciiDigits(inspectorProp.propertyNumber)}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                inspectorProp.status === 'VACANT'
                                  ? 'bg-emerald-500 text-white'
                                  : inspectorProp.status === 'ALLOTTED'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-amber-500 text-slate-950'
                              }`}
                            >
                              {getStatusLabel(inspectorProp.status)}
                            </span>
                            <span className="text-xs text-slate-200">
                              • {getPropertyTypeLabel(inspectorProp.propertyType)}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-extrabold mt-1.5 leading-snug break-words">
                            {toAsciiDigits(inspectorProp.propertyName || inspectorProp.propertyNumber)}
                          </h3>
                        </div>

                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenHistoryModal(inspectorProp)}
                            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>{isHi ? 'किराये का इतिहास' : 'Rent History'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProperty(inspectorProp)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-600 text-white transition cursor-pointer"
                            title={isHi ? 'संपत्ति हटाएं' : 'Delete Property'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detail Content Body */}
                      <div className="p-5 sm:p-6 space-y-5 flex-1">
                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
                            <span className="text-[11px] font-bold uppercase text-indigo-700 block">
                              {isHi ? 'वर्तमान मासिक किराया' : 'Monthly Rent'}
                            </span>
                            <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
                              ₹{(inspectorProp.currentTenant?.activeRent || inspectorProp.baseMonthlyRent).toLocaleString('en-IN')}
                              <span className="text-xs font-sans font-normal text-slate-500"> /mo</span>
                            </div>
                            {inspectorProp.currentTenant &&
                              inspectorProp.currentTenant.activeRent !== inspectorProp.baseMonthlyRent && (
                                <span className="text-xs text-slate-500 line-through">
                                  Base: ₹{inspectorProp.baseMonthlyRent.toLocaleString('en-IN')}
                                </span>
                              )}
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                              {isHi ? 'क्षेत्रफल / साइज़' : 'Dimensions'}
                            </span>
                            <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                              <span>{inspectorProp.dimensionsSqft ? `${inspectorProp.dimensionsSqft} sq.ft` : 'N/A'}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                              {isHi ? 'संपत्ति श्रेणी' : 'Asset Category'}
                            </span>
                            <div className="text-sm font-bold text-slate-900 mt-1.5">
                              {getPropertyTypeLabel(inspectorProp.propertyType)}
                            </div>
                          </div>
                        </div>

                        {/* Address + Current Tenant Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                              {isHi ? 'पूरा पता एवं स्थान' : 'Address & Location'}
                            </span>
                            <p className="text-sm font-medium text-slate-800 leading-relaxed break-words">
                              {toAsciiDigits(inspectorProp.address || inspectorProp.location)}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                            <span className="text-[11px] font-bold uppercase text-slate-500 block">
                              {isHi ? 'वर्तमान आवंटन / किरायेदार' : 'Current Tenant / Allotment'}
                            </span>
                            {inspectorProp.currentTenant ? (
                              <div className="space-y-1.5">
                                <div className="text-base font-bold text-slate-900">
                                  {toAsciiDigits(inspectorProp.currentTenant.fullName)}
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-blue-700">
                                    {inspectorProp.currentTenant.mobile}
                                  </span>

                                </div>
                                {inspectorProp.currentTenant.leaseStartDate && (
                                  <p className="text-xs text-slate-500">
                                    {isHi ? 'आवंटन तिथि:' : 'Lease Start:'}{' '}
                                    {new Date(inspectorProp.currentTenant.leaseStartDate).toLocaleDateString('en-IN')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs font-semibold text-emerald-800">
                                {isHi ? 'यह दुकान अभी रिक्त है और आवंटन हेतु उपलब्ध है।' : 'Vacant unit ready for immediate allotment.'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shop Photo Gallery Section */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              {isHi ? 'दुकान की तस्वीरें' : 'Property Gallery'}
                            </span>
                          </div>

                          {inspectorProp.photoUrls && inspectorProp.photoUrls.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {inspectorProp.photoUrls.map((url, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleOpenPhotoModal(inspectorProp)}
                                  className="h-32 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 shadow-2xs transition cursor-pointer"
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPhotoModal(inspectorProp)}
                              className="w-full py-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50/70 text-slate-500 hover:text-indigo-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                            >
                              <span>{isHi ? 'दुकान की फोटो अपलोड करें (अधिकतम 3)' : 'Upload Shop Photos (Max 3)'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Primary Action Bar */}
                      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenPhotoModal(inspectorProp)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <span>
                              {isHi ? 'फोटो' : 'Photos'} ({inspectorProp.photoUrls?.length || 0}/3)
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => requestDeleteProperty(inspectorProp)}
                            className="sm:hidden inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isHi ? 'हटाएं' : 'Delete'}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {inspectorProp.status === 'VACANT' ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(inspectorProp)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                            >
                              <span>{isHi ? 'किरायेदार को आवंटित करें' : 'Allot Property'}</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenRentModal(inspectorProp)}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                              >
                                <span>{isHi ? 'किराया बदलें' : 'Revise Rent'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => requestVacateProperty(inspectorProp)}
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer"
                              >
                                <span>{isHi ? 'खाली करें' : 'Vacate'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                      <Store className="w-12 h-12 mb-2 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        {isHi ? 'विवरण देखने के लिए बाईं ओर से किसी दुकान का चयन करें' : 'Select a property from the left list to inspect details'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
          </>
        )}
        </div>

        {/* Modal 1: Add Commercial Asset */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'नई व्यावसायिक संपत्ति पंजीकृत करें' : 'Register Commercial Property Asset'}
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'दुकान / संपत्ति का नाम *' : 'Shop / Property Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.propertyName ?? ''}
                    onChange={(e) => setNewProp({ ...newProp, propertyName: e.target.value })}
                    placeholder={isHi ? 'उदा. दुकान संख्या 12, भूतल' : 'e.g., Shop No. 12, Ground Floor'}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'दुकान कोड *' : 'Shop Code *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProp.propertyNumber}
                      onChange={(e) => setNewProp({ ...newProp, propertyNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g., SHOP-101"
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'संपत्ति का प्रकार *' : 'Property Type *'}
                    </label>
                    <select
                      value={newProp.propertyType}
                      onChange={(e) => setNewProp({ ...newProp, propertyType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COMMERCIAL_SHOP">{isHi ? 'व्यावसायिक दुकान' : 'Commercial Shop'}</option>
                      <option value="ROADSIDE_STALL">{isHi ? 'सड़क किनारे स्टॉल' : 'Roadside Stall'}</option>
                      <option value="WAREHOUSE_GODOWN">{isHi ? 'गोदाम / वेयरहाउस' : 'Warehouse / Godown'}</option>
                      <option value="LAND_PARCEL">{isHi ? 'भूखंड' : 'Land Parcel'}</option>
                      <option value="OFFICE_SPACE">{isHi ? 'कार्यालय' : 'Office Space'}</option>
                      <option value="OTHER">{isHi ? 'अन्य' : 'Other'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'दुकान का पता *' : 'Shop Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.address}
                    onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                    placeholder={isHi ? 'उदा. मॉल रोड, अल्मोड़ा' : 'e.g., Near Gandhi Chowk, Mall Road, Almora'}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'क्षेत्रफल वर्ग फुट (वैकल्पिक)' : 'Area in Sq. Ft (Optional)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProp.dimensionsSqft ?? ''}
                      onChange={(e) =>
                        setNewProp({
                          ...newProp,
                          dimensionsSqft: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="e.g., 120"
                      className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'मासिक किराया (₹/माह) *' : 'Monthly Rent (₹/month) *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={newProp.baseMonthlyRent || ''}
                        onChange={(e) => setNewProp({ ...newProp, baseMonthlyRent: Number(e.target.value) })}
                        placeholder="2500"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="px-5 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {submittingAdd
                      ? isHi
                        ? 'सहेज रहे हैं...'
                        : 'Registering...'
                      : isHi
                        ? 'संपत्ति दर्ज करें'
                        : 'Register Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Allot Property to Tenant */}
        {isAssignModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {isHi ? 'किरायेदार को दुकान आवंटित करें' : 'Allot Property to Tenant'}
                </h3>
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border text-sm">
                <div className="font-bold text-slate-900">{selectedProperty.propertyName}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {selectedProperty.propertyNumber} • {selectedProperty.location}
                </div>
              </div>

              <form onSubmit={handleAssignProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'सक्रिय पंजीकृत किरायेदार चुनें' : 'Select Registered Active Tenant'}
                  </label>
                  {activeTenants.length === 0 ? (
                    <p className="text-xs text-red-500">
                      {isHi
                        ? 'कोई सक्रिय किरायेदार उपलब्ध नहीं है। पहले नया किरायेदार पंजीकृत करें।'
                        : 'No active tenants available. Please register a tenant first.'}
                    </p>
                  ) : (
                    <select
                      value={selectedTenantId}
                      onChange={(e) => setSelectedTenantId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      {activeTenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.mobile})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'सहमत मासिक किराया (₹)' : 'Agreed Monthly Rent (₹)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={assignRent}
                      onChange={(e) => setAssignRent(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'पट्टा प्रारंभ तिथि' : 'Lease Start Date'}
                    </label>
                    <input
                      type="date"
                      required
                      value={leaseStartDate}
                      onChange={(e) => setLeaseStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'पट्टा समाप्ति तिथि (वैकल्पिक)' : 'Lease End Date (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAssign || activeTenants.length === 0}
                    className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {submittingAssign
                      ? isHi
                        ? 'आवंटन कर रहे हैं...'
                        : 'Allotting...'
                      : isHi
                        ? 'आवंटन की पुष्टि करें'
                        : 'Confirm Allotment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Revise Rent with Audit Trail */}
        {isRentModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  {isHi ? 'मासिक किराया संशोधन' : 'Revise Monthly Rent'}
                </h3>
                <button
                  onClick={() => setIsRentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  {isHi ? 'लेखा परीक्षा अखंडता चेतावनी' : 'Maker-Checker Historical Integrity'}
                </div>
                <div>
                  {isHi
                    ? 'पूर्व में जारी बिलों और खातों पर इसका प्रभाव नहीं पड़ेगा। नया किराया केवल प्रभावी तिथि से आगे लागू होगा।'
                    : 'Issued historical bills and settled ledgers will not be altered. The revised rent takes effect strictly from the effective date forward.'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border text-sm space-y-1">
                <div className="font-bold text-slate-900">{selectedProperty.propertyName}</div>
                <div className="text-xs text-slate-600">
                  {isHi ? 'वर्तमान किरायेदार' : 'Current Tenant'}:{' '}
                  <span className="font-semibold text-slate-900">
                    {selectedProperty.currentTenant?.fullName}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  {isHi ? 'वर्तमान किराया' : 'Current Rent'}:{' '}
                  <span className="font-bold text-indigo-700">
                    ₹{selectedProperty.currentTenant?.activeRent.toLocaleString('en-IN')}/माह
                  </span>
                </div>
              </div>

              <form onSubmit={handleReviseRent} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'नया संशोधित किराया (₹/माह)' : 'New Revised Rent (₹/mo)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={newRentAmount}
                      onChange={(e) => setNewRentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'प्रभावी तिथि *' : 'Effective Date *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={rentEffectiveDate}
                      onChange={(e) => setRentEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'संशोधन का वैधानिक कारण' : 'Statutory Reason for Revision'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={rentChangeReason}
                    onChange={(e) => setRentChangeReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'अनुरोधकर्ता / प्राधिकृत निकाय' : 'Requested / Approved Authority'}
                  </label>
                  <input
                    type="text"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsRentModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRent}
                    className="px-5 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {submittingRent
                      ? isHi
                        ? 'सहेज रहे हैं...'
                        : 'Saving...'
                      : isHi
                        ? 'किराया संशोधित करें'
                        : 'Save Rent Revision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Rent Change Audit History */}
        {isHistoryModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-auto max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'किराया संशोधन लेखा परीक्षा इतिहास' : 'Rent Revision Audit History'}
                </h3>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border text-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{selectedProperty.propertyName}</div>
                  <div className="text-xs text-slate-500">
                    {selectedProperty.propertyNumber} • {selectedProperty.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{isHi ? 'वर्तमान किराया' : 'Current Rent'}</div>
                  <div className="text-base font-bold text-indigo-700">
                    ₹{(selectedProperty.currentTenant?.activeRent || selectedProperty.baseMonthlyRent).toLocaleString('en-IN')}/mo
                  </div>
                </div>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  <p>{isHi ? 'इतिहास लोड हो रहा है...' : 'Loading history...'}</p>
                </div>
              ) : rentHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">
                    {isHi
                      ? 'इस संपत्ति के लिए कोई किराया संशोधन रिकॉर्ड नहीं है (मूल किराया लागू है)।'
                      : 'No rent revision records found for this property (base rent active).'}
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {rentHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-600 line-through">
                            ₹{item.previous_rent.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400">➔</span>
                          <span className="font-extrabold text-emerald-700 text-sm">
                            ₹{item.new_rent.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="text-slate-500">
                          {isHi ? 'प्रभावी तिथि' : 'Effective'}:{' '}
                          <span className="font-semibold text-slate-800">
                            {new Date(item.effective_date).toLocaleDateString()}
                          </span>
                        </span>
                      </div>

                      <div className="text-slate-700 font-medium">
                        <span className="text-slate-500">{isHi ? 'कारण' : 'Reason'}:</span> {item.reason}
                      </div>

                      <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200">
                        <span>
                          {isHi ? 'किरायेदार' : 'Tenant'}: {item.user?.full_name || 'N/A'}
                        </span>
                        <span>
                          {isHi ? 'स्वीकृत' : 'Approved'}: {item.approved_by || 'Admin'} •{' '}
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t">
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vacate Confirmation Dialog */}
        <AdminConfirmModal
          isOpen={vacateModal.isOpen}
          title={isHi ? 'दुकान / संपत्ति खाली कराने की पुष्टि' : 'Vacate Property & Shop'}
          message={
            isHi
              ? 'क्या आप वाकई इस दुकान का आवंटन समाप्त कर इसे रिक्त स्थिति में लाना चाहते हैं? वर्तमान किरायेदार का आवंटन समाप्त हो जाएगा।'
              : 'Are you sure you want to terminate the allotment and mark this shop/property as VACANT? Current tenant assignment will be ended.'
          }
          subject={
            vacateModal.property
              ? `${vacateModal.property.propertyName} (${vacateModal.property.propertyNumber}) • किरायेदार: ${vacateModal.property.currentTenant?.fullName || 'N/A'}`
              : undefined
          }
          variant="danger"
          iconType="trash"
          confirmText={isHi ? 'हां, दुकान खाली करें' : 'Vacate Shop'}
          denyText={isHi ? 'रद्द करें' : 'Cancel'}
          loading={vacateModal.loading}
          onConfirm={handleConfirmVacateProperty}
          onDeny={() => setVacateModal({ isOpen: false, property: null, loading: false })}
        />

        {/* Delete Property Confirmation Dialog */}
        <AdminConfirmModal
          isOpen={deleteModal.isOpen}
          title={isHi ? 'संपत्ति स्थायी रूप से हटाएं' : 'Delete Commercial Property'}
          message={
            isHi
              ? 'क्या आप वाकई इस दुकान / व्यावसायिक संपत्ति को स्थायी रूप से हटाना चाहते हैं? इससे संबंधित सभी रिकॉर्ड हट जाएंगे। यह कार्रवाई वापस नहीं ली जा सकती।'
              : 'Are you sure you want to permanently delete this commercial property asset? All related records will be removed. This action cannot be undone.'
          }
          subject={
            deleteModal.property
              ? `${deleteModal.property.propertyName} (${deleteModal.property.propertyNumber}) • ${deleteModal.property.location}`
              : undefined
          }
          variant="danger"
          iconType="trash"
          confirmText={isHi ? 'हां, संपत्ति हटाएं' : 'Delete Property'}
          denyText={isHi ? 'रद्द करें' : 'Cancel'}
          loading={deleteModal.loading}
          onConfirm={handleConfirmDeleteProperty}
          onDeny={() => setDeleteModal({ isOpen: false, property: null, loading: false })}
        />

        {/* Manage Shop Photos Modal (1–3 Photos) */}
        {photoModalProp && (
          <div
            className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4"
            onClick={() => !savingPhotos && setPhotoModalProp(null)}
          >
            <div
              className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 bg-[#0B3B60] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold">
                    {isHi
                      ? `दुकान फोटो प्रबंधन — ${photoModalProp.propertyNumber}`
                      : `Manage Shop Photos — ${photoModalProp.propertyNumber}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => !savingPhotos && setPhotoModalProp(null)}
                  className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{isHi ? 'चयनित फोटो:' : 'Selected Photos:'}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {keptPhotoUrls.map((url, idx) => (
                    <div
                      key={`kept-${idx}`}
                      className="relative h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-100"
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setKeptPhotoUrls((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {newPhotoItems.map((item, idx) => (
                    <div
                      key={`new-${idx}`}
                      className="relative h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-100"
                    >
                      <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setNewPhotoItems((prev) => {
                            const t = prev[idx];
                            if (t) URL.revokeObjectURL(t.previewUrl);
                            return prev.filter((_, i) => i !== idx);
                          })
                        }
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/85 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {keptPhotoUrls.length + newPhotoItems.length < 3 && (
                    <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#0B3B60] bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#0B3B60] transition cursor-pointer p-2 text-center">
                      <span className="text-[11px] font-bold">
                        {isHi ? '+ फोटो जोड़ें' : '+ Add Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        multiple
                        onChange={handlePickModalPhotos}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={savingPhotos}
                    onClick={() => setPhotoModalProp(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={savingPhotos}
                    onClick={handleSaveShopPhotos}
                    className="px-5 py-2 rounded-lg bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                  >
                    {savingPhotos
                      ? isHi
                        ? 'सहेजा जा रहा है...'
                        : 'Saving...'
                      : isHi
                        ? 'फोटो सहेजें'
                        : 'Save Photos'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
