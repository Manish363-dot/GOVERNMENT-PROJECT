import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Mountain,
  Recycle,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function VisionMissionPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visionPillars = useMemo(() => [
    {
      id: isHi ? 'विज़न-01' : 'Vision-01',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: isHi ? 'पर्वतीय पर्यावरण व नदी संरक्षण' : 'Himalayan Ecology & River Conservation',
      desc: isHi
        ? 'अल्मोड़ा की प्राकृतिक वादियों, कोसी व सुयाल नदी जलग्रहण क्षेत्रों को प्लास्टिक व ठोस कचरे से सर्वथा मुक्त रखना।'
        : "Preserving Almora's scenic hills, valleys, and river catchment areas from plastic contamination and solid waste accumulation.",
      highlights: isHi
        ? ['कोसी व सुयाल नदी जलग्रहण संरक्षण', 'प्राकृतिक वादियों में कचरा रोकथाम', 'ग्रामीण क्षेत्रों में हरित पहल']
        : ['River catchment protection', 'Zero plastic accumulation in valleys', 'Green rural initiatives'],
      icon: Mountain,
    },
    {
      id: isHi ? 'विज़न-02' : 'Vision-02',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
      title: isHi ? 'शून्य-लैंडफिल एवं शत-प्रतिशत पृथक्करण' : 'Zero-Landfill & 100% Segregation',
      desc: isHi
        ? 'गीले और सूखे कचरे का शत-प्रतिशत वैज्ञानिक स्रोत पर पृथक्करण सुनिश्चित कर खुले में डंपिंग समाप्त करना।'
        : 'Achieving 100% source-level segregation of wet and dry waste to eliminate open dumping practices.',
      highlights: isHi
        ? ['गीला व सूखा कचरा स्रोत पृथक्करण', 'खुले में डंपिंग पर पूर्ण रोक', 'जैविक खाद निर्माण को प्रोत्साहन']
        : ['100% source waste segregation', 'End to open dumping sites', 'Promotion of organic composting'],
      icon: Recycle,
    },
    {
      id: isHi ? 'विज़न-03' : 'Vision-03',
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
      title: isHi ? 'सतत पर्यटन एवं स्वच्छ देवभूमि' : 'Eco-Tourism & Clean Devbhoomi',
      desc: isHi
        ? 'धार्मिक व पर्यटक स्थलों पर कचरा-मुक्त वातावरण जिससे पर्यटकों एवं श्रद्धालुओं में पर्यावरण चेतना जागे।'
        : 'Maintaining spotless tourist and pilgrimage routes to foster responsible eco-tourism across Uttarakhand.',
      highlights: isHi
        ? ['धार्मिक व ऐतिहासिक स्थलों की सफाई', 'पर्यटन मार्गों पर विशेष डस्टबिन', 'सिंगल-यूज़ प्लास्टिक रोकथाम']
        : ['Pilgrimage & heritage site cleanliness', 'Eco-friendly bins on travel corridors', 'Single-use plastic prevention'],
      icon: Leaf,
    },
  ], [isHi]);

  const missionPillars = useMemo(() => [
    {
      id: isHi ? 'मिशन-01' : 'Mission-01',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: isHi ? 'डोर-टू-डोर दैनिक एकत्रीकरण' : 'Daily Door-to-Door Collection',
      desc: isHi
        ? 'समस्त 11 विकासखंडों, ग्राम पंचायतों और ग्रामीण बाजारों में नियमित स्वच्छता वाहनों का परिचालन।'
        : 'Regular morning waste pickup across all rural markets, gram panchayat wards, and commercial establishments.',
      highlights: isHi
        ? ['11 विकासखंडों में दैनिक वाहन सेवा', 'प्रातःकालीन निश्चित समय-सारणी', 'समर्पित स्वच्छता कर्मियों की तैनाती']
        : ['Daily collection across 11 blocks', 'Scheduled morning collection', 'Dedicated sanitation workforce'],
      icon: CheckCircle2,
    },
    {
      id: isHi ? 'मिशन-02' : 'Mission-02',
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: isHi ? 'जीपीएस फ्लीट ट्रैकिंग व पारदर्शिता' : 'GPS Telematics Fleet Tracking',
      desc: isHi
        ? 'प्रत्येक कचरा संग्रहण वाहन में मिलीट्रैक (MilliTrack) जीपीएस से रीयल-टाइम रूट मॉनिटरिंग एवं पारदर्शी जवाबदेही।'
        : 'Real-time vehicle tracking via MilliTrack GPS hardware ensuring route compliance and full operational transparency.',
      highlights: isHi
        ? ['MilliTrack GPS लाइव मॉनिटरिंग', 'मार्ग विचलन व ठहराव ट्रैकिंग', '100% पारदर्शी डिजिटल रिकॉर्ड']
        : ['Live MilliTrack GPS monitoring', 'Route compliance & idle detection', '100% transparent digital records'],
      icon: ShieldCheck,
    },
    {
      id: isHi ? 'मिशन-03' : 'Mission-03',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      title: isHi ? 'त्वरित नागरिक शिकायत निवारण' : 'Swift Citizen Grievance Redressal',
      desc: isHi
        ? 'नागरिकों द्वारा दर्ज की गई शिकायतों का 24 से 48 घंटे के भीतर डिजिटल समाधान व समयबद्ध स्टेटस ट्रैकिंग।'
        : 'Digital complaint logging with guaranteed resolution and status tracking within 24 to 48 operational hours.',
      highlights: isHi
        ? ['पोर्टल पर 24/7 ऑनलाइन शिकायत', '24 से 48 घंटे में समाधान गारंटी', 'समाधान पूर्व व पश्चात फोटो प्रमाण']
        : ['24/7 online grievance logging', '24–48 hour resolution target', 'Before & after photo verification'],
      icon: Clock,
    },
  ], [isHi]);

  // Combined items for carousel
  const carouselItems = useMemo(() => {
    return [...visionPillars, ...missionPillars];
  }, [visionPillars, missionPillars]);

  const maxIndex = Math.max(0, carouselItems.length - cardsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    setTouchStart(null);
  };

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
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Top Government Banner (Same as Our Initiative & Complaint Page Header) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-10 sm:py-14 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-[2.6rem] font-extrabold text-white tracking-tight leading-tight mb-3 font-poppins">
                {isHi ? 'हमारा विज़न एवं मिशन' : 'Vision & Mission Statement'}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत ठोस अपशिष्ट प्रबंधन, सफाई व्यवस्था एवं वाहन संचालन संबंधी समस्याओं का समयबद्ध समाधान व पारदर्शी डिजिटल ट्रैकिंग।'
                  : 'District Panchayat Almora — Timely redressal and 100% transparent tracking for solid waste management, sanitation issues, and vehicle operations under Swachh Bharat Mission (Grameen).'}
              </p>
            </div>
          </div>

          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="space-y-8">

          {/* Section 1: Institutional Statement & Overview */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-2xl font-bold text-navy-900 mb-3">
              {isHi ? 'पृष्ठभूमि एवं ध्येय' : 'Background & Core Purpose'}
            </h2>
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा का विज़न एवं मिशन आधुनिक डिजिटल पहलों, वैज्ञानिक अपशिष्ट प्रबंधन और सामुदायिक भागीदारी के माध्यम से पूरे जिले में स्वच्छता, पारदर्शिता और जवाबदेही को सुदृढ़ करना है। स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत हमारा उद्देश्य अल्मोड़ा को एक स्वच्छ, हरित, प्रदूषण-मुक्त और सतत पर्वतीय जिला बनाना है।'
                  : "District Panchayat Almora's vision and mission center around strengthening sanitation, transparency, and accountability across the district through modern digital solutions, scientific waste processing, and community engagement. Under the Swachh Bharat Mission (Grameen), our goal is to build a clean, green, pollution-free, and sustainable mountain district."}
              </p>

              {/* Quote Highlight Box */}
              <div className="p-4 sm:p-5 rounded-lg bg-slate-50 border-l-4 border-amber-500">
                <blockquote className="text-slate-800 font-medium text-sm sm:text-base italic leading-relaxed">
                  {isHi
                    ? '“अल्मोड़ा के समस्त ग्रामीण एवं अर्ध-शहरी अंचलों को एक स्वच्छ, हरित, प्रदूषण-मुक्त तथा शून्य-अपशिष्ट (Zero-Waste) आदर्श पर्वतीय क्षेत्र के रूप में स्थापित करना।”'
                    : '“To establish Almora\'s rural and semi-urban valleys as a pristine, green, pollution-free and zero-waste model mountain district of Uttarakhand.”'}
                </blockquote>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              Section 2: OUR VISION & OUR MISSION CARD CAROUSEL
             ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">

            {/* Header: Title + Category Tabs + Navigation Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-poppins text-navy-900">
                  {isHi ? 'हमारा विज़न एवं मिशन कार्ड्स' : 'Our Vision & Mission Cards'}
                </h2>
              </div>

              {/* Carousel Controls (Prev/Next buttons + Tab Pill Switcher) */}
              <div className="flex flex-wrap items-center gap-3">

                {/* Left / Right Carousel Arrow Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-colors flex items-center justify-center shadow-xs"
                    title={isHi ? 'पिछला' : 'Previous'}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-9 h-9 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-colors flex items-center justify-center shadow-xs"
                    title={isHi ? 'अगला' : 'Next'}
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── CARD SLIDER / CAROUSEL TRACK ── */}
            <div
              className="relative overflow-hidden -mx-2 px-2 py-2"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out gap-5"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {carouselItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="shrink-0 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden p-5 sm:p-6"
                      style={{
                        width: `calc(${100 / cardsPerView}% - ${(20 * (cardsPerView - 1)) / cardsPerView}px)`,
                      }}
                    >
                      {/* Card Header: Badge + Icon */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-navy-900 text-amber-400">
                            {item.id}
                          </span>

                          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base sm:text-lg text-navy-900 leading-snug mb-2">
                          {item.title}
                        </h3>

                        {/* Description */}
                        <p className="text-slate-700 text-xs sm:text-sm leading-relaxed mb-4">
                          {item.desc}
                        </p>

                        {/* Bullet Highlights */}
                        <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/80 mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {isHi ? 'मुख्य कार्यबिंदु' : 'Key Focus Points'}
                          </p>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {item.highlights.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                                <span className="leading-snug">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel Bottom Pagination Dots */}
            <div className="flex items-center justify-center mt-6 pt-4 border-t border-slate-100">
              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${idx === currentIndex
                      ? 'w-6 h-2 bg-navy-900'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════
              Section 3: 3-YEAR STRATEGIC ROADMAP (2025–2028)
             ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-navy-900">
                {isHi ? 'रणनीतिक लक्ष्य एवं चरणबद्ध कार्ययोजना (2025–2028)' : 'Strategic Goals & Implementation Roadmap (2025–2028)'}
              </h2>
            </div>

            {/* Timeline grid */}
            <div className="p-4 sm:p-6 grid md:grid-cols-3 gap-0 md:divide-x divide-slate-200 border-t border-slate-100">
              {strategicMilestones.map((ms, idx) => (
                <div key={idx} className="flex flex-col px-4 sm:px-5 py-4 first:pt-4 md:first:pl-0 md:last:pr-0 relative border-b md:border-b-0 border-slate-200 last:border-b-0">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
