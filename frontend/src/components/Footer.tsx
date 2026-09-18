import { Truck, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white border-t border-navy-900">
      {/* Tricolor Accent Bar */}
      <div className="uk-tricolor-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & State Identity */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-slate-200 overflow-hidden p-0.5 shadow-xs">
                <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-poppins font-bold text-white text-base block leading-none">
                  Zila Panchayat Safai
                </span>
                <span className="text-[10px] font-medium text-emerald-400 tracking-wider uppercase block mt-0.5">
                  Government of Uttarakhand
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Smart Waste Collection Tracking & Citizen Grievance Redressal Service Portal for Devbhoomi Uttarakhand.
            </p>
            <div className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Official Digital Portal
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3 text-slate-300">Portal Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Complaint', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3 text-slate-300">Public Services</h4>
            <ul className="space-y-2">
              {['Real-Time GPS Fleet Tracking', 'Daily Vehicle Route History', 'Grievance Submission Portal', 'District Administrative Control'].map((item) => (
                <li key={item}>
                  <span className="text-xs text-slate-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3 text-slate-300">State Helpline</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-slate-300 font-mono font-medium">1800-185-1850</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-slate-300">safai@zilapanchayat.uk.gov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 mt-0.5" />
                <span className="text-xs text-slate-300">Zila Panchayat Bhavan, District HQ, Uttarakhand</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-900 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Zila Panchayat Safai Portal • Government of Uttarakhand. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500">
            Designed for Uttarakhand Digital Governance & Smart Waste Collection
          </p>
        </div>
      </div>
    </footer>
  );
}
