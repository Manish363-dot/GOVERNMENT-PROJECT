import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Phone, Mail, MapPin, X, CheckCircle2, Building2 } from 'lucide-react';

const policies: Record<string, { titleEn: string; titleHi: string; lines: string[] }> = {
  terms: {
    titleEn: "Terms of Use",
    titleHi: "उपयोग की शर्तें",
    lines: [
      "This portal is the official digital service of District Panchayat Almora, Govt. of Uttarakhand.",
      "Citizens must provide authentic information when registering waste collection complaints.",
      "False or spam complaints may result in suspension of citizen service access."
    ]
  },
  privacy: {
    titleEn: "Privacy Policy",
    titleHi: "गोपनीयता नीति",
    lines: [
      "Personal details collected during complaint registration are used solely for grievance resolution.",
      "No citizen data is sold or disclosed to third-party commercial entities.",
      "GPS telemetry collected from sanitation vehicles is used exclusively for service optimization."
    ]
  },
  disclaimer: {
    titleEn: "Disclaimer",
    titleHi: "अस्वीकरण",
    lines: [
      "While every effort is made to ensure accuracy of live GPS tracking, temporary satellite fluctuations may affect real-time telemetry in high-altitude terrain.",
      "For urgent waste collection emergencies, please call the Toll-Free Helpline: 1800-185-1850."
    ]
  },
  accessibility: {
    titleEn: "Accessibility",
    titleHi: "सुगम्यता",
    lines: [
      "This portal is designed to comply with GIGW and WCAG 2.1 AA accessibility standards.",
      "Features include bilingual support (Hindi/English), scalable typography, and keyboard navigation.",
      "For feedback, write to: safai@zilapanchayat.uk.gov.in"
    ]
  }
};

export const Footer = React.memo(() => {
  const { i18n } = useTranslation();
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const [showDeveloperContact, setShowDeveloperContact] = useState(false);
  const isHi = i18n.language === 'hi';

  const navLinks = React.useMemo(() => [
    { label: isHi ? 'मुख्य पृष्ठ' : 'Home', href: '/' },
    { label: isHi ? 'हमारे बारे में' : 'About Initiative', href: '/#about' },
    { label: isHi ? 'शिकायत दर्ज करें' : 'Register Complaint', href: '/#complaint' },
    { label: isHi ? 'संपर्क करें' : 'Contact Us', href: '/#contact' },
    { label: isHi ? 'एडमिन लॉगिन' : 'Admin Login', href: '/signin' },
    { label: isHi ? 'सूचनाएं एवं अपडेट' : 'Notices & Updates', href: '/#notices' },
    {label: isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules', href:'/#documents'},
    {label: isHi ? 'दैनिक कार्य' : 'Daily Work', href:'/#blogs'}
  ], [isHi]);

  return (
    <footer className="bg-navy-950 text-white font-sans">
      {/* Tricolor top ribbon */}
      <div className="uk-tricolor-line" />

      {/* Horizontal divider with Dept Name */}
      <div className="border-b border-navy-800 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img src="/assets/app-logo.png" alt="Zila Panchayat Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-slate-300 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest leading-none">
                {isHi ? 'उत्तराखंड सरकार • पंचायती राज विभाग' : 'Govt. of Uttarakhand • Panchayati Raj Department'}
              </p>
              <p className="font-poppins text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                {isHi ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण)' : 'District Panchayat Almora — Swachh Bharat Mission (Grameen)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Col 1: About Portal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-navy-800 pb-2">
              {isHi ? 'पोर्टल के बारे में' : 'About This Portal'}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isHi
                ? 'यह अल्मोड़ा जिले में ठोस अपशिष्ट संग्रहण वाहनों की रियल-टाइम जीपीएस ट्रैकिंग और नागरिक शिकायत निवारण हेतु विकसित आधिकारिक पोर्टल है।'
                : 'Official portal for real-time GPS tracking of waste collection vehicles and citizen grievance redressal under District Panchayat Almora.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isHi ? 'सत्यापित सरकारी पोर्टल' : 'Verified Government Portal'}</span>
            </div>
            <p className="text-xs italic text-amber-300 font-medium">
              {isHi ? '"स्वच्छ भारत • स्वच्छ देवभूमि"' : '"Swachh Bharat • Swachh Devbhoomi"'}
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-navy-800 pb-2 mb-4">
              {isHi ? 'त्वरित लिंक' : 'Quick Navigation'}
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors shrink-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact & Helpline */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-navy-800 pb-2 mb-4">
              {isHi ? 'संपर्क एवं हेल्पलाइन' : 'Contact & Helpline'}
            </h4>

            {/* Toll-free highlight */}
            <div className="bg-navy-900 border border-amber-500/40 rounded-lg p-3 mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-0.5">
                {isHi ? '☎ टोल-फ्री हेल्पलाइन' : '☎ Toll-Free Helpline'}
              </p>
              <p className="font-mono font-bold text-white text-lg tracking-wide">1800-185-1850</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isHi ? 'सोम-शनि: सुबह 9 बजे से शाम 6 बजे तक' : 'Mon-Sat: 9:00 AM – 6:00 PM'}
              </p>
            </div>

            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-xs">amazpalmora@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-xs leading-snug">
                  {isHi
                    ? ' धारानौला जिला पंचायत अल्मोड़ा, उत्तराखंड - 263601'
                    : 'Dharanaula Zila Panchayat Almora, Uttarakhand - 263601'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Policy Bar */}
      <div className="border-t border-navy-900 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
              {isHi ? 'वेबसाइट नीतियां:' : 'Website Policies:'}
            </span>
            {Object.keys(policies).map((key, idx, arr) => (
              <span key={key} className="flex items-center gap-3">
                <button
                  onClick={() => setActivePolicy(key)}
                  className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors hover:underline"
                >
                  {isHi ? policies[key].titleHi : policies[key].titleEn}
                </button>
                <span className="text-navy-700 text-[10px]">|</span>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <a 
                href="/security-policy" 
                className="text-[11px] text-slate-400 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'सुरक्षा नीति' : 'Security Policy'}
              </a>
            </span>
          </div>
          <p className="text-[10px] text-slate-500 shrink-0">
            © {new Date().getFullYear()} {isHi ? 'जिला पंचायत अल्मोड़ा • उत्तराखंड सरकार' : 'District Panchayat Almora • Govt. of Uttarakhand'}
          </p>
        </div>

        {/* NIC Credit & Copyright */}
        <div className="border-t border-navy-900 py-2 text-center">
          <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1.5 flex-wrap">
            <Building2 className="w-3 h-3 shrink-0 text-slate-600" />
            {isHi
              ?'डिजाइन, डेवलपमेंट और होस्टिंग मनीष पालीवाल ,दीपक बिष्ट  के साथ ।'
              : 'Design, Development & Hosting with Manish Paliwal,Deepak Bisht'}
            <button 
              onClick={() => setShowDeveloperContact(true)}
              className="ml-1 text-slate-600 hover:text-amber-400 font-medium transition-colors"
            >
              {isHi ? '(हमसे संपर्क करें)' : '(Contact Developers)'}
            </button>
          </p>
        </div>
      </div>

      {/* Policy Modal */}
      {activePolicy && policies[activePolicy] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-navy-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-poppins font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                {isHi ? policies[activePolicy].titleHi : policies[activePolicy].titleEn}
              </h3>
              <button
                onClick={() => setActivePolicy(null)}
                className="p-1 rounded hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4 text-amber-400" />
              </button>
            </div>
            <div className="uk-tricolor-line" />

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed">
              <p className="text-[11px] text-amber-700 font-semibold border-b border-slate-100 pb-2">
                {isHi ? 'जिला पंचायत अल्मोड़ा — उत्तराखंड सरकार' : 'District Panchayat Almora — Government of Uttarakhand'}
              </p>
              {policies[activePolicy].lines.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-slate-700">{line}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold rounded transition-colors"
              >
                {isHi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Contact Modal */}
      {showDeveloperContact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="relative h-32 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <button
                onClick={() => setShowDeveloperContact(false)}
                className="absolute z-20 top-4 right-4 text-white/70 hover:text-white transition-all duration-300 ease-out bg-white/10 hover:bg-rose-500 hover:shadow-[0_0_15px_rgba(244,63,94,0.5)] p-1.5 rounded-full hover:rotate-90 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center mt-2">
                <h3 className="font-poppins font-bold text-2xl text-white tracking-tight flex items-center justify-center gap-2">
                  <Building2 className="w-6 h-6 text-amber-400" />
                  Development Team
                </h3>
                <p className="text-blue-100/80 text-sm mt-1">Government Digital Services Partners</p>
              </div>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-5 bg-slate-50/50">
              {/* Manish Paliwal */}
              <div className="group relative bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:bg-blue-100 transition-colors"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-slate-200 p-1 shadow-inner">
                      <img src={`${import.meta.env.VITE_AWS_S3_BUCKET_URL || ''}/portal-logos/Manish.jpeg`} alt="Manish Paliwal" className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-navy-900 text-[17px] mb-0.5 group-hover:text-blue-600 transition-colors">Manish Paliwal</h4>
                    <p className="text-[11px] font-semibold text-blue-600/80 uppercase tracking-wider mb-3">Lead Developer</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-slate-700 font-medium">manishpaliwal847@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-slate-700 font-medium">+91 9870722406</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deepak Bisht */}
              <div className="group relative bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-50 group-hover:bg-amber-100 transition-colors"></div>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-slate-200 p-1 shadow-inner">
                      <img src={`${import.meta.env.VITE_AWS_S3_BUCKET_URL || ''}/portal-logos/Deepak.jpeg`} alt="Deepak Bisht" className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h4 className="font-bold text-navy-900 text-[17px] mb-0.5 group-hover:text-amber-600 transition-colors">Deepak Bisht</h4>
                    <p className="text-[11px] font-semibold text-amber-600/80 uppercase tracking-wider mb-3">Lead Developer</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-slate-700 font-medium">deepakbisht4050@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <span className="text-slate-700 font-medium">+91 7300756458</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-100/80 px-6 py-4 text-center border-t border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">SYSTEM ARCHITECTURE & INFRASTRUCTURE</p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
});
