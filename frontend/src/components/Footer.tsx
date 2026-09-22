import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Phone, Mail, MapPin, ShieldCheck, Globe, Building2,
  FileText, ChevronRight, Clock, Users,
  Sparkles, X, CheckCircle2
} from 'lucide-react';

export function Footer() {
  const { t, i18n } = useTranslation();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const isHi = i18n.language === 'hi';

  const policyDetails: Record<string, { titleEn: string; titleHi: string; contentEn: string[]; contentHi: string[] }> = {
    websitePolicies: {
      titleEn: "Website Policies & Digital Governance Guidelines",
      titleHi: "वेबसाइट नीतियां एवं डिजिटल गवर्नेंस दिशा-निर्देश",
      contentEn: [
        "This portal is the official digital infrastructure of District Panchayat Almora, Panchayati Raj Department, Government of Uttarakhand.",
        "All data regarding solid waste collection fleet, GPS tracking telemetry, and public grievance records are maintained under state digital security standards.",
        "Unauthorized access, automated data scraping, or tampering with live vehicle telemetry streams is punishable under the Information Technology Act, 2000."
      ],
      contentHi: [
        "यह पोर्टल जिला पंचायत अल्मोड़ा, पंचायती राज विभाग, उत्तराखंड सरकार की आधिकारिक डिजिटल अवसंरचना है।",
        "ठोस अपशिष्ट संग्रहण बेड़े, जीपीएस ट्रैकिंग टेलीमैटिक्स और नागरिक शिकायत अभिलेखों से संबंधित सभी डेटा राज्य डिजिटल सुरक्षा मानकों के तहत बनाए रखे जाते हैं।",
        "अनधिकृत पहुंच, स्वचालित डेटा निष्कर्षण, या लाइव वाहन टेलीमैटिक्स स्ट्रीम के साथ छेड़छाड़ सूचना प्रौद्योगिकी अधिनियम, 2000 के तहत दंडनीय है।"
      ]
    },
    terms: {
      titleEn: "Terms of Use & Public Service Charter",
      titleHi: "उपयोग की शर्तें एवं लोक सेवा चार्टर",
      contentEn: [
        "By accessing this portal, citizens agree to provide authentic contact and location information when registering waste collection grievances.",
        "Grievances registered on this portal are routed directly to the designated Ward Sanitation Supervisor and District Nodal Officer.",
        "False reporting or registering spam complaints may lead to temporary suspension of citizen service access."
      ],
      contentHi: [
        "इस पोर्टल का उपयोग करके, नागरिक अपशिष्ट संग्रहण शिकायतें दर्ज करते समय प्रामाणिक संपर्क और स्थान की जानकारी प्रदान करने के लिए सहमत होते हैं।",
        "इस पोर्टल पर दर्ज शिकायतें सीधे नामित वार्ड स्वच्छता पर्यवेक्षक और जिला नोडल अधिकारी को भेजी जाती हैं।",
        "गलत जानकारी देने या स्पैम शिकायतें दर्ज करने से नागरिक सेवा तक पहुंच अस्थायी रूप से निलंबित हो सकती है।"
      ]
    },
    privacy: {
      titleEn: "Privacy Policy & Data Security",
      titleHi: "गोपनीयता नीति एवं डेटा सुरक्षा",
      contentEn: [
        "District Panchayat Almora respects citizen privacy. Personal details (Name, Mobile Number, Ward Address) collected during complaint registration are strictly used for grievance resolution and SMS status updates.",
        "No citizen data is sold, rented, or disclosed to third-party commercial entities.",
        "GPS location telemetry collected from sanitation collection trucks is used solely for public service optimization and administrative audit."
      ],
      contentHi: [
        "जिला पंचायत अल्मोड़ा नागरिक गोपनीयता का सम्मान करता है। शिकायत पंजीकरण के दौरान एकत्र किए गए व्यक्तिगत विवरण (नाम, मोबाइल नंबर, वार्ड का पता) का उपयोग केवल शिकायत निवारण और एसएमएस स्थिति अपडेट के लिए किया जाता है।",
        "कोई भी नागरिक डेटा किसी तीसरे पक्ष की व्यावसायिक संस्थाओं को बेचा, किराए पर या साझा नहीं किया जाता है।",
        "सफाई वाहनों से एकत्र किए गए जीपीएस स्थान टेलीमैटिक्स का उपयोग केवल लोक सेवा अनुकूलन और प्रशासनिक ऑडिट के लिए किया जाता है।"
      ]
    },
    accessibility: {
      titleEn: "Accessibility Statement & Standards Compliance",
      titleHi: "सुगम्यता कथन एवं मानक अनुपालन",
      contentEn: [
        "This portal is designed to comply with Guidelines for Indian Government Websites (GIGW) and WCAG 2.1 AA accessibility standards.",
        "Features include high-contrast bilingual support (Hindi & English), scalable typography, screen-reader friendly semantic markup, and keyboard navigation.",
        "For any accessibility feedback, please write to our technical desk at safai@zilapanchayat.uk.gov.in."
      ],
      contentHi: [
        "यह पोर्टल भारतीय सरकारी वेबसाइटों के लिए दिशा-निर्देशों (GIGW) और WCAG 2.1 AA सुगम्यता मानकों का अनुपालन करने के लिए डिज़ाइन किया गया है।",
        "सुविधाओं में उच्च-विपरीत द्विभाषी सहायता (हिंदी और अंग्रेजी), स्केलेबल टाइपोग्राफी, स्क्रीन-रीडर अनुकूल सिमेंटिक मार्कअप और कीबोर्ड नेविगेशन शामिल हैं।",
        "किसी भी सुगम्यता संबंधी सुझाव के लिए, कृपया हमारे तकनीकी डेस्क को safai@zilapanchayat.uk.gov.in पर लिखें।"
      ]
    },
    copyrightPolicy: {
      titleEn: "Copyright Policy & Content Re-use",
      titleHi: "कॉपीराइट नीति एवं सामग्री पुनः उपयोग",
      contentEn: [
        "Material featured on this portal (including official crests, media gallery, route telemetry reports, and notifications) is subject to copyright protection.",
        "Content may be reproduced free of charge in any format or media without requiring specific permission, subject to the material being reproduced accurately and not being used in a derogatory or misleading context.",
        "Where content is republished, the source must be prominently acknowledged as District Panchayat Almora, Govt. of Uttarakhand."
      ],
      contentHi: [
        "इस पोर्टल पर प्रदर्शित सामग्री (आधिकारिक प्रतीक चिन्ह, मीडिया गैलरी, मार्ग टेलीमैटिक्स रिपोर्ट और सूचनाएं शामिल हैं) कॉपीराइट संरक्षण के अधीन है।",
        "सामग्री को किसी भी प्रारूप या मीडिया में बिना किसी विशेष अनुमति के नि:शुल्क पुनरुत्पादित किया जा सकता है, बशर्ते सामग्री का सटीक पुनरुत्पादन किया जाए और अपमानजनक या भ्रामक संदर्भ में उपयोग न किया जाए।",
        "जहां सामग्री पुनः प्रकाशित की जाती है, स्रोत को जिला पंचायत अल्मोड़ा, उत्तराखंड सरकार के रूप में प्रमुखता से स्वीकार किया जाना चाहिए।"
      ]
    },
    hyperlinkPolicy: {
      titleEn: "Hyperlink Policy",
      titleHi: "हाइपरलिंक नीति",
      contentEn: [
        "Links to external websites (such as India.gov.in, Digital India, or National Portal) are provided for citizen convenience.",
        "District Panchayat Almora is not responsible for the availability, reliability, or privacy practices of external government or private portals.",
        "Prior permission must be obtained before creating deep hyper-links to any page on this portal."
      ],
      contentHi: [
        "बाहरी वेबसाइटों (जैसे India.gov.in, डिजिटल इंडिया, या राष्ट्रीय पोर्टल) के लिंक नागरिक सुविधा के लिए प्रदान किए जाते हैं।",
        "जिला पंचायत अल्मोड़ा बाहरी सरकारी या निजी पोर्टलों की उपलब्धता, विश्वसनीयता या गोपनीयता प्रथाओं के लिए जिम्मेदार नहीं है।",
        "इस पोर्टल के किसी भी पृष्ठ का मुख्य हाइपरलिंक बनाने से पहले पूर्व अनुमति प्राप्त की जानी चाहिए।"
      ]
    },
    disclaimer: {
      titleEn: "Official Disclaimer",
      titleHi: "आधिकारिक अस्वीकरण",
      contentEn: [
        "While every effort has been made to ensure accuracy of live GPS vehicle tracking and route replays, real-time telematics may be subject to temporary satellite signal fluctuations or cellular network outages in high-altitude mountain terrain.",
        "In case of urgent waste collection emergencies, citizens are advised to call our Toll-Free Helpline: 1800-185-1850."
      ],
      contentHi: [
        "यद्यपि लाइव जीपीएस वाहन ट्रैकिंग और मार्ग रीप्ले की सटीकता सुनिश्चित करने का हर संभव प्रयास किया गया है, उच्च पर्वतीय क्षेत्रों में वास्तविक समय टेलीमैटिक्स अस्थायी उपग्रह सिग्नल उतार-चढ़ाव या सेलुलर नेटवर्क आउटेज के अधीन हो सकती है।",
        "कचरा संग्रहण की तत्काल आपात स्थिति में, नागरिकों को हमारे टोल-फ्री हेल्पलाइन: 1800-185-1850 पर कॉल करने की सलाह दी जाती है।"
      ]
    }
  };

  return (
    <footer className="bg-navy-950 text-white border-t border-navy-900 font-sans relative overflow-hidden">
      {/* 1. Tricolor Indian Accent Line */}
      <div className="uk-tricolor-line" />

      {/* 2. Official Government Header Strip */}
      <div className="bg-navy-900/90 border-b border-navy-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* State Emblem & Hierarchy Title */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-11 h-11 rounded bg-white p-1 flex items-center justify-center border border-slate-300 shadow-xs shrink-0">
              <img
                src="/assets/app-logo.png"
                alt="District Panchayat Almora Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                  {isHi ? 'उत्तराखंड सरकार • पंचायती राज विभाग' : 'Government of Uttarakhand • Panchayati Raj Department'}
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold uppercase">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {t('footer.officialBadge')}
                </span>
              </div>
              <h3 className="font-poppins font-bold text-white text-base sm:text-lg tracking-tight leading-tight mt-0.5">
                {t('footer.districtTitle')}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                {t('footer.missionTitle')}
              </p>
            </div>
          </div>

          {/* National Seals & Badges */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <div className="bg-navy-950 border border-navy-800 px-3 py-1.5 rounded flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <p className="text-[9px] text-slate-400 uppercase leading-none">{isHi ? 'राष्ट्रीय पहल' : 'National Mission'}</p>
                <p className="text-[11px] font-bold text-white leading-tight">स्वच्छ भारत मिशन (ग्रामीण)</p>
              </div>
            </div>
            <div className="bg-navy-950 border border-navy-800 px-3 py-1.5 rounded flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <p className="text-[9px] text-slate-400 uppercase leading-none">{isHi ? 'डिजिटल गवर्नेंस' : 'Digital India'}</p>
                <p className="text-[11px] font-bold text-white leading-tight">Digital India Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main 4-Column Government Information Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Identity & Mandate */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-7 h-7 object-contain rounded" />
              <span className="font-poppins font-bold text-white text-base tracking-tight">
                {t('footer.brandName')}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="pt-1 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isHi ? 'सत्यापित राज्य सेवा पोर्टल' : 'Certified Govt. Telematics Portal'}</span>
              </div>
              <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5 italic">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('footer.slogan')}
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3.5 text-amber-400 flex items-center gap-1.5 border-b border-navy-900 pb-2">
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              {t('footer.linksTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: t('footer.nav.home'), href: '/' },
                { name: t('footer.nav.about'), href: '/#about' },
                { name: t('footer.nav.complaint'), href: '/#complaint' },
                { name: t('footer.nav.contact'), href: '/#contact' },
                { name: t('footer.nav.gallery'), href: '/#gallery' },
                { name: t('footer.nav.admin'), href: '/signin' }
              ].map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-amber-400 transition-colors" />
                    <span>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Public Services & Telematics */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3.5 text-emerald-400 flex items-center gap-1.5 border-b border-navy-900 pb-2">
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
              {t('footer.servicesTitle')}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { name: t('footer.services.tracking'), icon: ShieldCheck, href: '/signin' },
                { name: t('footer.services.history'), icon: Clock, href: '/signin' },
                { name: t('footer.services.grievance'), icon: FileText, href: '/#complaint' },
                { name: t('footer.services.mrf'), icon: Building2, href: '/#about' },
                { name: t('footer.services.paryavaran'), icon: Users, href: '/#about' }
              ].map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="text-slate-300 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <service.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 transition-colors" />
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Official Contact & Control Room Desk */}
          <div>
            <h4 className="font-poppins font-semibold text-xs tracking-wider uppercase mb-3.5 text-amber-400 flex items-center gap-1.5 border-b border-navy-900 pb-2">
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              {t('footer.contactTitle')}
            </h4>

            {/* Callout Toll-Free Box */}
            <div className="bg-navy-900 border border-amber-500/40 rounded-lg p-3 mb-3.5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                {t('footer.tollFreeLabel')}
              </p>
              <p className="text-lg font-mono font-bold text-white tracking-wide">
                1800-185-1850
              </p>
              <p className="text-[10px] text-slate-400">
                {t('footer.tollFreeTime')}
              </p>
            </div>

            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px]">safai@zilapanchayat.uk.gov.in</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-[11px]">{t('footer.hqAddress')}</span>
              </li>
            </ul>

            {/* Control Room Live Status Indicator */}
            <div className="mt-3.5 pt-2 border-t border-navy-900 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wide">
                {t('footer.controlRoom')}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Mandatory Government Website Policies Bar */}
        <div className="border-t border-navy-900 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-slate-300">{t('footer.policiesTitle')}:</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1.5 gap-x-3 text-xs text-slate-300">
              {Object.keys(policyDetails).map((key, index) => (
                <div key={key} className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedPolicy(key)}
                    className="hover:text-amber-300 hover:underline transition-colors text-[11px]"
                  >
                    {t(`footer.policies.${key}`)}
                  </button>
                  {index < Object.keys(policyDetails).length - 1 && (
                    <span className="text-slate-600 text-[10px]">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clean NIC & Government Hosting Bottom Bar (Visitor Counter & Last Updated badges removed as requested) */}
      <div className="bg-navy-900/90 border-t border-navy-900 py-5 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          {/* Owner Info */}
          <p className="text-slate-300 font-medium">
            {t('footer.contentOwner')}
          </p>

          {/* Developer / NIC Credits */}
          <p className="text-[11px] text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t('footer.developedBy')}</span>
          </p>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto border-t border-navy-800 mt-3 pt-3 text-center text-[11px] text-slate-500">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>

      {/* Policy Details Modal */}
      {selectedPolicy && policyDetails[selectedPolicy] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-navy-950 border border-amber-500/50 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="bg-navy-900 px-6 py-4 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-poppins font-bold text-sm sm:text-base text-white">
                  {isHi ? policyDetails[selectedPolicy].titleHi : policyDetails[selectedPolicy].titleEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-amber-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200 leading-relaxed touch-scroll">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 border border-amber-700/50 text-amber-300 text-[11px] font-semibold">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isHi ? 'जिला पंचायत अल्मोड़ा - सरकारी डिजिटल नीति' : 'District Panchayat Almora - Official Policy'}</span>
              </div>

              {(isHi ? policyDetails[selectedPolicy].contentHi : policyDetails[selectedPolicy].contentEn).map((para, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-navy-900/80 p-3 rounded border border-navy-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>{para}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="bg-navy-900 px-6 py-3 border-t border-navy-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {isHi ? 'उत्तराखंड सरकार डिजिटल प्रशासन' : 'Govt. of Uttarakhand Digital Governance'}
              </span>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold transition-colors text-xs"
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
