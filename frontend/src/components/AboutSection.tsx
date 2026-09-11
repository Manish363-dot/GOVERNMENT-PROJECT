import { Truck, MapPin, History, Shield, ShieldCheck } from 'lucide-react';

const capabilities = [
  { icon: Truck, text: 'Track garbage vehicles in real time across district wards' },
  { icon: MapPin, text: 'Monitor collection operations across Uttarakhand panchayats' },
  { icon: History, text: 'Store and view daily vehicle route history records' },
  { icon: Shield, text: 'Receive and manage citizen public complaints efficiently' },
];

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-navy-100 text-navy-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-navy-200">
              <ShieldCheck className="w-3.5 h-3.5 text-navy-700" />
              About The Initiative
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 mb-5 leading-tight">
              Zila Panchayat Safai Digital Portal
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">
              Zila Panchayat Safai is a modern smart platform designed to help Zila Panchayat efficiently manage waste collection operations across Uttarakhand. By leveraging real-time GPS tracking technology, our system provides complete transparency and accountability in garbage collection services.
            </p>

            <p className="text-slate-600 leading-relaxed mb-8 text-sm sm:text-base">
              The platform empowers administrators with live vehicle tracking, historical route data, and a streamlined public complaint management system to ensure clean and healthy communities in Devbhoomi Uttarakhand.
            </p>

            <div className="grid sm:grid-cols-2 gap-3.5">
              {capabilities.map((cap) => (
                <div key={cap.text} className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <div className="w-8 h-8 rounded bg-navy-900 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <cap.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-navy-900 pt-1 leading-snug">{cap.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Presentation Card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-navy-900 rounded-xl p-8 border border-navy-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-6">
                  <div>
                    <h4 className="font-poppins font-bold text-white text-base">Uttarakhand Zila Panchayat</h4>
                    <p className="text-xs text-slate-400">Waste Management Command System</p>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800 uppercase">
                    Official Portal
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-navy-950/80 rounded-lg p-4 border border-navy-800 text-center">
                    <Truck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="font-poppins font-bold text-xl text-white">GPS Fleet</p>
                    <p className="text-[11px] text-slate-400">Real-Time Tracking</p>
                  </div>
                  <div className="bg-navy-950/80 rounded-lg p-4 border border-navy-800 text-center">
                    <MapPin className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="font-poppins font-bold text-xl text-white">Live Operations</p>
                    <p className="text-[11px] text-slate-400">District Monitoring</p>
                  </div>
                  <div className="bg-navy-950/80 rounded-lg p-4 border border-navy-800 text-center">
                    <History className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <p className="font-poppins font-bold text-xl text-white">Route Logs</p>
                    <p className="text-[11px] text-slate-400">Daily History Records</p>
                  </div>
                  <div className="bg-navy-950/80 rounded-lg p-4 border border-navy-800 text-center">
                    <Shield className="w-6 h-6 text-red-400 mx-auto mb-2" />
                    <p className="font-poppins font-bold text-xl text-white">Grievance</p>
                    <p className="text-[11px] text-slate-400">Citizen Complaints</p>
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
