import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from './UserLayout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { rentalBillingApi, BillListItem } from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import { rentalNoticeApi, NoticeItem } from '../services/rentalNotice.service';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Bell,
  MapPin,
  Store,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bills, setBills] = useState<BillListItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Online Pay Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState<BillListItem | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccessReceipt, setPaySuccessReceipt] = useState<string | null>(null);

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const [billRes, noticeRes] = await Promise.all([
        rentalBillingApi.listBills({ limit: 10 }),
        rentalNoticeApi.listNotices({ limit: 4 }),
      ]);
      setBills(billRes.data.data);
      setNotices(noticeRes.data.data);
    } catch (err) {
      console.error('Failed to load tenant dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  // Calculate outstanding balance across all unpaid bills
  const pendingBills = bills.filter((b) => b.balanceDue > 0);
  const totalOutstanding = pendingBills.reduce((acc, b) => acc + b.balanceDue, 0);
  const latestPendingBill = pendingBills[0] || null;

  const handleOpenPayModal = (bill: BillListItem) => {
    setSelectedBillForPay(bill);
    setPayError('');
    setPaySuccessReceipt(null);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedBillForPay) return;
    setPaying(true);
    setPayError('');
    try {
      // 1. Initiate Online Payment with Idempotency
      const initRes = await rentalPaymentApi.initiatePayment(selectedBillForPay.id);

      // 2. Simulate / execute payment verification callback
      const verifyRes = await rentalPaymentApi.verifyPayment({
        paymentReference: initRes.data.paymentReference,
        gatewayPaymentId: `pay_mock_${Date.now()}`,
        gatewayOrderId: initRes.data.gatewayOrderId,
      });

      setPaySuccessReceipt(verifyRes.data.receiptNumber);
      fetchTenantData();
    } catch (err: any) {
      setPayError(err.message || 'Payment transaction failed.');
    } finally {
      setPaying(false);
    }
  };

  // Property info from latest bill or auth profile
  const propertyInfo = bills[0]?.property || null;

  return (
    <UserLayout
      title={isHi ? 'किरायेदार सेवा डैशबोर्ड' : 'Tenant Self-Service Dashboard'}
      subtitle={
        isHi
          ? 'आपकी आवंटित दुकान, मासिक किराया चालान, डिजिटल भुगतान एवं आधिकारिक रसीदें'
          : 'Commercial lease management, online rent payments, and official municipal receipts'
      }
    >
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
          <p>{isHi ? 'डैशबोर्ड लोड हो रहा है...' : 'Loading your account details...'}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Hero Banner: Outstanding Dues & Quick Pay */}
          <div
            className={`rounded-2xl p-6 shadow-md text-white ${
              totalOutstanding > 0
                ? 'bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 border border-red-500/30'
                : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border border-emerald-500/30'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-sm">
                  {totalOutstanding > 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>{isHi ? 'बकाया देय राशि' : 'Action Required: Pending Dues'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{isHi ? 'समस्त खाते चुकता' : 'All Accounts Settled'}</span>
                    </>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </h3>

                <p className="text-xs sm:text-sm text-slate-200">
                  {totalOutstanding > 0
                    ? isHi
                      ? `आपके कुल ${pendingBills.length} चालान लंबित हैं। नियत तिथि से पूर्व ऑनलाइन भुगतान करें।`
                      : `You have ${pendingBills.length} pending bill(s). Please settle before due date to avoid penalty.`
                    : isHi
                    ? 'जिला पंचायत अल्मोड़ा के रिकॉर्ड के अनुसार आपका कोई बकाया नहीं है।'
                    : 'Your commercial rental ledger is completely up-to-date with no outstanding arrears.'}
                </p>
              </div>

              {totalOutstanding > 0 && latestPendingBill && (
                <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => handleOpenPayModal(latestPendingBill)}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{isHi ? 'अभी ऑनलाइन भुगतान करें' : 'Pay Online Now'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Grid: Allotted Asset & Recent Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Allotted Property Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-1">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-600" />
                  {isHi ? 'आवंटित दुकान / संपत्ति' : 'Allotted Property'}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                  Active Lease
                </span>
              </div>

              {propertyInfo ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'दुकान संख्या' : 'Shop Number'}</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {propertyInfo.propertyNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'संपत्ति का नाम' : 'Property Name'}</span>
                    <span className="font-semibold text-slate-800">{propertyInfo.propertyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isHi ? 'स्थान / बाजार' : 'Location / Market'}</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {propertyInfo.location}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</span>
                      <span className="text-sm font-bold text-emerald-700">
                        ₹{(bills[0]?.rentAmount || 0).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/rental/user/profile')}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {isHi ? 'विवरण देखें' : 'View Full Details'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  {isHi ? 'आवंटन विवरण लोड हो रहा है...' : 'Loading lease details...'}
                </div>
              )}
            </div>

            {/* Col 2 & 3: Official Circulars & Notices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'जिला पंचायत की नवीनतम सूचनाएं' : 'Official Circulars & Notices'}
                </h3>
                <button
                  onClick={() => navigate('/rental/user/notices')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>{isHi ? 'सभी देखें' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {notices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isHi ? 'कोई नई सूचना नहीं है।' : 'No new notices currently.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 hover:border-slate-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Bills & Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                {isHi ? 'हाल के किराया बिल एवं चालान' : 'Recent Rent Invoices'}
              </h3>
              <button
                onClick={() => navigate('/rental/user/bills')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>{isHi ? 'पूरा इतिहास देखें' : 'Full Billing History'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {bills.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                {isHi ? 'कोई बिल उपलब्ध नहीं है।' : 'No bills found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-slate-100 text-xs">
                  <thead className="text-slate-400 font-semibold text-left">
                    <tr>
                      <th className="py-2">Bill No.</th>
                      <th className="py-2">Month</th>
                      <th className="py-2">Total Due</th>
                      <th className="py-2">Paid</th>
                      <th className="py-2">Balance</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bills.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-900">{b.billNumber}</td>
                        <td className="py-3 text-slate-600">{b.billingMonth}</td>
                        <td className="py-3 font-semibold text-slate-900">
                          ₹{b.totalAmountDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-semibold text-emerald-700">
                          ₹{b.amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 font-bold text-red-600">
                          ₹{b.balanceDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {b.balanceDue > 0 ? (
                            <button
                              onClick={() => handleOpenPayModal(b)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs"
                            >
                              {isHi ? 'भुगतान करें' : 'Pay Now'}
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate('/rental/user/receipts')}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              {isHi ? 'रसीद देखें' : 'View Receipt'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Online Payment Execution */}
      {isPayModalOpen && selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                {isHi ? 'सुरक्षित ऑनलाइन किराया भुगतान' : 'Secure Online Rent Payment'}
              </h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl"
              >
                ×
              </button>
            </div>

            {paySuccessReceipt ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900">
                    {isHi ? 'भुगतान सफल रहा!' : 'Payment Completed Successfully!'}
                  </h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    {isHi ? 'सरकारी रसीद संख्या:' : 'Official Receipt Number:'}{' '}
                    <span className="font-mono font-bold text-emerald-950 text-sm">
                      {paySuccessReceipt}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isHi
                      ? 'रसीद आपके खाते में सुरक्षित सहेज ली गई है।'
                      : 'Official receipt is stored in your account receipts vault.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsPayModalOpen(false);
                      navigate('/rental/user/receipts');
                    }}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    {isHi ? 'रसीद देखें एवं डाउनलोड करें' : 'View & Download Receipt'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    Bill No: {selectedBillForPay.billNumber} ({selectedBillForPay.billingMonth})
                  </div>
                  <div className="text-slate-500">
                    Property: {selectedBillForPay.property.propertyNumber} (
                    {selectedBillForPay.property.location})
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t font-semibold text-slate-800">
                    <span>{isHi ? 'कुल देय राशि' : 'Total Amount Payable'}:</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      ₹{selectedBillForPay.balanceDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    {isHi
                      ? '100% सुरक्षित सरकारी भुगतान गेटवे (UPI, Cards, NetBanking)'
                      : 'Official government gateway with instant numbered receipt.'}
                  </span>
                </div>

                {payError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    {isHi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={paying}
                    onClick={handleExecutePayment}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {paying
                      ? isHi
                        ? 'प्रक्रिया जारी है...'
                        : 'Processing...'
                      : isHi
                      ? `₹${selectedBillForPay.balanceDue} का भुगतान करें`
                      : `Pay ₹${selectedBillForPay.balanceDue}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </UserLayout>
  );
};
