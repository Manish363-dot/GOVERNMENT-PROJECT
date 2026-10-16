import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Leaf, 
  Recycle, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Info
} from 'lucide-react';

export const WasteSegregationSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState<string>('all');

  const bins = [
    {
      id: 'green',
      name: isHi ? 'हरा डस्टबिन' : 'Green DustBin',
      category: isHi ? 'गीला / जैव-अपघटनीय अपशिष्ट' : 'Wet / Biodegradable Waste',
      colorBadge: 'bg-emerald-600 text-white',
      cardBorder: 'border-emerald-300 hover:border-emerald-500',
      bgGradient: 'from-emerald-50/80 via-white to-emerald-50/30',
      accentColor: 'text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-800',
      icon: Leaf,
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
      name: isHi ? 'नीला डस्टबिन' : 'Blue DustBin',
      category: isHi ? 'सूखा / पुनर्चक्रण योग्य अपशिष्ट' : 'Dry / Recyclable Waste',
      colorBadge: 'bg-blue-600 text-white',
      cardBorder: 'border-blue-300 hover:border-blue-500',
      bgGradient: 'from-blue-50/80 via-white to-blue-50/30',
      accentColor: 'text-blue-700',
      iconBg: 'bg-blue-100 text-blue-800',
      icon: Recycle,
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
      name: isHi ? 'लाल डस्टबिन' : 'Red DustBin',
      category: isHi ? 'सैनिटरी एवं घरेलू जोखिम अपशिष्ट' : 'Sanitary & Domestic Hazardous Waste',
      colorBadge: 'bg-rose-600 text-white',
      cardBorder: 'border-rose-300 hover:border-rose-500',
      bgGradient: 'from-rose-50/80 via-white to-rose-50/30',
      accentColor: 'text-rose-700',
      iconBg: 'bg-rose-100 text-rose-800',
      icon: ShieldAlert,
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
      name: isHi ? 'काला डस्टबिन' : 'Black DustBin',
      category: isHi ? 'विषाक्त, ई-कचरा एवं विशेष अपशिष्ट' : 'Hazardous & Special / E-Waste',
      colorBadge: 'bg-slate-900 text-amber-400 border border-slate-700',
      cardBorder: 'border-slate-400 hover:border-slate-800',
      bgGradient: 'from-slate-100/90 via-white to-slate-100/40',
      accentColor: 'text-slate-900',
      iconBg: 'bg-slate-900 text-amber-400',
      icon: AlertTriangle,
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

          <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
            {isHi ? 'कचरा स्रोत पृथक्करण प्रणाली' : 'Waste Source Segregation Protocol'}
          </h2>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBins.map((bin) => {
            const IconComponent = bin.icon;
            return (
              <div
                key={bin.id}
                className={`rounded-2xl border-2 bg-gradient-to-b ${bin.bgGradient} ${bin.cardBorder} p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wide ${bin.colorBadge} shadow-xs`}>
                      {bin.name}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bin.iconBg}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className={`font-bold text-base sm:text-lg mb-2 leading-snug ${bin.accentColor}`}>
                    {bin.category}
                  </h3>

                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    {bin.description}
                  </p>

                  {/* Items to Put (Allowed) */}
                  <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/90 mb-4 shadow-2xs">
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
                </div>

                {/* Bottom Destination Note */}
                <div className="pt-3 border-t border-slate-200/80 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    {isHi ? 'अंतिम वैज्ञानिक निस्तारण' : 'End Destination'}
                  </span>
                  <p className="text-xs font-semibold text-navy-950 leading-tight">
                    {bin.endDestination}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
