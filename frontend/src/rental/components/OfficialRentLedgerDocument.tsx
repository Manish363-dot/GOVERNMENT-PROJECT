import React, { useEffect, useRef, useState } from 'react';
import { Download, Printer, X } from 'lucide-react';

export interface OfficialLedgerBillRow {
  billNumber: string;
  billingMonth: string; // YYYY-MM
  rentAmount: number;
  gstAmount?: number;
  totalAmountDue: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  receiptNumber?: string | null;
}

export interface OfficialLedgerData {
  tenantName: string;
  tenantCode: string;
  mobile: string;
  shopNumber: string;
  location: string;
  totalOutstanding: number;
  isCurrentMonthPaid: boolean;
  bills: OfficialLedgerBillRow[];
}

const HI_MONTHS = [
  'जनवरी',
  'फरवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितंबर',
  'अक्टूबर',
  'नवंबर',
  'दिसंबर',
];

const formatHindiMonth = (yyyyMm: string): string => {
  if (!yyyyMm) return '—';
  const [yStr, mStr] = yyyyMm.split('-');
  const idx = parseInt(mStr, 10) - 1;
  return HI_MONTHS[idx] ? `${HI_MONTHS[idx]} ${yStr}` : yyyyMm;
};

const getHindiStatus = (status: string, bal: number): string => {
  if (status === 'PAID' || bal <= 0) return 'पूर्ण चुकता';
  if (status === 'PARTIALLY_PAID') return 'आंशिक भुगतान';
  if (status === 'OVERDUE') return 'अतिदेय बकाया';
  return 'लंबित / बकाया';
};

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const jpegToPdfBlob = (jpegBytes: Uint8Array, imgWidth: number, imgHeight: number): Blob => {
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

const downloadCanvasAsPdf = (canvas: HTMLCanvasElement, filename: string) => {
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
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const OfficialRentLedgerDocument: React.FC<{
  data: OfficialLedgerData;
  onClose?: () => void;
}> = ({ data, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const printScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (printScrollRef.current) {
      printScrollRef.current.scrollTop = 0;
    }
  }, [data]);

  const billsList = [...data.bills].sort((a, b) =>
    b.billingMonth.localeCompare(a.billingMonth)
  );

  const totalRentSum = billsList.reduce(
    (acc, b) => acc + Number(b.rentAmount || b.totalAmountDue || 0),
    0
  );
  const totalGstSum = billsList.reduce((acc, b) => acc + Number(b.gstAmount || 0), 0);
  const totalDueSum = billsList.reduce((acc, b) => acc + Number(b.totalAmountDue || 0), 0);
  const totalPaidSum = billsList.reduce((acc, b) => acc + Number(b.amountPaid || 0), 0);
  const totalBalSum = billsList.reduce((acc, b) => acc + Number(b.balanceDue || 0), 0);

  const formattedNow = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const resolvedShopNo = data.shopNumber || '—';
  const resolvedLocation = data.location || 'अल्मोड़ा';

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const scale = 2;
      const W = 860;
      const rowH = 34;
      const tableRowsCount = Math.max(1, billsList.length) + (billsList.length > 0 ? 1 : 0);
      const H = 560 + tableRowsCount * rowH;

      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
      const padX = 36;
      const innerW = W - padX * 2;

      const [logoLeft, logoRight] = await Promise.all([
        loadImage('/assets/logo1.webp'),
        loadImage('/assets/logo2.webp'),
      ]);

      if (logoLeft) ctx.drawImage(logoLeft, padX, 24, 62, 62);
      if (logoRight) ctx.drawImage(logoRight, W - padX - 62, 24, 62, 62);

      // Header (Pure Black)
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText('उत्तराखण्ड शासन • पंचायती राज विभाग', W / 2, 34);
      ctx.font = `800 22px ${fontBase}`;
      ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा', W / 2, 58);
      ctx.font = `600 13px ${fontBase}`;
      ctx.fillText('वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन प्रकोष्ठ', W / 2, 76);
      ctx.font = `bold 15px ${fontBase}`;
      ctx.fillText('वाणिज्यिक संपत्ति किराया खाता बही एवं मांग विवरण पत्र', W / 2, 96);

      // Parallel Reference Strip
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padX, 110);
      ctx.lineTo(W - padX, 110);
      ctx.moveTo(padX, 136);
      ctx.lineTo(W - padX, 136);
      ctx.stroke();

      ctx.font = `bold 12.5px ${fontBase}`;
      ctx.textAlign = 'left';
      ctx.fillText(
        `पत्रांक: जि०पं०अ० / किराया-लेखा / ${new Date().getFullYear()} / ${data.tenantCode || '01'}`,
        padX + 4,
        127
      );
      ctx.textAlign = 'right';
      ctx.fillText(`जारी दिनांक: ${formattedNow}`, W - padX - 4, 127);

      // Section 1: Tenant & Shop Info Table
      let curY = 160;
      ctx.textAlign = 'left';
      ctx.font = `bold 13.5px ${fontBase}`;
      ctx.fillText('1. आवंटी / किरायेदार एवं आवंटित दुकान का विवरण:', padX, curY);

      curY += 10;
      const infoRowH = 32;
      const infoH = infoRowH * 4;
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, curY, innerW, infoH);

      const col1W = Math.round(innerW * 0.23);
      const col2W = Math.round(innerW * 0.27);
      const col3W = Math.round(innerW * 0.23);

      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.moveTo(padX, curY + r * infoRowH);
        ctx.lineTo(padX + innerW, curY + r * infoRowH);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(padX + col1W, curY);
      ctx.lineTo(padX + col1W, curY + infoH);
      ctx.moveTo(padX + col1W + col2W, curY);
      ctx.lineTo(padX + col1W + col2W, curY + infoRowH * 3);
      ctx.moveTo(padX + col1W + col2W + col3W, curY);
      ctx.lineTo(padX + col1W + col2W + col3W, curY + infoRowH * 3);
      ctx.stroke();

      const drawInfoCell = (x: number, y: number, text: string, bold = true) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#000000';
        ctx.font = `${bold ? 'bold' : 'normal'} 13px ${fontBase}`;
        ctx.fillText(text, x + 10, y + 21);
      };

      drawInfoCell(padX, curY, 'किरायेदार का नाम:');
      drawInfoCell(padX + col1W, curY, data.tenantName || '—');
      drawInfoCell(padX + col1W + col2W, curY, 'पंजीकृत मोबाइल नंबर:');
      drawInfoCell(padX + col1W + col2W + col3W, curY, data.mobile || '—');

      drawInfoCell(padX, curY + infoRowH, 'आवंटित दुकान संख्या:');
      drawInfoCell(padX + col1W, curY + infoRowH, resolvedShopNo);
      drawInfoCell(padX + col1W + col2W, curY + infoRowH, 'स्थान / बाजार:');
      drawInfoCell(padX + col1W + col2W + col3W, curY + infoRowH, resolvedLocation);

      drawInfoCell(padX, curY + infoRowH * 2, 'किरायेदार पहचान कोड:');
      drawInfoCell(padX + col1W, curY + infoRowH * 2, data.tenantCode || '—');
      drawInfoCell(padX + col1W + col2W, curY + infoRowH * 2, 'चालू माह की स्थिति:');
      drawInfoCell(
        padX + col1W + col2W + col3W,
        curY + infoRowH * 2,
        data.isCurrentMonthPaid ? 'पूर्ण चुकता' : 'लंबित / बकाया'
      );

      drawInfoCell(padX, curY + infoRowH * 3, 'कुल देय बकाया राशि:');
      drawInfoCell(
        padX + col1W,
        curY + infoRowH * 3,
        `₹${Number(data.totalOutstanding || 0).toLocaleString('en-IN')}/-`
      );

      // Section 2: Monthly Bills Table
      curY += infoH + 26;
      ctx.textAlign = 'left';
      ctx.font = `bold 13.5px ${fontBase}`;
      ctx.fillText('2. माहवार किराया मांग एवं जमा खाता बही विवरण:', padX, curY);

      curY += 10;
      const colWidths = [
        32,
        92,
        130,
        74,
        72,
        78,
        72,
        74,
        78,
        innerW - (32 + 92 + 130 + 74 + 72 + 78 + 72 + 74 + 78),
      ];
      const colX: number[] = [];
      let accX = padX;
      for (const w of colWidths) {
        colX.push(accX);
        accX += w;
      }

      const totalTableH = (1 + tableRowsCount) * rowH;
      ctx.strokeRect(padX, curY, innerW, totalTableH);

      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padX, curY + rowH);
      ctx.lineTo(padX + innerW, curY + rowH);
      ctx.stroke();
      ctx.lineWidth = 1;

      const headers = [
        { label: 'क्र.', align: 'center' as CanvasTextAlign },
        { label: 'बिल माह', align: 'left' as CanvasTextAlign },
        { label: 'बिल संख्या', align: 'left' as CanvasTextAlign },
        { label: 'मासिक किराया', align: 'right' as CanvasTextAlign },
        { label: '18% GST', align: 'right' as CanvasTextAlign },
        { label: 'कुल देय राशि', align: 'right' as CanvasTextAlign },
        { label: 'जमा राशि', align: 'right' as CanvasTextAlign },
        { label: 'अवशेष बकाया', align: 'right' as CanvasTextAlign },
        { label: 'भुगतान स्थिति', align: 'center' as CanvasTextAlign },
        { label: 'रसीद संख्या', align: 'center' as CanvasTextAlign },
      ];

      headers.forEach((h, idx) => {
        const cx = colX[idx];
        const cw = colWidths[idx];
        ctx.font = `bold 11px ${fontBase}`;
        ctx.fillStyle = '#000000';
        ctx.textAlign = h.align;
        const tx =
          h.align === 'center' ? cx + cw / 2 : h.align === 'right' ? cx + cw - 6 : cx + 6;
        ctx.fillText(h.label, tx, curY + 22, cw - 8);
      });

      if (billsList.length === 0) {
        ctx.textAlign = 'center';
        ctx.font = `normal 12.5px ${fontBase}`;
        ctx.fillText('कोई बिल अभिलेख उपलब्ध नहीं है।', W / 2, curY + rowH + 22);
      } else {
        for (let r = 1; r <= colWidths.length - 1; r++) {
          ctx.beginPath();
          ctx.moveTo(colX[r], curY);
          ctx.lineTo(colX[r], curY + (1 + billsList.length) * rowH);
          ctx.stroke();
        }

        billsList.forEach((b, rIdx) => {
          const ry = curY + (1 + rIdx) * rowH;
          ctx.beginPath();
          ctx.moveTo(padX, ry + rowH);
          ctx.lineTo(padX + innerW, ry + rowH);
          ctx.stroke();

          const cells = [
            String(rIdx + 1),
            formatHindiMonth(b.billingMonth),
            b.billNumber,
            `₹${Number(b.rentAmount || b.totalAmountDue || 0).toLocaleString('en-IN')}`,
            `₹${Number(b.gstAmount || 0).toLocaleString('en-IN')}`,
            `₹${b.totalAmountDue.toLocaleString('en-IN')}`,
            `₹${b.amountPaid.toLocaleString('en-IN')}`,
            `₹${b.balanceDue.toLocaleString('en-IN')}`,
            getHindiStatus(b.status, b.balanceDue),
            b.receiptNumber || '—',
          ];

          cells.forEach((val, cIdx) => {
            const cx = colX[cIdx];
            const cw = colWidths[cIdx];
            const align = headers[cIdx].align;
            ctx.textAlign = align;
            ctx.fillStyle = '#000000';
            ctx.font = `bold 11.5px ${fontBase}`;
            const tx =
              align === 'center' ? cx + cw / 2 : align === 'right' ? cx + cw - 6 : cx + 6;
            ctx.fillText(val, tx, ry + 22, cw - 8);
          });
        });

        // Total summary row
        const totY = curY + (1 + billsList.length) * rowH;
        [3, 4, 5, 6, 7, 8].forEach((idx) => {
          ctx.beginPath();
          ctx.moveTo(colX[idx], totY);
          ctx.lineTo(colX[idx], totY + rowH);
          ctx.stroke();
        });

        ctx.font = `bold 12px ${fontBase}`;
        ctx.textAlign = 'right';
        ctx.fillText('कुल योग :', colX[3] - 8, totY + 22);
        ctx.fillText(
          `₹${totalRentSum.toLocaleString('en-IN')}`,
          colX[3] + colWidths[3] - 6,
          totY + 22
        );
        ctx.fillText(
          `₹${totalGstSum.toLocaleString('en-IN')}`,
          colX[4] + colWidths[4] - 6,
          totY + 22
        );
        ctx.fillText(
          `₹${totalDueSum.toLocaleString('en-IN')}`,
          colX[5] + colWidths[5] - 6,
          totY + 22
        );
        ctx.fillText(
          `₹${totalPaidSum.toLocaleString('en-IN')}`,
          colX[6] + colWidths[6] - 6,
          totY + 22
        );
        ctx.fillText(
          `₹${totalBalSum.toLocaleString('en-IN')}`,
          colX[7] + colWidths[7] - 6,
          totY + 22
        );
        ctx.textAlign = 'center';
        ctx.fillText(
          totalBalSum > 0 ? 'बकाया देय' : 'पूर्ण चुकता',
          colX[8] + (colWidths[8] + colWidths[9]) / 2,
          totY + 22
        );
      }

      // Signatures at bottom
      const signY = curY + totalTableH + 58;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';

      ctx.font = `normal 12px ${fontBase}`;
      ctx.fillText('हस्ताक्षर', padX + 95, signY);
      ctx.fillText('कार्यालय मुहर', W / 2, signY);
      ctx.fillText('हस्ताक्षर', W - padX - 95, signY);

      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText('मांग एवं वसूली लिपिक', padX + 95, signY + 22);
      ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा', W / 2, signY + 22);
      ctx.fillText('कर अधिकारी / मुख्य अधिकारी', W - padX - 95, signY + 22);

      ctx.font = `normal 11.5px ${fontBase}`;
      ctx.fillText('जिला पंचायत अल्मोड़ा', padX + 95, signY + 40);
      ctx.fillText('उत्तराखण्ड शासन', W / 2, signY + 40);
      ctx.fillText('जिला पंचायत अल्मोड़ा', W - padX - 95, signY + 40);

      ctx.beginPath();
      ctx.moveTo(padX, signY + 58);
      ctx.lineTo(W - padX, signY + 58);
      ctx.stroke();

      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(
        'नोट: यह प्रपत्र कार्यालय जिला पंचायत अल्मोड़ा के वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन पोर्टल द्वारा जारी शासकीय खाता बही विवरण है।',
        W / 2,
        signY + 76
      );

      downloadCanvasAsPdf(canvas, `ZPA_Rent_Ledger_${resolvedShopNo}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden text-black flex flex-col max-h-[calc(100vh-2.5rem)]">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-rent-ledger-print, #official-rent-ledger-print * {
            visibility: visible !important;
          }
          #official-rent-ledger-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 8mm !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      {/* Toolbar (No Print) */}
      <div className="no-print bg-[#0B1B36] px-5 py-3 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
        <span className="text-xs font-bold">
          आधिकारिक खाता बही विवरण — {data.tenantName} ({resolvedShopNo})
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'डाउनलोड हो रहा है...' : 'PDF डाउनलोड'}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            प्रिंट
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/15 hover:text-white cursor-pointer"
              title="बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Paper Document Preview Matching Exact Official PDF */}
      <div
        ref={printScrollRef}
        id="official-rent-ledger-print"
        className="pt-7 px-6 pb-6 sm:pt-8 sm:px-8 sm:pb-8 bg-white text-black flex-1 overflow-y-auto"
      >
        {/* Header with Both Logos */}
        <div className="flex items-center justify-between gap-4 pb-3">
          <img
            src="/assets/logo1.webp"
            alt="उत्तराखण्ड शासन"
            className="w-14 h-14 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="text-center leading-snug">
            <p className="text-xs font-bold">उत्तराखण्ड शासन • पंचायती राज विभाग</p>
            <h2 className="text-xl sm:text-2xl font-black">कार्यालय जिला पंचायत अल्मोड़ा</h2>
            <p className="text-xs font-semibold">वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन प्रकोष्ठ</p>
            <p className="text-sm font-bold mt-0.5">
              वाणिज्यिक संपत्ति किराया खाता बही एवं मांग विवरण पत्र
            </p>
          </div>
          <img
            src="/assets/logo2.webp"
            alt="पंचायती राज"
            className="w-14 h-14 object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Metadata Reference Strip */}
        <div className="border-y border-black py-1.5 px-1 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span>
            पत्रांक: जि०पं०अ० / किराया-लेखा / {new Date().getFullYear()} / {data.tenantCode || '01'}
          </span>
          <span>जारी दिनांक: {formattedNow}</span>
        </div>

        {/* Section 1 */}
        <div className="mt-5">
          <p className="text-xs sm:text-sm font-bold mb-2">
            1. आवंटी / किरायेदार एवं आवंटित दुकान का विवरण:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-black border-collapse text-xs">
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black px-3 py-2 font-bold w-[23%]">
                    किरायेदार का नाम:
                  </td>
                  <td className="border-r border-black px-3 py-2 font-bold w-[27%]">
                    {data.tenantName || '—'}
                  </td>
                  <td className="border-r border-black px-3 py-2 font-bold w-[23%]">
                    पंजीकृत मोबाइल नंबर:
                  </td>
                  <td className="px-3 py-2 font-bold w-[27%]">{data.mobile || '—'}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black px-3 py-2 font-bold">आवंटित दुकान संख्या:</td>
                  <td className="border-r border-black px-3 py-2 font-bold">{resolvedShopNo}</td>
                  <td className="border-r border-black px-3 py-2 font-bold">स्थान / बाजार:</td>
                  <td className="px-3 py-2 font-bold">{resolvedLocation}</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border-r border-black px-3 py-2 font-bold">किरायेदार पहचान कोड:</td>
                  <td className="border-r border-black px-3 py-2 font-bold">
                    {data.tenantCode || '—'}
                  </td>
                  <td className="border-r border-black px-3 py-2 font-bold">चालू माह की स्थिति:</td>
                  <td className="px-3 py-2 font-bold">
                    {data.isCurrentMonthPaid ? 'पूर्ण चुकता' : 'लंबित / बकाया'}
                  </td>
                </tr>
                <tr>
                  <td className="border-r border-black px-3 py-2 font-bold">कुल देय बकाया राशि:</td>
                  <td colSpan={3} className="px-3 py-2 font-bold">
                    ₹{Number(data.totalOutstanding || 0).toLocaleString('en-IN')}/-
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-6">
          <p className="text-xs sm:text-sm font-bold mb-2">
            2. माहवार किराया मांग एवं जमा खाता बही विवरण:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border border-black border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="border-r border-black px-2 py-2 text-center font-bold">क्र.</th>
                  <th className="border-r border-black px-2.5 py-2 text-left font-bold">बिल माह</th>
                  <th className="border-r border-black px-2.5 py-2 text-left font-bold">बिल संख्या</th>
                  <th className="border-r border-black px-2.5 py-2 text-right font-bold">मासिक किराया</th>
                  <th className="border-r border-black px-2.5 py-2 text-right font-bold whitespace-nowrap">18% GST</th>
                  <th className="border-r border-black px-2.5 py-2 text-right font-bold">कुल देय राशि</th>
                  <th className="border-r border-black px-2.5 py-2 text-right font-bold">जमा राशि</th>
                  <th className="border-r border-black px-2.5 py-2 text-right font-bold">अवशेष बकाया</th>
                  <th className="border-r border-black px-2.5 py-2 text-center font-bold">भुगतान स्थिति</th>
                  <th className="px-2.5 py-2 text-center font-bold">रसीद संख्या</th>
                </tr>
              </thead>
              <tbody>
                {billsList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-4 text-center">
                      कोई बिल अभिलेख उपलब्ध नहीं है।
                    </td>
                  </tr>
                ) : (
                  <>
                    {billsList.map((b, idx) => (
                      <tr key={b.billNumber || idx} className="border-b border-black">
                        <td className="border-r border-black px-2 py-2 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 font-bold whitespace-nowrap">
                          {formatHindiMonth(b.billingMonth)}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 font-mono font-bold">
                          {b.billNumber}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-right font-bold">
                          ₹{Number(b.rentAmount || b.totalAmountDue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-right font-bold">
                          ₹{Number(b.gstAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-right font-bold">
                          ₹{Number(b.totalAmountDue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-right font-bold">
                          ₹{Number(b.amountPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-right font-bold">
                          ₹{Number(b.balanceDue || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="border-r border-black px-2.5 py-2 text-center font-bold whitespace-nowrap">
                          {getHindiStatus(b.status, b.balanceDue)}
                        </td>
                        <td className="px-2.5 py-2 text-center font-mono font-bold">
                          {b.receiptNumber || '—'}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td colSpan={3} className="border-r border-black px-3 py-2 text-right">
                        कुल योग :
                      </td>
                      <td className="border-r border-black px-2.5 py-2 text-right">
                        ₹{totalRentSum.toLocaleString('en-IN')}
                      </td>
                      <td className="border-r border-black px-2.5 py-2 text-right">
                        ₹{totalGstSum.toLocaleString('en-IN')}
                      </td>
                      <td className="border-r border-black px-2.5 py-2 text-right">
                        ₹{totalDueSum.toLocaleString('en-IN')}
                      </td>
                      <td className="border-r border-black px-2.5 py-2 text-right">
                        ₹{totalPaidSum.toLocaleString('en-IN')}
                      </td>
                      <td className="border-r border-black px-2.5 py-2 text-right">
                        ₹{totalBalSum.toLocaleString('en-IN')}
                      </td>
                      <td colSpan={2} className="px-2.5 py-2 text-center">
                        {totalBalSum > 0 ? 'बकाया देय' : 'पूर्ण चुकता'}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center text-xs">
          <div>
            <p className="text-slate-600">हस्ताक्षर</p>
            <p className="font-bold mt-4">मांग एवं वसूली लिपिक</p>
            <p>जिला पंचायत अल्मोड़ा</p>
          </div>
          <div>
            <p className="text-slate-600">कार्यालय मुहर</p>
            <p className="font-bold mt-4">कार्यालय जिला पंचायत अल्मोड़ा</p>
            <p>उत्तराखण्ड शासन</p>
          </div>
          <div>
            <p className="text-slate-600">हस्ताक्षर</p>
            <p className="font-bold mt-4">कर अधिकारी / मुख्य अधिकारी</p>
            <p>जिला पंचायत अल्मोड़ा</p>
          </div>
        </div>

        <div className="mt-5 pt-2 border-t border-black text-center text-[11px]">
          नोट: यह प्रपत्र कार्यालय जिला पंचायत अल्मोड़ा के वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन पोर्टल द्वारा जारी शासकीय खाता बही विवरण है।
        </div>
      </div>
    </div>
  );
};

export default OfficialRentLedgerDocument;
