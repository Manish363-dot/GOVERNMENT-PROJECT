import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  rentalPropertyApi,
  PropertyListItem,
  RentHistoryEntry,
  CreatePropertyInput,
} from '../services/rentalProperty.service';
import { rentalUserApi, TenantListItem } from '../services/rentalUser.service';
import {
  Building,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  UserCheck,
  UserX,
  MapPin,
  Maximize2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Store,
  FileText,
} from 'lucide-react';

export const PropertyManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
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
    location: 'Mall Road, Almora',
    address: 'Near Gandhi Chowk, Mall Road, Almora, Uttarakhand',
    dimensionsSqft: 120,
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

  const fetchProperties = async () => {
    setLoading(true);
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
    fetchProperties();
  }, [page, statusFilter, typeFilter]);

  const loadTenantsForAssignment = async () => {
    try {
      const res = await rentalUserApi.listTenants({ status: 'ACTIVE', limit: 100 });
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
        location: 'Mall Road, Almora',
        address: 'Near Gandhi Chowk, Mall Road, Almora, Uttarakhand',
        dimensionsSqft: 120,
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

  const handleVacateProperty = async (prop: PropertyListItem) => {
    const confirmVacate = window.confirm(
      isHi
        ? `क्या आप वाकई दुकान ${prop.propertyNumber} को खाली (Vacant) करना चाहते हैं?`
        : `Are you sure you want to mark ${prop.propertyNumber} as VACANT?`
    );
    if (!confirmVacate) return;

    const reason = window.prompt(
      isHi ? 'खाली करने का कारण दर्ज करें:' : 'Enter reason for vacating (e.g., Lease expired, Tenant surrendered):',
      'Lease term completed'
    );
    if (!reason) return;

    try {
      await rentalPropertyApi.unassignProperty(prop.id, reason);
      setSuccessMsg(isHi ? 'दुकान खाली कर दी गई है और रिक्त स्थिति में है।' : 'Property vacated successfully.');
      fetchProperties();
    } catch (err: any) {
      setError(err.message || 'Failed to vacate property.');
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
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा की सभी दुकानों, स्टॉलों एवं परिसंपत्तियों का प्रबंधन'
          : 'Manage all commercial shops, stalls, and municipal lease assets of Zila Panchayat Almora'
      }
      breadcrumbs={[{ label: isHi ? 'दुकानें व संपत्तियां' : 'Properties' }]}
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isHi ? 'कुल पंजीकृत संपत्तियां:' : 'Total Registered Properties:'}
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">{total}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/rental/admin/billing')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              {isHi ? 'मासिक बिलिंग' : 'Billing & Invoices'}
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              {isHi ? '+ नई संपत्ति जोड़ें' : '+ Add Asset'}
            </button>
            <button
              onClick={fetchProperties}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium shadow-xs transition"
              title={isHi ? 'ताज़ा करें' : 'Refresh'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-800 font-bold">
              ×
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800 font-bold">
              ×
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल संपत्तियां' : 'Total Assets'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'रिक्त संपत्तियां' : 'Vacant Assets'}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{vacantCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'आवंटित दुकानें' : 'Allotted Shops'}
              </p>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{allottedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'मासिक राजस्व क्षमता' : 'Monthly Potential'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalRentAccrued.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchProperties();
            }}
            className="flex-1 w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isHi
                    ? 'दुकान संख्या, नाम या स्थान से खोजें...'
                    : 'Search by shop number, location, or name...'
                }
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-900 transition"
            >
              {isHi ? 'खोजें' : 'Search'}
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">{isHi ? 'सभी स्थितियाँ' : 'All Statuses'}</option>
                <option value="VACANT">{isHi ? 'रिक्त (Vacant)' : 'Vacant'}</option>
                <option value="ALLOTTED">{isHi ? 'आवंटित (Allotted)' : 'Allotted'}</option>
                <option value="MAINTENANCE">{isHi ? 'रखरखाव (Maintenance)' : 'Maintenance'}</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">{isHi ? 'सभी प्रकार' : 'All Types'}</option>
              <option value="COMMERCIAL_SHOP">{isHi ? 'दुकान (Shop)' : 'Commercial Shop'}</option>
              <option value="ROADSIDE_STALL">{isHi ? 'स्टॉल (Stall)' : 'Roadside Stall'}</option>
              <option value="WAREHOUSE_GODOWN">{isHi ? 'गोदाम (Warehouse)' : 'Warehouse/Godown'}</option>
              <option value="LAND_PARCEL">{isHi ? 'भूमि (Land Parcel)' : 'Land Parcel'}</option>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'दुकान / संपत्ति' : 'Asset & Number'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'स्थान एवं विवरण' : 'Location & Dimensions'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'स्थिति' : 'Status'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'वर्तमान किरायेदार' : 'Current Tenant'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'मासिक किराया' : 'Monthly Rent'}
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'कार्यवाही' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {properties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {prop.propertyNumber.slice(0, 3)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{prop.propertyName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{prop.propertyId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {prop.location}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-slate-400" />
                          {prop.dimensionsSqft ? `${prop.dimensionsSqft} sq.ft` : 'N/A'} •{' '}
                          <span className="capitalize">{prop.propertyType.replace('_', ' ').toLowerCase()}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            prop.status === 'VACANT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prop.status === 'ALLOTTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prop.status === 'VACANT'
                                ? 'bg-emerald-600'
                                : prop.status === 'ALLOTTED'
                                ? 'bg-blue-600'
                                : 'bg-amber-600'
                            }`}
                          />
                          {prop.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {prop.currentTenant ? (
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {prop.currentTenant.fullName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              {prop.currentTenant.mobile} • {prop.currentTenant.userCode}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            {isHi ? 'कोई किरायेदार नहीं (रिक्त)' : 'No active tenant'}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          ₹
                          {(prop.currentTenant?.activeRent || prop.baseMonthlyRent).toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-slate-500">/mo</span>
                        </div>
                        {prop.currentTenant && prop.currentTenant.activeRent !== prop.baseMonthlyRent && (
                          <div className="text-xs text-slate-400 line-through">
                            Base: ₹{prop.baseMonthlyRent.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {/* Audit / History */}
                          <button
                            onClick={() => handleOpenHistoryModal(prop)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title={isHi ? 'किराया संशोधन इतिहास' : 'Rent Audit History'}
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {prop.status === 'VACANT' ? (
                            <button
                              onClick={() => handleOpenAssignModal(prop)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              {isHi ? 'आवंटित करें' : 'Allot'}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenRentModal(prop)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-xs font-medium transition"
                                title={isHi ? 'किराया संशोधित करें' : 'Revise Rent'}
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                {isHi ? 'किराया बदलें' : 'Revise Rent'}
                              </button>
                              <button
                                onClick={() => handleVacateProperty(prop)}
                                className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition"
                                title={isHi ? 'दुकान खाली करें' : 'Vacate Property'}
                              >
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal 1: Add Commercial Asset */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
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
                    {isHi ? 'संपत्ति का नाम / शीर्षक *' : 'Property / Shop Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.propertyName}
                    onChange={(e) => setNewProp({ ...newProp, propertyName: e.target.value })}
                    placeholder="e.g., Shop No. 12, Ground Floor"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'दुकान संख्या / कोड *' : 'Property Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProp.propertyNumber}
                      onChange={(e) => setNewProp({ ...newProp, propertyNumber: e.target.value })}
                      placeholder="e.g., SHOP-12"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'संपत्ति का प्रकार' : 'Property Type'}
                    </label>
                    <select
                      value={newProp.propertyType}
                      onChange={(e) => setNewProp({ ...newProp, propertyType: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="COMMERCIAL_SHOP">Commercial Shop</option>
                      <option value="ROADSIDE_STALL">Roadside Stall</option>
                      <option value="WAREHOUSE_GODOWN">Warehouse / Godown</option>
                      <option value="LAND_PARCEL">Land Parcel</option>
                      <option value="OFFICE_SPACE">Office Space</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'स्थान (Location) *' : 'Location / Bazaar *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newProp.location}
                      onChange={(e) => setNewProp({ ...newProp, location: e.target.value })}
                      placeholder="e.g., Mall Road, Almora"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'क्षेत्रफल (Sq.Ft)' : 'Dimensions (Sq.Ft)'}
                    </label>
                    <input
                      type="number"
                      value={newProp.dimensionsSqft}
                      onChange={(e) => setNewProp({ ...newProp, dimensionsSqft: Number(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'पूरा पता *' : 'Detailed Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProp.address}
                    onChange={(e) => setNewProp({ ...newProp, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'आधार मासिक किराया (₹/माह) *' : 'Base Monthly Rent (₹/month) *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={newProp.baseMonthlyRent}
                      onChange={(e) => setNewProp({ ...newProp, baseMonthlyRent: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
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
                    {isHi ? 'सक्रिय पंजीकृत किरायेदार चुनें *' : 'Select Registered Active Tenant *'}
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
                          {t.fullName} ({t.userCode} - {t.mobile})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'सहमत मासिक किराया (₹) *' : 'Agreed Monthly Rent (₹) *'}
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
                      {isHi ? 'पट्टा प्रारंभ तिथि *' : 'Lease Start Date *'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'मासिक किराया संशोधन (Audit Logged)' : 'Revise Monthly Rent (Audit Logged)'}
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
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
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
                      {isHi ? 'नया संशोधित किराया (₹/माह) *' : 'New Revised Rent (₹/mo) *'}
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
                      {isHi ? 'प्रभावी तिथि (Effective Date) *' : 'Effective Date *'}
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
                    {isHi ? 'संशोधन का वैधानिक कारण *' : 'Statutory Reason for Revision *'}
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={rentChangeReason}
                    onChange={(e) => setRentChangeReason(e.target.value)}
                    placeholder={
                      isHi
                        ? 'उदा. बोर्ड प्रस्ताव संख्या 104/2026 या वार्षिक 5% वृद्धि'
                        : 'e.g., Zila Panchayat Board Resolution #104/2026 or 5% Annual Escalation'
                    }
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
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
      </div>
    </AdminLayout>
  );
};
