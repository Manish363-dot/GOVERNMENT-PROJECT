import React, { useState, useEffect } from 'react';
import { UserLayout } from './UserLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, BillListItem } from '../services/rentalBilling.service';
import { rentalPaymentApi } from '../services/rentalPayment.service';
import {
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Filter,
} from 'lucide-react';

export const UserBillsPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [bills, setBills] = useState<BillListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Invoice Modal
  const [selectedBill, setSelectedBill] = useState<BillListItem | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Pay Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<BillListItem | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [payReceipt, setPayReceipt] = useState<string | null>(null);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.listBills({
        status: statusFilter,
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
  }, [page, statusFilter]);

  const handleOpenPayModal = (bill: BillListItem) => {
    setBillToPay(bill);
    setPayError('');
    setPayReceipt(null);
    setIsPayModalOpen(true);
  };

  const handleExecutePayment = async () => {
    if (!billToPay) return;
    setPaying(true);
    setPayError('');
    try {
      const initRes = await rentalPaymentApi.initiatePayment(billToPay.id);
      const verifyRes = await rentalPaymentApi.verifyPayment({
        paymentReference: initRes.data.paymentReference,
        gatewayPaymentId: `pay_mock_${Date.now()}`,
        gatewayOrderId: initRes.data.gatewayOrderId,
      });

      setPayReceipt(verifyRes.data.receiptNumber);
      fetchBills();
    } catch (err: any) {
      setPayError(err.message || 'Payment transaction failed.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <UserLayout
      title={isHi ? 'मासिक किराया चालान एवं भुगतान' : 'Commercial Rent Invoices & Payments'}
      subtitle={
        isHi
          ? 'आपके मासिक किराया चालान, बकाया विवरण एवं सुरक्षित डिजिटल भुगतान'
          : 'View monthly demand notices, itemized arrears, and make secure digital payments'
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">{isHi ? 'सभी चालान' : 'All Invoices'}</option>
              <option value="PENDING">{isHi ? 'बकाया (Pending)' : 'Pending'}</option>
              <option value="PAID">{isHi ? 'पूर्ण चुकता (Paid)' : 'Paid'}</option>
            </select>
          </div>

          <button
            onClick={fetchBills}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bills Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs">{isHi ? 'चालान लोड हो रहे हैं...' : 'Loading invoices...'}</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">{isHi ? 'कोई बिल नहीं मिला' : 'No bills found'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-left">
                  <tr>
                    <th className="px-5 py-3.5">Bill Number & Month</th>
                    <th className="px-5 py-3.5">Rent + Arrears</th>
                    <th className="px-5 py-3.5">Total Payable</th>
                    <th className="px-5 py-3.5">Amount Paid</th>
                    <th className="px-5 py-3.5">Balance Due</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{bill.billNumber}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {bill.billingMonth} • Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        ₹{bill.rentAmount.toLocaleString('en-IN')}{' '}
                        {bill.arrearsAmount > 0 && (
                          <span className="text-amber-600 font-semibold">
                            + ₹{bill.arrearsAmount.toLocaleString('en-IN')} arr.
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                        ₹{bill.totalAmountDue.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-semibold text-emerald-700">
                        ₹{bill.amountPaid.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-bold text-red-600">
                        ₹{bill.balanceDue.toLocaleString('en-IN')}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            bill.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                        >
                          {isHi ? 'चालान देखें' : 'View Bill'}
                        </button>

                        {bill.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(bill)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                          >
                            {isHi ? 'भुगतान करें' : 'Pay Online'}
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

        {/* Modal: View Municipal Invoice */}
        {isInvoiceModalOpen && selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  {isHi ? 'व्यावसायिक किराया चालान' : 'Commercial Rent Invoice'}
                </h3>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl text-xs space-y-3">
                <div className="text-center border-b pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase">
                    कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)
                  </h4>
                  <p className="text-[11px] text-slate-500">Commercial Demand Note</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Bill No:</span>{' '}
                    <span className="font-bold text-indigo-700">{selectedBill.billNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Month:</span>{' '}
                    <span className="font-bold">{selectedBill.billingMonth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Tenant:</span>{' '}
                    <span className="font-semibold">{selectedBill.tenant.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Shop No:</span>{' '}
                    <span className="font-semibold">{selectedBill.property.propertyNumber}</span>
                  </div>
                </div>

                <div className="border rounded-lg bg-white overflow-hidden text-[11px]">
                  <div className="p-2 border-b flex justify-between">
                    <span>Monthly Commercial Rent</span>
                    <span className="font-bold">₹{selectedBill.rentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedBill.arrearsAmount > 0 && (
                    <div className="p-2 border-b flex justify-between text-amber-700">
                      <span>Past Unsettled Arrears</span>
                      <span className="font-bold">₹{selectedBill.arrearsAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="p-2 bg-slate-50 font-bold flex justify-between">
                    <span>Total Amount Payable</span>
                    <span className="text-indigo-700">₹{selectedBill.totalAmountDue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 flex justify-between text-emerald-700 font-bold">
                    <span>Amount Paid</span>
                    <span>₹{selectedBill.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2 flex justify-between text-red-600 font-bold">
                    <span>Balance Due</span>
                    <span>₹{selectedBill.balanceDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isHi ? 'प्रिंट करें' : 'Print Invoice'}</span>
                </button>
                <button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg transition"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Pay Online */}
        {isPayModalOpen && billToPay && (
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

              {payReceipt ? (
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
                      <span className="font-mono font-bold text-emerald-950 text-sm">{payReceipt}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition"
                  >
                    {isHi ? 'पूर्ण हुआ' : 'Done'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                    <div className="font-bold text-slate-900">
                      Bill No: {billToPay.billNumber} ({billToPay.billingMonth})
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t font-semibold text-slate-800">
                      <span>Amount Payable:</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        ₹{billToPay.balanceDue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {payError && (
                    <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                      {payError}
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
                        ? `₹${billToPay.balanceDue} का भुगतान करें`
                        : `Pay ₹${billToPay.balanceDue}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
