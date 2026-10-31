import React from 'react';
import { useTranslation } from 'react-i18next';
import { ZilaServicesCarousel } from './ZilaServicesCarousel';


export const ZilaPanchayatAboutSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const stats = [
    {
      label: isHi ? 'विकासखंड (Blocks)' : 'Development Blocks',
      value: '11',
    },
    {
      label: isHi ? 'ग्राम पंचायतें' : 'Gram Panchayats',
      value: '1,160+',
    },
    {
      label: isHi ? 'जिला पंचायत वार्ड' : 'Zila Panchayat Wards',
      value: '45',
    },
    {
      label: isHi ? 'सक्रिय विकास कार्य' : 'Active Civic Projects',
      value: '45+',
    },
  ];

  return (
    <section id="about-zp" className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Introduction */}
        <div className="pt-6 sm:pt-8 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            {isHi ? 'परिचय' : 'About Us'}
          </h2>
          <div className="h-1 w-20 bg-amber-400 rounded-full mt-3 mb-6" />

          {/* Introductory Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {isHi ? (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">जिला पंचायत अल्मोड़ा </strong>
                  उत्तराखंड की पंचायती राज व्यवस्था की एक महत्वपूर्ण स्थानीय स्वशासन संस्था है, जिसका इतिहास अल्मोड़ा जिले की समृद्ध ऐतिहासिक और प्रशासनिक विरासत से जुड़ा हुआ है। वर्ष 1815 में ब्रिटिश शासन के दौरान कुमाऊँ क्षेत्र पर अधिकार के बाद अल्मोड़ा एक प्रमुख प्रशासनिक केंद्र के रूप में विकसित हुआ और वर्ष 1891 में अल्मोड़ा जिला अस्तित्व में आया। समय के साथ पिथौरागढ़ और बागेश्वर जैसे नए जिलों के गठन से इसकी भौगोलिक सीमाओं में परिवर्तन हुआ।
                </p>
                <p>
                  9 नवंबर 2000 को उत्तराखंड राज्य के गठन के बाद पंचायती राज व्यवस्था को राज्य की आवश्यकताओं के अनुरूप विकसित किया गया। इसी व्यवस्था के अंतर्गत जिला पंचायत अल्मोड़ा ग्रामीण क्षेत्रों के विकास, जनकल्याणकारी योजनाओं के समन्वय, बुनियादी सुविधाओं के विस्तार और स्थानीय स्वशासन को मजबूत बनाने में महत्वपूर्ण भूमिका निभाती है।
                </p>
                <p>
                  वर्तमान में जिला पंचायत ग्राम पंचायतों और क्षेत्र पंचायतों के साथ समन्वय स्थापित करते हुए ग्रामीण विकास, स्वच्छता, सार्वजनिक सुविधाओं, स्थानीय बुनियादी ढाँचे और नागरिक सेवाओं को बेहतर बनाने की दिशा में कार्य करती है। इसका उद्देश्य ग्रामीण समुदायों को सशक्त बनाना, प्रशासन में पारदर्शिता एवं जवाबदेही को बढ़ावा देना और विकास योजनाओं का लाभ आम नागरिकों तक पहुँचाना है। अपनी ऐतिहासिक विरासत और आधुनिक विकास दृष्टिकोण के साथ, जिला पंचायत अल्मोड़ा एक स्वच्छ, सशक्त, आत्मनिर्भर और विकसित ग्रामीण अल्मोड़ा के निर्माण के लिए प्रतिबद्ध है, जहाँ जनभागीदारी, सुशासन और सतत विकास के माध्यम से प्रत्येक गाँव की प्रगति सुनिश्चित करने का प्रयास किया जाता है।
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">Zila Panchayat Almora</strong> is an important local self-government institution within the Panchayati Raj system of Uttarakhand, with its roots connected to the rich historical and administrative heritage of Almora district. Following the British occupation of the Kumaon region in 1815, Almora developed as a major administrative centre. In 1891, Almora district was formally established, and its geographical boundaries changed over time with the formation of new districts, including Pithoragarh and Bageshwar.
                </p>
                <p>
                  Following the formation of Uttarakhand on 9 November 2000, the Panchayati Raj system continued to develop in accordance with the administrative and developmental needs of the state. Within this framework, Almora Zila Panchayat plays an important role in coordinating rural development initiatives, supporting public welfare programmes, improving basic infrastructure, and strengthening local self-governance.
                </p>
                <p>
                  Today, Almora Zila Panchayat works in coordination with Gram Panchayats and Kshetra Panchayats to improve rural infrastructure, sanitation, public amenities, and citizen services. It aims to empower rural communities, promote transparency and accountability in administration, and help ensure that the benefits of development programmes reach citizens across the district. Building on its historical legacy and commitment to modern governance, Almora Zila Panchayat strives to create a clean, empowered, self-reliant, and developed rural Almora, where public participation, good governance, and sustainable development contribute to the progress of every village and community.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid - Rectangular Cards without Icons or Sub-headings */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {stats.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 text-center flex flex-col justify-center items-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-poppins text-slate-700 tracking-tight">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Core Administrative Responsibilities */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
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
                  { hi: 'नागरिक सेवाएं', en: 'Citizen Services' },
                  { hi: 'दुकान लाइसेंस एवं व्यापार कर', en: 'Shop licensing & trade tax '},
                  { hi: 'भूमि एवं होटल मानचित्र स्वीकृति', en: 'Land and hotel map approval'},
                  { hi: 'ठेकेदारी लाइसेंसिंग', en: 'Contractor Licensing'},
                  { hi: 'पशु शेड योजना', en: 'Animal Shed Scheme'}
                ].map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>{isHi ? point.hi : point.en}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote / District Emblem Highlights */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-7 rounded-xl shadow-md border border-blue-800/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
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
                <span>{isHi ? '-अपर मुख्य अधिकारी' : 'Apar Mukhya Adhikari'}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
      <div className="mt-10 sm:mt-12">
        <ZilaServicesCarousel />
      </div>
    </section>
  );
});

ZilaPanchayatAboutSection.displayName = 'ZilaPanchayatAboutSection';
