import React, { useEffect, useState } from 'react';
import { FileText, Download, Calendar, RefreshCw, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';
import { NoticeItem, NoticeListResponse, rentalNoticeApi } from '../services/rentalNotice.service';

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

  const contentStream = `q\n${pdfW} 0 0 ${pdfH} 0 0 cm\n/Im1 Do\nQ\n`;
  startObj(5);
  pushStr(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  const xrefOffset = currentOffset;
  pushStr('xref\n0 6\n0000000000 65535 f \n');
  for (let id = 1; id <= 5; id++) {
    pushStr(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
  }

  pushStr(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
};

const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] => {
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

const downloadNoticePdf = async (notice: NoticeItem) => {
  const scale = 2;
  const W = 820;
  const padX = 48;
  const contentW = W - padX * 2;
  const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.font = `bold 16px ${fontBase}`;
  const titleLines = wrapLines(tempCtx, notice.title, contentW - 24);
  tempCtx.font = `normal 13.5px ${fontBase}`;
  const bodyLines = wrapLines(tempCtx, notice.message, contentW - 24);

  const H = Math.max(540, 290 + titleLines.length * 24 + bodyLines.length * 22 + 110);
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const [logo1, logo2] = await Promise.all([
    loadImage('/assets/logo1.webp'),
    loadImage('/assets/logo2.webp'),
  ]);
  if (logo1) ctx.drawImage(logo1, padX, 24, 58, 58);
  if (logo2) ctx.drawImage(logo2, W - padX - 58, 24, 58, 58);

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.font = `bold 13px ${fontBase}`;
  ctx.fillText('उत्तराखण्ड शासन • पंचायती राज विभाग', W / 2, 34);
  ctx.font = `800 22px ${fontBase}`;
  ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा', W / 2, 58);
  ctx.font = `600 13px ${fontBase}`;
  ctx.fillText('वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन प्रकोष्ठ', W / 2, 77);
  ctx.font = `bold 15px ${fontBase}`;
  ctx.fillText('सार्वजनिक सूचना एवं प्रशासनिक आदेश', W / 2, 98);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(padX, 114);
  ctx.lineTo(W - padX, 114);
  ctx.moveTo(padX, 142);
  ctx.lineTo(W - padX, 142);
  ctx.stroke();

  const dateStr = new Date(notice.publishedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  ctx.font = `bold 12.5px ${fontBase}`;
  ctx.textAlign = 'left';
  ctx.fillText(`पत्रांक / सूचना सं०: ${notice.noticeNumber}`, padX + 4, 132);
  ctx.textAlign = 'right';
  ctx.fillText(`दिनांक: ${dateStr}`, W - padX - 4, 132);

  let curY = 178;
  ctx.textAlign = 'left';
  ctx.font = `bold 16px ${fontBase}`;
  for (const tl of titleLines) {
    ctx.fillText(tl, padX + 12, curY);
    curY += 24;
  }

  curY += 10;
  ctx.font = `normal 13.5px ${fontBase}`;
  for (const bl of bodyLines) {
    ctx.fillText(bl, padX + 12, curY);
    curY += 22;
  }

  const signY = H - 82;
  ctx.textAlign = 'right';
  ctx.font = `bold 13px ${fontBase}`;
  ctx.fillText('मुख्य अधिकारी / कर अधिकारी', W - padX - 10, signY);
  ctx.font = `normal 11.5px ${fontBase}`;
  ctx.fillText('कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखण्ड)', W - padX - 10, signY + 18);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  const base64 = dataUrl.split(',')[1];
  const raw = atob(base64);
  const jpegBytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) jpegBytes[i] = raw.charCodeAt(i);

  const pdfBlob = jpegToPdfBlob(jpegBytes, canvas.width, canvas.height);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${notice.noticeNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const NoticesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const endpoint = '/rental/notices?category=PUBLIC&limit=20';
  const initialCached = api.peekCache<{ data: NoticeListResponse }>(endpoint)?.data?.data;

  const [notices, setNotices] = useState<NoticeItem[]>(initialCached || []);
  const [loading, setLoading] = useState(!initialCached);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    rentalNoticeApi
      .listNotices({ category: 'PUBLIC', limit: 20 })
      .then((res) => {
        if (!active) return;
        const rows = (res?.data?.data || []).filter((n) => n.category === 'PUBLIC');
        setNotices(rows);
      })
      .catch(() => {
        // Keep currently loaded notices cleanly on transient error
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const formatNoticeDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const isRecentNotice = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    return ms >= 0 && ms < 14 * 24 * 60 * 60 * 1000;
  };

  const handleDownloadPdf = async (item: NoticeItem) => {
    setDownloadingId(item.id);
    try {
      await downloadNoticePdf(item);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section id="notices" className="py-14 sm:py-20 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-2 sm:pt-4 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            {t.notices.title}
          </h2>
          <div className="h-1 w-20 bg-emerald-400 rounded-full mt-3 mb-4" />
        </div>

        {/* Live Published Public Notices */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-10 text-center text-slate-500 flex items-center justify-center gap-2 text-xs font-semibold">
              <span>{isHi ? 'सार्वजनिक सूचनाएं लोड हो रही हैं...' : 'Loading official notices...'}</span>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
              <p className="text-sm font-bold text-slate-700">
                {isHi
                  ? 'वर्तमान में कोई सार्वजनिक सूचना / प्रशासनिक आदेश प्रकाशित नहीं है।'
                  : 'No public notices or administrative orders are published at the moment.'}
              </p>
            </div>
          ) : (
            notices.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 sm:p-5 border border-slate-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                      {isHi ? 'पत्रांक:' : 'Ref:'} {item.noticeNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      {isHi ? 'सार्वजनिक सूचना (Public Notice)' : 'Public Notice'}
                    </span>
                    {item.priority === 'URGENT' && (
                      <span className="bg-red-100 text-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                        {isHi ? 'अति आवश्यक' : 'URGENT'}
                      </span>
                    )}
                    {item.priority === 'IMPORTANT' && (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                        {isHi ? 'महत्वपूर्ण' : 'IMPORTANT'}
                      </span>
                    )}
                    {isRecentNotice(item.publishedAt) && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        {isHi ? 'नवीन' : 'NEW'}
                      </span>
                    )}
                    <span className="text-slate-500 text-xs flex items-center gap-1 ml-auto sm:ml-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatNoticeDate(item.publishedAt)}</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  {item.attachmentUrl && (
                    <a
                      href={item.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0b1b36] border border-slate-300 font-semibold px-3 py-2 rounded-lg text-xs shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isHi ? 'संलग्नक' : 'Attachment'}</span>
                    </a>
                  )}
                  <button
                    type="button"
                    disabled={downloadingId === item.id}
                    onClick={() => handleDownloadPdf(item)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0b1b36] border border-slate-300 font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>{t.common.downloadPdf}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
