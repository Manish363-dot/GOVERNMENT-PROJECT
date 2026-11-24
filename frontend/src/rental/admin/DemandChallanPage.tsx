import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Printer, ArrowLeft, Banknote, Calendar, Eye, FileCheck2 } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useLanguage } from '../context/LanguageContext';
import { rentalBillingApi, BillListItem } from '../services/rentalBilling.service';
import { OfficialStatutoryReceipt } from '../components/OfficialStatutoryReceipt';

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

export const DemandChallanPage: React.FC = () => {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [bill, setBill] = useState<any | null>(null);
  const [tenantBills, setTenantBills] = useState<BillListItem[]>([]);
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<any | null>(null);
  const [printTarget, setPrintTarget] = useState<'challan' | 'receipt'>('challan');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const fetchBillDetails = async () => {
    if (!billId) return;
    setLoading(true);
    setError('');
    try {
      const res = await rentalBillingApi.getBillDetails(billId);
      const data = (res as any)?.data || res;
      if (data && (data.id || data.billNumber || data.bill_number)) {
        setBill(data);
        setSelectedReceiptForView(null);

        // Fetch all monthly bills of this tenant for month-switcher
        const tId = data.user_id || data.userId || data.tenant?.id || data.user?.id;
        if (tId) {
          try {
            const listRes = await rentalBillingApi.listBills({ userId: tId, limit: 100 });
            const allList: BillListItem[] = (listRes as any)?.data?.data || (listRes as any)?.data || [];
            if (Array.isArray(allList)) {
              setTenantBills(allList);
            }
          } catch (e) {
            console.error('Could not load tenant monthly bills list:', e);
          }
        }
      } else {
        setError(isHi ? 'मांग बिल विवरण प्राप्त नहीं हुआ।' : 'Demand bill details not found.');
      }
    } catch (err: any) {
      console.error('Failed to load bill details:', err);
      setError(
        err.message ||
        (isHi
          ? 'शासकीय मांग चालान लोड करने में त्रुटि आई।'
          : 'Error loading official demand challan.')
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetails();
  }, [billId]);

  const handlePrint = () => {
    setPrintTarget('challan');
    setTimeout(() => window.print(), 50);
  };

  const handlePrintReceipt = () => {
    setPrintTarget('receipt');
    setTimeout(() => window.print(), 50);
  };

  const formatMonthDisplay = (monthStr: string) => {
    if (!monthStr) return '—';
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const hiMonths = [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    const enMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    if (monthNum >= 1 && monthNum <= 12) {
      return isHi
        ? `${hiMonths[monthNum - 1]} ${year}`
        : `${enMonths[monthNum - 1]} ${year}`;
    }
    return monthStr;
  };

  // Safe data extraction
  const tenant = bill?.tenant || bill?.user;
  const property = bill?.property;
  const receipts: any[] = bill?.receipts || [];
  const rentAmount = Number(bill?.rent_amount || bill?.rentAmount || 0);
  const arrearsAmount = Number(bill?.arrears_amount || bill?.arrearsAmount || 0);
  const totalDue = Number(bill?.total_amount_due || bill?.totalAmountDue || 0);
  const amountPaid = Number(bill?.amount_paid || bill?.amountPaid || 0);
  const balanceDue = Number(bill?.balance_due || bill?.balanceDue || 0);
  const billNumber = bill?.bill_number || bill?.billNumber || '—';
  const rawBillingMonth = bill?.billing_month || bill?.billingMonth || '';
  const billingMonthDisplay = formatMonthDisplay(rawBillingMonth);

  const dueDateStr = bill?.due_date || bill?.dueDate;
  const formattedDueDate = dueDateStr
    ? new Date(dueDateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '—';

  const isPaid = balanceDue <= 0;
  const isPartiallyPaid = amountPaid > 0 && balanceDue > 0;

  const getStatusText = () => {
    if (isPaid) return isHi ? 'पूर्ण चुकता' : 'PAID';
    if (isPartiallyPaid) return isHi ? 'आंशिक भुगतान' : 'PARTIALLY PAID';
    return isHi ? 'अदत्त / बकाया' : 'UNPAID';
  };

  const handleDownload = async () => {
    if (!bill) return;
    setDownloading(true);
    try {
      const scale = 2;
      const W = 860;
      const extraRowsH = Math.max(0, receipts.length - 1) * 32;
      const H = 730 + extraRowsH;
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
      const padX = 28;
      const innerW = W - padX * 2;

      // White card background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      // 1. Dark Navy Header (#0B3B60)
      const headerH = 128;
      ctx.fillStyle = '#0B3B60';
      ctx.fillRect(0, 0, W, headerH);

      const [logo1, logo2] = await Promise.all([
        loadImage('/assets/logo1.webp'),
        loadImage('/assets/logo2.webp'),
      ]);

      // Left Logo Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(padX, 20, 54, 54);
      if (logo1) ctx.drawImage(logo1, padX + 4, 24, 46, 46);

      // Right Logo Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(W - padX - 54, 20, 54, 54);
      if (logo2) ctx.drawImage(logo2, W - padX - 50, 24, 46, 46);

      // Header Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fcd34d';
      ctx.font = `bold 11px ${fontBase}`;
      ctx.fillText(
        isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'GOVT. OF UTTARAKHAND • PANCHAYATI RAJ',
        padX + 68,
        32
      );

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 20px ${fontBase}`;
      ctx.fillText(
        isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora',
        padX + 68,
        54
      );

      ctx.fillStyle = '#e2e8f0';
      ctx.font = `500 12px ${fontBase}`;
      ctx.fillText(
        isHi ? 'वाणिज्यिक परिसंपत्ति एवं किराया वसूली प्रकोष्ठ' : 'Commercial Asset & Rental Management Cell',
        padX + 68,
        72
      );

      // Divider inside header
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(padX, 90);
      ctx.lineTo(W - padX, 90);
      ctx.stroke();

      ctx.fillStyle = '#fcd34d';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi
          ? 'वाणिज्यिक किराया मांग पत्र एवं समाधान चालान'
          : 'COMMERCIAL RENT DEMAND BILL & SETTLEMENT VOUCHER',
        padX,
        112
      );

      ctx.textAlign = 'right';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `12px monospace`;
      ctx.fillText(isHi ? 'शासकीय राजस्व प्रपत्र' : 'Official Revenue Voucher', W - padX, 112);

      // 2. Metadata Strip
      const metaY = headerH;
      const metaH = 42;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, metaY, W, metaH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(0, metaY + metaH);
      ctx.lineTo(W, metaY + metaH);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = `600 12px ${fontBase}`;
      ctx.fillText(`${isHi ? 'मांग बिल संख्या:' : 'Bill No:'} ${billNumber}`, padX, metaY + 26);
      ctx.fillText(`${isHi ? 'बिल माह:' : 'Billing Month:'} ${billingMonthDisplay}`, padX + 215, metaY + 26);
      ctx.fillText(`${isHi ? 'अंतिम देय तिथि:' : 'Due Date:'} ${formattedDueDate}`, padX + 470, metaY + 26);

      ctx.textAlign = 'right';
      ctx.fillStyle = isPaid ? '#065f46' : isPartiallyPaid ? '#92400e' : '#991b1b';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(`${isHi ? 'स्थिति:' : 'Status:'} ${getStatusText()}`, W - padX, metaY + 26);

      // 3. Section 1: Tenant & Property Particulars
      let curY = metaY + metaH + 22;
      const sec1H = 126;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(padX, curY, innerW, sec1H);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padX + 0.5, curY + 0.5, innerW - 1, 32);
      ctx.beginPath();
      ctx.moveTo(padX, curY + 32);
      ctx.lineTo(padX + innerW, curY + 32);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? '१. किरायेदार एवं आवंटित संपत्ति विवरण' : '1. TENANT & PROPERTY PARTICULARS',
        padX + 14,
        curY + 21
      );
      ctx.textAlign = 'right';
      ctx.fillStyle = '#475569';
      ctx.font = `11px monospace`;
      ctx.fillText(`ID: ${tenant?.user_id || tenant?.userCode || '—'}`, padX + innerW - 14, curY + 21);

      // Left & Right columns in Section 1
      const midX = W / 2;
      ctx.beginPath();
      ctx.moveTo(midX, curY + 32);
      ctx.lineTo(midX, curY + sec1H);
      ctx.stroke();

      const drawPair = (xLeft: number, xRight: number, y: number, label: string, val: string) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = `normal 12px ${fontBase}`;
        ctx.fillText(label, xLeft, y);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold 12.5px ${fontBase}`;
        ctx.fillText(val, xRight, y);
      };

      drawPair(
        padX + 14,
        midX - 14,
        curY + 56,
        isHi ? 'किरायेदार का नाम:' : 'Tenant Name:',
        tenant?.full_name || tenant?.fullName || '—'
      );
      drawPair(
        padX + 14,
        midX - 14,
        curY + 82,
        isHi ? 'मोबाइल नंबर:' : 'Mobile Number:',
        tenant?.mobile || '—'
      );
      drawPair(
        padX + 14,
        midX - 14,
        curY + 108,
        isHi ? 'किरायेदार पहचान कोड:' : 'Tenant Code:',
        tenant?.user_id || tenant?.userCode || '—'
      );

      drawPair(
        midX + 14,
        padX + innerW - 14,
        curY + 56,
        isHi ? 'आवंटित दुकान / संपत्ति सं.:' : 'Property / Shop No:',
        property?.property_number || property?.propertyNumber || '—'
      );
      drawPair(
        midX + 14,
        padX + innerW - 14,
        curY + 82,
        isHi ? 'बाजार / स्थान:' : 'Market / Location:',
        property?.location || 'अल्मोड़ा'
      );
      drawPair(
        midX + 14,
        padX + innerW - 14,
        curY + 108,
        isHi ? 'अंतिम देय तिथि:' : 'Due Date:',
        formattedDueDate
      );

      // 4. Section 2: Demand & Balance Statement
      curY += sec1H + 20;
      const sec2H = 104;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(padX, curY, innerW, sec2H);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padX + 0.5, curY + 0.5, innerW - 1, 32);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padX + 0.5, curY + 32.5, innerW - 1, 30);

      ctx.beginPath();
      ctx.moveTo(padX, curY + 32);
      ctx.lineTo(padX + innerW, curY + 32);
      ctx.moveTo(padX, curY + 62);
      ctx.lineTo(padX + innerW, curY + 62);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? '२. मांग एवं अवशेष लेखा विवरण' : '2. DEMAND & BALANCE STATEMENT',
        padX + 14,
        curY + 21
      );

      const cols2 = [
        { x: padX + 14, align: 'left' as CanvasTextAlign, label: isHi ? 'मासिक किराया' : 'Monthly Rent', val: `₹${rentAmount.toLocaleString('en-IN')}` },
        { x: padX + 210, align: 'center' as CanvasTextAlign, label: isHi ? 'पूर्व अवशेष बकाया' : 'Past Arrears', val: `₹${arrearsAmount.toLocaleString('en-IN')}` },
        { x: padX + 390, align: 'center' as CanvasTextAlign, label: isHi ? 'कुल मांग राशि' : 'Total Demanded', val: `₹${totalDue.toLocaleString('en-IN')}` },
        { x: padX + 560, align: 'center' as CanvasTextAlign, label: isHi ? 'पूर्व जमा' : 'Amount Paid', val: `₹${amountPaid.toLocaleString('en-IN')}` },
        { x: padX + innerW - 14, align: 'right' as CanvasTextAlign, label: isHi ? 'वर्तमान अवशेष देय' : 'Current Outstanding', val: `₹${balanceDue.toLocaleString('en-IN')}` },
      ];

      cols2.forEach((c) => {
        ctx.textAlign = c.align;
        ctx.fillStyle = '#334155';
        ctx.font = `bold 11.5px ${fontBase}`;
        ctx.fillText(c.label, c.x, curY + 51);

        ctx.fillStyle = c.align === 'right' ? (balanceDue > 0 ? '#b91c1c' : '#065f46') : '#0f172a';
        ctx.font = `bold 13px monospace`;
        ctx.fillText(c.val, c.x, curY + 87);
      });

      // 5. Section 3: Issued Receipts & Settlement History
      curY += sec2H + 20;
      const rowsCount = Math.max(1, receipts.length);
      const sec3H = 64 + rowsCount * 32;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(padX, curY, innerW, sec3H);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padX + 0.5, curY + 0.5, innerW - 1, 32);

      ctx.beginPath();
      ctx.moveTo(padX, curY + 32);
      ctx.lineTo(padX + innerW, curY + 32);
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? '३. शासकीय राजस्व रसीदें एवं समाधान प्रविष्टि' : '3. ISSUED RECEIPTS & SETTLEMENT HISTORY',
        padX + 14,
        curY + 21
      );

      if (receipts.length > 0) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(padX + 0.5, curY + 32.5, innerW - 1, 28);
        ctx.beginPath();
        ctx.moveTo(padX, curY + 60);
        ctx.lineTo(padX + innerW, curY + 60);
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.font = `bold 11.5px ${fontBase}`;
        ctx.textAlign = 'left';
        ctx.fillText(isHi ? 'रसीद संख्या' : 'Receipt No.', padX + 14, curY + 50);
        ctx.fillText(isHi ? 'प्रपत्र प्रकार' : 'Form Type', padX + 200, curY + 50);
        ctx.textAlign = 'center';
        ctx.fillText(isHi ? 'जमा दिनांक' : 'Issued Date', padX + 430, curY + 50);
        ctx.textAlign = 'right';
        ctx.fillText(isHi ? 'जमा राशि' : 'Amount Paid', padX + 620, curY + 50);
        ctx.textAlign = 'center';
        ctx.fillText(isHi ? 'स्थिति' : 'Status', padX + innerW - 55, curY + 50);

        receipts.forEach((r, idx) => {
          const rY = curY + 82 + idx * 32;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold 12px monospace`;
          ctx.fillText(String(r.receipt_number || r.receiptNumber || '—'), padX + 14, rY);

          ctx.fillStyle = '#334155';
          ctx.font = `normal 12px ${fontBase}`;
          ctx.fillText(isHi ? 'प्रपत्र संख्या ५ (नियम ४१)' : 'Statutory Form 5', padX + 200, rY);

          ctx.textAlign = 'center';
          ctx.font = `12px monospace`;
          const dt = r.issued_at || r.issuedAt ? new Date(r.issued_at || r.issuedAt).toLocaleDateString('en-IN') : '—';
          ctx.fillText(dt, padX + 430, rY);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold 12px monospace`;
          ctx.fillText(`₹${Number(r.amount_paid || r.amountPaid || 0).toLocaleString('en-IN')}`, padX + 620, rY);

          ctx.textAlign = 'center';
          ctx.fillStyle = '#1e293b';
          ctx.font = `bold 11px ${fontBase}`;
          ctx.fillText(isHi ? 'शासकीय जमा' : 'CREDITED', padX + innerW - 55, rY);
        });
      } else {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#475569';
        ctx.font = `500 12px ${fontBase}`;
        ctx.fillText(
          isHi
            ? 'इस मांग चालान हेतु वर्तमान तक कोई शासकीय रसीद जारी नहीं हुई है (बकाया देय है)।'
            : 'No official receipts issued yet for this demand (Dues pending).',
          W / 2,
          curY + 68
        );
      }

      // 6. Signatures Section
      curY += sec3H + 26;
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(padX, curY);
      ctx.lineTo(padX + innerW, curY);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = `11px monospace`;
      ctx.fillText('— हस्ताक्षर —', padX + 110, curY + 26);
      ctx.fillText('— हस्ताक्षर —', W - padX - 110, curY + 26);

      ctx.fillStyle = '#1e293b';
      ctx.font = `bold 12.5px ${fontBase}`;
      ctx.fillText(isHi ? 'मांग एवं वसूली लिपिक' : 'Demand & Recovery Clerk', padX + 110, curY + 58);
      ctx.fillText(isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat', W / 2, curY + 48);
      ctx.fillText(isHi ? 'कर अधिकारी / मुख्य अधिकारी' : 'Tax Officer / In-Charge', W - padX - 110, curY + 58);

      // Footer note
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(padX, curY + 78);
      ctx.lineTo(padX + innerW, curY + 78);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = `normal 10px ${fontBase}`;
      ctx.fillText(
        isHi
          ? 'यह प्रपत्र जिला पंचायत अल्मोड़ा के व्यावसायिक संपत्ति एवं किराया प्रबंधन पोर्टल द्वारा डिजिटल रूप से संकलित एवं अभिलेखित शासकीय मांग अभिलेख है।'
          : 'This document is a digitally compiled and verified demand record generated by Zila Panchayat Almora Commercial Rental Management System.',
        W / 2,
        curY + 98
      );

      // Export PDF
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
      link.download = `ZPA_Demand_Challan_${billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download demand challan PDF:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout
      title={isHi ? 'व्यावसायिक किराया मांग चालान' : 'Commercial Rent Demand Challan'}
      breadcrumbs={[
        { label: isHi ? 'किराया प्रबंधन' : 'Rent Management', to: '/rental/admin/billing' },
        { label: isHi ? 'मांग चालान एवं समाधान' : 'Demand Challan & Settlement' },
      ]}
    >
      {/* ── PRINT MEDIA STYLES ───────────────────────────────── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          ${
            printTarget === 'receipt'
              ? `
          #official-statutory-receipt-print, #official-statutory-receipt-print * {
            visibility: visible !important;
          }
          #official-statutory-receipt-print {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 6mm 10mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          `
              : `
          #official-demand-challan-document, #official-demand-challan-document * {
            visibility: visible !important;
          }
          #official-demand-challan-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 4mm 8mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 1px solid #000000 !important;
            background: #ffffff !important;
          }
          `
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-5 pb-16 font-sans">
        {/* ── TOP ACTION BAR (No Print) ────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print bg-white border border-slate-300 rounded-lg px-4 py-2.5 shadow-2xs">
          <button
            type="button"
            onClick={() => navigate('/rental/admin/billing')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-100 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHi ? 'किराया प्रबंधन पर वापस लौटें' : 'Back to Rent Management'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !bill}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-800 border border-slate-300 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-700" />
              <span>
                {downloading
                  ? isHi
                    ? 'डाउनलोड हो रहा है...'
                    : 'Downloading...'
                  : isHi
                    ? 'पीडीएफ डाउनलोड करें'
                    : 'Download PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!bill}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white border border-slate-900 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHi ? 'चालान प्रिंट करें' : 'Print Challan'}</span>
            </button>

            {balanceDue > 0 && billId && (
              <button
                type="button"
                onClick={() => navigate(`/rental/admin/collect-rent/${billId}`)}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 rounded-md text-xs font-bold transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>{isHi ? 'किराया जमा करें' : 'Collect Rent'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── ERROR ALERT ───────────────────────────────────────── */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg text-red-900 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-950 font-black text-lg px-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* ── LOADING SKELETON ─────────────────────────────────── */}
        {loading ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="w-8 h-8 border-3 border-indigo-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {isHi ? 'शासकीय मांग चालान लोड हो रहा है...' : 'Loading official demand challan...'}
            </p>
          </div>
        ) : !bill ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <p className="text-base font-bold text-slate-800">
              {isHi ? 'संबंधित मांग चालान अभिलेख उपलब्ध नहीं है।' : 'Demand challan record not found.'}
            </p>
            <button
              onClick={() => navigate('/rental/admin/billing')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              {isHi ? 'बिलिंग सूची पर लौटें' : 'Return to Billing List'}
            </button>
          </div>
        ) : (
          <>
            {/* ── MONTH SELECTOR & RECEIPT BAR (No Print) ── */}
            {tenantBills.length > 0 && (
              <div className="no-print bg-white border border-slate-300 rounded-lg px-4 py-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-700 shrink-0" />
                    <span className="text-xs font-bold text-slate-800">
                      {isHi
                        ? 'माह के अनुसार किराया स्थिति एवं रसीद देखें:'
                        : 'Select Billing Month to View Status & Receipt:'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={bill.id}
                      onChange={(e) => {
                        if (e.target.value && e.target.value !== bill.id) {
                          navigate(`/rental/admin/demand-challan/${e.target.value}`);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 cursor-pointer"
                    >
                      {tenantBills.map((tb) => {
                        const tbPaid = tb.balanceDue <= 0 || tb.status === 'PAID';
                        const tbPartial = tb.amountPaid > 0 && tb.balanceDue > 0;
                        const statusLabel = tbPaid
                          ? isHi
                            ? '✓ पूर्ण चुकता'
                            : '✓ PAID'
                          : tbPartial
                            ? isHi
                              ? '◐ आंशिक बकाया'
                              : '◐ PARTIAL'
                            : isHi
                              ? '⚠ बकाया'
                              : '⚠ PENDING';
                        return (
                          <option key={tb.id} value={tb.id}>
                            {formatMonthDisplay(tb.billingMonth)} — {statusLabel} (₹{Number(tb.totalAmountDue || 0).toLocaleString('en-IN')})
                          </option>
                        );
                      })}
                    </select>

                    {receipts.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedReceiptForView(selectedReceiptForView ? null : receipts[0])
                        }
                        className={`px-3.5 py-1.5 rounded-md text-xs font-bold border transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5 ${
                          selectedReceiptForView
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          {selectedReceiptForView
                            ? isHi
                              ? 'रसीद बंद करें'
                              : 'Hide Receipt'
                            : isHi
                              ? 'रसीद देखें / डाउनलोड'
                              : 'View / Download Receipt'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SELECTED MONTH STATUTORY FORM 5 RECEIPT VIEW, DOWNLOAD & PRINT (AT TOP) ── */}
            {selectedReceiptForView && (
              <div
                id="monthly-statutory-receipt-section"
                className="space-y-2.5 animate-in fade-in duration-300"
              >
                <div className="max-w-2xl mx-auto no-print flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isHi
                        ? `माह ${billingMonthDisplay} की जारी शासकीय किराया रसीद (प्रपत्र संख्या ५):`
                        : `Issued Official Rent Receipt (Form 5) for ${billingMonthDisplay}:`}
                    </span>
                  </div>
                  {receipts.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      {receipts.map((r, i) => {
                        const rNo = r.receipt_number || r.receiptNumber;
                        const active =
                          (selectedReceiptForView.receipt_number || selectedReceiptForView.receiptNumber) === rNo;
                        return (
                          <button
                            key={r.id || i}
                            type="button"
                            onClick={() => setSelectedReceiptForView(r)}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border cursor-pointer ${
                              active
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            #{rNo}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-6 shadow-xs">
                  <OfficialStatutoryReceipt
                    data={{
                      receiptNumber:
                        selectedReceiptForView.receipt_number ||
                        selectedReceiptForView.receiptNumber ||
                        '286480',
                      bookNumber: `B-${new Date().getFullYear()}/${property?.property_number || property?.propertyNumber || '01'}`,
                      demandRegisterNumber: tenant?.user_id || tenant?.userCode || 'TENANT',
                      tenantName: tenant?.full_name || tenant?.fullName || '—',
                      shopNumber: property?.property_number || property?.propertyNumber,
                      location: property?.location,
                      amount: Number(
                        selectedReceiptForView.amount_paid || selectedReceiptForView.amountPaid || amountPaid || 0
                      ),
                      isFullPayment: balanceDue <= 0,
                      billNumber,
                      billingMonth: billingMonthDisplay,
                      place: 'अल्मोड़ा',
                      dateStr:
                        selectedReceiptForView.issued_at || selectedReceiptForView.issuedAt
                          ? new Date(
                              selectedReceiptForView.issued_at || selectedReceiptForView.issuedAt
                            ).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : formattedDueDate,
                    }}
                    onPrint={handlePrintReceipt}
                    onClose={() => setSelectedReceiptForView(null)}
                  />
                </div>
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════
               OFFICIAL GOVERNMENT DEMAND CHALLAN DOCUMENT
               ═════════════════════════════════════════════════════════ */}
            <div
              id="official-demand-challan-document"
              className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden text-slate-900"
            >
            {/* 1. Official Government Header (Exact match with CollectRentPage) */}
            <div className="bg-[#0B3B60] text-white p-6 relative">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Uttarakhand State Emblem */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src="/assets/logo1.webp"
                      alt="Emblem of Uttarakhand"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
                      {isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'Govt. of Uttarakhand • Panchayati Raj'}
                    </div>
                    <h2 className="text-base sm:text-xl font-extrabold tracking-wide text-white">
                      {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                    </h2>
                    <p className="text-xs text-slate-200 font-medium">
                      {isHi
                        ? 'वाणिज्यिक परिसंपत्ति एवं किराया वसूली प्रकोष्ठ'
                        : 'Commercial Asset & Rental Management Cell'}
                    </p>
                  </div>
                </div>

                {/* Right: Panchayati Raj Logo */}
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img
                      src="/assets/logo2.webp"
                      alt="Panchayati Raj Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Title & Type Strip */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-amber-300">
                  {isHi
                    ? 'वाणिज्यिक किराया मांग पत्र एवं समाधान चालान'
                    : 'Commercial Rent Demand Bill & Settlement Voucher'}
                </span>
                <span className="font-mono text-slate-200">
                  {isHi ? 'शासकीय राजस्व प्रपत्र' : 'Official Revenue Voucher'}
                </span>
              </div>
            </div>

            {/* 2. Metadata Strip */}
            <div className="bg-slate-100 border-b border-slate-300 px-6 py-3 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'मांग बिल संख्या:' : 'Bill No:'}</span>
                <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                  {billNumber}
                </strong>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-600 font-semibold">{isHi ? 'बिल माह:' : 'Billing Month:'}</span>
                {tenantBills.length > 1 ? (
                  <select
                    value={bill.id}
                    onChange={(e) => {
                      if (e.target.value && e.target.value !== bill.id) {
                        navigate(`/rental/admin/demand-challan/${e.target.value}`);
                      }
                    }}
                    className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-600"
                  >
                    {tenantBills.map((tb) => (
                      <option key={tb.id} value={tb.id}>
                        {formatMonthDisplay(tb.billingMonth)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong className="font-mono text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 font-bold">
                    {billingMonthDisplay}
                  </strong>
                )}

                {receipts.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedReceiptForView(selectedReceiptForView ? null : receipts[0])
                    }
                    className="no-print inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>
                      {selectedReceiptForView
                        ? isHi
                          ? 'रसीद बंद करें'
                          : 'Hide Receipt'
                        : isHi
                          ? 'रसीद देखें / डाउनलोड'
                          : 'View / Download Receipt'}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'अंतिम देय तिथि:' : 'Due Date:'}</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                  {formattedDueDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-semibold">{isHi ? 'स्थिति:' : 'Status:'}</span>
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${isPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : isPartiallyPaid
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>

            {/* 3. Document Body (Clean, Official, No Extra Colors/Icons) */}
            <div className="p-6 sm:p-7 space-y-6">
              {/* भाग १: किरायेदार एवं आवंटित संपत्ति विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                  <span>{isHi ? '१. किरायेदार एवं आवंटित संपत्ति विवरण' : '1. Tenant & Property Particulars'}</span>
                  <span className="text-[11px] font-mono text-slate-600 font-normal">
                    {isHi ? 'पहचान सं.:' : 'ID:'} {tenant?.user_id || tenant?.userCode || '—'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'किरायेदार का नाम:' : 'Tenant Name:'}</span>
                      <strong className="text-slate-900 text-sm font-bold">
                        {tenant?.full_name || tenant?.fullName || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'मोबाइल नंबर:' : 'Mobile Number:'}</span>
                      <span className="font-mono font-bold text-slate-900">{tenant?.mobile || '—'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'किरायेदार पहचान कोड:' : 'Tenant Code:'}</span>
                      <span className="font-mono text-slate-800">{tenant?.user_id || tenant?.userCode || '—'}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'आवंटित दुकान / संपत्ति सं.:' : 'Property / Shop No:'}</span>
                      <strong className="text-slate-900 text-sm font-bold font-mono">
                        {property?.property_number || property?.propertyNumber || '—'}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'बाजार / स्थान:' : 'Market / Location:'}</span>
                      <span className="font-medium text-slate-900">{property?.location || 'अल्मोड़ा'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{isHi ? 'अंतिम देय तिथि:' : 'Due Date:'}</span>
                      <span className="font-mono text-slate-900 font-medium">{formattedDueDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* भाग २: मांग एवं अवशेष लेखा विवरण */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isHi ? '२. मांग एवं अवशेष लेखा विवरण' : '2. Demand & Balance Statement'}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2.5 px-4 text-left">{isHi ? 'मासिक किराया' : 'Monthly Rent'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'पूर्व अवशेष बकाया' : 'Past Arrears'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'कुल मांग राशि' : 'Total Demanded'}</th>
                        <th className="py-2.5 px-4 text-center">{isHi ? 'पूर्व जमा' : 'Amount Paid'}</th>
                        <th className="py-2.5 px-4 text-right font-bold">{isHi ? 'वर्तमान अवशेष देय' : 'Current Outstanding'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          ₹{rentAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                          ₹{arrearsAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                          ₹{totalDue.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-700">
                          ₹{amountPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded ${balanceDue > 0
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                          >
                            ₹{balanceDue.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* भाग ३: शासकीय राजस्व रसीदें एवं समाधान प्रविष्टि */}
              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isHi ? '३. शासकीय राजस्व रसीदें एवं समाधान प्रविष्टि' : '3. Issued Receipts & Settlement History'}
                </div>

                {receipts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100/80 border-b border-slate-300 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 text-left">{isHi ? 'रसीद संख्या' : 'Receipt No.'}</th>
                          <th className="py-2.5 px-4 text-left">{isHi ? 'प्रपत्र प्रकार' : 'Form Type'}</th>
                          <th className="py-2.5 px-4 text-center">{isHi ? 'जमा दिनांक' : 'Issued Date'}</th>
                          <th className="py-2.5 px-4 text-right">{isHi ? 'जमा राशि' : 'Amount Paid'}</th>
                          <th className="py-2.5 px-4 text-center">{isHi ? 'स्थिति' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {receipts.map((r, idx) => (
                          <tr key={r.id || idx}>
                            <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                              {r.receipt_number || r.receiptNumber}
                            </td>
                            <td className="py-2.5 px-4 text-slate-700">
                              {isHi ? 'प्रपत्र संख्या ५ (नियम ४१)' : 'Statutory Form 5'}
                            </td>
                            <td className="py-2.5 px-4 text-center font-mono text-slate-700">
                              {r.issued_at || r.issuedAt
                                ? new Date(r.issued_at || r.issuedAt).toLocaleDateString('en-IN')
                                : '—'}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₹{Number(r.amount_paid || r.amountPaid || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 rounded">
                                {isHi ? 'शासकीय जमा' : 'CREDITED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-xs text-slate-600 font-medium">
                      {isHi
                        ? 'इस मांग चालान हेतु वर्तमान तक कोई शासकीय रसीद जारी नहीं हुई है (बकाया देय है)।'
                        : 'No official receipts issued yet for this demand (Dues pending).'}
                    </p>
                    {balanceDue > 0 && billId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/rental/admin/collect-rent/${billId}`)}
                        className="inline-flex items-center px-4 py-2 bg-[#0B3B60] hover:bg-slate-900 text-white rounded-md text-xs font-bold transition shadow-2xs cursor-pointer"
                      >
                        {isHi ? 'कार्यालय काउंटर पर किराया जमा करें' : 'Accept Payment at Counter'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* भाग ४: शासकीय अधोहस्ताक्षर एवं मुहर खंड */}
              <div className="pt-6 border-t border-slate-300">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  <div className="space-y-8">
                    <div className="text-slate-400 font-mono text-[11px]">{isHi ? '— हस्ताक्षर —' : '— Signature —'}</div>
                    <div className="font-bold text-slate-800">
                      {isHi ? 'मांग एवं वसूली लिपिक' : 'Demand & Recovery Clerk'}
                    </div>
                  </div>

                  <div className="space-y-6">

                    <div className="font-bold text-slate-800">
                      {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat'}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="text-slate-400 font-mono text-[11px]">{isHi ? '— हस्ताक्षर —' : '— Signature —'}</div>
                    <div className="font-bold text-slate-800">
                      {isHi ? 'कर अधिकारी / मुख्य अधिकारी' : 'Tax Officer / In-Charge'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  {isHi
                    ? 'यह प्रपत्र जिला पंचायत अल्मोड़ा के व्यावसायिक संपत्ति एवं किराया प्रबंधन पोर्टल द्वारा डिजिटल रूप से संकलित एवं अभिलेखित शासकीय मांग अभिलेख है।'
                    : 'This document is a digitally compiled and verified demand record generated by Zila Panchayat Almora Commercial Rental Management System.'}
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DemandChallanPage;
