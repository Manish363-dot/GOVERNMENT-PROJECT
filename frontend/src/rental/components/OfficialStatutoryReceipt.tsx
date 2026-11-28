import React, { useState } from 'react';
import { Download, Printer, X, FileText } from 'lucide-react';
import { amountToHindiWords } from '../utils/hindiNumberWords';
import { useLanguage } from '../context/LanguageContext';

/**
 * Helper to load an image URL into an HTMLImageElement for canvas rendering
 */
const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/**
 * Wraps a JPEG Uint8Array into a valid single-page PDF Blob (Zero external dependencies)
 */
const jpegToPdfBlob = (jpegBytes: Uint8Array, imgWidth: number, imgHeight: number): Blob => {
  // A4 landscape-ish / statutory slip proportion in PDF points (72 dpi)
  const pdfW = 595.28;
  const pdfH = Math.round((imgHeight / imgWidth) * pdfW * 100) / 100;

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let currentOffset = 0;

  const pushStr = (str: string) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    currentOffset += bytes.length;
  };

  const startObj = (id: number) => {
    offsets[id] = currentOffset;
    pushStr(`${id} 0 obj\n`);
  };

  pushStr('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  startObj(1);
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  startObj(2);
  pushStr('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  startObj(3);
  pushStr(
    `<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im1 4 0 R >> >> /MediaBox [0 0 ${pdfW} ${pdfH}] /Contents 5 0 R >>\nendobj\n`
  );

  startObj(4);
  pushStr(
    `<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  pushBytes(jpegBytes);
  pushStr('\nendstream\nendobj\n');

  const contentStream = `q ${pdfW} 0 0 ${pdfH} 0 0 cm /Im1 Do Q\n`;
  startObj(5);
  pushStr(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  const xrefOffset = currentOffset;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob(chunks as unknown as BlobPart[], { type: 'application/pdf' });
};

export interface StatutoryReceiptData {
  receiptNumber: string | number;
  bookNumber?: string;
  demandRegisterNumber?: string;
  tenantName: string;
  shopNumber?: string;
  location?: string;
  amount: number;
  baseRentAmount?: number;
  gstAmount?: number;
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
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [downloading, setDownloading] = useState(false);
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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const scale = 2;
      const W = 800;
      const H = 640;
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Pure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
      const padX = 48;
      const contentW = W - padX * 2;

      // Load Left & Right Logos
      const [logoLeft, logoRight] = await Promise.all([
        loadImage('/assets/logo1.webp'),
        loadImage('/assets/logo2.webp'),
      ]);

      if (logoLeft) {
        ctx.drawImage(logoLeft, padX, 26, 56, 56);
      }
      if (logoRight) {
        ctx.drawImage(logoRight, W - padX - 56, 26, 56, 56);
      }

      // 1. Header Centered
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold 20px ${fontBase}`;
      ctx.fillText('जिला पंचायत/क्षेत्र समिति प्रपत्र संख्या 5', W / 2, 44);

      ctx.font = `600 14px ${fontBase}`;
      ctx.fillText('(नियम 41 देखिये)', W / 2, 65);

      ctx.font = `normal 12px ${fontBase}`;
      ctx.fillText('(“डबल साइडेड कार्बन पेपर” पर अमिट पेन्सिल से लिखा जायेगा)', W / 2, 84);

      // 2. Parallel Horizontal Lines with Rubber Stamp
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, 98);
      ctx.lineTo(W - padX, 98);
      ctx.stroke();

      ctx.font = `600 12px ${fontBase}`;
      ctx.fillText('जिला पंचायत/जिले के नाम सहित क्षेत्र समिति के नाम का रबड़ स्टाम्प', W / 2, 116);
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)', W / 2, 136);

      ctx.beginPath();
      ctx.moveTo(padX, 146);
      ctx.lineTo(W - padX, 146);
      ctx.stroke();

      // Helper to draw label + underlined value
      const drawLine = (x1: number, x2: number, y: number) => {
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      };

      // 3. Row 1: बही संख्या & रसीद संख्या
      const row1Y = 182;
      ctx.textAlign = 'left';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('बही संख्या', padX, row1Y);
      const bookNoStr = data.bookNumber || `B-${new Date().getFullYear()}/${data.shopNumber || '01'}`;
      drawLine(padX + 68, 420, row1Y + 4);
      ctx.textAlign = 'center';
      ctx.fillText(bookNoStr, (padX + 68 + 420) / 2, row1Y);

      ctx.textAlign = 'left';
      ctx.font = `bold 24px monospace`;
      ctx.fillText(displayReceiptNumber, 450, row1Y);

      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('रसीद संख्या', 565, row1Y);
      drawLine(642, W - padX, row1Y + 4);

      // 4. Row 2: मांग रजिस्टर संख्या ... से
      const row2Y = 218;
      ctx.textAlign = 'left';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('मांग रजिस्टर संख्या', padX, row2Y);
      ctx.textAlign = 'right';
      ctx.fillText('से', W - padX, row2Y);

      const tenantLine = `${data.demandRegisterNumber ? `${data.demandRegisterNumber}, ` : ''}${data.tenantName}${data.shopNumber ? ` (दुकान सं० ${data.shopNumber}${data.location ? `, ${data.location}` : ''})` : ''
        }`;
      drawLine(padX + 122, W - padX - 24, row2Y + 4);
      ctx.textAlign = 'left';
      ctx.font = `bold 13.5px ${fontBase}`;
      ctx.fillText(tenantLine, padX + 128, row2Y, contentW - 160);

      // 5. Row 3: __________________ रुपया (शब्दों में)
      const row3Y = 254;
      ctx.textAlign = 'right';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('रुपया (शब्दों में)', W - padX, row3Y);
      drawLine(padX, W - padX - 105, row3Y + 4);
      ctx.textAlign = 'left';
      ctx.fillText(amountInWords, padX + 8, row3Y, contentW - 120);

      // 6. Row 4: बिल संख्या __________________ के पूर्ण/आंशिक भुगतान
      const row4Y = 290;
      ctx.textAlign = 'left';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('बिल संख्या', padX, row4Y);

      const billInfo = `${data.billNumber}${data.billingMonth ? ` (माह: ${data.billingMonth})` : ''}`;
      drawLine(padX + 70, W - padX - 165, row4Y + 4);
      ctx.textAlign = 'center';
      ctx.fillText(billInfo, (padX + 70 + (W - padX - 165)) / 2, row4Y, contentW - 250);

      ctx.textAlign = 'right';
      const statusSuffix = data.isFullPayment ? 'के पूर्ण /आंशिक भुगतान' : 'के पूर्ण/ आंशिक भुगतान';
      ctx.fillText(statusSuffix, W - padX, row4Y);

      // 7. Row 5: वाणिज्यिक दुकान किराया ... के मद प्राप्त हुआ।
      const row5Y = 326;
      const hasGstBreakdown = Boolean(data.gstAmount && data.gstAmount > 0);
      const rentHeadLabel = hasGstBreakdown
        ? `वाणिज्यिक दुकान किराया (₹${Number(data.baseRentAmount || 0).toLocaleString('en-IN')} + 18% GST ₹${Number(data.gstAmount).toLocaleString('en-IN')})`
        : 'वाणिज्यिक दुकान किराया (Commercial Shop Rent)';
      ctx.textAlign = 'right';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('के मद प्राप्त हुआ।', W - padX, row5Y);
      drawLine(padX, W - padX - 115, row5Y + 4);
      ctx.textAlign = 'left';
      ctx.fillText(rentHeadLabel, padX + 8, row5Y, contentW - 130);

      // 8. Lower Section: Left (Amount, Place, Date, Cashier) & Right (Officers)
      const amountY = 376;
      drawLine(padX, 320, amountY + 4);
      ctx.textAlign = 'center';
      ctx.font = `bold 16px monospace`;
      ctx.fillText(`₹ ${data.amount.toLocaleString('en-IN')}/-`, (padX + 320) / 2, amountY);
      ctx.textAlign = 'left';
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('रुपया', 330, amountY);

      ctx.textAlign = 'right';
      ctx.fillText('मुख्य अधिकारी/खण्ड विकास अधिकारी', W - padX, amountY + 4);

      const placeY = 414;
      ctx.textAlign = 'left';
      ctx.fillText('स्थान', padX, placeY);
      drawLine(padX + 44, 370, placeY + 4);
      ctx.textAlign = 'center';
      ctx.fillText(data.place || 'अल्मोड़ा', (padX + 44 + 370) / 2, placeY);

      ctx.textAlign = 'right';
      ctx.fillText('कर समाहर्ता (टैक्स कलेक्टर)', W - padX, placeY + 22);

      const dateY = 452;
      ctx.textAlign = 'left';
      ctx.fillText('दिनांक', padX, dateY);
      drawLine(padX + 48, 370, dateY + 4);
      ctx.textAlign = 'center';
      ctx.font = `bold 14px monospace`;
      ctx.fillText(formattedDate, (padX + 48 + 370) / 2, dateY);

      // रोकड़िया
      ctx.font = `bold 14px ${fontBase}`;
      ctx.fillText('रोकड़िया', (padX + 370) / 2, 496);

      // Bottom Signatures Row
      const bottomSignY = 550;
      ctx.textAlign = 'left';
      ctx.fillText('लेखाकार', padX, bottomSignY);
      ctx.textAlign = 'center';
      ctx.fillText('मांग तथा वसूली का प्रभारी लिपिक', W / 2, bottomSignY);
      ctx.textAlign = 'right';
      ctx.fillText('कर अधिकारी', W - padX, bottomSignY);

      // 9. Footer
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      drawLine(padX, W - padX, 575);
      ctx.textAlign = 'left';
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(
        'पी०एस०यू० (आर०ई०) 02 पंचायतीराज / 124-10-12-2021-2,000 बुक्स (कम्प्यूटर/ऑफसेट)।',
        padX,
        596
      );

      // Convert canvas to JPEG bytes and wrap in a real PDF
      const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
      const base64 = dataUrl.split(',')[1];
      const binaryStr = atob(base64);
      const jpegBytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        jpegBytes[i] = binaryStr.charCodeAt(i);
      }

      const pdfBlob = jpegToPdfBlob(jpegBytes, canvas.width, canvas.height);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ZPA_Receipt_${displayReceiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download receipt:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Official Toolbar — Aligned to Receipt Width (Hidden when printing) */}
      <div className="max-w-2xl mx-auto no-print bg-white border border-slate-300 rounded-lg px-4 py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-slate-700 shrink-0" />
          <span className="text-xs font-bold text-slate-800 truncate">
            {isHi
              ? 'शासकीय किराया रसीद'
              : 'Official Rent Receipt'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-800 border border-slate-300 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>
              {downloading
                ? isHi
                  ? 'डाउनलोड...'
                  : 'Downloading...'
                : isHi
                  ? 'PDF डाउनलोड'
                  : 'Download PDF'}
            </span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isHi ? 'प्रिंट करें' : 'Print Receipt'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title={isHi ? 'बंद करें' : 'Close'}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-md text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isHi ? 'बंद करें' : 'Close'}</span>
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
        {/* 1. Header (Centered with Left & Right Official Logos) */}
        <div className="flex items-center justify-between gap-4">
          <img
            src="/assets/logo1.webp"
            alt="Emblem of Uttarakhand"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="text-center space-y-0.5 flex-1">
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

          <img
            src="/assets/logo2.webp"
            alt="Panchayati Raj Logo"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
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
            {data.gstAmount && data.gstAmount > 0
              ? `वाणिज्यिक दुकान किराया (₹${Number(data.baseRentAmount || 0).toLocaleString('en-IN')} + 18% GST ₹${Number(data.gstAmount).toLocaleString('en-IN')})`
              : 'वाणिज्यिक दुकान किराया (Commercial Shop Rent)'}
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
