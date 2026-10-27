import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Phone, Mail, MapPin, X, CheckCircle2, Building2 } from 'lucide-react';
import { PANCHAYATI_RAJ_LOGO_URL } from './TopBarLogos';
import { cn } from '@/lib/utils';
export const Footer = React.memo(() => {
  const { i18n } = useTranslation();
  const [showDeveloperContact, setShowDeveloperContact] = useState(false);
  const isHi = i18n.language === 'hi';

  const navLinks = React.useMemo(() => [
    { label: isHi ? 'मुख्य पृष्ठ' : 'Home', href: '/' },
    { label: isHi ? 'परिचय' : 'About Us', href: '#about-zp' },
    { label: isHi ? 'हमारी पहल' : 'Our Initiative', href: '/our-initiative' },
    { label: isHi ? 'विज़न और मिशन' : 'Vision & Mission', href: '/vision-mission' },
    { label: isHi ? 'अधिकारी विवरण' : 'Staff Directory', href: '/staff-directory' },
    { label: isHi ? 'ठोस अपशिष्ट प्रबन्धन' : 'SWM Portal', href: '/safai-portal' },
    { label: isHi ? 'किराया प्रबंधन पोर्टल' : 'Rental Management Portal', href: '/rental-portal' },
    { label: isHi ? '11 विकासखण्ड' : '11 Blocks', href: '/blocks' },
    { label: isHi ? 'हमारा मीडिया' : 'Our Media', href: '/media' },
    { label: isHi ? 'सूचनाएं एवं अपडेट' : 'Notices & Updates', href: '/#Notices' },
    { label: isHi ? 'सोशल मीडिया जुड़ाव' : 'Social Engagement', href: '/#social-engagement' },
    { label: isHi ? 'दैनिक कार्य' : 'Daily Work', href: '/#blogs' },
    { label: isHi ? 'शिकायत दर्ज करें' : 'Register Complaint', href: '/complaint' },
    { label: isHi ? 'ठोस अपवशिष्ट प्रबन्धन पोर्टल' : 'About SWM Portal', href: '/contact' },
    { label: isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules', href: '/bylaws' },
    {label:isHi ? "ग्राम पंचायत विवरण" : "Swachhata Pledge", href:"/safai-portal#pledge"}
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
              <p className={cn(
                "text-[10px] font-semibold text-amber-400 uppercase leading-none",
                isHi ? "tracking-normal" : "tracking-widest"
              )}>
                {isHi ? 'उत्तराखंड सरकार • पंचायती राज विभाग' : 'Govt. of Uttarakhand • Panchayati Raj Department'}
              </p>
              <p className="font-poppins text-sm sm:text-base font-bold text-white leading-tight mt-0.5">
                {isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

          {/* Col 1: About Portal */}
          <div className="space-y-2.5">
            <h4 className={cn(
              "text-xs font-bold text-amber-400 uppercase border-b border-navy-800 pb-1.5",
              isHi ? "tracking-normal text-sm" : "tracking-widest"
            )}>
              {isHi ? 'पोर्टल के बारे में' : 'About This Portal'}
            </h4>
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
              {isHi
                ? 'जिला पंचायत अल्मोड़ा का आधिकारिक पोर्टल डिजिटल सुविधाएँ, कर एवं संपत्ति प्रबंधन, सार्वजनिक सूचनाएँ तथा जनशिकायत निवारण सेवाएँ प्रदान करता है। इसका उद्देश्य पारदर्शी, कुशल और सुलभ प्रशासन के माध्यम से नागरिकों को बेहतर सेवाएँ उपलब्ध कराना है।'
                : 'Official portal of Zila Panchayat Almora, providing essential digital facilities, tax and property management, public information, and citizen grievance redressal to promote transparent, efficient, and accessible governance.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold italic pt-0.5">
              <span>{isHi ? '“डिजिटल उत्तराखंड • सशक्त उत्तराखंड”' : '"Digital Uttarakhand • Stronger Uttarakhand"'}</span>
            </div>

            <p className="text-xs italic text-amber-300 font-medium">
              {isHi ? '“स्वच्छ भारत • स्वच्छ देवभूमि”' : '"Swachh Bharat • Swachh Devbhoomi"'}
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className={cn(
              "text-xs font-bold text-amber-400 uppercase border-b border-navy-800 pb-1.5 mb-2.5",
              isHi ? "tracking-normal text-sm" : "tracking-widest"
            )}>
              {isHi ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="grid grid-cols-2 gap-y-1.5 gap-x-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  {link.href.startsWith('/#') ? (
                    <a
                      href={link.href}
                      className="text-xs sm:text-[13px] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors shrink-0" />
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-xs sm:text-[13px] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group"
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
            <h4 className={cn(
              "text-xs font-bold text-amber-400 uppercase border-b border-navy-800 pb-1.5 mb-2.5",
              isHi ? "tracking-normal text-sm" : "tracking-widest"
            )}>
              {isHi ? 'संपर्क एवं हेल्पलाइन' : 'Contact & Helpline'}
            </h4>

            {/* Toll-free highlight */}
            <div className="bg-navy-900 border border-amber-500/40 rounded-lg p-2.5 mb-2.5">
              <p className={cn(
                "text-[10px] font-bold uppercase text-amber-400 mb-0.5",
                isHi ? "tracking-normal" : "tracking-wider"
              )}>
                {isHi ? '☎ टोल-फ्री हेल्पलाइन' : '☎ Toll-Free Helpline'}
              </p>
              <p className="font-mono font-bold text-white text-base tracking-wide">1800-185-1850</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isHi ? 'सोम-शनि: सुबह 9 बजे से शाम 6 बजे तक' : 'Mon-Sat: 9:00 AM – 6:00 PM'}
              </p>
            </div>

            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-300">
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
             <Link
                to="/contact"
                className="text-[11px] text-slate-300 hover:text-amber-300 transition-colors hover:underline"
              >
                {isHi ? 'संपर्क' : 'Contact Us'}
              </Link>
          </div>
          <p className="text-[10px] text-slate-400 shrink-0">
            © {new Date().getFullYear()} {isHi ? 'जिला पंचायत अल्मोड़ा • उत्तराखंड सरकार' : 'District Panchayat Almora • Govt. of Uttarakhand'}
          </p>
        </div>

        {/*Developer Programme */}
        <div className="border-t border-navy-900 py-2 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
            {isHi
              ?'डिज़ाइन, विकास, होस्टिंग एवं प्रबंधन जिला पंचायत विभाग, अल्मोड़ा, उत्तराखंड द्वारा।'
              : 'Design, Development, Hosting and Managed by Department Of Zila Panchayat Almora, Uttarakhand'}
          </p>
        </div>
      </div>
    </footer>
  );
});
