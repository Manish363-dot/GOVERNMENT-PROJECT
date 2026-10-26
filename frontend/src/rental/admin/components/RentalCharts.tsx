import React, { CSSProperties, SVGProps } from 'react';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShieldCheck, Activity, Award } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   1. ISOMETRIC TRUE 3D BAR COMPONENT (@reui/c-chart-8)
   Calculates isometric angle, 3D top face polygon, right face polygon, and back depth
───────────────────────────────────────────────────────────────────────────── */
export const True3DBar = (
  props: SVGProps<SVGRectElement> & {
    dataKey?: string;
    payload?: any;
    index?: number;
  }
) => {
  const { fill, x, y, width, height } = props;
  const barX = (x as number) || 0;
  const barY = (y as number) || 0;
  const barWidth = (width as number) || 0;
  const barHeight = (height as number) || 0;

  // 3D perspective parameters
  const depth = Math.min(barWidth * 0.35, 14);

  return (
    <g>
      {/* Back face shadow */}
      <rect
        x={barX + depth}
        y={barY - depth}
        width={barWidth}
        height={barHeight}
        fill={fill}
        opacity={0.35}
        rx={3}
      />

      {/* Right side 3D face */}
      <polygon
        points={`
          ${barX + barWidth + 2},${barY - 2} 
          ${barX + barWidth + depth - 2},${barY - depth + 2} 
          ${barX + barWidth + depth - 2},${barY + barHeight - depth - 2} 
          ${barX + barWidth + 2},${barY + barHeight - 2}
        `}
        fill={fill}
        opacity={0.7}
      />

      {/* Top 3D face */}
      <polygon
        points={`
          ${barX + 2},${barY - 2} 
          ${barX + barWidth - 2},${barY - 2} 
          ${barX + barWidth + depth - 2},${barY - depth + 2} 
          ${barX + depth + 2},${barY - depth + 2}
        `}
        fill={fill}
        opacity={0.9}
      />

      {/* Front face with soft gradient/opacity */}
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        fill={fill}
        rx={3}
      />
    </g>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   2. CUSTOM DUOTONE BAR (@reui/c-chart-10)
───────────────────────────────────────────────────────────────────────────── */
export const CustomDuotoneBar = (
  props: SVGProps<SVGRectElement> & { dataKey?: string }
) => {
  const { fill, x, y, width, height, dataKey } = props;

  return (
    <>
      <rect
        rx={4}
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="none"
        fill={`url(#duotone-bar-pattern-${dataKey || 'default'})`}
      />
      <defs>
        <linearGradient
          key={dataKey}
          id={`duotone-bar-pattern-${dataKey || 'default'}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="50%" stopColor={fill} stopOpacity={0.45} />
          <stop offset="50%" stopColor={fill} stopOpacity={0.95} />
        </linearGradient>
      </defs>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   3. ISOMETRIC 3D REVENUE FORECAST CHART
───────────────────────────────────────────────────────────────────────────── */
interface Revenue3DProps {
  data: Array<{
    month: string;
    label: string;
    billed: number;
    collected: number;
    overdue: number;
  }>;
  isHi?: boolean;
}

export const Revenue3DBarChart: React.FC<Revenue3DProps> = ({ data, isHi }) => {
  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">
            {isHi ? 'मासिक राजस्व एवं वसूली' : 'Monthly Revenue & Collections'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {isHi ? 'मासिक देय मांग बनाम प्राप्त वसूली का विवरण' : 'Billed rent demand vs actual collections'}
          </CardDescription>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="text-slate-600">{isHi ? 'वसूली' : 'Collected'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500"></span>
            <span className="text-slate-600">{isHi ? 'मांग' : 'Billed'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 30, right: 25, bottom: 15, left: 10 }}
              barCategoryGap="25%"
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl border border-slate-700 text-xs space-y-1 font-sans">
                      <div className="font-bold text-amber-400 border-b border-slate-700 pb-1 mb-1">
                        {label} 2026
                      </div>
                      {payload.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="text-slate-300">
                            {item.dataKey === 'collected' ? (isHi ? 'प्राप्त वसूली' : 'Collected') : (isHi ? 'मासिक मांग' : 'Billed Demand')}:
                          </span>
                          <span className="font-bold font-mono text-emerald-400">
                            ₹{Number(item.value).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="billed"
                fill="#d97706"
                shape={<True3DBar />}
              />
              <Bar
                dataKey="collected"
                fill="#10b981"
                shape={<True3DBar />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   4. PATTERN TEXTURED NATURAL AREA CHART (@reui/c-chart-13 & c-chart-18)
───────────────────────────────────────────────────────────────────────────── */
interface PatternAreaProps {
  data: Array<{
    month: string;
    label: string;
    billed: number;
    collected: number;
    overdue: number;
  }>;
  isHi?: boolean;
}

export const RevenuePatternAreaChart: React.FC<PatternAreaProps> = ({ data, isHi }) => {
  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">
            {isHi ? 'राजस्व वृद्धि एवं संग्रह ट्रेंड' : 'Revenue Collection & Growth Trend'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            {isHi ? 'मासिक मांग, संग्रह एवं बकाया राशि का तुलनात्मक प्रवाह' : 'Monthly demand, collections and arrears progression'}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 15, right: 10, bottom: 5, left: 5 }}
            >
              <defs>
                {/* Emerald Gradient */}
                <linearGradient id="chart13-gradient-collected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>

                {/* Diagonal Stripe Pattern */}
                <pattern
                  id="chart13-stripe-collected"
                  patternUnits="userSpaceOnUse"
                  width="7"
                  height="7"
                >
                  <path
                    d="M0,7 L7,0"
                    stroke="#059669"
                    strokeWidth="1.2"
                    opacity="0.25"
                  />
                </pattern>

                {/* Overdue Pattern */}
                <pattern
                  id="chart18-crosshatch-overdue"
                  x="0"
                  y="0"
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0,8 L8,0" stroke="#ef4444" strokeWidth="0.8" opacity="0.3" />
                  <path d="M0,0 L8,8" stroke="#ef4444" strokeWidth="0.8" opacity="0.15" />
                </pattern>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-xl bg-slate-900 text-white p-3 shadow-xl border border-slate-700 text-xs space-y-1 font-sans">
                      <div className="font-bold text-amber-400 border-b border-slate-700 pb-1 mb-1">
                        {label} 2026
                      </div>
                      {payload.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4">
                          <span className="text-slate-300">
                            {item.dataKey === 'collected' ? (isHi ? 'प्राप्त वसूली' : 'Collected') : (isHi ? 'बकाया' : 'Overdue')}:
                          </span>
                          <span className="font-bold font-mono text-emerald-400">
                            ₹{Number(item.value).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area
                dataKey="overdue"
                type="natural"
                fill="url(#chart18-crosshatch-overdue)"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Area
                dataKey="collected"
                type="natural"
                fill="url(#chart13-gradient-collected)"
                stroke="#10b981"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   5. TEXTURED PATTERN PIE / DONUT CHART (@reui/c-chart-21)
───────────────────────────────────────────────────────────────────────────── */
interface PropertyPatternDonutProps {
  allotted: number;
  vacant: number;
  total: number;
  isHi?: boolean;
}

export const PropertyPatternDonutChart: React.FC<PropertyPatternDonutProps> = ({
  allotted,
  vacant,
  total,
  isHi,
}) => {
  const pieData = [
    { name: isHi ? 'आवंटित दुकानें' : 'Allotted Shops', value: Math.max(1, allotted), fill: 'url(#chart22-allotted-pattern)' },
    { name: isHi ? 'रिक्त संपत्तियां' : 'Vacant Properties', value: Math.max(1, vacant), fill: '#f59e0b' },
    { name: isHi ? 'थड़े / स्टॉल' : 'Roadside Stalls', value: Math.max(1, Math.round(total * 0.25)), fill: 'url(#chart22-stalls-pattern)' },
    { name: isHi ? 'गोदाम / वेयरहाउस' : 'Godowns / Storage', value: Math.max(1, Math.round(total * 0.15)), fill: '#6366f1' },
  ];

  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-bold text-slate-800">
          {isHi ? 'संपत्ति वर्ग एवं आवंटन अनुपात' : 'Asset Categories & Allotment'}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          {isHi ? 'वाणिज्यिक दुकानों, थड़ों व वेयरहाउस का आवंटन वितरण' : 'Breakdown of municipal commercial assets'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {/* Critical / Allotted Crosshatch Pattern */}
                <pattern
                  id="chart22-allotted-pattern"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <rect width="6" height="6" fill="#10b981" opacity="0.3" />
                  <path
                    d="M0,6 L6,0 M-2,2 L2,-2 M4,8 L8,4"
                    stroke="#059669"
                    strokeWidth="1.2"
                    opacity="0.9"
                  />
                </pattern>

                {/* Stalls Dot Pattern */}
                <pattern
                  id="chart22-stalls-pattern"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <rect width="6" height="6" fill="#3b82f6" opacity="0.2" />
                  <circle cx="3" cy="3" r="1.5" fill="#2563eb" opacity="0.8" />
                </pattern>
              </defs>

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-xl text-xs font-sans">
                      <div className="font-bold text-amber-400">{item.name}</div>
                      <div className="text-slate-300 font-mono mt-0.5">
                        {item.value} {isHi ? 'इकाइयां' : 'Units'}
                      </div>
                    </div>
                  );
                }}
              />

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                cornerRadius={5}
                paddingAngle={4}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Stat */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 leading-none">{total}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
              {isHi ? 'कुल संपत्तियां' : 'Total Assets'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 w-full pt-2 text-[11px]">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0 border border-slate-300"
                style={{ background: item.fill.startsWith('url') ? '#10b981' : item.fill }}
              />
              <span className="truncate text-slate-700 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   6. RADIAL BAR CHART WITH GLOW FILTER (@reui/c-chart-25)
───────────────────────────────────────────────────────────────────────────── */
interface RadialScoreProps {
  occupancyScore: number;
  collectionScore: number;
  complianceScore: number;
  isHi?: boolean;
}

export const MunicipalRadialScoresChart: React.FC<RadialScoreProps> = ({
  occupancyScore,
  collectionScore,
  complianceScore,
  isHi,
}) => {
  const radialData = [
    { name: isHi ? 'समय पर भुगतान' : 'Timely Payment', score: complianceScore, fill: 'url(#chart28-api)' },
    { name: isHi ? 'राजस्व वसूली' : 'Rent Collection', score: collectionScore, fill: 'url(#chart28-desktop)' },
    { name: isHi ? 'दुकान आवंटन' : 'Shop Occupancy', score: occupancyScore, fill: 'url(#chart28-mobile)' },
  ];

  return (
    <Card className="w-full bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-bold text-slate-800">
          {isHi ? 'प्रशासनिक दक्षता सूचकांक' : 'Administrative Performance Index'}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          {isHi ? 'दुकान आवंटन, राजस्व वसूली एवं समय पर भुगतान का विश्लेषण' : 'Occupancy, revenue collection, and compliance audit scores'}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col items-center justify-center">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={radialData}
              innerRadius={30}
              outerRadius={95}
              barSize={14}
            >
              <defs>
                <linearGradient id="chart28-mobile" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="chart28-desktop" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="chart28-api" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                </linearGradient>

                {/* Neon Glow Filter */}
                <filter id="chart28-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                dataKey="score"
                background={{ fill: '#f1f5f9' }}
                cornerRadius={8}
                filter="url(#chart28-glow)"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0];
                  return (
                    <div className="rounded-xl bg-slate-900 text-white p-2.5 shadow-xl text-xs font-sans">
                      <div className="font-bold text-amber-400">{item.payload.name}</div>
                      <div className="text-emerald-400 font-mono font-bold mt-0.5">
                        {item.payload.score}/100 Score
                      </div>
                    </div>
                  );
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 w-full pt-1 text-[11px]">
          {radialData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-700">{item.name}</span>
              <span className="font-black text-slate-900 font-mono">{item.score}/100</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
