import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Users, Award, ShieldCheck, ArrowRight, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ZilaPanchayatAboutSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const stats = [
    {
      label: isHi ? 'विकासखंड (Blocks)' : 'Development Blocks',
      value: '11',
      subtext: isHi ? 'तहसील एवं ब्लॉक स्तर पर' : 'Across District',
      icon: Building2,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      label: isHi ? 'ग्राम पंचायतें' : 'Gram Panchayats',
      value: '1,160+',
      subtext: isHi ? 'सक्रिय ग्रामीण निकाय' : 'Active Rural Bodies',
      icon: Landmark,
      color: 'from-emerald-600 to-teal-700',
    },
    {
      label: isHi ? 'जिला पंचायत वार्ड' : 'Zila Panchayat Wards',
      value: '11',
      subtext: isHi ? 'निर्वाचित प्रतिनिधि' : 'Elected Constituencies',
      icon: Users,
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: isHi ? 'सक्रिय विकास कार्य' : 'Active Civic Projects',
      value: '45+',
      subtext: isHi ? '15वां वित्त व जिला योजना' : 'Under 15th FC & SBM',
      icon: Award,
      color: 'from-purple-600 to-indigo-800',
    },
  ];

  return (
    <section id="about-zp" className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{isHi ? 'संवैधानिक स्थानीय स्वशासन' : 'Constitutional Local Governance'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isHi ? 'जिला पंचायत अल्मोड़ा - एक परिचय' : 'About Zila Panchayat Almora'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-amber-500 mx-auto rounded-full mt-3 mb-4" />
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isHi 
              ? '73वें संविधान संशोधन के अंतर्गत गठित, जिला पंचायत अल्मोड़ा जनपद के ग्रामीण क्षेत्रों के सर्वांगीण विकास, बुनियादी ढांचे के सुदृढ़ीकरण, एवं नागरिक कल्याण हेतु सर्वोच्च त्रिस्तरीय पंचायती राज संस्था है।' 
              : 'Established under the 73rd Constitutional Amendment, Zila Panchayat Almora is the apex district local governance body driving sustainable rural development, basic infrastructure, and civic well-being across Almora.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-center flex flex-col items-center"
              >
                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-xs`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                  {item.label}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  {item.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Administrative Responsibilities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                {isHi ? 'मुख्य दायित्व एवं कार्यक्षेत्र' : 'Core Mandate & Jurisdiction'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isHi 
                  ? 'जनपद के सतत विकास और सुशासन के लिए प्रतिबद्ध' 
                  : 'Committed to Sustainable Rural Progress & Transparent Governance'}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {isHi 
                  ? 'जिला पंचायत अल्मोड़ा ग्रामीण सड़कों, ठोस अपशिष्ट प्रबंधन, पेयजल संरक्षण, सोलर लाइट व्यवस्था, मेलों व बाजारों के प्रबंधन, एवं 15वें वित्त आयोग की योजनाओं के क्रियान्वयन के लिए निरंतर समर्पित है।'
                  : 'Zila Panchayat Almora manages rural infrastructure, municipal solid waste, water conservation, solar lighting, local fairs, public markets, commercial assets, and central/state development finance schemes.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { hi: 'ठोस अपशिष्ट एवं स्वच्छता प्रबंधन', en: 'Solid Waste & Sanitation' },
                  { hi: 'ग्रामीण संपर्क मार्ग एवं अवसंरचना', en: 'Rural Roads & Infrastructure' },
                  { hi: 'पंचायती परिसंपत्ति एवं दुकान प्रबंधन', en: 'Commercial Asset Management' },
                  { hi: 'पारदर्शी ई-निविदा व नागरिक सेवाएं', en: 'e-Tenders & Citizen Services' }
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>{isHi ? point.hi : point.en}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link
                  to="/staff-directory"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white text-xs sm:text-sm font-semibold hover:bg-blue-800 transition-colors shadow-xs"
                >
                  <span>{isHi ? 'जनप्रतिनिधि व स्टाफ डायरेक्टरी' : 'Leadership & Staff Directory'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/safai-portal"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <span>{isHi ? 'सफाई व शिकायत पोर्टल' : 'Open Safai Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quote / District Emblem Highlights */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-xl shadow-md border border-blue-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{isHi ? 'अल्मोड़ा, उत्तराखण्ड' : 'Almora, Uttarakhand'}</span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">
                  {isHi ? 'सांस्कृतिक एवं प्रशासनिक धरोहर' : 'Cultural & Administrative Heritage'}
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {isHi 
                    ? 'कुमाऊं की सांस्कृतिक राजधानी अल्मोड़ा में पंचायती राज तंत्र के माध्यम से सुदूरवर्ती पर्वतीय गांवों तक मूलभूत जनसुविधाएं और आधुनिक तकनीक आधारित स्वच्छता सेवाएं पहुंचाना हमारा प्राथमिक संकल्प है।' 
                    : 'Serving as the cultural capital of Kumaon, Zila Panchayat Almora is dedicated to bringing essential amenities and technology-driven sanitation to the remotest Himalayan villages.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                <span>{isHi ? 'अपर मुख्य अधिकारी (AMA) कार्यालय' : 'Office of Apar Mukhya Adhikari'}</span>
                <span className="font-mono text-amber-300">Mall Road, Almora</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
});

ZilaPanchayatAboutSection.displayName = 'ZilaPanchayatAboutSection';
