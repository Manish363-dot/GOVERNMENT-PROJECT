import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Phone, Mail, MapPin, X, CheckCircle2, Building2 } from 'lucide-react';
import { PANCHAYATI_RAJ_LOGO_URL } from './TopBarLogos';
export const Footer = React.memo(() => {
  const { i18n } = useTranslation();
  const [showDeveloperContact, setShowDeveloperContact] = useState(false);
  const isHi = i18n.language === 'hi';

  const navLinks = React.useMemo(() => [
    { label: isHi ? 'मुख्य पृष्ठ' : 'Home', href: '/' },
    { label: isHi ? 'हमारी पहल' : 'Our Initiative', href: '/our-initiative' },
    { label: isHi ? 'विज़न और मिशन' : 'Vision & Mission', href: '/vision-mission' },
    { label: isHi ? 'अधिकारी विवरण' : 'Staff Directory', href: '/staff-directory' },
    { label: isHi ? 'सोशल मीडिया जुड़ाव' : 'Social Engagement', href: '/#social-engagement' },
    { label: isHi ? 'शिकायत दर्ज करें' : 'Register Complaint', href: '/complaint' },
    { label: isHi ? 'संपर्क करें' : 'Contact Us', href: '/contact' },
    { label: isHi ? 'सूचनाएं एवं अपडेट' : 'Notices & Updates', href: '/#Notices' },
    { label: isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules', href: '/bylaws' },
    { label: isHi ? 'दैनिक कार्य' : 'Daily Work', href: '/#blogs' },
  ], [isHi]);

  return (
    <footer className="relative z-20 bg-navy-950 text-white font-sans">
      {/* Tricolor top ribbon */}
      <div className="uk-tricolor-line" />

      {/* Horizontal divider with Dept Name */}
      <div className="border-b border-navy-800 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Logo" className="w-8 h-8 object-contain rounded bg-white p-0.5 border border-slate-300 shrink-0" />
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
            
            {/* Official Social Media Connect Badges */}
            <div className="pt-2 border-t border-navy-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-300">
                  {isHi ? 'आधिकारिक सोशल मीडिया' : 'Official Social Media'}
                </span>
                <a
                  href="/#social-engagement"
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold transition-colors underline"
                >
                  {isHi ? 'विस्तृत देखें' : 'View Section'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {/* X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-black hover:bg-slate-800 text-white flex items-center justify-center p-1.5 transition-colors border border-slate-700"
                  title="X (Twitter)"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#1877F2] hover:bg-blue-600 text-white flex items-center justify-center p-1.5 transition-colors"
                  title="Facebook"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#FF0000] hover:bg-red-600 text-white flex items-center justify-center p-1.5 transition-colors"
                  title="YouTube"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-700 text-white flex items-center justify-center p-1.5 transition-opacity hover:opacity-90"
                  title="Instagram"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* WhatsApp */}
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-[#25D366] hover:bg-emerald-600 text-white flex items-center justify-center p-1.5 transition-colors"
                  title="WhatsApp"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>

            <p className="text-xs italic text-amber-300 font-medium">
              {isHi ? '"स्वच्छ भारत • स्वच्छ देवभूमि"' : '"Swachh Bharat • Swachh Devbhoomi"'}
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest border-b border-navy-800 pb-2 mb-4">
              {isHi ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/#') ? (
                    <a
                      href={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors shrink-0" />
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  )}
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
            <span className="flex items-center gap-3">
              <Link
                to="/about-website"
                className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'इस पोर्टल के बारे में' : 'About This Website'}
              </Link>
              <span className="text-navy-700 text-[10px]">|</span>
            </span>
            <span className="flex items-center gap-3">
              <Link
                to="/terms-of-use"
                className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'उपयोग की शर्तें' : 'Terms of Use'}
              </Link>
              <span className="text-navy-700 text-[10px]">|</span>
            </span>
            <span className="flex items-center gap-3">
              <Link
                to="/website-policy"
                className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'वेबसाइट नीति' : 'Website Policy'}
              </Link>
              <span className="text-navy-700 text-[10px]">|</span>
            </span>
            <span className="flex items-center gap-3">
              <Link
                to="/sitemap"
                className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'साइट मैप' : 'Site Map'}
              </Link>
              <span className="text-navy-700 text-[10px]">|</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 shrink-0">
            © {new Date().getFullYear()} {isHi ? 'जिला पंचायत अल्मोड़ा • उत्तराखंड सरकार' : 'District Panchayat Almora • Govt. of Uttarakhand'}
          </p>
        </div>

        {/*Developer Programme */}
        <div className="border-t border-navy-900 py-2 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
            <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
            {isHi
              ?'डिजाइन, डेवलपमेंट और होस्टिंग मनीष पालीवाल ,दीपक बिष्ट  के साथ ।'
              : 'Design, Development, Hosting and Managed by Department Of Zila Panchayat Almora, Uttarakhand'}
            <button 
              onClick={() => setShowDeveloperContact(true)}
              className="ml-1 text-slate-300 hover:text-amber-400 font-medium transition-colors"
            >
              {isHi ? '(हमसे संपर्क करें)' : '(Contact Developers)'}
            </button>
          </p>
        </div>
      </div>


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
