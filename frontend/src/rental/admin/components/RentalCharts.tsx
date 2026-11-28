import React, { useState, useEffect, useMemo, SVGProps } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, Maximize2, Printer, X } from 'lucide-react';

export const True3DBar = (
  props: SVGProps<SVGRectElement> & {
    dataKey?: string;
    payload?: any;
    index?: number;
  }
) => {
  const { fill, x, y, width, height } = props;
  const barX = Number(x || 0);
  const barY = Number(y || 0);
  const barWidth = Number(width || 0);
  const barHeight = Number(height || 0);

  if (barHeight <= 1 || barWidth <= 0) {
    return null;
  }

  const depth = Math.max(2.5, Math.min(barWidth * 0.36, 9));

  return (
    <g>
      {/* Back depth shadow */}
      <rect
        x={barX + depth}
        y={barY - depth}
        width={barWidth}
        height={barHeight}
        fill={fill}
        opacity={0.32}
        rx={1.5}
      />

      {/* Right 3D angled side face */}
      <polygon
        points={`
          ${barX + barWidth},${barY}
          ${barX + barWidth + depth},${barY - depth}
          ${barX + barWidth + depth},${barY + barHeight - depth}
          ${barX + barWidth},${barY + barHeight}
        `}
        fill={fill}
        opacity={0.72}
      />

      {/* Top 3D cap face */}
      <polygon
        points={`
          ${barX},${barY}
          ${barX + barWidth},${barY}
          ${barX + barWidth + depth},${barY - depth}
          ${barX + depth},${barY - depth}
        `}
        fill={fill}
        opacity={0.9}
      />

      {/* Front main face */}
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill={fill}
        rx={1.5}
      />
    </g>
  );
};

export interface MonthlyTrendPoint {
  month: string;
  year?: number;
  monthNum?: number;
  label: string;
  labelHi?: string;
  baseBilled?: number;
  gstBilled?: number;
  billed: number;
  collected: number;
  overdue: number;
}

export interface YearlyMonthPoint {
  month: string;
  monthNum: number;
  label: string;
  labelHi: string;
  fullLabel: string;
  fullLabelHi: string;
  target: number;
  achieved: number;
  remaining: number;
  overdue?: number;
  achievedPct: number;
}

interface YearlyTargetGraphProps {
  monthlyTarget?: number;
  currentMonth?: string;
  availableYears?: number[];
  yearlyTrends?: Record<string, YearlyMonthPoint[]>;
  fallbackTrends?: MonthlyTrendPoint[];
  isHi?: boolean;
}

const EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HI_SHORT = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];
const EN_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HI_FULL = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

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

export const YearlyTargetGraphChart: React.FC<YearlyTargetGraphProps> = ({
  monthlyTarget = 0,
  currentMonth,
  availableYears = [],
  yearlyTrends = {},
  fallbackTrends = [],
  isHi,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const resolvedCurrentMonth =
    currentMonth || `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const yearsList = useMemo(() => {
    if (availableYears.length > 0) return availableYears;
    return [currentYear, currentYear - 1, currentYear - 2];
  }, [availableYears, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(yearsList[0] || currentYear);
  const [isPresenting, setIsPresenting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (yearsList.length > 0 && !yearsList.includes(selectedYear)) {
      setSelectedYear(yearsList[0]);
    }
  }, [yearsList, selectedYear]);

  const effectiveTarget = Math.round(Number(monthlyTarget || 0) * 100) / 100;

  const chartData = useMemo(() => {
    const fromBackend = yearlyTrends[String(selectedYear)];

    return Array.from({ length: 12 }, (_, idx) => {
      const mStr = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
      const isFutureMonth = mStr > resolvedCurrentMonth;

      const pt = fromBackend?.find((p) => p.month === mStr);
      const fb = fallbackTrends.find((t) => t.month === mStr);

      const rawCollected = pt ? pt.achieved : fb?.collected || 0;
      const collectionVal: number | null = isFutureMonth ? null : rawCollected;

      const isAchieved =
        !isFutureMonth && effectiveTarget > 0 && rawCollected >= effectiveTarget;
      const pct =
        !isFutureMonth && effectiveTarget > 0
          ? Math.min(100, Math.round((rawCollected / effectiveTarget) * 100))
          : 0;
      const shortfall =
        !isFutureMonth && effectiveTarget > 0
          ? Math.max(0, Math.round((effectiveTarget - rawCollected) * 100) / 100)
          : 0;

      return {
        month: mStr,
        monthNum: idx + 1,
        shortLabelHi: HI_SHORT[idx],
        shortLabelEn: EN_SHORT[idx],
        fullMonthHi: HI_FULL[idx],
        fullMonthEn: EN_FULL[idx],
        displayLabel: isHi ? HI_SHORT[idx] : EN_SHORT[idx],
        displayFullLabel: isHi
          ? `${HI_FULL[idx]} ${selectedYear}`
          : `${EN_FULL[idx]} ${selectedYear}`,
        targetLine: effectiveTarget,
        collection: collectionVal,
        rawCollected,
        isFutureMonth,
        isAchieved,
        pct,
        shortfall,
      };
    });
  }, [yearlyTrends, fallbackTrends, selectedYear, resolvedCurrentMonth, effectiveTarget, isHi]);

  const summary = useMemo(() => {
    const activeMonths = chartData.filter((d) => !d.isFutureMonth);
    const totalTargetElapsed = activeMonths.length * effectiveTarget;
    const totalCollectedInYear = activeMonths.reduce((s, d) => s + d.rawCollected, 0);
    const totalShortfallInYear = activeMonths.reduce((s, d) => s + d.shortfall, 0);
    const achievedMonthsCount = activeMonths.filter((d) => d.isAchieved).length;
    return {
      totalTargetElapsed,
      totalCollectedInYear,
      totalShortfallInYear,
      achievedMonthsCount,
      elapsedMonthsCount: activeMonths.length,
    };
  }, [chartData, effectiveTarget]);

  const hasData =
    effectiveTarget > 0 || chartData.some((d) => (d.rawCollected || 0) > 0);
  const fmt = (v: number) => '₹' + Number(v || 0).toLocaleString('en-IN');

  const getStatusText = (row: (typeof chartData)[number]) => {
    if (row.isFutureMonth) return isHi ? 'आगामी माह' : 'Upcoming';
    if (effectiveTarget <= 0) return '—';
    if (row.isAchieved) return isHi ? 'लक्ष्य पूर्ण' : 'Achieved';
    if (row.rawCollected > 0) return isHi ? `आंशिक (${row.pct}%)` : `Partial (${row.pct}%)`;
    return isHi ? 'लंबित' : 'Pending';
  };

  /**
   * Generates a crisp A4 Official PDF Report for the selected year (Graph + 12-Month Table)
   */
  const handleDownloadYearlyPdf = async () => {
    setDownloadingPdf(true);
    try {
      const scale = 2;
      const W = 900;
      const H = 1240;
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      // Pure White Page
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      const fontBase = "'Noto Sans Devanagari', 'Segoe UI', Arial, sans-serif";
      const padX = 48;
      const contentW = W - padX * 2;

      // Outer Official Border
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, W - 48, H - 48);

      // Load Official Logos
      const [logoLeft, logoRight] = await Promise.all([
        loadImage('/assets/logo1.webp'),
        loadImage('/assets/logo2.webp'),
      ]);

      if (logoLeft) ctx.drawImage(logoLeft, padX, 42, 60, 60);
      if (logoRight) ctx.drawImage(logoRight, W - padX - 60, 42, 60, 60);

      // Official Header Text (Pure Black)
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'GOVT. OF UTTARAKHAND • PANCHAYATI RAJ DEPT.',
        W / 2,
        52
      );

      ctx.font = `bold 22px ${fontBase}`;
      ctx.fillText(
        isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'OFFICE OF ZILA PANCHAYAT ALMORA',
        W / 2,
        80
      );

      ctx.font = `bold 15px ${fontBase}`;
      ctx.fillText(
        isHi
          ? `वार्षिक किराया लक्ष्य एवं माहवार वसूली प्रतिवेदन — वर्ष ${selectedYear}`
          : `Annual Rent Target & Monthly Collection Report — Year ${selectedYear}`,
        W / 2,
        104
      );

      const genDateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillStyle = '#334155';
      ctx.fillText(
        isHi ? `प्रतिवेदन जारी दिनांक: ${genDateStr}` : `Report Date: ${genDateStr}`,
        W / 2,
        122
      );

      // Divider Line
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(padX, 136);
      ctx.lineTo(W - padX, 136);
      ctx.stroke();

      // 1. Summary Strip Box (4 Columns, Pure Black Text)
      const sumY = 152;
      const sumH = 58;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, sumY, contentW, sumH);

      const sumItems = [
        {
          label: isHi ? 'चयनित वर्ष' : 'Selected Year',
          val: String(selectedYear),
        },
        {
          label: isHi ? 'मासिक निर्धारित लक्ष्य' : 'Monthly Target',
          val: fmt(effectiveTarget),
        },
        {
          label: isHi ? 'वर्ष में कुल वसूली' : 'Total Collected',
          val: fmt(summary.totalCollectedInYear),
        },
        {
          label: isHi ? 'लक्ष्य पूर्ण माह' : 'Target Achieved',
          val: isHi
            ? `${summary.achievedMonthsCount} / ${summary.elapsedMonthsCount} माह`
            : `${summary.achievedMonthsCount} / ${summary.elapsedMonthsCount} Months`,
        },
      ];

      const colW = contentW / 4;
      sumItems.forEach((it, idx) => {
        const x = padX + idx * colW;
        if (idx > 0) {
          ctx.beginPath();
          ctx.moveTo(x, sumY);
          ctx.lineTo(x, sumY + sumH);
          ctx.stroke();
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = `bold 11px ${fontBase}`;
        ctx.fillText(it.label, x + 14, sumY + 22);

        ctx.fillStyle = '#000000';
        ctx.font = `bold 16px ${fontBase}`;
        ctx.fillText(it.val, x + 14, sumY + 45);
      });

      // 2. Graph Section Drawn on Canvas (Colored Graph Lines Only)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi
          ? '१. माहवार लक्ष्य बनाम वसूली ग्राफ:'
          : '1. Monthly Target vs Collection Graph:',
        padX,
        236
      );

      // Legend on Right
      ctx.font = `bold 11px ${fontBase}`;
      ctx.strokeStyle = '#0B3B60';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(W - padX - 270, 232);
      ctx.lineTo(W - padX - 246, 232);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#000000';
      ctx.fillText(isHi ? 'मुख्य लक्ष्य रेखा' : 'Target Line', W - padX - 240, 236);

      ctx.fillStyle = '#047857';
      ctx.beginPath();
      ctx.arc(W - padX - 120, 232, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillText(isHi ? 'मासिक वसूली रेखा' : 'Collection Line', W - padX - 110, 236);

      const gBoxX = padX;
      const gBoxY = 248;
      const gBoxW = contentW;
      const gBoxH = 240;

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(gBoxX, gBoxY, gBoxW, gBoxH);

      const plotLeft = gBoxX + 64;
      const plotRight = gBoxX + gBoxW - 26;
      const plotTop = gBoxY + 24;
      const plotBottom = gBoxY + gBoxH - 34;
      const plotW = plotRight - plotLeft;
      const plotH = plotBottom - plotTop;

      const maxValRaw = Math.max(
        effectiveTarget,
        ...chartData.map((d) => d.rawCollected || 0),
        1000
      );
      const yMax = Math.ceil((maxValRaw * 1.2) / 500) * 500;

      // Grid lines + Y labels
      const ySteps = 4;
      for (let s = 0; s <= ySteps; s++) {
        const val = Math.round((yMax / ySteps) * s);
        const yPos = plotBottom - (s / ySteps) * plotH;
        ctx.strokeStyle = s === 0 ? '#94a3b8' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plotLeft, yPos);
        ctx.lineTo(plotRight, yPos);
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.textAlign = 'right';
        ctx.font = `normal 10px ${fontBase}`;
        const lbl = val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `₹${val}`;
        ctx.fillText(lbl, plotLeft - 8, yPos + 3.5);
      }

      const getX = (i: number) => plotLeft + (i / 11) * plotW;
      const getY = (v: number) => plotBottom - Math.min(1, Math.max(0, v / yMax)) * plotH;

      // X-axis month labels
      chartData.forEach((d, idx) => {
        const xPos = getX(idx);
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.font = `bold 11px ${fontBase}`;
        ctx.fillText(d.displayLabel, xPos, plotBottom + 20);
      });

      // Main Target Horizontal Dashed Line (#0B3B60)
      if (effectiveTarget > 0) {
        const targetY = getY(effectiveTarget);
        ctx.strokeStyle = '#0B3B60';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(plotLeft, targetY);
        ctx.lineTo(plotRight, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Collection Shaded Area & Line (#047857)
      const validPoints = chartData
        .map((d, idx) => ({ ...d, idx }))
        .filter((d) => !d.isFutureMonth && d.collection !== null);

      if (validPoints.length > 0) {
        // Soft Fill
        const grad = ctx.createLinearGradient(0, plotTop, 0, plotBottom);
        grad.addColorStop(0, 'rgba(5, 150, 105, 0.18)');
        grad.addColorStop(1, 'rgba(5, 150, 105, 0.02)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(getX(validPoints[0].idx), plotBottom);
        validPoints.forEach((pt) => {
          ctx.lineTo(getX(pt.idx), getY(pt.rawCollected));
        });
        ctx.lineTo(getX(validPoints[validPoints.length - 1].idx), plotBottom);
        ctx.closePath();
        ctx.fill();

        // Stroke Line
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        validPoints.forEach((pt, i) => {
          const px = getX(pt.idx);
          const py = getY(pt.rawCollected);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Dots
        validPoints.forEach((pt) => {
          const px = getX(pt.idx);
          const py = getY(pt.rawCollected);
          ctx.beginPath();
          ctx.arc(px, py, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = pt.isAchieved ? '#047857' : '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#047857';
          ctx.stroke();
        });
      }

      // 3. 12-Month Detailed Table (Pure Black Official Borders & Text)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi
          ? `२. माहवार किराया लक्ष्य एवं वसूली विवरण तालिका (${selectedYear}):`
          : `2. Month-wise Rent Target & Collection Statement (${selectedYear}):`,
        padX,
        516
      );

      const tblTop = 528;
      const rowH = 38;
      const cols = [
        { w: 54, align: 'center' as const, header: isHi ? 'क्र.' : 'S.No.' },
        { w: 160, align: 'left' as const, header: isHi ? 'माह' : 'Month' },
        { w: 150, align: 'right' as const, header: isHi ? 'मासिक लक्ष्य' : 'Monthly Target' },
        { w: 150, align: 'right' as const, header: isHi ? 'प्राप्त वसूली' : 'Collected' },
        { w: 140, align: 'right' as const, header: isHi ? 'शेष अंतर' : 'Shortfall' },
        { w: contentW - 654, align: 'center' as const, header: isHi ? 'लक्ष्य स्थिति' : 'Status' },
      ];

      // Table Header Background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padX, tblTop, contentW, rowH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, tblTop, contentW, rowH);

      let curX = padX;
      cols.forEach((c, idx) => {
        if (idx > 0) {
          ctx.beginPath();
          ctx.moveTo(curX, tblTop);
          ctx.lineTo(curX, tblTop + rowH);
          ctx.stroke();
        }
        ctx.fillStyle = '#000000';
        ctx.font = `bold 12px ${fontBase}`;
        ctx.textAlign = c.align;
        const tx =
          c.align === 'center'
            ? curX + c.w / 2
            : c.align === 'right'
              ? curX + c.w - 12
              : curX + 12;
        ctx.fillText(c.header, tx, tblTop + 24);
        curX += c.w;
      });

      // 12 Month Rows
      chartData.forEach((row, rIdx) => {
        const ry = tblTop + rowH * (rIdx + 1);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(padX, ry, contentW, rowH);

        const rowCells = [
          String(rIdx + 1),
          isHi ? `${row.fullMonthHi} ${selectedYear}` : `${row.fullMonthEn} ${selectedYear}`,
          fmt(row.targetLine),
          row.isFutureMonth ? '—' : fmt(row.rawCollected),
          row.isFutureMonth ? '—' : fmt(row.shortfall),
          getStatusText(row),
        ];

        let rx = padX;
        cols.forEach((c, cIdx) => {
          if (cIdx > 0) {
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx, ry + rowH);
            ctx.stroke();
          }
          ctx.fillStyle = '#000000';
          ctx.font = cIdx === 1 || cIdx === 3 ? `bold 12px ${fontBase}` : `normal 12px ${fontBase}`;
          ctx.textAlign = c.align;
          const tx =
            c.align === 'center'
              ? rx + c.w / 2
              : c.align === 'right'
                ? rx + c.w - 12
                : rx + 12;
          ctx.fillText(rowCells[cIdx], tx, ry + 24);
          rx += c.w;
        });
      });

      // Total Footer Row
      const totalY = tblTop + rowH * 13;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padX, totalY, contentW, rowH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(padX, totalY, contentW, rowH);

      const totalCells = [
        '',
        isHi ? `कुल योग (${summary.elapsedMonthsCount} माह)` : `Total (${summary.elapsedMonthsCount} mo)`,
        fmt(summary.totalTargetElapsed),
        fmt(summary.totalCollectedInYear),
        fmt(summary.totalShortfallInYear),
        `${summary.achievedMonthsCount} / ${summary.elapsedMonthsCount}`,
      ];

      let txCursor = padX;
      cols.forEach((c, cIdx) => {
        if (cIdx > 0) {
          ctx.beginPath();
          ctx.moveTo(txCursor, totalY);
          ctx.lineTo(txCursor, totalY + rowH);
          ctx.stroke();
        }
        ctx.fillStyle = '#000000';
        ctx.font = `bold 12px ${fontBase}`;
        ctx.textAlign = c.align;
        const tx =
          c.align === 'center'
            ? txCursor + c.w / 2
            : c.align === 'right'
              ? txCursor + c.w - 12
              : txCursor + 12;
        ctx.fillText(totalCells[cIdx], tx, totalY + 24);
        txCursor += c.w;
      });

      // Official Signatures at Bottom
      const sigY = H - 88;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? 'प्रभारी किराया एवं संपत्ति प्रकोष्ठ' : 'In-Charge, Rent & Asset Cell',
        padX,
        sigY
      );
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(
        isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora',
        padX,
        sigY + 18
      );

      ctx.textAlign = 'right';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? 'अपर मुख्य अधिकारी / प्राधिकृत अधिकारी' : 'Additional Chief Officer / Authorized Signatory',
        W - padX,
        sigY
      );
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(
        isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora',
        W - padX,
        sigY + 18
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const binStr = atob(dataUrl.split(',')[1]);
      const jpegBytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        jpegBytes[i] = binStr.charCodeAt(i);
      }

      const pdfBlob = jpegToPdfBlob(jpegBytes, canvas.width, canvas.height);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ZPA_Yearly_Rent_Report_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const renderGraphSvg = (heightClass = 'h-64', gradientSuffix = 'main') => (
    <div className={`${heightClass} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 14, right: 16, bottom: 4, left: 4 }}>
          <defs>
            <linearGradient id={`collectionGreenArea-${gradientSuffix}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="displayLabel"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tickMargin={8}
            tick={{ fill: '#0f172a', fontSize: 11.5, fontWeight: 600 }}
          />
          <YAxis
            domain={[
              0,
              (dataMax: number) => {
                const peak = Math.max(Number(dataMax || 0), effectiveTarget);
                return peak > 0 ? Math.ceil((peak * 1.2) / 100) * 100 : 1000;
              },
            ]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) =>
              val >= 100000
                ? `₹${(val / 100000).toFixed(1)}L`
                : val >= 1000
                  ? `₹${(val / 1000).toFixed(0)}k`
                  : `₹${val}`
            }
            tick={{ fill: '#334155', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as (typeof chartData)[number];
              return (
                <div className="rounded-lg bg-white text-slate-900 p-3 shadow-lg border border-slate-300 text-xs space-y-1.5 min-w-[210px]">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
                    <span>{row.displayFullLabel}</span>
                    {!row.isFutureMonth && effectiveTarget > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-900 border border-slate-300">
                        {row.isAchieved
                          ? isHi
                            ? '✓ लक्ष्य पूर्ण'
                            : '✓ Achieved'
                          : `${row.pct}%`}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">
                      {isHi ? 'मासिक लक्ष्य:' : 'Monthly Target:'}
                    </span>
                    <span className="font-bold font-mono text-slate-900">
                      {fmt(row.targetLine)}
                    </span>
                  </div>

                  {row.isFutureMonth ? (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      {isHi ? 'आगामी माह (अभी देय नहीं)' : 'Upcoming month'}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-600">
                          {isHi ? 'प्राप्त वसूली:' : 'Collected:'}
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {fmt(row.rawCollected)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-200">
                        <span className="text-slate-600">{isHi ? 'स्थिति:' : 'Status:'}</span>
                        <span className="font-bold font-mono text-slate-900">
                          {row.isAchieved
                            ? isHi
                              ? 'लक्ष्य पूरा हुआ'
                              : 'Target Achieved'
                            : `${fmt(row.shortfall)} ${isHi ? 'शेष' : 'short'}`}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            }}
          />

          {/* 1. MAIN HORIZONTAL TARGET LINE */}
          <Area
            type="linear"
            dataKey="targetLine"
            stroke="#0B3B60"
            strokeWidth={2}
            strokeDasharray="6 4"
            fill="none"
            dot={false}
            activeDot={{ r: 4, fill: '#0B3B60', stroke: '#ffffff', strokeWidth: 1.5 }}
            isAnimationActive={false}
          />

          {/* 2. MONTHLY COLLECTION LINE */}
          <Area
            type="linear"
            dataKey="collection"
            stroke="#047857"
            strokeWidth={2.5}
            fill={`url(#collectionGreenArea-${gradientSuffix})`}
            connectNulls={false}
            dot={(dotProps: any) => {
              const { cx, cy, payload } = dotProps;
              if (
                cx == null ||
                cy == null ||
                !payload ||
                payload.isFutureMonth ||
                payload.collection == null
              ) {
                return <g key={`empty-${payload?.month || cx}`} />;
              }
              const achieved = payload.isAchieved;
              return (
                <circle
                  key={`dot-${payload.month}`}
                  cx={cx}
                  cy={cy}
                  r={achieved ? 4.5 : 4}
                  fill={achieved ? '#047857' : '#ffffff'}
                  stroke={achieved ? '#ffffff' : '#047857'}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6, fill: '#047857', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <div className="bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        {/* Official Header with Year Selector + Present + PDF Download */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isHi
                ? 'मासिक किराया लक्ष्य बनाम वसूली ग्राफ'
                : 'Monthly Rent Target vs Collection Graph'}
            </h3>

          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-800">
                {isHi ? 'वर्ष:' : 'Year:'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-slate-600 cursor-pointer"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsPresenting(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'प्रस्तुत करें' : 'Present'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadYearlyPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingPdf
                  ? isHi
                    ? 'तैयार हो रहा है...'
                    : 'Generating...'
                  : isHi
                    ? 'वार्षिक रिपोर्ट डाउनलोड करें'
                    : 'Download PDF Report'}
              </span>
            </button>
          </div>
        </div>

        {/* Clean 2-Line Graph Body (Zero Duplicate Stat Boxes) */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-4 text-xs pb-3 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dashed border-[#0B3B60] inline-block" />
                <span className="text-slate-900 font-bold">
                  {isHi ? 'मुख्य लक्ष्य रेखा' : 'Main Target Line'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
                <span className="text-slate-900 font-bold">
                  {isHi ? 'मासिक वसूली रेखा' : 'Monthly Collection Line'}
                </span>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-700">
              {isHi
                ? `लक्ष्य पूर्ण माह (${selectedYear}): ${summary.achievedMonthsCount} / ${summary.elapsedMonthsCount} माह`
                : `Target Achieved (${selectedYear}): ${summary.achievedMonthsCount} / ${summary.elapsedMonthsCount} months`}
            </span>
          </div>

          {!hasData ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-slate-50 px-4 text-center">
              <p className="text-xs font-semibold text-slate-600">
                {isHi
                  ? `वर्ष ${selectedYear} के लिए कोई किराया वसूली डेटा उपलब्ध नहीं है।`
                  : `No rent collection records found for year ${selectedYear}.`}
              </p>
            </div>
          ) : (
            renderGraphSvg('h-64', 'card')
          )}
        </div>
      </div>

      {/* ── FULL-SCREEN OFFICIAL PRESENTATION & REPORT MODAL ── */}
      {isPresenting && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 overflow-y-auto p-3 sm:p-6 flex flex-col items-center"
          onClick={() => setIsPresenting(false)}
        >
          {/* Top Action Bar (Hidden in Print) */}
          <div
            className="no-print w-full max-w-5xl bg-white rounded-t-xl border border-b-0 border-slate-300 px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                {isHi ? 'आधिकारिक प्रस्तुति एवं वार्षिक प्रतिवेदन' : 'Official Presentation & Annual Report'}
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-bold text-slate-900 cursor-pointer"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {isHi ? `वर्ष ${yr}` : `Year ${yr}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadYearlyPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHi ? 'पीडीएफ डाउनलोड करें' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रिंट करें' : 'Print'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPresenting(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isHi ? 'बंद करें' : 'Close'}</span>
              </button>
            </div>
          </div>

          {/* Printable / Presentable Official Sheet */}
          <div
            id="official-yearly-graph-report-print"
            className="w-full max-w-5xl bg-white border border-slate-300 rounded-b-xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Official Government Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
              <img
                src="/assets/logo1.webp"
                alt="Uttarakhand Emblem"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-center flex-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'Govt. of Uttarakhand • Panchayati Raj Department'}
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                </h2>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {isHi
                    ? `वार्षिक किराया लक्ष्य एवं माहवार वसूली प्रगति प्रतिवेदन — वर्ष ${selectedYear}`
                    : `Annual Rent Target & Monthly Collection Progress Report — Year ${selectedYear}`}
                </p>
              </div>
              <img
                src="/assets/logo2.webp"
                alt="Panchayati Raj Emblem"
                className="w-14 h-14 object-contain shrink-0"
              />
            </div>

            {/* Summary Strip (Monochrome Black Text) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'चयनित वर्ष' : 'Selected Year'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">{selectedYear}</p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'मासिक निर्धारित लक्ष्य' : 'Monthly Target'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">{fmt(effectiveTarget)}</p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'वर्ष में कुल वसूली' : 'Total Collected'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                  {fmt(summary.totalCollectedInYear)}
                </p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'लक्ष्य पूर्ण माह' : 'Target Achieved'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                  {summary.achievedMonthsCount} / {summary.elapsedMonthsCount}{' '}
                  {isHi ? 'माह' : 'months'}
                </p>
              </div>
            </div>

            {/* Large Presentation Graph */}
            <div className="border border-slate-300 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 flex-wrap gap-2">
                <h4 className="text-xs font-bold uppercase text-slate-900">
                  {isHi
                    ? '१. माहवार लक्ष्य बनाम वास्तविक वसूली ग्राफ'
                    : '1. Monthly Target vs Actual Collection Graph'}
                </h4>
                <div className="flex items-center gap-5 text-xs font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-5 border-t-2 border-dashed border-[#0B3B60] inline-block" />
                    {isHi ? 'मुख्य लक्ष्य रेखा' : 'Main Target Line'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block" />
                    {isHi ? 'मासिक वसूली रेखा' : 'Monthly Collection Line'}
                  </span>
                </div>
              </div>
              {renderGraphSvg('h-72', 'modal')}
            </div>

            {/* Full 12-Month Official Statement Table */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                {isHi
                  ? `२. माहवार किराया लक्ष्य एवं वसूली विवरण तालिका (जनवरी – दिसंबर ${selectedYear})`
                  : `2. Month-wise Rent Target & Collection Statement (Jan – Dec ${selectedYear})`}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-900 text-slate-900">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                      <th className="border border-slate-900 py-2 px-3 text-center w-12">
                        {isHi ? 'क्र.' : 'S.No.'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-left">
                        {isHi ? 'माह' : 'Month'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'मासिक लक्ष्य' : 'Monthly Target'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'प्राप्त वसूली' : 'Collected'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'शेष अंतर' : 'Shortfall'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-center">
                        {isHi ? 'लक्ष्य स्थिति' : 'Status'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((r, idx) => (
                      <tr key={r.month} className="border-b border-slate-300">
                        <td className="border border-slate-400 py-2 px-3 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 font-bold">
                          {r.displayFullLabel}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono">
                          {fmt(r.targetLine)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono font-bold">
                          {r.isFutureMonth ? '—' : fmt(r.rawCollected)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono">
                          {r.isFutureMonth ? '—' : fmt(r.shortfall)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-center font-semibold">
                          {getStatusText(r)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                      <td className="border border-slate-900 py-2.5 px-3" />
                      <td className="border border-slate-900 py-2.5 px-3">
                        {isHi
                          ? `कुल योग (${summary.elapsedMonthsCount} माह)`
                          : `Total (${summary.elapsedMonthsCount} Months)`}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalTargetElapsed)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalCollectedInYear)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalShortfallInYear)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-center font-mono">
                        {summary.achievedMonthsCount} / {summary.elapsedMonthsCount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="pt-8 flex items-end justify-between text-xs text-slate-900">
              <div>
                <p className="font-bold">
                  {isHi ? 'प्रभारी किराया एवं संपत्ति प्रकोष्ठ' : 'In-Charge, Rent & Asset Cell'}
                </p>
                <p className="text-slate-600">
                  {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {isHi
                    ? 'अपर मुख्य अधिकारी / प्राधिकृत अधिकारी'
                    : 'Additional Chief Officer / Authorized Signatory'}
                </p>
                <p className="text-slate-600">
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


interface Yearly3DBarChartProps {
  currentMonth?: string;
  availableYears?: number[];
  yearlyTrends?: Record<string, YearlyMonthPoint[]>;
  fallbackTrends?: MonthlyTrendPoint[];
  isHi?: boolean;
}

type SegmentType = 'collected' | 'remaining' | 'overdue';

const SEGMENT_SHADES: Record<
  SegmentType,
  { top: string; frontStart: string; frontEnd: string; side: string; stroke: string }
> = {
  collected: {
    top: '#34d399',
    frontStart: '#10b981',
    frontEnd: '#047857',
    side: '#064e3b',
    stroke: '#065f46',
  },
  remaining: {
    top: '#fbbf24',
    frontStart: '#f59e0b',
    frontEnd: '#b45309',
    side: '#78350f',
    stroke: '#92400e',
  },
  overdue: {
    top: '#f87171',
    frontStart: '#ef4444',
    frontEnd: '#b91c1c',
    side: '#7f1d1d',
    stroke: '#991b1b',
  },
};

const Stacked3DPrismBar = (props: any) => {
  const { x, y, width, height, payload, segmentKey, gradPrefix } = props as {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    payload?: any;
    segmentKey: SegmentType;
    gradPrefix: string;
  };

  if (x == null || y == null || width == null || height == null || !payload) return null;

  const bx = Number(x);
  const by = Number(y);
  const bw = Number(width);
  const bh = Number(height);

  const dx = Math.round(Math.min(Math.max(bw * 0.34, 6), 10));
  const dy = Math.round(dx * 0.72);

  const cVal = Number(payload.collected || 0);
  const rVal = Number(payload.remaining || 0);
  const oVal = Number(payload.overdue || 0);
  const totalVal = cVal + rVal + oVal;

  // Draw a neat 3D slate pedestal slot on the floor when a month has 0 data
  if (totalVal <= 0) {
    if (segmentKey !== 'collected') return null;
    const padH = 3;
    const baseTopY = by - padH;
    return (
      <g>
        <rect x={bx} y={baseTopY} width={bw} height={padH} fill="#cbd5e1" />
        <polygon
          points={`${bx},${baseTopY} ${bx + bw},${baseTopY} ${bx + bw + dx},${baseTopY - dy} ${bx + dx},${baseTopY - dy}`}
          fill="#e2e8f0"
          stroke="#cbd5e1"
          strokeWidth={0.6}
        />
        <polygon
          points={`${bx + bw},${baseTopY} ${bx + bw + dx},${baseTopY - dy} ${bx + bw + dx},${by - dy} ${bx + bw},${by}`}
          fill="#94a3b8"
        />
      </g>
    );
  }

  if (bh <= 0.5) return null;

  const isBottom =
    (segmentKey === 'collected' && cVal > 0) ||
    (segmentKey === 'remaining' && rVal > 0 && cVal <= 0) ||
    (segmentKey === 'overdue' && oVal > 0 && cVal <= 0 && rVal <= 0);

  const isTop =
    (segmentKey === 'overdue' && oVal > 0) ||
    (segmentKey === 'remaining' && rVal > 0 && oVal <= 0) ||
    (segmentKey === 'collected' && cVal > 0 && rVal <= 0 && oVal <= 0);

  const shades = SEGMENT_SHADES[segmentKey];
  const compactTotal =
    totalVal >= 100000
      ? `₹${(totalVal / 100000).toFixed(1)}L`
      : totalVal >= 10000
        ? `₹${(totalVal / 1000).toFixed(1)}k`
        : `₹${totalVal.toLocaleString('en-IN')}`;

  return (
    <g>
      {/* Subtle 3D cast floor shadow under bottom segment */}
      {isBottom && (
        <polygon
          points={`${bx + 3},${by + 1} ${bx + bw + 4},${by + 1} ${bx + bw + dx + 5},${by - dy + 1} ${bx + dx + 2},${by - dy + 1}`}
          fill="rgba(15, 23, 42, 0.12)"
        />
      )}

      {/* Front lit face */}
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        fill={`url(#prismFront-${segmentKey}-${gradPrefix})`}
        stroke={shades.stroke}
        strokeWidth={0.4}
      />

      {/* Right shaded 3D isometric wall */}
      <polygon
        points={`${bx + bw},${by} ${bx + bw + dx},${by - dy} ${bx + bw + dx},${by + bh - dy} ${bx + bw},${by + bh}`}
        fill={shades.side}
        stroke={shades.stroke}
        strokeWidth={0.4}
      />

      {/* Sunlit 3D top parallelogram lid + compact value label on topmost segment */}
      {isTop && (
        <>
          <polygon
            points={`${bx},${by} ${bx + bw},${by} ${bx + bw + dx},${by - dy} ${bx + dx},${by - dy}`}
            fill={shades.top}
            stroke={shades.stroke}
            strokeWidth={0.5}
          />
          <line
            x1={bx + 0.5}
            y1={by}
            x2={bx + bw - 0.5}
            y2={by}
            stroke="rgba(255,255,255,0.65)"
            strokeWidth={1}
          />
          <text
            x={bx + bw / 2 + dx / 2}
            y={by - dy - 6}
            textAnchor="middle"
            fill="#0f172a"
            fontSize={9.5}
            fontWeight={700}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {compactTotal}
          </text>
        </>
      )}
    </g>
  );
};

export const Yearly3DBarChart: React.FC<Yearly3DBarChartProps> = ({
  currentMonth,
  availableYears = [],
  yearlyTrends = {},
  fallbackTrends = [],
  isHi,
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const resolvedCurrentMonth =
    currentMonth || `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const yearsList = useMemo(() => {
    if (availableYears.length > 0) return availableYears;
    return [currentYear, currentYear - 1, currentYear - 2];
  }, [availableYears, currentYear]);

  const [selectedYear, setSelectedYear] = useState<number>(yearsList[0] || currentYear);
  const [isPresenting, setIsPresenting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (yearsList.length > 0 && !yearsList.includes(selectedYear)) {
      setSelectedYear(yearsList[0]);
    }
  }, [yearsList, selectedYear]);

  const chartData = useMemo(() => {
    const fromBackend = yearlyTrends[String(selectedYear)];

    return Array.from({ length: 12 }, (_, idx) => {
      const mStr = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
      const isFutureMonth = mStr > resolvedCurrentMonth;

      if (isFutureMonth) {
        return {
          month: mStr,
          fullMonthHi: HI_FULL[idx],
          fullMonthEn: EN_FULL[idx],
          displayLabel: isHi ? HI_SHORT[idx] : EN_SHORT[idx],
          displayFullLabel: isHi
            ? `${HI_FULL[idx]} ${selectedYear}`
            : `${EN_FULL[idx]} ${selectedYear}`,
          collected: 0,
          remaining: 0,
          overdue: 0,
          totalDemand: 0,
          isFutureMonth: true,
        };
      }

      const pt = fromBackend?.find((p) => p.month === mStr);
      const fb = fallbackTrends.find((t) => t.month === mStr);

      const collected = pt ? pt.achieved : fb?.collected || 0;
      const totalUnpaid = pt
        ? Number(pt.remaining || 0) + Number(pt.overdue || 0)
        : Number(fb?.overdue || 0);

      // Current month unpaid = Remaining; previous months unpaid = Overdue
      const remaining = mStr >= resolvedCurrentMonth ? totalUnpaid : 0;
      const overdue = mStr < resolvedCurrentMonth ? totalUnpaid : 0;
      const totalDemand = Math.round((collected + remaining + overdue) * 100) / 100;

      return {
        month: mStr,
        fullMonthHi: HI_FULL[idx],
        fullMonthEn: EN_FULL[idx],
        displayLabel: isHi ? HI_SHORT[idx] : EN_SHORT[idx],
        displayFullLabel: isHi
          ? `${HI_FULL[idx]} ${selectedYear}`
          : `${EN_FULL[idx]} ${selectedYear}`,
        collected,
        remaining,
        overdue,
        totalDemand,
        isFutureMonth: false,
      };
    });
  }, [yearlyTrends, fallbackTrends, selectedYear, resolvedCurrentMonth, isHi]);

  const summary = useMemo(() => {
    const active = chartData.filter((d) => !d.isFutureMonth);
    const totalCollected = active.reduce((s, d) => s + d.collected, 0);
    const totalRemaining = active.reduce((s, d) => s + d.remaining, 0);
    const totalOverdue = active.reduce((s, d) => s + d.overdue, 0);
    const totalDemand = active.reduce((s, d) => s + d.totalDemand, 0);
    return {
      totalDemand,
      totalCollected,
      totalRemaining,
      totalOverdue,
      elapsedMonths: active.length,
    };
  }, [chartData]);

  const axisScale = useMemo(() => {
    const peak = Math.max(
      ...chartData.map((d) => d.collected + d.remaining + d.overdue),
      1000
    );
    const rawStep = (peak * 1.25) / 4;
    const magnitude = rawStep >= 5000 ? 1000 : 500;
    const step = Math.max(500, Math.ceil(rawStep / magnitude) * magnitude);
    const max = step * 4;
    return {
      max,
      ticks: [0, step, step * 2, step * 3, max],
    };
  }, [chartData]);

  const hasAnyValue = chartData.some(
    (d) => d.collected > 0 || d.remaining > 0 || d.overdue > 0
  );
  const fmt = (v: number) => '₹' + Number(v || 0).toLocaleString('en-IN');

  const getRowStatusText = (r: (typeof chartData)[number]) => {
    if (r.isFutureMonth) return isHi ? 'आगामी माह' : 'Upcoming';
    if (r.totalDemand <= 0) return '—';
    if (r.overdue > 0) return isHi ? 'ओवरड्यू बकाया' : 'Overdue';
    if (r.remaining > 0) return isHi ? 'आंशिक / शेष' : 'Remaining Due';
    return isHi ? 'पूर्ण वसूली' : 'Paid';
  };

  /**
   * Generates a crisp A4 Official PDF with True 3D Isometric Bars + 12-Month Table
   */
  const handleDownload3DPdf = async () => {
    setDownloadingPdf(true);
    try {
      const scale = 2;
      const W = 900;
      const H = 1240;
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

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(24, 24, W - 48, H - 48);

      const [logoLeft, logoRight] = await Promise.all([
        loadImage('/assets/logo1.webp'),
        loadImage('/assets/logo2.webp'),
      ]);
      if (logoLeft) ctx.drawImage(logoLeft, padX, 42, 60, 60);
      if (logoRight) ctx.drawImage(logoRight, W - padX - 60, 42, 60, 60);

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'GOVT. OF UTTARAKHAND • PANCHAYATI RAJ DEPT.',
        W / 2,
        52
      );
      ctx.font = `bold 22px ${fontBase}`;
      ctx.fillText(
        isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'OFFICE OF ZILA PANCHAYAT ALMORA',
        W / 2,
        80
      );
      ctx.font = `bold 15px ${fontBase}`;
      ctx.fillText(
        isHi
          ? `माहवार वसूली, शेष एवं ओवरड्यू 3D प्रतिवेदन — वर्ष ${selectedYear}`
          : `Monthly Collected, Remaining & Overdue 3D Report — Year ${selectedYear}`,
        W / 2,
        104
      );

      const genDateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillStyle = '#334155';
      ctx.fillText(
        isHi ? `प्रतिवेदन जारी दिनांक: ${genDateStr}` : `Report Date: ${genDateStr}`,
        W / 2,
        122
      );

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(padX, 136);
      ctx.lineTo(W - padX, 136);
      ctx.stroke();

      // Summary Strip (4 Columns, Pure Black Text)
      const sumY = 152;
      const sumH = 58;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, sumY, contentW, sumH);

      const sumItems = [
        { label: isHi ? 'चयनित वर्ष' : 'Selected Year', val: String(selectedYear) },
        { label: isHi ? 'कुल प्राप्त वसूली' : 'Total Collected', val: fmt(summary.totalCollected) },
        { label: isHi ? 'चालू शेष किराया' : 'Current Remaining', val: fmt(summary.totalRemaining) },
        { label: isHi ? 'ओवरड्यू बकाया' : 'Past Overdue', val: fmt(summary.totalOverdue) },
      ];

      const colW = contentW / 4;
      sumItems.forEach((it, idx) => {
        const x = padX + idx * colW;
        if (idx > 0) {
          ctx.beginPath();
          ctx.moveTo(x, sumY);
          ctx.lineTo(x, sumY + sumH);
          ctx.stroke();
        }
        ctx.textAlign = 'left';
        ctx.fillStyle = '#475569';
        ctx.font = `bold 11px ${fontBase}`;
        ctx.fillText(it.label, x + 14, sumY + 22);

        ctx.fillStyle = '#000000';
        ctx.font = `bold 16px ${fontBase}`;
        ctx.fillText(it.val, x + 14, sumY + 45);
      });

      // 1. True 3D Isometric Stacked Column Chart on Canvas
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi
          ? '१. माहवार 3D स्तंभ चार्ट (वसूली, शेष एवं ओवरड्यू):'
          : '1. Monthly 3D Column Chart (Collected, Remaining & Overdue):',
        padX,
        236
      );

      // Legend
      const legendItems = [
        { color: '#10b981', label: isHi ? 'प्राप्त वसूली' : 'Collected', offset: 280 },
        { color: '#f59e0b', label: isHi ? 'शेष बचा' : 'Remaining', offset: 175 },
        { color: '#ef4444', label: isHi ? 'ओवरड्यू' : 'Overdue', offset: 80 },
      ];
      ctx.font = `bold 11px ${fontBase}`;
      legendItems.forEach((lg) => {
        ctx.fillStyle = lg.color;
        ctx.fillRect(W - padX - lg.offset, 226, 10, 10);
        ctx.fillStyle = '#000000';
        ctx.fillText(lg.label, W - padX - lg.offset + 15, 235);
      });

      const gBoxX = padX;
      const gBoxY = 248;
      const gBoxW = contentW;
      const gBoxH = 244;
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(gBoxX, gBoxY, gBoxW, gBoxH);

      const plotLeft = gBoxX + 64;
      const plotRight = gBoxX + gBoxW - 28;
      const plotTop = gBoxY + 28;
      const plotBottom = gBoxY + gBoxH - 34;
      const plotW = plotRight - plotLeft;
      const plotH = plotBottom - plotTop;

      const yMax = axisScale.max;
      axisScale.ticks.forEach((val, idx) => {
        const yPos = plotBottom - (val / yMax) * plotH;
        ctx.strokeStyle = idx === 0 ? '#94a3b8' : '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plotLeft, yPos);
        ctx.lineTo(plotRight, yPos);
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.textAlign = 'right';
        ctx.font = `normal 10px ${fontBase}`;
        const lbl = val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k` : `₹${val}`;
        ctx.fillText(lbl, plotLeft - 8, yPos + 3.5);
      });

      const slotW = plotW / 12;
      const barW = 24;
      const dx = 8;
      const dy = 6;

      const drawPrismSegment = (
        bx: number,
        by: number,
        bh: number,
        seg: SegmentType,
        isTopSeg: boolean
      ) => {
        const sh = SEGMENT_SHADES[seg];
        const grad = ctx.createLinearGradient(0, by, 0, by + bh);
        grad.addColorStop(0, sh.frontStart);
        grad.addColorStop(1, sh.frontEnd);
        ctx.fillStyle = grad;
        ctx.fillRect(bx, by, barW, bh);

        // Right 3D side wall
        ctx.fillStyle = sh.side;
        ctx.beginPath();
        ctx.moveTo(bx + barW, by);
        ctx.lineTo(bx + barW + dx, by - dy);
        ctx.lineTo(bx + barW + dx, by + bh - dy);
        ctx.lineTo(bx + barW, by + bh);
        ctx.closePath();
        ctx.fill();

        if (isTopSeg) {
          ctx.fillStyle = sh.top;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + barW, by);
          ctx.lineTo(bx + barW + dx, by - dy);
          ctx.lineTo(bx + dx, by - dy);
          ctx.closePath();
          ctx.fill();
        }
      };

      chartData.forEach((d, idx) => {
        const centerX = plotLeft + slotW * idx + slotW / 2;
        const bx = centerX - barW / 2 - dx / 2;

        // Month X label
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.font = `bold 11px ${fontBase}`;
        ctx.fillText(d.displayLabel, centerX, plotBottom + 20);

        const total = d.collected + d.remaining + d.overdue;
        if (total <= 0) {
          // 3D Floor pedestal tile
          const padH = 3;
          const py = plotBottom - padH;
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(bx, py, barW, padH);
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.moveTo(bx, py);
          ctx.lineTo(bx + barW, py);
          ctx.lineTo(bx + barW + dx, py - dy);
          ctx.lineTo(bx + dx, py - dy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(bx + barW, py);
          ctx.lineTo(bx + barW + dx, py - dy);
          ctx.lineTo(bx + barW + dx, plotBottom - dy);
          ctx.lineTo(bx + barW, plotBottom);
          ctx.closePath();
          ctx.fill();
          return;
        }

        let cursorY = plotBottom;
        const allSegments: Array<{ key: SegmentType; val: number }> = [
          { key: 'collected', val: d.collected },
          { key: 'remaining', val: d.remaining },
          { key: 'overdue', val: d.overdue },
        ];
        const segments = allSegments.filter((s) => s.val > 0);

        segments.forEach((seg, sIdx) => {
          const segH = Math.max(2, (seg.val / yMax) * plotH);
          const segTopY = cursorY - segH;
          const isTopSeg = sIdx === segments.length - 1;
          drawPrismSegment(bx, segTopY, segH, seg.key, isTopSeg);
          cursorY = segTopY;
        });

        // Value label above top cap
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.font = `bold 9.5px ${fontBase}`;
        const valText =
          total >= 10000 ? `₹${(total / 1000).toFixed(1)}k` : `₹${total.toLocaleString('en-IN')}`;
        ctx.fillText(valText, bx + barW / 2 + dx / 2, cursorY - dy - 5);
      });

      // 2. 12-Month Detailed Table
      ctx.textAlign = 'left';
      ctx.fillStyle = '#000000';
      ctx.font = `bold 13px ${fontBase}`;
      ctx.fillText(
        isHi
          ? `२. माहवार किराया वसूली, शेष एवं ओवरड्यू विवरण तालिका (${selectedYear}):`
          : `2. Month-wise Collected, Remaining & Overdue Statement (${selectedYear}):`,
        padX,
        518
      );

      const tblTop = 530;
      const rowH = 38;
      const cols = [
        { w: 48, align: 'center' as const, header: isHi ? 'क्र.' : 'S.No.' },
        { w: 148, align: 'left' as const, header: isHi ? 'माह' : 'Month' },
        { w: 132, align: 'right' as const, header: isHi ? 'कुल बिल मांग' : 'Total Demand' },
        { w: 132, align: 'right' as const, header: isHi ? 'प्राप्त वसूली' : 'Collected' },
        { w: 124, align: 'right' as const, header: isHi ? 'चालू शेष' : 'Remaining' },
        { w: 124, align: 'right' as const, header: isHi ? 'ओवरड्यू' : 'Overdue' },
        { w: contentW - 708, align: 'center' as const, header: isHi ? 'स्थिति' : 'Status' },
      ];

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(padX, tblTop, contentW, rowH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.strokeRect(padX, tblTop, contentW, rowH);

      let curX = padX;
      cols.forEach((c, idx) => {
        if (idx > 0) {
          ctx.beginPath();
          ctx.moveTo(curX, tblTop);
          ctx.lineTo(curX, tblTop + rowH);
          ctx.stroke();
        }
        ctx.fillStyle = '#000000';
        ctx.font = `bold 11.5px ${fontBase}`;
        ctx.textAlign = c.align;
        const tx =
          c.align === 'center'
            ? curX + c.w / 2
            : c.align === 'right'
              ? curX + c.w - 10
              : curX + 10;
        ctx.fillText(c.header, tx, tblTop + 24);
        curX += c.w;
      });

      chartData.forEach((row, rIdx) => {
        const ry = tblTop + rowH * (rIdx + 1);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(padX, ry, contentW, rowH);

        const rowCells = [
          String(rIdx + 1),
          isHi ? `${row.fullMonthHi} ${selectedYear}` : `${row.fullMonthEn} ${selectedYear}`,
          row.isFutureMonth ? '—' : fmt(row.totalDemand),
          row.isFutureMonth ? '—' : fmt(row.collected),
          row.isFutureMonth ? '—' : fmt(row.remaining),
          row.isFutureMonth ? '—' : fmt(row.overdue),
          getRowStatusText(row),
        ];

        let rx = padX;
        cols.forEach((c, cIdx) => {
          if (cIdx > 0) {
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx, ry + rowH);
            ctx.stroke();
          }
          ctx.fillStyle = '#000000';
          ctx.font = cIdx === 1 || cIdx === 3 ? `bold 11.5px ${fontBase}` : `normal 11.5px ${fontBase}`;
          ctx.textAlign = c.align;
          const tx =
            c.align === 'center'
              ? rx + c.w / 2
              : c.align === 'right'
                ? rx + c.w - 10
                : rx + 10;
          ctx.fillText(rowCells[cIdx], tx, ry + 24);
          rx += c.w;
        });
      });

      // Total Row
      const totalY = tblTop + rowH * 13;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padX, totalY, contentW, rowH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(padX, totalY, contentW, rowH);

      const totalCells = [
        '',
        isHi ? `कुल योग (${summary.elapsedMonths} माह)` : `Total (${summary.elapsedMonths} mo)`,
        fmt(summary.totalDemand),
        fmt(summary.totalCollected),
        fmt(summary.totalRemaining),
        fmt(summary.totalOverdue),
        '—',
      ];

      let txCursor = padX;
      cols.forEach((c, cIdx) => {
        if (cIdx > 0) {
          ctx.beginPath();
          ctx.moveTo(txCursor, totalY);
          ctx.lineTo(txCursor, totalY + rowH);
          ctx.stroke();
        }
        ctx.fillStyle = '#000000';
        ctx.font = `bold 11.5px ${fontBase}`;
        ctx.textAlign = c.align;
        const tx =
          c.align === 'center'
            ? txCursor + c.w / 2
            : c.align === 'right'
              ? txCursor + c.w - 10
              : txCursor + 10;
        ctx.fillText(totalCells[cIdx], tx, totalY + 24);
        txCursor += c.w;
      });

      // Official Signatures
      const sigY = H - 86;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? 'प्रभारी किराया एवं संपत्ति प्रकोष्ठ' : 'In-Charge, Rent & Asset Cell',
        padX,
        sigY
      );
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora', padX, sigY + 18);

      ctx.textAlign = 'right';
      ctx.font = `bold 12px ${fontBase}`;
      ctx.fillText(
        isHi ? 'अपर मुख्य अधिकारी / प्राधिकृत अधिकारी' : 'Additional Chief Officer / Authorized Signatory',
        W - padX,
        sigY
      );
      ctx.font = `normal 11px ${fontBase}`;
      ctx.fillText(
        isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora',
        W - padX,
        sigY + 18
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const binStr = atob(dataUrl.split(',')[1]);
      const jpegBytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        jpegBytes[i] = binStr.charCodeAt(i);
      }

      const pdfBlob = jpegToPdfBlob(jpegBytes, canvas.width, canvas.height);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ZPA_Monthly_3D_Rent_Report_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const render3DBarChartSvg = (heightClass = 'h-64', gradPrefix = 'card', barWidth = 24) => (
    <div className={`${heightClass} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 24, right: 18, bottom: 4, left: 2 }}
        >
          <defs>
            <linearGradient id={`prismFront-collected-${gradPrefix}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id={`prismFront-remaining-${gradPrefix}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id={`prismFront-overdue-${gradPrefix}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="displayLabel"
            interval={0}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
            tickMargin={8}
            tick={{ fill: '#0f172a', fontSize: 11.5, fontWeight: 600 }}
          />
          <YAxis
            domain={[0, axisScale.max]}
            ticks={axisScale.ticks}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) =>
              val >= 100000
                ? `₹${(val / 100000).toFixed(1)}L`
                : val >= 1000
                  ? `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`
                  : `₹${val}`
            }
            tick={{ fill: '#334155', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.65)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as (typeof chartData)[number];
              return (
                <div className="rounded-lg bg-white text-slate-900 p-3 shadow-lg border border-slate-300 text-xs space-y-1.5 min-w-[205px]">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-3">
                    <span>{row.displayFullLabel}</span>
                    {!row.isFutureMonth && row.totalDemand > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-900 border border-slate-300">
                        {getRowStatusText(row)}
                      </span>
                    )}
                  </div>
                  {row.isFutureMonth ? (
                    <div className="text-[11px] text-slate-500">
                      {isHi ? 'आगामी माह (अभी देय नहीं)' : 'Upcoming month'}
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-600">
                          {isHi ? 'कुल बिल मांग:' : 'Total Demand:'}
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {fmt(row.totalDemand)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-600">
                          {isHi ? 'प्राप्त वसूली:' : 'Collected:'}
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {fmt(row.collected)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-600">
                          {isHi ? 'शेष बचा:' : 'Remaining:'}
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {fmt(row.remaining)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 pt-1 border-t border-slate-200">
                        <span className="text-slate-600">
                          {isHi ? 'ओवरड्यू:' : 'Overdue:'}
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {fmt(row.overdue)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            }}
          />
          <Bar
            dataKey="collected"
            stackId="rent3d"
            barSize={barWidth}
            isAnimationActive={false}
            shape={(barProps: any) => (
              <Stacked3DPrismBar
                {...barProps}
                segmentKey="collected"
                gradPrefix={gradPrefix}
              />
            )}
          />
          <Bar
            dataKey="remaining"
            stackId="rent3d"
            barSize={barWidth}
            isAnimationActive={false}
            shape={(barProps: any) => (
              <Stacked3DPrismBar
                {...barProps}
                segmentKey="remaining"
                gradPrefix={gradPrefix}
              />
            )}
          />
          <Bar
            dataKey="overdue"
            stackId="rent3d"
            barSize={barWidth}
            isAnimationActive={false}
            shape={(barProps: any) => (
              <Stacked3DPrismBar
                {...barProps}
                segmentKey="overdue"
                gradPrefix={gradPrefix}
              />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <div className="bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
        {/* Official Header with Year Selector + Present + PDF Download */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isHi
                ? 'माहवार वसूली, शेष एवं ओवरड्यू (3D चार्ट)'
                : 'Monthly Collected, Remaining & Overdue'}
            </h3>

          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-800">
                {isHi ? 'वर्ष:' : 'Year:'}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-md bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-slate-600 cursor-pointer"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setIsPresenting(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'प्रस्तुत करें' : 'Present'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload3DPdf}
              disabled={downloadingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingPdf
                  ? isHi
                    ? 'तैयार हो रहा है...'
                    : 'Generating...'
                  : isHi
                    ? 'वार्षिक रिपोर्ट डाउनलोड करें'
                    : 'Download PDF Report'}
              </span>
            </button>
          </div>
        </div>

        {/* 3D Stacked Isometric Column Chart Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 text-xs pb-3 flex-wrap">
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#10b981] border border-[#065f46] inline-block" />
                <span className="text-slate-900 font-bold">
                  {isHi ? 'प्राप्त वसूली' : 'Collected'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#f59e0b] border border-[#92400e] inline-block" />
                <span className="text-slate-900 font-bold">
                  {isHi ? 'शेष बचा' : 'Remaining'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-[#ef4444] border border-[#991b1b] inline-block" />
                <span className="text-slate-900 font-bold">
                  {isHi ? 'ओवरड्यू' : 'Overdue'}
                </span>
              </div>
            </div>
          </div>

          {!hasAnyValue ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-300 rounded-lg bg-slate-50 px-4 text-center">
              <p className="text-xs font-semibold text-slate-600">
                {isHi
                  ? `वर्ष ${selectedYear} के लिए कोई बिल या वसूली रिकॉर्ड उपलब्ध नहीं है।`
                  : `No billing or collection records available for year ${selectedYear}.`}
              </p>
            </div>
          ) : (
            render3DBarChartSvg('h-64', 'card', 22)
          )}
        </div>
      </div>

      {/* ── FULL-SCREEN OFFICIAL PRESENTATION & REPORT MODAL FOR 3D BAR CHART ── */}
      {isPresenting && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 overflow-y-auto p-3 sm:p-6 flex flex-col items-center"
          onClick={() => setIsPresenting(false)}
        >
          <div
            className="no-print w-full max-w-5xl bg-white rounded-t-xl border border-b-0 border-slate-300 px-5 py-3 flex items-center justify-between gap-3 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                {isHi ? 'आधिकारिक 3D स्तंभ प्रतिवेदन' : 'Official 3D Column Presentation & Report'}
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-bold text-slate-900 cursor-pointer"
              >
                {yearsList.map((yr) => (
                  <option key={yr} value={yr}>
                    {isHi ? `वर्ष ${yr}` : `Year ${yr}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload3DPdf}
                disabled={downloadingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3B60] hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isHi ? 'पीडीएफ डाउनलोड करें' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रिंट करें' : 'Print'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPresenting(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{isHi ? 'बंद करें' : 'Close'}</span>
              </button>
            </div>
          </div>

          <div
            id="official-yearly-3dbar-report-print"
            className="w-full max-w-5xl bg-white border border-slate-300 rounded-b-xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Official Letterhead */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
              <img
                src="/assets/logo1.webp"
                alt="Uttarakhand Emblem"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-center flex-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isHi
                    ? 'उत्तराखण्ड शासन • पंचायती राज विभाग'
                    : 'Govt. of Uttarakhand • Panchayati Raj Department'}
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                </h2>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {isHi
                    ? `माहवार वसूली, चालू शेष एवं ओवरड्यू 3D प्रतिवेदन — वर्ष ${selectedYear}`
                    : `Monthly Collected, Remaining & Overdue 3D Report — Year ${selectedYear}`}
                </p>
              </div>
              <img
                src="/assets/logo2.webp"
                alt="Panchayati Raj Emblem"
                className="w-14 h-14 object-contain shrink-0"
              />
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-900 divide-y sm:divide-y-0 sm:divide-x divide-slate-900 text-xs">
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'चयनित वर्ष' : 'Selected Year'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">{selectedYear}</p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'कुल प्राप्त वसूली' : 'Total Collected'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                  {fmt(summary.totalCollected)}
                </p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'चालू शेष किराया' : 'Current Remaining'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                  {fmt(summary.totalRemaining)}
                </p>
              </div>
              <div className="p-3">
                <p className="font-bold text-slate-600">{isHi ? 'ओवरड्यू बकाया' : 'Past Overdue'}</p>
                <p className="text-base font-black font-mono text-slate-900 mt-0.5">
                  {fmt(summary.totalOverdue)}
                </p>
              </div>
            </div>

            {/* Large 3D Chart */}
            <div className="border border-slate-300 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 flex-wrap gap-2">
                <h4 className="text-xs font-bold uppercase text-slate-900">
                  {isHi
                    ? '१. माहवार 3D स्तंभ चार्ट (वसूली, शेष एवं ओवरड्यू)'
                    : '1. Monthly 3D Column Chart (Collected, Remaining & Overdue)'}
                </h4>
                <div className="flex items-center gap-5 text-xs font-bold text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#10b981] inline-block" />
                    {isHi ? 'प्राप्त वसूली' : 'Collected'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#f59e0b] inline-block" />
                    {isHi ? 'शेष बचा' : 'Remaining'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#ef4444] inline-block" />
                    {isHi ? 'ओवरड्यू' : 'Overdue'}
                  </span>
                </div>
              </div>
              {render3DBarChartSvg('h-72', 'modal', 30)}
            </div>

            {/* 12-Month Official Table */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-900 mb-2">
                {isHi
                  ? `२. माहवार किराया वसूली, शेष एवं ओवरड्यू विवरण तालिका (जनवरी – दिसंबर ${selectedYear})`
                  : `2. Month-wise Rent Collection, Remaining & Overdue Statement (Jan – Dec ${selectedYear})`}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse border border-slate-900 text-slate-900">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-bold">
                      <th className="border border-slate-900 py-2 px-3 text-center w-12">
                        {isHi ? 'क्र.' : 'S.No.'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-left">
                        {isHi ? 'माह' : 'Month'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'कुल बिल मांग' : 'Total Demand'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'प्राप्त वसूली' : 'Collected'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'शेष बचा' : 'Remaining'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-right">
                        {isHi ? 'ओवरड्यू' : 'Overdue'}
                      </th>
                      <th className="border border-slate-900 py-2 px-3 text-center">
                        {isHi ? 'स्थिति' : 'Status'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((r, idx) => (
                      <tr key={r.month} className="border-b border-slate-300">
                        <td className="border border-slate-400 py-2 px-3 text-center font-mono">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 font-bold">
                          {r.displayFullLabel}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono">
                          {r.isFutureMonth ? '—' : fmt(r.totalDemand)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono font-bold">
                          {r.isFutureMonth ? '—' : fmt(r.collected)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono">
                          {r.isFutureMonth ? '—' : fmt(r.remaining)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-right font-mono">
                          {r.isFutureMonth ? '—' : fmt(r.overdue)}
                        </td>
                        <td className="border border-slate-400 py-2 px-3 text-center font-semibold">
                          {getRowStatusText(r)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black border-t-2 border-slate-900">
                      <td className="border border-slate-900 py-2.5 px-3" />
                      <td className="border border-slate-900 py-2.5 px-3">
                        {isHi
                          ? `कुल योग (${summary.elapsedMonths} माह)`
                          : `Total (${summary.elapsedMonths} Months)`}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalDemand)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalCollected)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalRemaining)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-right font-mono">
                        {fmt(summary.totalOverdue)}
                      </td>
                      <td className="border border-slate-900 py-2.5 px-3 text-center font-mono">
                        —
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="pt-8 flex items-end justify-between text-xs text-slate-900">
              <div>
                <p className="font-bold">
                  {isHi ? 'प्रभारी किराया एवं संपत्ति प्रकोष्ठ' : 'In-Charge, Rent & Asset Cell'}
                </p>
                <p className="text-slate-600">
                  {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {isHi
                    ? 'अपर मुख्य अधिकारी / प्राधिकृत अधिकारी'
                    : 'Additional Chief Officer / Authorized Signatory'}
                </p>
                <p className="text-slate-600">
                  {isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा' : 'Office of Zila Panchayat Almora'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
