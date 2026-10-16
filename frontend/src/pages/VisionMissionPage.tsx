import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Mountain, 
  Leaf, 
  Recycle, 
  Clock, 
  ChevronRight,
  TrendingUp,
  MapPin
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
      desc: isHi ? 'अल्मोड़ा की प्राकृतिक वादियों, कोसी व सुयाल नदी जलग्रहण क्षेत्रों को प्लास्टिक व ठोस कचरे से सर्वथा मुक्त रखना।' : 'Preserving Almora’s scenic hills, valleys, and river catchment areas from plastic contamination.',
      icon: Mountain
    },
    {
      title: isHi ? 'शून्य-लैंडफिल एवं शत-प्रतिशत पृथक्करण' : 'Zero-Landfill & 100% Segregation',
      desc: isHi ? 'गीले और सूखे कचरे का शत-प्रतिशत वैज्ञानिक स्रोत पर पृथक्करण सुनिश्चित कर खुले में डंपिंग समाप्त करना।' : 'Achieving 100% source segregation of wet and dry waste to eliminate open dumping sites.',
      icon: Recycle
    },
    {
      title: isHi ? 'सतत पर्यटन एवं स्वच्छ देवभूमि' : 'Eco-Tourism & Clean Devbhoomi',
      desc: isHi ? 'धार्मिक व पर्यटक स्थलों पर कचरा-मुक्त वातावरण जिससे पर्यटकों एवं श्रद्धालुओं में पर्यावरण चेतना जागे।' : 'Spotless tourist and pilgrimage routes fostering responsible eco-tourism across Uttarakhand.',
      icon: Leaf
    }
  ], [isHi]);

  const missionPillars = useMemo(() => [
    {
      title: isHi ? 'डोर-टू-डोर दैनिक एकत्रीकरण' : 'Daily Door-to-Door Collection',
      desc: isHi ? 'समस्त 11 विकासखंडों, ग्राम पंचायतों और ग्रामीण बाजारों में नियमित स्वच्छता वाहनों का परिचालन।' : 'Regular morning waste pickup across rural markets, panchayat wards, and commercial spots.',
      icon: CheckCircle2
    },
    {
      title: isHi ? 'जीपीएस फ्लीट ट्रैकिंग व पारदर्शिता' : 'GPS Telematics Fleet Tracking',
      desc: isHi ? 'प्रत्येक कचरा संग्रहण वाहन में मिलीट्रैक (MilliTrack) जीपीएस से रीयल-टाइम रूट मॉनिटरिंग एवं पारदर्शी जवाबदेही।' : 'Real-time vehicle tracking via MilliTrack GPS hardware for route compliance and transparency.',
      icon: ShieldCheck
    },
    {
      title: isHi ? 'त्वरित नागरिक शिकायत निवारण' : 'Swift Citizen Grievance Redressal',
      desc: isHi ? 'नागरिकों द्वारा दर्ज की गई शिकायतों का 24 से 48 घंटे के भीतर डिजिटल समाधान व समयबद्ध स्टेटस ट्रैकिंग।' : 'Digital complaint resolution and status tracking within 24 to 48 operational hours.',
      icon: Clock
    }
  ], [isHi]);

  const strategicMilestones = useMemo(() => [
    {
      year: '2025 - 2026',
      title: isHi ? '100% वाहन जीपीएस एवं डिजिटल कमांड पोर्टल' : '100% Fleet GPS & Command Portal',
      desc: isHi ? 'सभी वाहनों पर रीयल-टाइम जीपीएस ट्रैकिंग, नागरिक शिकायत पोर्टल एवं डिजिटल दैनिक कार्य फोटो अभिलेख।' : 'Full fleet telematics, citizen grievance portal, and daily work photo archiving.'
    },
    {
      year: '2026 - 2027',
      title: isHi ? 'ब्लॉक स्तरीय मैटेरियल रिकवरी सेंटर (MRF) विस्तार' : 'Block-Level MRF Expansion',
      desc: isHi ? 'हवालबाग, रानीखेत, द्वाराहाट सहित सभी ब्लॉकों में हाइड्रोलिक प्लास्टिक कॉम्पेक्टर व बेलिंग यूनिट्स।' : 'Hydraulic plastic compactors and baling facilities across all development blocks.'
    },
    {
      year: '2027 - 2028',
      title: isHi ? 'विकेंद्रीकृत कम्पोस्टिंग एवं प्लास्टिक-मुक्त गलियारे' : 'Decentralized Composting & Plastic-Free Corridors',
      desc: isHi ? 'गीले कचरे से जैविक खाद उत्पादन एवं पर्यटन व तीर्थ मार्गों को पूरी तरह सिंगल-यूज प्लास्टिक मुक्त बनाना।' : 'Organic manure production and zero-single-use-plastic heritage and tourist corridors.'
    }
  ], [isHi]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Top Government Banner (Same as Complaint Page Header) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-10 sm:py-14 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-white tracking-tight leading-tight mb-3">
                {isHi ? 'हमारा विज़न और मिशन' : 'Our Vision & Mission'}
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
        <div className="space-y-10">

          {/* 2-Column Cards Grid: Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
            {/* Card 1: Vision */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 rounded-2xl p-6 sm:p-8 border border-emerald-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                      {isHi ? 'दीर्घकालिक ध्येय' : 'Long-Term Vision'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 leading-tight">
                      {isHi ? 'हमारा विज़न (Our Vision)' : 'Our Vision'}
                    </h2>
                  </div>
                </div>

                <div className="bg-emerald-900/5 border border-emerald-200 rounded-xl p-4 mb-6">
                  <p className="text-navy-950 font-semibold text-sm sm:text-base italic leading-relaxed">
                    {isHi
                      ? '"अल्मोड़ा के समस्त ग्रामीण एवं अर्ध-शहरी अंचलों को एक स्वच्छ, हरित, प्रदूषण-मुक्त तथा शून्य-अपशिष्ट (Zero-Waste) आदर्श पर्वतीय क्षेत्र के रूप में स्थापित करना।"'
                      : '"To establish Almora’s rural and semi-urban valleys into a pristine, green, pollution-free and zero-waste model mountain district."'}
                  </p>
                </div>

                <div className="space-y-4">
                  {visionPillars.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy-900">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>{isHi ? 'स्वच्छ अल्मोड़ा • सुंदर अल्मोड़ा' : 'Clean Almora • Green Almora'}</span>
                <span className="inline-flex items-center gap-1 font-bold">
                  <Leaf className="w-3.5 h-3.5" /> Devbhoomi
                </span>
              </div>
            </div>

            {/* Card 2: Mission */}
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 rounded-2xl p-6 sm:p-8 border border-blue-200/80 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800">
                      {isHi ? 'कार्ययोजना एवं रणनीति' : 'Action & Strategy'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 leading-tight">
                      {isHi ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}
                    </h2>
                  </div>
                </div>

                <div className="bg-blue-900/5 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-navy-950 font-semibold text-sm sm:text-base italic leading-relaxed">
                    {isHi
                      ? '"आधुनिक जीपीएस तकनीक, एमआरएफ रीसाइक्लिंग केंद्र, समर्पित पर्यावरण मित्रों और जन-सहभागिता के माध्यम से प्रत्येक ग्राम पंचायत तक शत-प्रतिशत स्वच्छता सेवा पहुंचाना।"'
                      : '"Delivering 100% efficient sanitation services to every gram panchayat through modern GPS telematics, MRF recycling, and dedicated sanitation personnel."'}
                  </p>
                </div>

                <div className="space-y-4">
                  {missionPillars.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-navy-900">{item.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-blue-200/60 flex items-center justify-between text-xs font-semibold text-blue-800">
                <span>{isHi ? 'वैज्ञानिक प्रबंधन • जन-भागीदारी' : 'Scientific SWM • Civic Participation'}</span>
                <span className="inline-flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Gov-Assisted
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Milestones Roadmap */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6">
              <TrendingUp className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                {isHi ? 'रणनीतिक लक्ष्य एवं कार्ययोजना (2025 - 2028)' : 'Strategic Goals & Implementation Roadmap (2025 - 2028)'}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {strategicMilestones.map((milestone, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded bg-navy-900 text-amber-400 font-mono text-xs font-bold mb-3">
                      {milestone.year}
                    </span>
                    <h3 className="font-bold text-navy-900 text-base mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {milestone.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHi ? 'प्राथमिकता लक्ष्य' : 'Priority Deliverable'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Call to Action */}
          <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 border border-navy-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {isHi ? 'जिला पंचायत अल्मोड़ा के स्वच्छता अभियान से जुड़ें' : 'Join District Panchayat Almora’s Cleanliness Mission'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {isHi ? 'अपने क्षेत्र के सफाई दल या अधिकारियों के बारे में विस्तृत जानकारी प्राप्त करें।' : 'Learn about our administrative officers, nodal leadership, and field teams.'}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/staff-directory"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs sm:text-sm transition-colors"
              >
                {isHi ? 'अधिकारी एवं कर्मचारी विवरण →' : 'Staff Directory →'}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
