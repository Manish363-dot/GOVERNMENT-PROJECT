import React from 'react';
import { amountToHindiWords } from '../utils/hindiNumberWords';

export interface StatutoryReceiptData {
  receiptNumber: string | number;
  bookNumber?: string;
  demandRegisterNumber?: string;
  tenantName: string;
  shopNumber?: string;
  location?: string;
  amount: number;
  isFullPayment: boolean;
  billNumber: string;
  billingMonth?: string;
  place?: string;
  dateStr?: string;
  collectorName?: string;
}

interface Props {
  data: StatutoryReceiptData;
  onPrint?: () => void;
  onClose?: () => void;
}

export const OfficialStatutoryReceipt: React.FC<Props> = ({ data, onPrint, onClose }) => {
  const amountInWords = amountToHindiWords(data.amount);
  const formattedDate = data.dateStr || new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Extract numeric serial number (e.g. 286480)
  const rawReceipt = String(data.receiptNumber || '286480');
  const digitsOnly = rawReceipt.replace(/\D/g, '');
  const displayReceiptNumber = digitsOnly.length >= 3 ? digitsOnly.slice(-6) : rawReceipt;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Buttons (Hidden when printing) */}
      <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-800">
          प्रपत्र संख्या ५ — आधिकारिक शासकीय किराया रसीद (Statutory Form 5 Receipt)
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>रसीद प्रिंट करें (Print)</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              बंद करें (Close)
            </button>
          )}
        </div>
      </div>

      {/* ════════ 100% IDENTICAL STATUTORY FORM 5 (NO OUTER BORDER / EXACT PAPER LAYOUT) ════════ */}
      <div
        id="official-statutory-receipt-print"
        className="bg-white text-black p-6 sm:p-10 max-w-2xl mx-auto text-sm print:m-0 print:p-4 print:max-w-none"
        style={{
          fontFamily: "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif",
          color: '#000000',
          backgroundColor: '#ffffff',
          lineHeight: '1.6',
        }}
      >
        {/* 1. Header (Centered) */}
        <div className="text-center space-y-0.5">
          <h1 className="text-lg sm:text-xl font-bold text-black tracking-normal">
            जिला पंचायत/क्षेत्र समिति प्रपत्र संख्या 5
          </h1>
          <p className="text-sm font-semibold text-black">
            (नियम 41 देखिये)
          </p>
          <p className="text-xs text-black">
            (&ldquo;डबल साइडेड कार्बन पेपर&rdquo; पर अमिट पेन्सिल से लिखा जायेगा)
          </p>
        </div>

        {/* 2. Parallel Horizontal Lines with Rubber Stamp */}
        <div className="border-t border-black my-2"></div>
        <div className="text-center py-0.5">
          <div className="text-xs text-black font-semibold">
            जिला पंचायत/जिले के नाम सहित क्षेत्र समिति के नाम का रबड़ स्टाम्प
          </div>
          <div className="text-sm font-bold text-black tracking-wide">
            कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)
          </div>
        </div>
        <div className="border-b border-black mb-3"></div>

        {/* 3. Row 1: बही संख्या & 286480 रसीद संख्या */}
        <div className="flex items-end justify-between text-sm py-1">
          <div className="flex items-baseline gap-2 flex-1">
            <span className="font-bold text-black shrink-0">बही संख्या</span>
            <span className="border-b border-black font-bold text-black px-2 flex-1 min-w-[100px] text-center">
              {data.bookNumber || `B-${new Date().getFullYear()}/${data.shopNumber || '01'}`}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pl-4">
            <span className="font-mono font-bold text-2xl text-black tracking-wider">
              {displayReceiptNumber}
            </span>
            <span className="font-bold text-black shrink-0">रसीद संख्या</span>
            <span className="border-b border-black w-14 inline-block"></span>
          </div>
        </div>

        {/* 4. Row 2: मांग रजिस्टर संख्या __________________ से */}
        <div className="flex items-baseline gap-2 text-sm py-1.5">
          <span className="font-bold text-black shrink-0">मांग रजिस्टर संख्या</span>
          <span className="border-b border-black font-bold text-black px-2 flex-1 truncate">
            {data.demandRegisterNumber ? `${data.demandRegisterNumber}, ` : ''}{data.tenantName} {data.shopNumber ? `(दुकान सं० ${data.shopNumber}${data.location ? `, ${data.location}` : ''})` : ''}
          </span>
          <span className="font-bold text-black shrink-0">से</span>
        </div>

        {/* 5. Row 3: __________________ रुपया (शब्दों में) */}
        <div className="flex items-baseline gap-2 text-sm py-1.5">
          <span className="border-b border-black font-bold text-black px-2 flex-1">
            {amountInWords}
          </span>
          <span className="font-bold text-black shrink-0">रुपया (शब्दों में)</span>
        </div>

        {/* 6. Row 4: बिल संख्या __________________ के पूर्ण/आंशिक भुगतान */}
        <div className="flex items-baseline gap-2 text-sm py-1.5">
          <span className="font-bold text-black shrink-0">बिल संख्या</span>
          <span className="border-b border-black font-bold text-black font-mono px-2 flex-1 text-center">
            {data.billNumber} {data.billingMonth ? `(माह: ${data.billingMonth})` : ''}
          </span>
          <span className="font-bold text-black shrink-0 flex items-center gap-1">
            के{' '}
            <span className="font-bold underline">{data.isFullPayment ? 'पूर्ण' : 'आंशिक'}</span>
            <span className="text-slate-400 line-through text-xs">{data.isFullPayment ? '/आंशिक' : 'पूर्ण/'}</span>{' '}
            भुगतान
          </span>
        </div>

        {/* 7. Row 5: __________________ के मद प्राप्त हुआ। */}
        <div className="flex items-baseline gap-2 text-sm py-1.5">
          <span className="border-b border-black font-bold text-black px-2 flex-1">
            वाणिज्यिक दुकान किराया (Commercial Shop Rent)
          </span>
          <span className="font-bold text-black shrink-0">के मद प्राप्त हुआ।</span>
        </div>

        {/* 8. Lower Section: Amount, Place, Date & Staggered Signatures */}
        <div className="pt-4 pb-2 text-sm">
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Left Sub-column */}
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="border-b border-black font-mono font-bold text-base text-black px-3 flex-1 text-center">
                  ₹ {data.amount.toLocaleString('en-IN')}/-
                </span>
                <span className="font-bold text-black shrink-0">रुपया</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-black shrink-0">स्थान</span>
                <span className="border-b border-black font-bold text-black px-2 flex-1 text-center">
                  {data.place || 'अल्मोड़ा'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-bold text-black shrink-0">दिनांक</span>
                <span className="border-b border-black font-mono font-bold text-black px-2 flex-1 text-center">
                  {formattedDate}
                </span>
              </div>

              <div className="pt-3 font-bold text-black text-center">
                रोकड़िया
              </div>
            </div>

            {/* Right Sub-column (Staggered Signatures as in original receipt) */}
            <div className="space-y-6 text-right font-bold text-black pr-2">
              <div className="pt-1">
                मुख्य अधिकारी/खण्ड विकास अधिकारी
              </div>
              <div className="pt-2">
                कर समाहर्ता (टैक्स कलेक्टर)
              </div>
            </div>
          </div>

          {/* Bottom Signatures Row */}
          <div className="pt-6 flex items-end justify-between text-xs sm:text-sm font-bold text-black">
            <div className="w-1/4 text-left">
              लेखाकार
            </div>
            <div className="w-2/4 text-center">
              मांग तथा वसूली का प्रभारी लिपिक
            </div>
            <div className="w-1/4 text-right">
              कर अधिकारी
            </div>
          </div>
        </div>

        {/* 9. Statutory Printing Press / Department Footer */}
        <div className="pt-3 border-t border-black/40 text-[10px] text-black">
          पी०एस०यू० (आर०ई०) 02 पंचायतीराज / 124-10-12-2021-2,000 बुक्स (कम्प्यूटर/ऑफसेट)।
        </div>
      </div>
    </div>
  );
};

export default OfficialStatutoryReceipt;
