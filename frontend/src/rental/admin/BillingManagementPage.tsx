import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import {
  rentalBillingApi,
  BillListItem,
} from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  Printer,
  Receipt,
  UserCheck,
  ShieldCheck,
  DollarSign,
  PlusCircle,
  Clock,
} from 'lucide-react';

export const BillingManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  const [bills, setBills] = useState<BillListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [billingMonthFilter, setBillingMonthFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillListItem | null>(null);

  // Generate Bills Form
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const [generateMonth, setGenerateMonth] = useState(currentMonthStr);
  const [generating, setGenerating] = useState(false);

  // Counter Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE_DD' | 'POS_MACHINE' | 'NEFT_RTGS'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.listBills({
        search,
        status: statusFilter,
        billingMonth: billingMonthFilter || undefined,
        page,
        limit: 15,
      });
      setBills(res.data.data);
      setTotal(res.data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, statusFilter, billingMonthFilter]);

  const handleGenerateBills = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    try {
      const res = await rentalBillingApi.generateMonthlyBills(generateMonth);
      setSuccessMsg(res.message);
      setIsGenerateModalOpen(false);
      fetchBills();
    } catch (err: any) {
      setError(err.message || 'Failed to generate monthly bills.');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenCounterModal = (bill: BillListItem) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.balanceDue);
    setPaymentMethod('CASH');
    setReferenceNumber('');
    setRemarks('');
    setIssuedReceipt(null);
    setIsCounterModalOpen(true);
  };

  const handleRecordCounterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    setSubmittingPayment(true);
    setError('');
    try {
      const res = await rentalPaymentApi.recordCounterPayment({
        billId: selectedBill.id,
        amount: paymentAmount,
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        remarks: remarks || undefined,
      });
      setIssuedReceipt(res.data);
      setSuccessMsg(
        isHi
          ? `भुगतान सफलतापूर्वक दर्ज किया गया! रसीद संख्या: ${res.data.receiptNumber}`
          : `Payment recorded successfully! Official Receipt: ${res.data.receiptNumber}`
      );
      fetchBills();
    } catch (err: any) {
      setError(err.message || 'Failed to process counter payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleOpenInvoiceModal = (bill: BillListItem) => {
    setSelectedBill(bill);
    setIsInvoiceModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // KPI Calculations
  const totalDemanded = bills.reduce((acc, b) => acc + b.totalAmountDue, 0);
  const totalCollected = bills.reduce((acc, b) => acc + b.amountPaid, 0);
  const totalBalanceDue = bills.reduce((acc, b) => acc + b.balanceDue, 0);

  return (
    <AdminLayout
      title={isHi ? 'मासिक किराया बिलिंग एवं राजस्व वसूली' : 'Commercial Billing & Invoices'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा के व्यावसायिक परिसंपत्तियों के मासिक चालान एवं बकाया वसूली'
          : 'Monthly rental bill generation, arrears roll-forward, and counter payment collection'
      }
      breadcrumbs={[{ label: isHi ? 'बिलिंग' : 'Billing' }]}
    >
      <div className="space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              {isHi ? 'कुल जारी बिल संख्या:' : 'Total Bills Issued:'}
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">{total}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              {isHi ? '+ मासिक बिल जारी करें' : '+ Generate Monthly Bills'}
            </button>
            <button
              onClick={() => navigate('/rental/admin/properties')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Building className="w-3.5 h-3.5 text-blue-600" />
              {isHi ? 'संपत्ति रजिस्टर' : 'Properties'}
            </button>
            <button
              onClick={fetchBills}
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
                {isHi ? 'कुल जारी बिल' : 'Total Bills'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{total}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल मांग (राजस्व)' : 'Total Demanded'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₹{totalDemanded.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'कुल प्राप्त राशि' : 'Total Collected'}
              </p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {isHi ? 'अवशेष बकाया राशि' : 'Outstanding Balance'}
              </p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">₹{totalBalanceDue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchBills();
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
                    ? 'बिल संख्या, किरायेदार का नाम, दुकान या मोबाइल से खोजें...'
                    : 'Search by bill number, tenant name, mobile, or shop number...'
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
                <option value="PENDING">{isHi ? 'लंबित (Pending)' : 'Pending'}</option>
                <option value="PARTIALLY_PAID">{isHi ? 'आंशिक भुगतान' : 'Partially Paid'}</option>
                <option value="PAID">{isHi ? 'पूर्ण भुगतान (Paid)' : 'Paid'}</option>
                <option value="OVERDUE">{isHi ? 'अतिदेय (Overdue)' : 'Overdue'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="month"
                value={billingMonthFilter}
                onChange={(e) => {
                  setBillingMonthFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
              <p>{isHi ? 'बिल लोड हो रहे हैं...' : 'Loading rental bills...'}</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">
                {isHi ? 'कोई बिल नहीं मिला' : 'No bills found'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {isHi
                  ? 'चयनित माह के लिए बिल जारी करने हेतु "मासिक बिल जारी करें" बटन दबाएं।'
                  : 'Click "Generate Monthly Bills" to create bills for active leases.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'बिल संख्या एवं माह' : 'Bill No. & Month'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'किरायेदार एवं दुकान' : 'Tenant & Property'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'मांग विवरण (किराया + बकाया)' : 'Demand Breakdown'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'भुगतान / अवशेष' : 'Paid / Balance'}
                    </th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'स्थिति' : 'Status'}
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {isHi ? 'कार्यवाही' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-indigo-700">{bill.billNumber}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {bill.billingMonth} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900">{bill.tenant.fullName}</div>
                        <div className="text-xs text-slate-500">
                          {bill.property.propertyNumber} • {bill.property.location}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{bill.totalAmountDue.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Rent: ₹{bill.rentAmount.toLocaleString('en-IN')}{' '}
                          {bill.arrearsAmount > 0 && (
                            <span className="text-amber-600 font-semibold">
                              + Arrears: ₹{bill.arrearsAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-emerald-700">
                          ₹{bill.amountPaid.toLocaleString('en-IN')}
                        </div>
                        <div
                          className={`text-xs font-semibold ${
                            bill.balanceDue > 0 ? 'text-red-600' : 'text-slate-400'
                          }`}
                        >
                          Due: ₹{bill.balanceDue.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            bill.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bill.status === 'PARTIALLY_PAID'
                              ? 'bg-blue-100 text-blue-800'
                              : bill.status === 'OVERDUE'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              bill.status === 'PAID'
                                ? 'bg-emerald-600'
                                : bill.status === 'PARTIALLY_PAID'
                                ? 'bg-blue-600'
                                : bill.status === 'OVERDUE'
                                ? 'bg-red-600'
                                : 'bg-amber-600'
                            }`}
                          />
                          {bill.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenInvoiceModal(bill)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                            title={isHi ? 'चालान देखें' : 'View Invoice'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {bill.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenCounterModal(bill)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition shadow-xs"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              {isHi ? 'वसूली दर्ज करें' : 'Accept Payment'}
                            </button>
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

        {/* Modal 1: Generate Monthly Bills */}
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'मासिक किराया बिल जारी करें' : 'Generate Monthly Bills'}
                </h3>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  {isHi ? 'स्वचालित बिलिंग एवं बकाया समायोजन' : 'Automated Arrears Roll-Forward'}
                </div>
                <div>
                  {isHi
                    ? 'यह प्रणाली सभी सक्रिय पट्टों के लिए चालान तैयार करेगी। यदि किसी किरायेदार का पिछला बकाया है, तो वह स्वचालित रूप से वर्तमान चालान में जुड़ जाएगा।'
                    : 'Generates monthly rent bills for all active commercial leases. Any unsettled balances from prior months will automatically be rolled forward into this bill.'}
                </div>
              </div>

              <form onSubmit={handleGenerateBills} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? 'बिलिंग माह चुनें (YYYY-MM) *' : 'Select Billing Month (YYYY-MM) *'}
                  </label>
                  <input
                    type="month"
                    required
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {generating
                      ? isHi
                        ? 'बिल तैयार हो रहे हैं...'
                        : 'Generating...'
                      : isHi
                      ? 'बिल जारी करें'
                      : 'Generate Bills'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Official Invoice View */}
        {isInvoiceModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'सरकारी किराया चालान / बिल' : 'Commercial Rent Invoice'}
                </h3>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              {/* Printable Invoice Container */}
              <div id="printable-invoice" className="p-4 bg-slate-50 border rounded-xl text-xs space-y-4">
                <div className="text-center border-b pb-3">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा, उत्तराखण्ड' : 'Office of Zila Panchayat Almora, Uttarakhand'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isHi ? 'व्यावसायिक किराया मांग पत्र (Demand Bill)' : 'Commercial Rent Demand Bill & Receipt'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Bill Number:</span>{' '}
                    <span className="font-bold text-indigo-700">{selectedBill.billNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Billing Month:</span>{' '}
                    <span className="font-bold text-slate-800">{selectedBill.billingMonth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenant Name:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedBill.tenant.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Due Date:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedBill.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Property:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedBill.property.propertyNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Location:</span>{' '}
                    <span className="font-semibold text-slate-800">{selectedBill.property.location}</span>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-white">
                  <table className="w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-[11px]">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Description</th>
                        <th className="px-3 py-2 text-right font-semibold text-slate-600">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      <tr>
                        <td className="px-3 py-2 text-slate-700">Monthly Commercial Rent</td>
                        <td className="px-3 py-2 text-right font-bold">
                          ₹{selectedBill.rentAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      {selectedBill.arrearsAmount > 0 && (
                        <tr>
                          <td className="px-3 py-2 text-amber-700">Arrears / Past Unpaid Dues</td>
                          <td className="px-3 py-2 text-right font-bold text-amber-700">
                            ₹{selectedBill.arrearsAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-bold">
                        <td className="px-3 py-2 text-slate-900">Total Amount Payable</td>
                        <td className="px-3 py-2 text-right text-indigo-700">
                          ₹{selectedBill.totalAmountDue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-emerald-700">Amount Paid</td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-700">
                          ₹{selectedBill.amountPaid.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="font-bold">
                        <td className="px-3 py-2 text-red-600">Net Balance Due</td>
                        <td className="px-3 py-2 text-right text-red-600">
                          ₹{selectedBill.balanceDue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {selectedBill.receipts.length > 0 && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-900">Issued Official Receipts:</div>
                    {selectedBill.receipts.map((r) => (
                      <div key={r.id} className="flex justify-between text-[11px] text-emerald-800">
                        <span>Receipt No: {r.receiptNumber}</span>
                        <span>
                          ₹{r.amountPaid.toLocaleString('en-IN')} ({new Date(r.issuedAt).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  {isHi ? 'प्रिंट करें' : 'Print Invoice'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Accept Counter Payment */}
        {isCounterModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  {isHi ? 'कार्यालय काउंटर वसूली एवं रसीद जारी करें' : 'Accept Office Counter Payment'}
                </h3>
                <button
                  onClick={() => setIsCounterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              {issuedReceipt ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-900">
                      {isHi ? 'भुगतान सफलतापूर्वक प्राप्त हुआ!' : 'Payment Recorded Successfully!'}
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      {isHi ? 'सरकारी रसीद संख्या:' : 'Official Municipal Receipt No:'}{' '}
                      <span className="font-mono font-bold text-emerald-950 text-sm">
                        {issuedReceipt.receiptNumber}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Amount: ₹{issuedReceipt.amountPaid} • Remaining Balance: ₹{issuedReceipt.remainingBalance}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCounterModalOpen(false);
                      setIssuedReceipt(null);
                    }}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold transition"
                  >
                    {isHi ? 'पूर्ण हुआ' : 'Done'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecordCounterPayment} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg border text-xs space-y-1">
                    <div className="font-bold text-slate-900">
                      {selectedBill.billNumber} • {selectedBill.tenant.fullName}
                    </div>
                    <div className="text-slate-500">
                      Shop: {selectedBill.property.propertyNumber} ({selectedBill.property.location})
                    </div>
                    <div className="text-slate-700 font-medium">
                      Current Outstanding: <span className="font-bold text-red-600">₹{selectedBill.balanceDue}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isHi ? 'प्राप्त राशि (₹) *' : 'Amount Received (₹) *'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={selectedBill.balanceDue}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isHi ? 'भुगतान का माध्यम *' : 'Payment Mode *'}
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="CASH">Cash (नकद)</option>
                        <option value="CHEQUE_DD">Cheque / Demand Draft</option>
                        <option value="POS_MACHINE">POS Machine (Card Swipe)</option>
                        <option value="NEFT_RTGS">Direct Bank Transfer / NEFT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'चेक संख्या / बैंक संदर्भ (वैकल्पिक)' : 'Cheque No. / Transaction Ref'}
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g., CHQ-928312 or SBI-TXN-10294"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isHi ? 'कार्यालयीय टिप्पणी' : 'Officer Remarks'}
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g., Deposited at Almora main counter"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setIsCounterModalOpen(false)}
                      className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      {isHi ? 'रद्द करें' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {submittingPayment
                        ? isHi
                          ? 'दर्ज कर रहे हैं...'
                          : 'Processing...'
                        : isHi
                        ? 'वसूली दर्ज करें एवं रसीद दें'
                        : 'Record & Issue Receipt'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
