import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';


export const WasteSegregationSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState<string>('all');

  const bins = [
    {
      id: 'green',
      name: isHi ? 'हरा डस्टबिन' : 'Green Dustbin',
      category: isHi ? 'गीला / जैव-अपघटनीय अपशिष्ट' : 'Wet / Biodegradable Waste',
      colorBadge: 'bg-emerald-600 text-white',
      cardBorder: 'border-emerald-300 hover:border-emerald-500',
      bgGradient: 'from-emerald-50/80 via-white to-emerald-50/30',
      headerBg: 'bg-emerald-600',
      accentColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-800',
      dustbinImg: '/assets/dustbin_green.png',
      exampleImg: '/assets/waste_wet.png',
      exampleAlt: isHi ? 'सब्जी-फल के छिलके, बचा भोजन' : 'Vegetable peels, fruit scraps, food waste',
      description: isHi
        ? 'रसोई एवं बगीचे से निकलने वाला ऐसा अपशिष्ट जो प्राकृतिक रूप से गलकर जैविक खाद में परिवर्तित हो जाता है।'
        : 'Organic and biodegradable waste from kitchens and gardens that decomposes naturally into rich compost.',
      itemsAllowed: isHi
        ? [
          'सब्जी व फलों के छिलके (Vegetable & Fruit Peels)',
          'बचा हुआ भोजन व बासी रोटी (Cooked Food Scraps)',
          'चाय की पत्ती व कॉफी अवशेष (Tea leaves & Coffee grounds)',
          'सूखे पत्ते, फूल व घास (Garden leaves & flowers)',
          'अंडे के छिलके (Egg shells)'
        ]
        : [
          'Vegetable & fruit peels',
          'Leftover & cooked food scraps',
          'Used tea leaves & coffee grounds',
          'Garden leaves, cut grass & flowers',
          'Eggshells & fruit seeds'
        ],
      itemsProhibited: isHi
        ? ['प्लास्टिक थैली', 'कांच या धातु', 'दवाइयां या केमिकल']
        : ['Plastic bags', 'Glass or metal', 'Medicines or chemicals'],
      endDestination: isHi
        ? 'घरेलू कम्पोस्टिंग एवं विकासखंड वर्मी-कम्पोस्ट इकाइयां (जैविक खाद निर्माण)'
        : 'Home & Community vermicomposting pits for rich organic manure'
    },
    {
      id: 'blue',
      name: isHi ? 'नीला डस्टबिन' : 'Blue Dustbin',
      category: isHi ? 'सूखा / पुनर्चक्रण योग्य अपशिष्ट' : 'Dry / Recyclable Waste',
      colorBadge: 'bg-blue-600 text-white',
      cardBorder: 'border-blue-300 hover:border-blue-500',
      bgGradient: 'from-blue-50/80 via-white to-blue-50/30',
      headerBg: 'bg-blue-600',
      accentColor: 'text-blue-700',
      iconBg: 'bg-blue-100 text-blue-800',
      dustbinImg: '/assets/dustbin_blue.png',
      exampleImg: '/assets/waste_dry.png',
      exampleAlt: isHi ? 'प्लास्टिक बोतल, अखबार, गत्ता, कांच' : 'Plastic bottles, newspapers, cardboard, glass',
      description: isHi
        ? 'गैर-जैव-अपघटनीय सूखा कचरा जिसे पुनः उपयोग या रिसाइकिल करके नए उत्पाद बनाए जा सकते हैं।'
        : 'Non-biodegradable clean dry waste suitable for material recovery, sorting, and industrial recycling.',
      itemsAllowed: isHi
        ? [
          'प्लास्टिक बोतलें, कंटेनर व जार (Plastic Bottles & Containers)',
          'कागज, अखबार व किताबें (Paper, Magazines & Newspapers)',
          'गत्ते व कार्टन बॉक्स (Cardboard & Packaging Boxes)',
          'कोल्ड ड्रिंक केन व धातु (Metal cans, tins & foil)',
          'कांच की बोतलें व शीशियां (Glass bottles & jars)'
        ]
        : [
          'Plastic bottles, jars & rigid containers',
          'Newspapers, books & paper sheets',
          'Cardboard cartons & packaging boxes',
          'Metal beverage cans, tins & clean foil',
          'Glass bottles & containers'
        ],
      itemsProhibited: isHi
        ? ['गीला खाना', 'डायपर या सेनेटरी पैड', 'कीचड़ या गंदा कचरा']
        : ['Wet food waste', 'Sanitary napkins or diapers', 'Mud or soiled items'],
      endDestination: isHi
        ? 'विकासखंड मैटेरियल रिकवरी फैसिलिटी (MRF) में हाइड्रोलिक बेलिंग एवं रीसाइक्लिंग'
        : 'Block Material Recovery Facilities (MRF) for baling & authorized recycling'
    },
    {
      id: 'red',
      name: isHi ? 'लाल डस्टबिन' : 'Red Dustbin',
      category: isHi ? 'सैनिटरी एवं घरेलू जोखिम अपशिष्ट' : 'Sanitary & Domestic Hazardous Waste',
      colorBadge: 'bg-rose-600 text-white',
      cardBorder: 'border-rose-300 hover:border-rose-500',
      bgGradient: 'from-rose-50/80 via-white to-rose-50/30',
      headerBg: 'bg-rose-600',
      accentColor: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-800',
      dustbinImg: '/assets/dustbin_red.png',
      exampleImg: '/assets/waste_sanitary.png',
      exampleAlt: isHi ? 'सेनेटरी पैड, डायपर, मेडिकल बैंडेज' : 'Sanitary pads, diapers, medical bandages',
      description: isHi
        ? 'सैनिटरी एवं व्यक्तिगत स्वच्छता से जुड़ा अपशिष्ट जिसे संक्रमण से बचाव हेतु पृथक व सुरक्षित रखना अनिवार्य है।'
        : 'Sanitary and personal hygiene waste that poses biological risks and requires strict segregated handling.',
      itemsAllowed: isHi
        ? [
          'उपयोग किए गए डायपर (Baby & Adult Diapers)',
          'सेनेटरी नैपकिन व पैड्स (Sanitary Napkins & Pads)',
          'उपयोग की गई बैंडेज व रुई (Medical bandages & cotton gauze)',
          'यूज्ड टिशू व डिसपोजेबल वाइप्स (Used tissues & personal wipes)',
          'डिस्पोजेबल रेजर ब्लेड (कागज में लिपटे) (Disposable razor blades wrapped)'
        ]
        : [
          'Used baby & adult diapers',
          'Sanitary pads & menstrual hygiene items',
          'Medical bandages, dressing cotton & gauze',
          'Used facial tissues & cleaning wipes',
          'Wrapped disposable razors'
        ],
      itemsProhibited: isHi
        ? ['सामान्य प्लास्टिक बोतलें', 'गीला रसोई कचरा', 'सामान्य अखबार']
        : ['Normal plastic bottles', 'Kitchen waste', 'Dry recyclable paper'],
      endDestination: isHi
        ? 'कागज में लपेटकर बायोमेडिकल अपशिष्ट प्रबंधन नियमों के अनुसार सुरक्षित निस्तारण'
        : 'Wrapped in paper bags for scientific incineration / deep sanitary burial'
    },
    {
      id: 'black',
      name: isHi ? 'काला डस्टबिन' : 'Black Dustbin',
      category: isHi ? 'विषाक्त, ई-कचरा एवं विशेष अपशिष्ट' : 'Hazardous & Special / E-Waste',
      colorBadge: 'bg-slate-900 text-amber-400 border border-slate-700',
      cardBorder: 'border-slate-400 hover:border-slate-800',
      bgGradient: 'from-slate-100/90 via-white to-slate-100/40',
      headerBg: 'bg-slate-900',
      accentColor: 'text-slate-900',
      iconBg: 'bg-slate-900 text-amber-400',
      dustbinImg: '/assets/dustbin_black.png',
      exampleImg: '/assets/waste_hazardous.png',
      exampleAlt: isHi ? 'बैटरी, CFL बल्ब, पुराना चार्जर, दवाइयां' : 'Batteries, CFL bulbs, old chargers, medicines',
      description: isHi
        ? 'रासायनिक, विषाक्त एवं इलेक्ट्रॉनिक अपशिष्ट जो पर्यावरण और भूजल को गंभीर क्षति पहुंचा सकते हैं।'
        : 'Toxic, chemical, and electronic waste that can contaminate mountain soil and river groundwater.',
      itemsAllowed: isHi
        ? [
          'पुरानी बैटरियां व सेल (Used AA/AAA & Mobile Batteries)',
          'सीएफएल, ट्यूबलाइट व एलईडी बल्ब (CFLs, Tube-lights & Bulbs)',
          'एक्सपायर्ड दवाइयां व सीरिंज (Expired Medicines & Syringes)',
          'ई-कचरा: पुराने चार्जर, रिमोट, केबल (E-Waste: Chargers, Remotes, Cables)',
          'पेंट, थिनर, कीटनाशक के डिब्बे (Paints, Thinners & Pesticide Cans)'
        ]
        : [
          'Used AA/AAA, mobile & button batteries',
          'CFLs, fluorescent tubes & broken LED bulbs',
          'Expired pharmaceutical drugs & injection vials',
          'E-waste: Old phone chargers, wires & remotes',
          'Pesticides, aerosol sprays, paints & thinners'
        ],
      itemsProhibited: isHi
        ? ['गीला भोजन', 'सामान्य कागज व गत्ता', 'स्वच्छ प्लास्टिक बोतलें']
        : ['Kitchen food waste', 'Normal paper & boxes', 'Clean plastic bottles'],
      endDestination: isHi
        ? 'विशेष खतरनाक अपशिष्ट निपटान व अधिकृत ई-वेस्ट रीसाइक्लिंग केंद्र'
        : 'Authorized hazardous waste facilities for scientific de-toxification'
    }
  ];

  const filteredBins = activeTab === 'all'
    ? bins
    : bins.filter(b => b.id === activeTab);

  return (
    <section id="waste-segregation" className="py-16 sm:py-20 bg-slate-100/80 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-left max-w-1xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-pink-100 text-pink-900 text-xs font-bold uppercase tracking-wider mb-3 border border-pink-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-pink-700" />
            {isHi ? 'कचरा स्रोत पृथक्करण प्रणाली' : '4-Dustbin Segregation Rule'}
          </div>

          <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-800 tracking-tight leading-tight">
            {isHi ? 'कचरा स्रोत पृथक्करण प्रणाली' : 'Waste Source Segregation Protocol'}
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBins.map((bin) => {
            return (
              <div
                key={bin.id}
                className={`rounded-2xl border-2 bg-gradient-to-b ${bin.bgGradient} ${bin.cardBorder} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                {/* === CARD HEADER: colored bar with title === */}
                <div className={`${bin.headerBg} px-4 pt-4 pb-4 relative flex items-start`}>
                  {/* Text: pr-16 reserves space so image never overlaps text */}
                  <div className="flex-1 min-w-0 pr-16">
                    <span className="block text-white/75 text-[10px] font-semibold uppercase tracking-widest leading-none mb-0.5">
                      {bin.name}
                    </span>
                    <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight">
                      {bin.category}
                    </h3>
                  </div>
                  {/* Dustbin Image — half in header, half in card body */}
                  <div className="absolute right-3 -bottom-4 w-[78px] h-[78px] z-10">
                    <img
                      src={bin.dustbinImg}
                      alt={bin.name}
                      className="object-contain drop-shadow-xl w-full h-full"
                    />
                  </div>
                </div>

                {/* === CARD BODY === */}
                {/* pt-10 gives room for the overflowing dustbin image */}
                <div className="p-4 sm:p-5 pt-10 flex flex-col flex-1">

                  {/* Description */}
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                    {bin.description}
                  </p>

                  {/* Example Image below description */}
                  <div className="relative w-full h-28 sm:h-32 rounded-xl overflow-hidden mb-4 border border-slate-200 shadow-xs bg-slate-50">
                    <img
                      src={bin.exampleImg}
                      alt={bin.exampleAlt}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  {/* Items to Put (Allowed) */}
                  <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/90 mb-3 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isHi ? 'क्या डालें (What to Put):' : 'Allowed Items:'}</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700 leading-snug">
                      {bin.itemsAllowed.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Do Not Put (Prohibited) */}
                  <div className="bg-white/70 rounded-lg p-2.5 border border-rose-100 mb-4 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1 font-bold text-rose-700 mb-1">
                      <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{isHi ? 'क्या न डालें (Never Put):' : 'Do Not Put:'}</span>
                    </div>
                    <p className="text-slate-600 leading-tight">
                      {bin.itemsProhibited.join(', ')}
                    </p>
                  </div>

                  {/* Bottom Destination Note */}
                  <div className="pt-3 border-t border-slate-200/80 mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {isHi ? 'अंतिम वैज्ञानिक निस्तारण' : 'End Destination'}
                    </span>
                    <p className="text-xs font-semibold text-navy-950 leading-tight">
                      {bin.endDestination}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* === About 4-Dustbin Rule Summary === */}
        <div className="mt-10 mb-4 rounded-xl border border-slate-200 bg-white/60 backdrop-blur-sm px-6 py-6 shadow-xs">

          {/* Heading — plain, official */}
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-200 pb-2">
            {isHi ? '4-डस्टबिन नियम — संक्षिप्त विवरण' : '4-Dustbin Rule — Brief Overview'}
          </h4>

          {/* 4-line official description */}
          <div className="text-xs sm:text-[13px] text-slate-600 leading-relaxed space-y-2 mb-5">
            {isHi ? (
              <>
                <p>स्वच्छ भारत मिशन (SBM) के अंतर्गत देश के प्रत्येक नगरीय एवं ग्रामीण परिवार को अपशिष्ट को उत्पत्ति स्थल पर ही 4 रंग-कोडित डस्टबिन में अलग-अलग करना अनिवार्य किया गया है।</p>
                <p>यह व्यवस्था सुनिश्चित करती है कि जैव-अपघटनीय, पुनर्चक्रणीय, सैनिटरी एवं खतरनाक अपशिष्ट — प्रत्येक अपनी प्रकृति के अनुसार संबंधित प्रसंस्करण सुविधा तक पहुंचे।</p>
                <p>स्रोत पर उचित पृथक्करण न करने पर मिश्रित कचरा न तो ठीक से खाद बन सकता है, न रिसाइकिल हो सकता है — जिससे पर्यावरण प्रदूषण एवं सार्वजनिक स्वास्थ्य पर प्रतिकूल प्रभाव पड़ता है।</p>
                <p>नागरिकों से अनुरोध है कि नगर पालिका / स्थानीय निकाय द्वारा निर्धारित संग्रहण समय-सारणी का पालन करें एवं कचरा सदैव बंद डस्टबिन में ही रखें।</p>
              </>
            ) : (
              <>
                <p>Under the Swachh Bharat Mission (SBM), all urban and rural households are mandated to segregate waste at the source into four designated colour-coded bins before municipal collection.</p>
                <p>This system ensures that biodegradable, recyclable, sanitary, and hazardous waste streams are directed to their respective processing facilities — composting units, MRFs, or scientifically managed disposal sites.</p>
                <p>Failure to segregate waste at source results in contaminated mixed waste that can neither be composted effectively nor recycled, causing preventable environmental pollution and public health risks.</p>
                <p>Citizens are requested to adhere to the collection schedule prescribed by the local municipal authority and to always keep waste covered within the designated bins until collection.</p>
              </>
            )}
          </div>

          {/* 4 Bin Quick Reference — text only, left colored border */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { borderColor: 'border-l-emerald-500', label: isHi ? 'हरा डस्टबिन' : 'Green Bin', sub: isHi ? 'गीला / जैव-अपघटनीय' : 'Wet / Biodegradable' },
              { borderColor: 'border-l-blue-500', label: isHi ? 'नीला डस्टबिन' : 'Blue Bin', sub: isHi ? 'सूखा / पुनर्चक्रणीय' : 'Dry / Recyclable' },
              { borderColor: 'border-l-rose-500', label: isHi ? 'लाल डस्टबिन' : 'Red Bin', sub: isHi ? 'सैनिटरी अपशिष्ट' : 'Sanitary Waste' },
              { borderColor: 'border-l-slate-700', label: isHi ? 'काला डस्टबिन' : 'Black Bin', sub: isHi ? 'खतरनाक / ई-कचरा' : 'Hazardous / E-Waste' },
            ].map((item, i) => (
              <div key={i} className={`border-l-4 ${item.borderColor} bg-slate-50 border border-slate-200 rounded-r-lg px-3 py-2.5`}>
                <p className="text-[11.5px] font-bold text-slate-700 leading-tight">{item.label}</p>
                <p className="text-[10.5px] text-slate-500 leading-tight mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* === Information Strip === */}
        <div className="mt-10 rounded-xl border border-slate-300 bg-white/70 backdrop-blur-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
          {/* Icon + Label */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-700 whitespace-nowrap">
              {isHi ? 'अपशिष्ट पृथक्करण दिशा-निर्देश' : 'Waste Segregation Guidelines'}
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-300 shrink-0" />

          {/* Advisory Text */}
          <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
            {isHi
              ? 'कृपया स्थानीय प्राधिकारी द्वारा जारी लागू अपशिष्ट प्रबंधन नियमों एवं संग्रह निर्देशों का पालन करें।'
              : 'Please follow the applicable waste management rules and collection instructions issued by the local authority.'}
          </p>
        </div>

      </div>
    </section>
  );
});
