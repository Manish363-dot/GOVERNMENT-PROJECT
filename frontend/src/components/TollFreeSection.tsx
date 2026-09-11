import { Phone, ShieldCheck } from 'lucide-react';

export function TollFreeSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 rounded-lg p-8 sm:p-10 text-center text-white relative overflow-hidden border border-navy-800 shadow-md">
          {/* Subtle background ridge accent */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 1440 320" fill="currentColor" className="w-full h-full text-emerald-200">
              <path d="M0,192L120,181.3C240,171,480,149,720,165.3C960,181,1200,235,1440,234.7L1440,320L0,320Z" />
            </svg>
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Citizen Helpline
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl font-bold mb-3">
              Uttarakhand State Service Assistance
            </h2>
            <p className="text-slate-300 mb-6 max-w-md mx-auto text-sm">
              Call our official toll-free helpline for urgent assistance regarding waste collection operations.
            </p>

            <div className="inline-flex items-center gap-4 bg-navy-950/90 rounded-md px-6 py-4 border border-slate-700 shadow-xs">
              <div className="w-11 h-11 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Toll-Free Helpline</p>
                <p className="font-poppins text-2xl sm:text-3xl font-bold tracking-wide text-white">1800-185-1850</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Available during official hours • Government of Uttarakhand Digital Assistance
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
