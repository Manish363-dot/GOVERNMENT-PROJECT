import { Button } from '@/components/ui/button';
import { MapPin, Truck, Radio, Navigation, ShieldCheck, Cpu, MessageSquareWarning } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-[#0d2342] to-navy-950 text-white border-b border-navy-800">
      {/* Subtle Himalayan Mountain Silhouette Background Vector */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-15">
        <svg viewBox="0 0 1440 320" fill="currentColor" className="w-full h-auto text-emerald-200">
          <path d="M0,192L60,181.3C120,171,240,149,360,165.3C480,181,600,235,720,234.7C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Main Hero Content */}
          <div className="animate-fade-in">
            {/* Official Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3.5 py-1.5 mb-6 border border-white/15 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                उत्तराखंड शासन • Zila Panchayat Safai Portal
              </span>
            </div>

            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 tracking-tight text-white">
              {t('hero.title').split(' ').map((word, i, arr) =>
                i === arr.length - 1 ? <span key={i} className="text-amber-400 block mt-1 font-extrabold">{word}</span> : word + ' '
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3.5">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md border border-emerald-500/30" asChild>
                <a href="#tracking-info">
                  <MapPin className="w-4.5 h-4.5 mr-1.5" />
                  {t('hero.liveTracking')}
                </a>
              </Button>
              <Button size="lg" className="bg-white text-navy-900 hover:bg-slate-100 font-semibold shadow-md border border-white" asChild>
                <a href="#complaint">
                  <MessageSquareWarning className="w-4.5 h-4.5 mr-1.5 text-amber-600" />
                  {t('hero.registerComplaint')}
                </a>
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Real-Time GPS Telematics</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>State Command Control System</span>
              </div>
            </div>
          </div>

          {/* Professional Government Fleet Command Console Widget */}
          <div className="hidden lg:flex items-center justify-center animate-slide-up">
            <div className="relative w-full max-w-lg">
              {/* Outer Glow Halo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-amber-500/20 blur-xl opacity-60 pointer-events-none" />

              {/* Main Command Console Container */}
              <div className="relative bg-[#071426]/95 backdrop-blur-xl rounded-2xl border border-slate-700/80 p-5 shadow-2xl overflow-hidden">

                {/* Console Top Header Bar */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                    </div>
                    <div>
                      <h3 className="font-mono text-xs font-bold text-slate-100 tracking-wider uppercase flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                        DISTRICT GIS FLEET COMMAND
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Uttarakhand Telematics Subsystem</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded border border-emerald-700/60 uppercase font-semibold">
                      GPS Online
                    </span>
                  </div>
                </div>

                {/* Floating Telematics Badge Over Tooltip */}
                <div className="relative mb-3">
                  <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 rounded-lg p-2.5 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                        <Navigation className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white tracking-wide">UK-07-GA-1234</span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">28 km/h</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Route: Dehradun Sector-1 (Rajpur Rd)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-emerald-400 block font-semibold">Signal 99%</span>
                      <span className="text-[9px] text-slate-400 block">Ping: 1.2s ago</span>
                    </div>
                  </div>
                </div>

                {/* Tactical GIS Map Monitor Display */}
                <div className="relative bg-[#050f1d] rounded-xl h-52 overflow-hidden border border-slate-800/90 shadow-inner">
                  {/* Fine Grid Background */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }} />

                  {/* Sector Overlay Labels */}
                  <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                    SECTOR 01 • DEHRADUN HQ
                  </div>
                  <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
                    SECTOR 02 • HARIDWAR ROUTE
                  </div>

                  {/* SVG Sector Contour & Vector Routes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 440 220">
                    {/* Topo lines */}
                    <path d="M 20,40 Q 120,90 220,50 T 420,80" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 10,160 Q 150,110 280,170 T 430,130" fill="none" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Active Route Path 1 (Green) */}
                    <path
                      d="M 60,150 Q 140,40 240,110 T 380,80"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="6,4"
                      className="opacity-70"
                    />

                    {/* Active Route Path 2 (Amber) */}
                    <path
                      d="M 120,180 Q 200,100 320,150"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="4,4"
                      className="opacity-60"
                    />
                  </svg>

                  {/* GPS Node 1: UK-07-GA-1234 (Active Moving) */}
                  <div className="absolute top-[28%] left-[50%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative group">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/25 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950">
                        <Truck className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-50" />
                      <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-emerald-800 whitespace-nowrap shadow-md">
                        UK-07-GA-1234
                      </div>
                    </div>
                  </div>

                  {/* GPS Node 2: UK-04-CA-5678 (Idle Collection) */}
                  <div className="absolute top-[52%] left-[26%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-amber-500/25 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-950">
                        <Truck className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-800 whitespace-nowrap shadow-md">
                        UK-04-CA-5678
                      </div>
                    </div>
                  </div>

                  {/* GPS Node 3: UK-12-B-9012 (En Route) */}
                  <div className="absolute top-[36%] left-[82%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-blue-500/25 border-2 border-blue-400 flex items-center justify-center shadow-lg shadow-blue-950">
                        <Truck className="w-3.5 h-3.5 text-blue-300" />
                      </div>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-blue-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-blue-800 whitespace-nowrap shadow-md">
                        UK-12-B-9012
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telematics Metrics Footer Row */}
                <div className="grid grid-cols-3 gap-3 mt-3.5">
                  <div className="bg-slate-900/90 rounded-lg p-2.5 text-center border border-slate-800 shadow-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Active Fleet</p>
                    <div className="flex items-center justify-center gap-1 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="font-poppins font-bold text-white text-base">3 Vehicles</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 rounded-lg p-2.5 text-center border border-slate-800 shadow-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Fleet Status</p>
                    <p className="font-poppins font-bold text-emerald-400 text-sm mt-0.5">2 Moving • 1 Halt</p>
                  </div>

                  <div className="bg-slate-900/90 rounded-lg p-2.5 text-center border border-slate-800 shadow-xs">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-semibold">District Coverage</p>
                    <p className="font-poppins font-bold text-amber-400 text-base mt-0.5">5 Routes (100%)</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
