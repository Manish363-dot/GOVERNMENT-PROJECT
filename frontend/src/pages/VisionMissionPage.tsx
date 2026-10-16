import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Target,
  ShieldCheck,
  Mountain,
  Leaf,
  Recycle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
  FileText,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export function VisionMissionPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const visionPillars = useMemo(() => [
    {
      title: isHi ? 'पर्वतीय पर्यावरण व नदी संरक्षण' : 'Himalayan Ecology & River Conservation',
      desc: isHi
        ? 'अल्मोड़ा की प्राकृतिक वादियों, कोसी व सुयाल नदी जलग्रहण क्षेत्रों को प्लास्टिक व ठोस कचरे से सर्वथा मुक्त रखना।'
        : "Preserving Almora's scenic hills, valleys, and river catchment areas from plastic contamination and solid waste accumulation.",
      icon: Mountain,
      serial: 'V-01',
    },
    {
      title: isHi ? 'शून्य-लैंडफिल एवं शत-प्रतिशत पृथक्करण' : 'Zero-Landfill & 100% Segregation',
      desc: isHi
        ? 'गीले और सूखे कचरे का शत-प्रतिशत वैज्ञानिक स्रोत पर पृथक्करण सुनिश्चित कर खुले में डंपिंग समाप्त करना।'
        : 'Achieving 100% source-level segregation of wet and dry waste to eliminate open dumping practices.',
      icon: Recycle,
      serial: 'V-02',
    },
    {
      title: isHi ? 'सतत पर्यटन एवं स्वच्छ देवभूमि' : 'Eco-Tourism & Clean Devbhoomi',
      desc: isHi
        ? 'धार्मिक व पर्यटक स्थलों पर कचरा-मुक्त वातावरण जिससे पर्यटकों एवं श्रद्धालुओं में पर्यावरण चेतना जागे।'
        : 'Maintaining spotless tourist and pilgrimage routes to foster responsible eco-tourism across Uttarakhand.',
      icon: Leaf,
      serial: 'V-03',
    },
  ], [isHi]);

  const missionPillars = useMemo(() => [
    {
      title: isHi ? 'डोर-टू-डोर दैनिक एकत्रीकरण' : 'Daily Door-to-Door Collection',
      desc: isHi
        ? 'समस्त 11 विकासखंडों, ग्राम पंचायतों और ग्रामीण बाजारों में नियमित स्वच्छता वाहनों का परिचालन।'
        : 'Regular morning waste pickup across all rural markets, gram panchayat wards, and commercial establishments.',
      icon: CheckCircle2,
      serial: 'M-01',
    },
    {
      title: isHi ? 'जीपीएस फ्लीट ट्रैकिंग व पारदर्शिता' : 'GPS Telematics Fleet Tracking',
      desc: isHi
        ? 'प्रत्येक कचरा संग्रहण वाहन में मिलीट्रैक (MilliTrack) जीपीएस से रीयल-टाइम रूट मॉनिटरिंग एवं पारदर्शी जवाबदेही।'
        : 'Real-time vehicle tracking via MilliTrack GPS hardware ensuring route compliance and full operational transparency.',
      icon: ShieldCheck,
      serial: 'M-02',
    },
    {
      title: isHi ? 'त्वरित नागरिक शिकायत निवारण' : 'Swift Citizen Grievance Redressal',
      desc: isHi
        ? 'नागरिकों द्वारा दर्ज की गई शिकायतों का 24 से 48 घंटे के भीतर डिजिटल समाधान व समयबद्ध स्टेटस ट्रैकिंग।'
        : 'Digital complaint logging with guaranteed resolution and status tracking within 24 to 48 operational hours.',
      icon: Clock,
      serial: 'M-03',
    },
  ], [isHi]);

  const strategicMilestones = useMemo(() => [
    {
      year: '2025–2026',
      phase: isHi ? 'चरण I' : 'Phase I',
      title: isHi ? '100% वाहन जीपीएस एवं डिजिटल कमांड पोर्टल' : '100% Fleet GPS & Command Portal',
      desc: isHi
        ? 'सभी वाहनों पर रीयल-टाइम जीपीएस ट्रैकिंग, नागरिक शिकायत पोर्टल एवं डिजिटल दैनिक कार्य फोटो अभिलेख।'
        : 'Full fleet telematics, citizen grievance portal, and daily work photo archiving across all 11 blocks.',
    },
    {
      year: '2026–2027',
      phase: isHi ? 'चरण II' : 'Phase II',
      title: isHi ? 'ब्लॉक स्तरीय मैटेरियल रिकवरी सेंटर (MRF) विस्तार' : 'Block-Level MRF Expansion',
      desc: isHi
        ? 'हवालबाग, रानीखेत, द्वाराहाट सहित सभी ब्लॉकों में हाइड्रोलिक प्लास्टिक कॉम्पेक्टर व बेलिंग यूनिट्स।'
        : 'Hydraulic plastic compactors and baling facilities operationalised across all 11 development blocks.',
    },
    {
      year: '2027–2028',
      phase: isHi ? 'चरण III' : 'Phase III',
      title: isHi ? 'विकेंद्रीकृत कम्पोस्टिंग एवं प्लास्टिक-मुक्त गलियारे' : 'Decentralised Composting & Plastic-Free Corridors',
      desc: isHi
        ? 'गीले कचरे से जैविक खाद उत्पादन एवं पर्यटन व तीर्थ मार्गों को पूरी तरह सिंगल-यूज प्लास्टिक मुक्त बनाना।'
        : 'Organic manure production from wet waste and zero-single-use-plastic heritage and tourist corridors district-wide.',
    },
  ], [isHi]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans pb-20">

      {/* ══════════════════════════════════════════
          HERO BANNER — Official Government Style
      ══════════════════════════════════════════ */}
      <div className="relative bg-[#0a1628] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9933] border border-[#FF9933]/30 bg-[#FF9933]/10 px-2.5 py-1 rounded-sm">
              {isHi ? 'जिला पंचायत अल्मोड़ा' : 'District Panchayat Almora'}
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {isHi ? 'विज़न एवं मिशन' : 'Vision & Mission'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-[2.6rem] font-extrabold text-white tracking-tight leading-tight mb-3 font-poppins">
                {isHi ? 'हमारा विज़न एवं मिशन' : 'Vision & Mission Statement'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत ठोस अपशिष्ट प्रबंधन, सफाई व्यवस्था एवं वाहन संचालन हेतु पारदर्शी डिजिटल प्रशासन।'
                  : 'District Panchayat Almora — Committed to transparent, accountable, and technology-driven solid waste management under Swachh Bharat Mission (Grameen).'}
              </p>
            </div>

            {/* Stamp-style authority badge */}
            <div className="shrink-0 border border-slate-600 rounded-sm px-4 py-3 bg-white/5 backdrop-blur-sm flex flex-col items-center min-w-[160px]">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400 mb-1">
                {isHi ? 'संदर्भ संख्या' : 'Ref. Document'}
              </span>
              <span className="font-mono text-sm font-bold text-amber-400">DPA/SBM/VM/2025</span>
              <div className="w-full h-px bg-slate-700 my-2" />
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest">
                {isHi ? 'स्वच्छ भारत मिशन' : 'Swachh Bharat Mission'}
              </span>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="flex gap-1 mt-7">
            <div className="h-[3px] w-16 bg-[#FF9933] rounded-full" />
            <div className="h-[3px] w-8 bg-white/30 rounded-full" />
            <div className="h-[3px] w-4 bg-[#138808] rounded-full" />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">

        {/* ── Vision & Mission 2-col grid ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── VISION CARD ── */}
          <div className="bg-white rounded-none border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Tricolor stripe */}
            <div className="flex h-[4px]">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-[#138808]" />
            </div>

            {/* Section header */}
            <div className="px-6 py-4 bg-[#0a1628] border-l-4 border-[#FF9933] flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-[#FF9933] shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-200/70 mb-0.5">
                  {isHi ? 'दीर्घकालीन ध्येय' : 'Long-Term Goal · Section 01'}
                </p>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isHi ? 'हमारा विज़न' : 'Our Vision'}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-200/50 border border-blue-300/20 px-2 py-0.5 rounded-sm">
                VISION
              </span>
            </div>

            {/* Official Vision Statement */}
            <div className="px-6 pt-5 pb-4 border-b border-dashed border-slate-200 bg-slate-50">
              <div className="flex gap-3">
                <div className="w-0.5 bg-[#FF9933] shrink-0 self-stretch" />
                <blockquote className="text-sm sm:text-[14.5px] text-slate-700 font-medium leading-relaxed italic">
                  {isHi
                    ? '"अल्मोड़ा के समस्त ग्रामीण एवं अर्ध-शहरी अंचलों को एक स्वच्छ, हरित, प्रदूषण-मुक्त तथा शून्य-अपशिष्ट (Zero-Waste) आदर्श पर्वतीय क्षेत्र के रूप में स्थापित करना।"'
                    : '"To establish Almora\'s rural and semi-urban valleys as a pristine, green, pollution-free and zero-waste model mountain district of Uttarakhand."'}
                </blockquote>
              </div>
            </div>

            {/* Vision Pillars */}
            <div className="px-6 py-5 space-y-3 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                {isHi ? 'मुख्य स्तंभ' : 'Strategic Pillars'}
              </p>
              {visionPillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.serial} className="flex items-start gap-3 p-3.5 border border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                      <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#FF9933]" />
                      </div>
                      <span className="font-mono text-[8px] text-slate-400 font-bold">{item.serial}</span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5">{item.title}</h3>
                      <p className="text-[11.5px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-3 h-3 text-[#138808]" />
                {isHi ? 'स्वच्छ अल्मोड़ा · देवभूमि' : 'Clean Almora · Devbhoomi'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">SBM-G / 2025-28</span>
            </div>
          </div>

          {/* ── MISSION CARD ── */}
          <div className="bg-white rounded-none border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Tricolor stripe */}
            <div className="flex h-[4px]">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white border-y border-slate-200" />
              <div className="flex-1 bg-[#138808]" />
            </div>

            {/* Section header */}
            <div className="px-6 py-4 bg-[#0a1628] border-l-4 border-[#138808] flex items-center gap-4">
              <Target className="w-6 h-6 text-[#4ade80] shrink-0" />
              <div className="flex-1">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-200/70 mb-0.5">
                  {isHi ? 'कार्ययोजना एवं रणनीति' : 'Action Plan & Strategy · Section 02'}
                </p>
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isHi ? 'हमारा मिशन' : 'Our Mission'}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-200/50 border border-blue-300/20 px-2 py-0.5 rounded-sm">
                MISSION
              </span>
            </div>

            {/* Official Mission Statement */}
            <div className="px-6 pt-5 pb-4 border-b border-dashed border-slate-200 bg-slate-50">
              <div className="flex gap-3">
                <div className="w-0.5 bg-[#138808] shrink-0 self-stretch" />
                <blockquote className="text-sm sm:text-[14.5px] text-slate-700 font-medium leading-relaxed italic">
                  {isHi
                    ? '"आधुनिक जीपीएस तकनीक, एमआरएफ रीसाइक्लिंग केंद्र, समर्पित पर्यावरण मित्रों और जन-सहभागिता के माध्यम से प्रत्येक ग्राम पंचायत तक शत-प्रतिशत स्वच्छता सेवा पहुंचाना।"'
                    : '"Delivering 100% efficient sanitation services to every gram panchayat through modern GPS telematics, MRF recycling infrastructure, and dedicated Paryavaran Mitras."'}
                </blockquote>
              </div>
            </div>

            {/* Mission Pillars */}
            <div className="px-6 py-5 space-y-3 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
                {isHi ? 'मुख्य उद्देश्य' : 'Core Objectives'}
              </p>
              {missionPillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.serial} className="flex items-start gap-3 p-3.5 border border-slate-200 bg-white hover:bg-slate-50 transition-colors group">
                    <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
                      <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#4ade80]" />
                      </div>
                      <span className="font-mono text-[8px] text-slate-400 font-bold">{item.serial}</span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5">{item.title}</h3>
                      <p className="text-[11.5px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-[#0a1628]" />
                {isHi ? 'वैज्ञानिक प्रबंधन · जन-भागीदारी' : 'Scientific SWM · Civic Participation'}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">SBM-G / 2025-28</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            STRATEGIC ROADMAP — Phase-wise Timeline
        ══════════════════════════════════════════ */}
        <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Tricolor stripe */}
          <div className="flex h-[4px]">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white border-y border-slate-200" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 bg-[#0a1628] border-l-4 border-amber-400 flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-blue-200/70 mb-0.5">
                {isHi ? 'कार्यान्वयन योजना · धारा 03' : 'Implementation Roadmap · Section 03'}
              </p>
              <h2 className="text-base font-bold text-white">
                {isHi ? 'रणनीतिक लक्ष्य एवं कार्ययोजना (2025–2028)' : 'Strategic Goals & Implementation Roadmap (2025–2028)'}
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-200/50 border border-blue-300/20 px-2 py-0.5 hidden sm:block">
              3-YR PLAN
            </span>
          </div>

          {/* Timeline grid */}
          <div className="p-6 grid md:grid-cols-3 gap-0 md:divide-x divide-slate-200 border-t border-slate-100">
            {strategicMilestones.map((ms, idx) => (
              <div key={idx} className="flex flex-col px-5 py-4 first:pl-0 last:pr-0 relative">
                {/* Connector line on mobile */}
                {idx < 2 && (
                  <div className="absolute bottom-0 left-6 right-6 h-px bg-slate-200 md:hidden" />
                )}

                {/* Phase badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-white bg-[#0a1628] px-2 py-1">
                    {ms.phase}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-500">{ms.year}</span>
                </div>

                {/* Step number */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-400/15 border-2 border-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-extrabold text-amber-600">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug mb-1.5">{ms.title}</h3>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">{ms.desc}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-[#138808] shrink-0" />
                  <span className="font-semibold">{isHi ? 'प्राथमिकता लक्ष्य' : 'Priority Deliverable'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            AUTHORITY FOOTER STRIP + CTA
        ══════════════════════════════════════════ */}
        <div className="grid sm:grid-cols-3 gap-4">
          {/* Mandate box */}
          <div className="sm:col-span-2 bg-[#0a1628] border border-slate-700 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm text-white mb-1">
                {isHi ? 'जिला पंचायत अल्मोड़ा के स्वच्छता अभियान से जुड़ें' : "Join District Panchayat Almora's Cleanliness Mission"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isHi
                  ? 'अपने क्षेत्र के सफाई दल या अधिकारियों के बारे में विस्तृत जानकारी प्राप्त करें।'
                  : 'Learn about our administrative officers, nodal leadership, and field sanitation teams.'}
              </p>
            </div>
            <Link
              to="/staff-directory"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-[#0a1628] font-extrabold text-xs uppercase tracking-wider transition-colors"
            >
              {isHi ? 'कर्मचारी विवरण' : 'Staff Directory'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Location info box */}
          <div className="bg-white border border-slate-200 p-5 flex flex-col gap-3">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              {isHi ? 'कार्यक्षेत्र' : 'Operational Jurisdiction'}
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">{isHi ? 'अल्मोड़ा जिला' : 'Almora District'}</p>
                <p className="text-[11px] text-slate-500">{isHi ? 'उत्तराखण्ड, भारत' : 'Uttarakhand, India'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isHi ? '11 विकासखंड' : '11 Development Blocks'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Official Footer Note ── */}
        <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-slate-400 font-medium">
            {isHi
              ? '© जिला पंचायत अल्मोड़ा | स्वच्छ भारत मिशन (ग्रामीण) | यह एक आधिकारिक सरकारी दस्तावेज़ है।'
              : '© District Panchayat Almora | Swachh Bharat Mission (Grameen) | This is an official government document.'}
          </p>
          <span className="font-mono text-[10px] text-slate-400">DPA/SBM-G/2025–2028</span>
        </div>

      </div>
    </div>
  );
}
