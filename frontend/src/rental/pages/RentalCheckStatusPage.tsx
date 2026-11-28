import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Download,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import { RentalNavbar } from '../components/RentalNavbar';
import { Footer } from '@/components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, DuesSearchResult } from '../services/rentalBilling.service';
import { amountToHindiWords } from '../utils/hindiNumberWords';

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

export const RentalCheckStatusPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { t, language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DuesSearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle strictly 10-digit numeric mobile number input
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setQuery(val);
    if (errorMsg) setErrorMsg('');
  };

  // Search dues & ledger strictly by 10-digit mobile number
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = query.replace(/\D/g, '').slice(0, 10);

    if (cleanMobile.length !== 10) {
      setErrorMsg(
        isHi
          ? 'कृपया पूरा 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें।'
          : 'Please enter a complete 10-digit registered mobile number.'
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMsg(
        isHi
          ? 'कृपया मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाला)।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    setSearched(true);
    setSearching(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await rentalBillingApi.searchDues(cleanMobile);
      if (res.data && (res.data.tenant || (res.data.allBills && res.data.allBills.length > 0))) {
        setResult(res.data);
      } else {
        setErrorMsg(
          isHi
            ? 'इस मोबाइल नंबर पर कोई पंजीकृत किरायेदार खाता नहीं मिला। कृपया अपने 10-अंकीय पंजीकृत मोबाइल नंबर की जांच करें या कार्यालय से संपर्क करें।'
            : 'No registered tenant account found for this mobile number. Please verify your registered mobile number or contact the office.'
        );
      }
    } catch (err: any) {
      console.error('Search dues error:', err);
      setErrorMsg(
        isHi
          ? 'बकाया राशि खोजने में असमर्थ। कृपया अपने पंजीकृत मोबाइल नंबर की जांच करें।'
          : 'Unable to fetch rental status. Please verify your registered mobile number.'
      );
    } finally {
      setSearching(false);
    }
  };

  const formatHindiMonth = (monthStr: string) => {
    if (!monthStr) return '—';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const m = parseInt(parts[1], 10);
    const hiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
    ];
    return m >= 1 && m <= 12 ? `${hiMonths[m - 1]} ${year}` : monthStr;
  };

  // Direct 1-Click PDF Download for Official Statutory Form 5 Receipt Voucher (100% Pure Hindi + Top Logos)
  const handlePrintReceipt = async (receiptNo: string, month: string, amount: number) => {
    const rawReceipt = String(receiptNo || '286480');
    const digitsOnly = rawReceipt.replace(/\D/g, '');
    const displayReceiptNumber = digitsOnly.length >= 3 ? digitsOnly.slice(-6) : rawReceipt;
    const amountInWords = amountToHindiWords(amount);

    const resolvedShopNo =
      result?.tenant?.shopNo && result.tenant.shopNo !== 'SHOP-TBD'
        ? result.tenant.shopNo
        : result?.pendingBills?.[0]?.propertyNumber || '01';
    const resolvedLocation =
      result?.tenant?.location && result.tenant.location !== 'Almora Market'
        ? result.tenant.location
        : result?.pendingBills?.[0]?.location || 'अल्मोड़ा';

    const bookNo = `B-${new Date().getFullYear()}/${resolvedShopNo}`;
    const tenantCode = result?.tenant?.code || '';
    const tenantName = result?.tenant?.name || 'किरायेदार';
    const matchedBill = result?.allBills?.find((b) => b.billingMonth === month);
    const billNo = matchedBill?.billNumber || `BL-${resolvedShopNo}-${month}`;
    const isFull = matchedBill ? matchedBill.balanceDue <= 0 : true;
    const formattedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const scale = 2;
    const W = 800;
    const H = 640;
    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
    const padX = 48;
    const contentW = W - padX * 2;

    const [logoLeft, logoRight] = await Promise.all([
      loadImage('/assets/logo1.webp'),
      loadImage('/assets/logo2.webp'),
    ]);

    if (logoLeft) ctx.drawImage(logoLeft, padX, 26, 56, 56);
    if (logoRight) ctx.drawImage(logoRight, W - padX - 56, 26, 56, 56);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `bold 20px ${fontBase}`;
    ctx.fillText('जिला पंचायत/क्षेत्र समिति प्रपत्र संख्या 5', W / 2, 44);
    ctx.font = `600 14px ${fontBase}`;
    ctx.fillText('(नियम 41 देखिये)', W / 2, 65);
    ctx.font = `normal 12px ${fontBase}`;
    ctx.fillText('(“डबल साइडेड कार्बन पेपर” पर अमिट पेन्सिल से लिखा जायेगा)', W / 2, 84);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    const drawLine = (x1: number, x2: number, y: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    };

    drawLine(padX, W - padX, 98);
    ctx.font = `600 12px ${fontBase}`;
    ctx.fillText('जिला पंचायत/जिले के नाम सहित क्षेत्र समिति के नाम का रबड़ स्टाम्प', W / 2, 116);
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)', W / 2, 136);
    drawLine(padX, W - padX, 146);

    const row1Y = 182;
    ctx.textAlign = 'left';
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('बही संख्या', padX, row1Y);
    drawLine(padX + 68, 420, row1Y + 4);
    ctx.textAlign = 'center';
    ctx.fillText(bookNo, (padX + 68 + 420) / 2, row1Y);

    ctx.textAlign = 'left';
    ctx.font = `bold 24px monospace`;
    ctx.fillText(displayReceiptNumber, 450, row1Y);
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('रसीद संख्या', 565, row1Y);
    drawLine(642, W - padX, row1Y + 4);

    const row2Y = 218;
    ctx.textAlign = 'left';
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('मांग रजिस्टर संख्या', padX, row2Y);
    ctx.textAlign = 'right';
    ctx.fillText('से', W - padX, row2Y);
    const tenantLine = `${tenantCode ? `${tenantCode}, ` : ''}${tenantName} (दुकान सं० ${resolvedShopNo}, ${resolvedLocation})`;
    drawLine(padX + 122, W - padX - 24, row2Y + 4);
    ctx.textAlign = 'left';
    ctx.font = `bold 13.5px ${fontBase}`;
    ctx.fillText(tenantLine, padX + 128, row2Y, contentW - 160);

    const row3Y = 254;
    ctx.textAlign = 'right';
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('रुपया (शब्दों में)', W - padX, row3Y);
    drawLine(padX, W - padX - 105, row3Y + 4);
    ctx.textAlign = 'left';
    ctx.fillText(amountInWords, padX + 8, row3Y, contentW - 120);

    const row4Y = 290;
    ctx.textAlign = 'left';
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('बिल संख्या', padX, row4Y);
    const billInfo = `${billNo} (माह: ${formatHindiMonth(month)})`;
    drawLine(padX + 70, W - padX - 165, row4Y + 4);
    ctx.textAlign = 'center';
    ctx.fillText(billInfo, (padX + 70 + (W - padX - 165)) / 2, row4Y, contentW - 250);
    ctx.textAlign = 'right';
    ctx.fillText(isFull ? 'के पूर्ण /आंशिक भुगतान' : 'के पूर्ण/ आंशिक भुगतान', W - padX, row4Y);

    const row5Y = 326;
    const matchedGst = Number(matchedBill?.gstAmount || 0);
    const matchedRent = Number(matchedBill?.rentAmount || 0);
    const receiptHead =
      matchedGst > 0
        ? `वाणिज्यिक दुकान किराया (₹${matchedRent.toLocaleString('en-IN')} + 18% GST ₹${matchedGst.toLocaleString('en-IN')})`
        : 'वाणिज्यिक दुकान किराया';
    ctx.textAlign = 'right';
    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('के मद प्राप्त हुआ।', W - padX, row5Y);
    drawLine(padX, W - padX - 115, row5Y + 4);
    ctx.textAlign = 'left';
    ctx.fillText(receiptHead, padX + 8, row5Y, contentW - 130);

    const amountY = 376;
    drawLine(padX, 320, amountY + 4);
    ctx.textAlign = 'center';
    ctx.font = `bold 16px monospace`;
    ctx.fillText(`₹ ${amount.toLocaleString('en-IN')}/-`, (padX + 320) / 2, amountY);
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
    ctx.fillText('अल्मोड़ा', (padX + 44 + 370) / 2, placeY);
    ctx.textAlign = 'right';
    ctx.fillText('कर समाहर्ता (टैक्स कलेक्टर)', W - padX, placeY + 22);

    const dateY = 452;
    ctx.textAlign = 'left';
    ctx.fillText('दिनांक', padX, dateY);
    drawLine(padX + 48, 370, dateY + 4);
    ctx.textAlign = 'center';
    ctx.font = `bold 14px monospace`;
    ctx.fillText(formattedDate, (padX + 48 + 370) / 2, dateY);

    ctx.font = `bold 14px ${fontBase}`;
    ctx.fillText('रोकड़िया', (padX + 370) / 2, 496);

    const bottomSignY = 550;
    ctx.textAlign = 'left';
    ctx.fillText('लेखाकार', padX, bottomSignY);
    ctx.textAlign = 'center';
    ctx.fillText('मांग तथा वसूली का प्रभारी लिपिक', W / 2, bottomSignY);
    ctx.textAlign = 'right';
    ctx.fillText('कर अधिकारी', W - padX, bottomSignY);

    ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    drawLine(padX, W - padX, 575);
    ctx.textAlign = 'left';
    ctx.font = `normal 11px ${fontBase}`;
    ctx.fillText(
      'पी०एस०यू० (आर०ई०) 02 पंचायतीराज / 124-10-12-2021-2,000 बुक्स (कम्प्यूटर/ऑफसेट)।',
      padX,
      596
    );

    downloadCanvasAsPdf(canvas, `ZPA_Receipt_${displayReceiptNumber}.pdf`);
  };

  // Direct 1-Click PDF Download for Full Ledger Statement (100% Pure Hindi + Pure Black Official Format)
  const handlePrintLedger = async () => {
    const getHindiStatus = (status: string, bal: number) => {
      if (status === 'PAID' || bal <= 0) return 'पूर्ण चुकता';
      if (status === 'PARTIALLY_PAID') return 'आंशिक भुगतान';
      if (status === 'OVERDUE') return 'अतिदेय बकाया';
      return 'लंबित / बकाया';
    };

    const billsList = result?.allBills || [];
    const totalRentSum = billsList.reduce((acc, b) => acc + Number(b.rentAmount || b.totalAmountDue || 0), 0);
    const totalGstSum = billsList.reduce((acc, b) => acc + Number(b.gstAmount || 0), 0);
    const totalDueSum = billsList.reduce((acc, b) => acc + Number(b.totalAmountDue || 0), 0);
    const totalPaidSum = billsList.reduce((acc, b) => acc + Number(b.amountPaid || 0), 0);
    const totalBalSum = billsList.reduce((acc, b) => acc + Number(b.balanceDue || 0), 0);

    const resolvedShopNo =
      result?.tenant?.shopNo && result.tenant.shopNo !== 'SHOP-TBD'
        ? result.tenant.shopNo
        : result?.pendingBills?.[0]?.propertyNumber || '—';

    const resolvedLocation =
      result?.tenant?.location && result.tenant.location !== 'Almora Market'
        ? result.tenant.location
        : result?.pendingBills?.[0]?.location || 'अल्मोड़ा';

    const formattedNow = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

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
      `पत्रांक: जि०पं०अ० / किराया-लेखा / ${new Date().getFullYear()} / ${result?.tenant?.code || '01'}`,
      padX + 4,
      127
    );
    ctx.textAlign = 'right';
    ctx.fillText(`जारी दिनांक: ${formattedNow}`, W - padX - 4, 127);

    // Section 1: Tenant & Shop Info Table (Pure Black)
    let curY = 160;
    ctx.textAlign = 'left';
    ctx.font = `bold 13.5px ${fontBase}`;
    ctx.fillText('१. आवंटी / किरायेदार एवं आवंटित दुकान का विवरण:', padX, curY);

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

    // Vertical lines in info table (first 3 rows have 4 columns, 4th row has 2 columns)
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
    drawInfoCell(padX + col1W, curY, result?.tenant?.name || '—');
    drawInfoCell(padX + col1W + col2W, curY, 'पंजीकृत मोबाइल नंबर:');
    drawInfoCell(padX + col1W + col2W + col3W, curY, result?.tenant?.mobile || query);

    drawInfoCell(padX, curY + infoRowH, 'आवंटित दुकान संख्या:');
    drawInfoCell(padX + col1W, curY + infoRowH, resolvedShopNo);
    drawInfoCell(padX + col1W + col2W, curY + infoRowH, 'स्थान / बाजार:');
    drawInfoCell(padX + col1W + col2W + col3W, curY + infoRowH, resolvedLocation);

    drawInfoCell(padX, curY + infoRowH * 2, 'किरायेदार पहचान कोड:');
    drawInfoCell(padX + col1W, curY + infoRowH * 2, result?.tenant?.code || '—');
    drawInfoCell(padX + col1W + col2W, curY + infoRowH * 2, 'चालू माह की स्थिति:');
    drawInfoCell(padX + col1W + col2W + col3W, curY + infoRowH * 2, isComplete ? 'पूर्ण चुकता' : 'लंबित / बकाया');

    drawInfoCell(padX, curY + infoRowH * 3, 'कुल देय बकाया राशि:');
    drawInfoCell(
      padX + col1W,
      curY + infoRowH * 3,
      `₹${Number(result?.totalOutstanding || 0).toLocaleString('en-IN')}/-`
    );

    // Section 2: Monthly Bills Table (Pure Black)
    curY += infoH + 26;
    ctx.textAlign = 'left';
    ctx.font = `bold 13.5px ${fontBase}`;
    ctx.fillText('२. माहवार किराया मांग एवं जमा खाता बही विवरण:', padX, curY);

    curY += 10;
    const colWidths = [32, 92, 130, 74, 72, 78, 72, 74, 78, innerW - (32 + 92 + 130 + 74 + 72 + 78 + 72 + 74 + 78)];
    const colX: number[] = [];
    let accX = padX;
    for (const w of colWidths) {
      colX.push(accX);
      accX += w;
    }

    const totalTableH = (1 + tableRowsCount) * rowH;
    ctx.strokeRect(padX, curY, innerW, totalTableH);

    // Header row bottom border (thicker)
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
      const tx = h.align === 'center' ? cx + cw / 2 : h.align === 'right' ? cx + cw - 6 : cx + 6;
      ctx.fillText(h.label, tx, curY + 22, cw - 8);
    });

    // Draw rows
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
          const tx = align === 'center' ? cx + cw / 2 : align === 'right' ? cx + cw - 6 : cx + 6;
          ctx.fillText(val, tx, ry + 22, cw - 8);
        });
      });

      // Total summary row
      const totY = curY + (1 + billsList.length) * rowH;
      // Vertical dividers for total row
      [3, 4, 5, 6, 7, 8].forEach((idx) => {
        ctx.beginPath();
        ctx.moveTo(colX[idx], totY);
        ctx.lineTo(colX[idx], totY + rowH);
        ctx.stroke();
      });

      ctx.font = `bold 12px ${fontBase}`;
      ctx.textAlign = 'right';
      ctx.fillText('कुल योग :', colX[3] - 8, totY + 22);
      ctx.fillText(`₹${totalRentSum.toLocaleString('en-IN')}`, colX[3] + colWidths[3] - 6, totY + 22);
      ctx.fillText(`₹${totalGstSum.toLocaleString('en-IN')}`, colX[4] + colWidths[4] - 6, totY + 22);
      ctx.fillText(`₹${totalDueSum.toLocaleString('en-IN')}`, colX[5] + colWidths[5] - 6, totY + 22);
      ctx.fillText(`₹${totalPaidSum.toLocaleString('en-IN')}`, colX[6] + colWidths[6] - 6, totY + 22);
      ctx.fillText(`₹${totalBalSum.toLocaleString('en-IN')}`, colX[7] + colWidths[7] - 6, totY + 22);
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

    // Bottom Note
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
  };

  const hasAnyBills = Boolean(result?.allBills && result.allBills.length > 0);
  const isComplete = Boolean(
    hasAnyBills && result?.isThisMonthComplete && result?.currentMonthBill?.status === 'PAID'
  );
  const totalOutstanding = Number(result?.totalOutstanding || 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] w-full overflow-x-hidden font-sans">
      {/* 🏛️ Master Government Navbar */}
      <RentalNavbar />

      <main className="flex-1 w-full py-6 sm:py-10 md:py-12">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back Navigation */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <Link
              to="/rental"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHi ? 'किराया पोर्टल मुख्य पृष्ठ' : 'Back to Rental Portal'}</span>
            </Link>
          </div>

          {/* Page Header Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm mb-6 sm:mb-8 text-center relative overflow-hidden">
            <div className="uk-tricolor-line absolute top-0 left-0 right-0" />

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-navy-950 tracking-tight leading-snug">
              {isHi
                ? 'मासिक किराया स्थिति एवं खाता बही'
                : 'Monthly Rent Status & Ledger Statement'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium px-1 sm:px-0 leading-relaxed">
              {isHi
                ? 'अपने 10-अंकीय पंजीकृत मोबाइल नंबर से अपने चालू माह के किराये की स्थिति जांचें और रसीद, खाता विवरण डाउनलोड करें।'
                : 'Enter your 10-digit registered mobile number to check rent status and download receipts or ledger.'}
            </p>

            {/* Search Input Form (Strictly 10-digit Mobile Number) */}
            <form onSubmit={handleSearch} className="mt-5 sm:mt-6 max-w-xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 sm:gap-3 w-full">
                <div className="relative flex-1 flex items-center w-full min-w-0">
                  <div className="absolute left-3 sm:left-3.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-slate-500 select-none pointer-events-none">
                    <span className="text-slate-500 font-bold">+91</span>
                    <span className="text-slate-300">|</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={query}
                    onChange={handleMobileChange}
                    placeholder={
                      isHi
                        ? '10-अंकों का पंजीकृत मोबाइल नंबर'
                        : '10-digit registered mobile number'
                    }
                    className="w-full pr-14 sm:pr-16 py-3 sm:py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
                    style={{ paddingLeft: '5.25rem' }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || query.length !== 10}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {searching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isHi ? 'खोज रहे हैं...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHi ? 'किराया स्थिति जांचें' : 'Check Status'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 max-w-xl mx-auto text-center px-4">
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Results Display */}
          {searched && result && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
              {/* 1. Tenant & Shop Overview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="text-base sm:text-xl font-extrabold text-navy-950 break-words">
                        {result.tenant?.name}
                      </h2>
                      <div className="text-xs text-slate-600 font-medium mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{result.tenant?.mobile || query}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Current Month Status Hero Box */}
                <div className="mt-4 sm:mt-5 p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-5 bg-gradient-to-r shadow-xs">
                  {isComplete ? (
                    // STATUS: COMPLETE / PAID
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                          {isHi
                            ? 'इस माह का किराया पूर्ण रूप से प्राप्त हो चुका है। कोई बकाया नहीं है।'
                            : 'Rent for this month has been fully cleared. Zero outstanding balance.'}
                        </p>
                        {result.currentMonthBill?.receipt && (
                          <div className="text-xs text-slate-500 mt-0.5 font-medium break-all">
                            {isHi ? 'रसीद संख्या:' : 'Receipt No:'}{' '}
                            <strong className="text-slate-800 font-mono">
                              {result.currentMonthBill.receipt.receipt_number}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // STATUS: PENDING / DUE
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase border border-amber-300">
                          {isHi ? 'चालू माह का किराया बकाया है' : 'Rent Pending'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 font-bold mt-1 break-words">
                          {isHi
                            ? `इस माह की बकाया राशि: ₹${totalOutstanding.toLocaleString('en-IN')}`
                            : `Current Outstanding Dues: ₹${totalOutstanding.toLocaleString('en-IN')}`}
                        </p>
                        <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                          {isHi
                            ? 'कृपया निर्धारित तिथि से पूर्व कार्यालय काउंटर पर नकद / चेक द्वारा भुगतान करें।'
                            : 'Please deposit the due amount at the Zila Panchayat office counter before due date.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for Current Month */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    {/* If Paid: Download Receipt */}
                    {isComplete && result.currentMonthBill?.receipt && (
                      <button
                        type="button"
                        onClick={() =>
                          handlePrintReceipt(
                            result.currentMonthBill!.receipt!.receipt_number,
                            result.currentMonthBill!.billingMonth,
                            result.currentMonthBill!.amountPaid
                          )
                        }
                        className="w-full sm:w-auto flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isHi ? 'रसीद डाउनलोड करें' : 'Download Receipt'}</span>
                      </button>
                    )}

                    {/* Download Full Statement / Ledger */}
                    <button
                      type="button"
                      onClick={handlePrintLedger}
                      className="w-full sm:w-auto flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isHi ? 'खाता विवरण डाउनलोड करें' : 'Download Ledger Statement'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Detailed Rent Ledger & Past Bills Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-navy-950 flex items-center gap-2">
                      <span>{isHi ? 'माहवार किराया खाता बही' : 'Monthly Rent Ledger Trail'}</span>
                    </h3>
                  </div>
                </div>

                {/* Table */}
                <div className="mt-4 -mx-4 sm:mx-0 overflow-x-auto px-4 sm:px-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] sm:text-[11px] tracking-wider">
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">{isHi ? 'माह' : 'Month'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 whitespace-nowrap">{isHi ? 'बिल संख्या' : 'Bill No'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'किराया' : 'Rent'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">18% GST</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'कुल देय' : 'Total Due'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'जमा राशि' : 'Paid'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right whitespace-nowrap">{isHi ? 'बकाया' : 'Balance'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">{isHi ? 'स्थिति' : 'Status'}</th>
                            <th className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">{isHi ? 'रसीद' : 'Receipt'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium bg-white">
                          {result.allBills && result.allBills.length > 0 ? (
                            result.allBills.map((bill) => (
                              <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 font-bold text-navy-950 whitespace-nowrap">{bill.billingMonth}</td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-slate-600 font-mono text-[11px] whitespace-nowrap">{bill.billNumber}</td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right text-slate-700 whitespace-nowrap">
                                  ₹{Number(bill.rentAmount || bill.totalAmountDue || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right text-slate-700 whitespace-nowrap">
                                  ₹{Number(bill.gstAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                                  ₹{bill.totalAmountDue.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right text-emerald-700 font-bold whitespace-nowrap">
                                  ₹{bill.amountPaid.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                  ₹{bill.balanceDue.toLocaleString('en-IN')}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">
                                  {bill.status === 'PAID' ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      {isHi ? 'पूर्ण' : 'PAID'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                      {isHi ? 'लंबित' : 'PENDING'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 sm:py-3 px-2.5 sm:px-3 text-center whitespace-nowrap">
                                  {bill.status === 'PAID' && bill.receiptNumber ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePrintReceipt(bill.receiptNumber!, bill.billingMonth, bill.amountPaid)
                                      }
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>{bill.receiptNumber}</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="py-6 text-center text-slate-500">
                                {isHi ? 'कोई बिल रिकॉर्ड नहीं मिला' : 'No past bill history available'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Important Notice Footer Box */}
                <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                  <p>
                    {isHi
                      ? 'सूचना: जिला पंचायत अल्मोड़ा के नियमों के तहत मासिक किराया प्रत्येक माह की 20 तारीख तक कार्यालय काउंटर पर अनिवार्य रूप से जमा किया जाना चाहिए। किसी भी त्रुटि या संशोधन हेतु कर निरीक्षक से संपर्क करें।'
                      : 'Notice: Monthly commercial rents must be cleared by the 20th of every month at the municipal counter under Zila Panchayat Almora rules.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 🏛️ Official Website Footer */}
      <Footer />
    </div>
  );
};

export default RentalCheckStatusPage;
