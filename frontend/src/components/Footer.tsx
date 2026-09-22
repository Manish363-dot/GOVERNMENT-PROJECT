import { useState } from 'react';
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

export function Footer() {
  const { i18n } = useTranslation();
  const [activePolicy, setActivePolicy] = useState<string | null>(null);
  const isHi = i18n.language === 'hi';

  const navLinks = [
    { label: isHi ? 'मुख्य पृष्ठ' : 'Home', href: '/' },
    { label: isHi ? 'हमारे बारे में' : 'About Initiative', href: '/#about' },
    { label: isHi ? 'शिकायत दर्ज करें' : 'Register Complaint', href: '/#complaint' },
    { label: isHi ? 'संपर्क करें' : 'Contact Us', href: '/#contact' },
    { label: isHi ? 'मीडिया गैलरी' : 'Media Gallery', href: '/#gallery' },
    { label: isHi ? 'एडमिन लॉगिन' : 'Admin Login', href: '/signin' },
  ];

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

          {/* Live Status Badge */}
          <div className="flex items-center gap-1.5 bg-navy-950/80 border border-emerald-800/60 px-3 py-1.5 rounded text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {isHi ? '24×7 नियंत्रण कक्ष सक्रिय' : '24×7 Control Room Active'}
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
                <span className="font-mono text-xs">safai@zilapanchayat.uk.gov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-xs leading-snug">
                  {isHi
                    ? 'जिला पंचायत भवन, विकास भवन परिसर, अल्मोड़ा, उत्तराखंड - 263601'
                    : 'Zila Panchayat Bhavan, Vikas Bhavan Complex, Almora, Uttarakhand - 263601'}
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
                {idx < arr.length - 1 && <span className="text-navy-700 text-[10px]">|</span>}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 shrink-0">
            © {new Date().getFullYear()} {isHi ? 'जिला पंचायत अल्मोड़ा • उत्तराखंड सरकार' : 'District Panchayat Almora • Govt. of Uttarakhand'}
          </p>
        </div>

        {/* NIC Credit & Copyright */}
        <div className="border-t border-navy-900 py-2 text-center">
          <p className="text-[10px] text-slate-600 flex items-center justify-center gap-1.5">
            <Building2 className="w-3 h-3 shrink-0 text-slate-600" />
            {isHi
              ? 'वेबसाइट का विकास, डिज़ाइन एवं संधारण राष्ट्रीय सूचना विज्ञान केंद्र (NIC), भारत सरकार द्वारा किया गया है।'
              : 'Designed, Developed & Hosted by National Informatics Centre (NIC), Government of India.'}
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
    </footer>
  );
}
