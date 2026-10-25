import React, { useState, useEffect } from 'react';
import { UserLayout } from './UserLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, BillListItem } from '../services/rentalBilling.service';
import {
  Receipt,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const UserReceiptsPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      // Fetch user bills and aggregate issued receipts
      const res = await rentalBillingApi.listBills({ limit: 50 });
      const allReceipts: any[] = [];
      res.data.data.forEach((bill) => {
        if (bill.receipts && bill.receipts.length > 0) {
          bill.receipts.forEach((r) => {
            allReceipts.push({
              ...r,
              billNumber: bill.billNumber,
              billingMonth: bill.billingMonth,
              tenant: bill.tenant,
              property: bill.property,
            });
          });
        }
      });
      setReceipts(allReceipts);
    } catch (err) {
      console.error('Failed to load receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <UserLayout
      title={isHi ? 'आधिकारिक डिजिटल रसीदें' : 'Official Municipal Receipts Vault'}
      subtitle={
        isHi
          ? 'जिला पंचायत अल्मोड़ा द्वारा जारी समस्त सत्यापित डिजिटल रसीदें'
          : 'Archive of all verified digital receipts issued for your commercial lease'
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {isHi
              ? `कुल ${receipts.length} आधिकारिक रसीदें उपलब्ध हैं`
              : `Total ${receipts.length} official receipts available in your account`}
          </p>
          <button
            onClick={fetchReceipts}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">{isHi ? 'रसीदें लोड हो रही हैं...' : 'Loading receipts...'}</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-8">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'कोई रसीद जारी नहीं हुई है' : 'No receipts issued yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isHi
                ? 'ऑनलाइन या कार्यालय काउंटर पर किराया जमा करने पर रसीद यहां प्रदर्शित होगी।'
                : 'Receipts will appear here as soon as payments are confirmed.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 relative hover:border-emerald-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    {r.receiptNumber}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    ₹{r.amountPaid.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    For Bill: <span className="font-semibold text-slate-700">{r.billNumber}</span> (
                    {r.billingMonth})
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(r.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(r)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                  >
                    <span>{isHi ? 'रसीद देखें' : 'View Receipt'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Official Receipt View */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  {isHi ? 'कार्यालयीन डिजिटल रसीद' : 'Official Municipal Receipt'}
                </h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl"
                >
                  ×
                </button>
              </div>

              <div id="printable-receipt" className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-3">
                <div className="text-center border-b border-emerald-200/60 pb-2">
                  <h4 className="font-extrabold text-slate-900 uppercase">
                    कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Commercial Rental Payment Receipt
                  </p>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt Number:</span>
                    <span className="font-mono font-bold text-emerald-950">{selectedReceipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bill Number:</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.billNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Payment:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedReceipt.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tenant Name:</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.tenant?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Shop / Property:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedReceipt.property?.propertyNumber} ({selectedReceipt.property?.location})
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 flex justify-between items-center font-bold text-sm">
                    <span className="text-slate-900">Amount Received:</span>
                    <span className="text-emerald-800">₹{selectedReceipt.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-slate-400">
                  This is a computer-generated receipt issued under Zila Panchayat Almora Digital Portal.
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isHi ? 'प्रिंट करें' : 'Print Receipt'}</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
