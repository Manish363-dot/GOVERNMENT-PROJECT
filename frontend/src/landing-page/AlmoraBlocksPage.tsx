import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
export interface BlockDetail {
  id: string;
  nameHi: string;
  nameEn: string;
  panchayatsCount: number;
  hq: string;
  hqHi: string;
  tehsil: string;
  tehsilHi: string;
  descriptionHi: string;
  descriptionEn: string;
  keyAttractionsHi: string[];
  keyAttractionsEn: string[];
  focusAreasHi: string[];
  focusAreasEn: string[];
  populationApprox: string;
}

export const ALMORA_BLOCKS_DATA: BlockDetail[] = [
  {
    id: 'hawalbagh',
    nameHi: 'हवालबाग',
    nameEn: 'Hawalbagh',
    panchayatsCount: 132,
    hq: 'Hawalbagh',
    hqHi: 'हवालबाग',
    tehsil: 'Almora',
    tehsilHi: 'अल्मोड़ा',
    populationApprox: '74,500+',
    descriptionHi: 'जनपद मुख्यालय का प्रमुख एवं केन्द्रीय विकासखंड, ऐतिहासिक, सांस्कृतिक व प्रशासनिक गतिविधियों का मुख्य केन्द्र।',
    descriptionEn: 'Core development block surrounding the district administrative headquarters, blending heritage with modern public governance.',
    keyAttractionsHi: ['कसार देवी शक्तिपीठ', 'कटारमल ऐतिहासिक सूर्य मंदिर', 'विवेकानन्द पर्वतीय कृषि अनुसंधान संस्थान (VPKAS)'],
    keyAttractionsEn: ['Kasar Devi Temple', 'Katarmal Sun Temple', 'ICAR-VPKAS Research Hub'],
    focusAreasHi: ['ठोस अपशिष्ट पृथक्करण व डोर-टू-डोर कचरा संग्रहण', 'ग्रामीण डिजिटल सेवा केंद्र', 'जल जीवन मिशन पाइपलाइन'],
    focusAreasEn: ['Door-to-door SWM Collection', 'Digital Citizen Kiosks', 'Jal Jeevan Mission Tap Water'],
  },
  {
    id: 'takula',
    nameHi: 'ताकुला',
    nameEn: 'Takula',
    panchayatsCount: 88,
    hq: 'Takula',
    hqHi: 'ताकुला',
    tehsil: 'Someshwar / Almora',
    tehsilHi: 'सोमेश्वर / अल्मोड़ा',
    populationApprox: '52,000+',
    descriptionHi: 'उपजाऊ सोमेश्वर घाटी और कौसानी पर्यटन मार्ग से जुड़ा प्राकृतिक रूप से समृद्ध एवं शांतिपूर्ण कृषि प्रधान क्षेत्र।',
    descriptionEn: 'Fertile agricultural valley block bordering the scenic Kausani tourism highway and river valleys.',
    keyAttractionsHi: ['सोमेश्वर शिव मंदिर घाटी', 'कौसानी संपर्क मार्ग', 'कोसी नदी जलसंभर क्षेत्र'],
    keyAttractionsEn: ['Someshwar Shiva Temple', 'Kausani Highway Corridor', 'Kosi River Watershed'],
    focusAreasHi: ['जैविक कृषि एवं विपणन क्लस्टर', 'ग्राम स्तर पर प्लास्टिक अपशिष्ट बैंक', 'ग्रामीण संपर्क मार्ग निर्माण'],
    focusAreasEn: ['Organic Agriculture Clusters', 'Village Plastic Waste Banks', 'Rural All-Weather Roads'],
  },
  {
    id: 'tarikhet',
    nameHi: 'ताड़ीखेत',
    nameEn: 'Tarikhet',
    panchayatsCount: 114,
    hq: 'Tarikhet',
    hqHi: 'ताड़ीखेत',
    tehsil: 'Ranikhet',
    tehsilHi: 'रानीखेत',
    populationApprox: '68,200+',
    descriptionHi: 'रानीखेत छावनी के निकट स्थित ऐतिहासिक गांधी आश्रम (प्रेम विद्यालय), चौबटिया सेब उद्यान और बागवानी का प्रमुख केंद्र।',
    descriptionEn: 'Historic center of Gandhi Ashram (Prem Vidyalaya), Chaubatia fruit orchards, and horticulture near Ranikhet.',
    keyAttractionsHi: ['गांधी आश्रम (1929 निर्मित)', 'चौबटिया सरकारी सेब उद्यान', 'रानीखेत गोल्फ ग्राउंड निकटता'],
    keyAttractionsEn: ['Gandhi Ashram (Est. 1929)', 'Chaubatia Apple Orchards', 'Ranikhet Pine Woodlands'],
    focusAreasHi: ['फलोत्पादन एवं प्रसंस्करण सहायता', 'स्वच्छता उपविधि 2023 अनुपालन', 'सड़क किनारे हरित पट्टी व डस्टबिन'],
    focusAreasEn: ['Fruit Processing Support', 'Cleanliness Bylaws Redressal', 'Highway Waste Bins Network'],
  },
  {
    id: 'dwarahat',
    nameHi: 'द्वाराहाट',
    nameEn: 'Dwarahat',
    panchayatsCount: 121,
    hq: 'Dwarahat',
    hqHi: 'द्वाराहाट',
    tehsil: 'Dwarahat',
    tehsilHi: 'द्वाराहाट',
    populationApprox: '71,800+',
    descriptionHi: 'मध्यकालीन कत्यूरी मंदिरों की पावन नगरी, दूनागिरि शक्तिपीठ और बिपिन त्रिपाठी कुमाऊं प्रौद्योगिकी संस्थान (BTKIT) का हब।',
    descriptionEn: 'City of 55+ medieval stone temples, Dunagiri Shaktipeeth temple, and prominent technical education hub BTKIT.',
    keyAttractionsHi: ['कत्यूरी कालीन 55+ मंदिर समूह', 'दूनागिरि माता शक्तिपीठ', 'इंजीनियरिंग कॉलेज (BTKIT)'],
    keyAttractionsEn: ['Katyuri Stone Temples Group', 'Dunagiri Temple Shrine', 'BTKIT Engineering Campus'],
    focusAreasHi: ['धार्मिक-सांस्कृतिक पर्यटन स्वच्छता', 'तकनीकी ई-पंचायत प्रणाली', 'कचरा पुनर्चक्रण व कंपोस्टिंग'],
    focusAreasEn: ['Heritage Site Sanitation', 'E-Panchayat Modernization', 'Composting & Material Recovery'],
  },
  {
    id: 'chaukhutiya',
    nameHi: 'चौखुटिया',
    nameEn: 'Chaukhutiya',
    panchayatsCount: 96,
    hq: 'Chaukhutiya',
    hqHi: 'चौखुटिया',
    tehsil: 'Chaukhutiya',
    tehsilHi: 'चौखुटिया',
    populationApprox: '58,400+',
    descriptionHi: 'पश्चिमी रामगंगा नदी के दोनों तटों पर फैली अत्यंत उपजाऊ घाटी एवं कुमाऊं-गढ़वाल सीमान्त व्यापारिक जंक्शन।',
    descriptionEn: 'Fertile Ramganga river valley acting as the commercial confluence connecting Almora and Chamoli/Garhwal.',
    keyAttractionsHi: ['अगनेरी देवी प्राचीन मंदिर', 'रामगंगा नदी तटवर्ती तटबंध', 'खीड़ा-मासी कृषि बाजार'],
    keyAttractionsEn: ['Agneri Devi Temple', 'Ramganga Riverside Belt', 'Khida & Masi Rural Markets'],
    focusAreasHi: ['नदी तटवर्ती अपशिष्ट प्रबंधन', 'बाढ़ सुरक्षा एवं चेकडैम', 'ग्रामीण हाट बाजार स्वच्छता'],
    focusAreasEn: ['Riverfront Waste Mitigation', 'Check dams & Erosion Control', 'Rural Market Cleanliness'],
  },
  {
    id: 'bhikiyasain',
    nameHi: 'भिकियासैंण',
    nameEn: 'Bhikiyasain',
    panchayatsCount: 104,
    hq: 'Bhikiyasain',
    hqHi: 'भिकियासैंण',
    tehsil: 'Bhikiyasain',
    tehsilHi: 'भिकियासैंण',
    populationApprox: '62,000+',
    descriptionHi: 'रामगंगा, गगास और नौरार नदियों का पवित्र संगम स्थल; सल्ट, रानीखेत व गैरसैंण मार्गों का केन्द्रीय संपर्क सूत्र।',
    descriptionEn: 'Scenic tri-river confluence connecting Western Almora, Sult, Ranikhet, and Gairsain corridors.',
    keyAttractionsHi: ['तीन नदियों का पावन संगम', 'नौला देवी व महाकाली मंदिर', 'पारंपरिक पहाड़ी व्यापार केंद्र'],
    keyAttractionsEn: ['Tri-River Confluence', 'Naula Devi Shrine', 'Traditional Mountain Trade Post'],
    focusAreasHi: ['संगम क्षेत्र जल संरक्षण', 'कूड़ा संग्रहण वाहनों का रूट जीपीएस', 'स्वच्छ भारत अभियान शौचालय संधारण'],
    focusAreasEn: ['Riverbank Water Conservation', 'GPS Fleet Route Management', 'Sanitation Facility Upkeep'],
  },
  {
    id: 'sult',
    nameHi: 'सल्ट',
    nameEn: 'Sult',
    panchayatsCount: 142,
    hq: 'Manila / Sult',
    hqHi: 'मानिला / सल्ट',
    tehsil: 'Sult',
    tehsilHi: 'सल्ट',
    populationApprox: '79,300+',
    descriptionHi: 'महात्मा गांधी द्वारा "कुमाऊं का बारदोली" संबोधित; 1942 के भारत छोड़ो आंदोलन का अमर शहीद तीर्थ एवं मानिला माता का धाम।',
    descriptionEn: 'Acclaimed as "Bardoli of Kumaon" by Mahatma Gandhi; epic center of India\'s 1942 Freedom Struggle and Manila Devi.',
    keyAttractionsHi: ['खुमाड़ अमर शहीद स्मारक', 'मानिला माता सिद्धपीठ', 'कॉर्बेट टाइगर रिजर्व सीमावर्ती वन'],
    keyAttractionsEn: ['Khumar Martyrs Memorial', 'Manila Devi Hilltop Temple', 'Corbett Foothills Edge'],
    focusAreasHi: ['शहीद स्मारक व पर्यटन स्थल सफाई', 'सामुदायिक कचरा निस्तारण गड्ढे', 'महिला स्वयं सहायता समूह आजीविका'],
    focusAreasEn: ['Memorial Heritage Sanitation', 'Community Waste Pits', 'Women SHG Sanitation Drives'],
  },
  {
    id: 'syaldey',
    nameHi: 'स्यालदे',
    nameEn: 'Syaldey',
    panchayatsCount: 92,
    hq: 'Syaldey',
    hqHi: 'स्यालदे',
    tehsil: 'Syaldey',
    tehsilHi: 'स्यालदे',
    populationApprox: '51,600+',
    descriptionHi: 'जनपद का सीमान्त पर्वतीय विकासखंड; प्राकृतिक वन संपदा, पारंपरिक औषधीय कृषि व समृद्ध पहाड़ी संस्कृति का प्रतीक।',
    descriptionEn: 'Highland border development block renowned for pristine oak forests, traditional medicinal herbs, and village crafts.',
    keyAttractionsHi: ['देघाट ऐतिहासिक बाजार', 'नागार्जुन महादेव गुफा मंदिर', 'गगास घाटी के सीढ़ीदार खेत'],
    keyAttractionsEn: ['Deghat Historic Marketplace', 'Nagarjun Mahadev Cave Temple', 'Terraced Valley Landscape'],
    focusAreasHi: ['दूरस्थ ग्राम पंचायतों में स्वच्छता वाहन सेवा', 'प्लास्टिक कचरा नियंत्रण', 'प्राकृतिक जलधारा (नौला) संवर्धन'],
    focusAreasEn: ['Remote GP Waste Collection', 'Plastic Free Drives', 'Traditional Water Springs (Naula)'],
  },
  {
    id: 'lamgara',
    nameHi: 'लमगड़ा',
    nameEn: 'Lamgara',
    panchayatsCount: 109,
    hq: 'Lamgara',
    hqHi: 'लमगड़ा',
    tehsil: 'Bhanoli / Almora',
    tehsilHi: 'भनोली / अल्मोड़ा',
    populationApprox: '64,100+',
    descriptionHi: 'दक्षिण-पूर्वी अल्मोड़ा का देवदार व बांज के वनों से घिरा पर्वतीय विकासखंड, विश्वविख्यात डोल आश्रम (कल्याण सेवा ट्रस्ट) का केंद्र।',
    descriptionEn: 'Pine and cedar forest development block hosting the renowned Dol Ashram (Shri Kalyan Seva Ashram) and yoga retreats.',
    keyAttractionsHi: ['डोल आश्रम (विशाल श्रीयंत्र पीठ)', 'मलयनाथ मंदिर व कपिल मुनि गुफा', 'लमगड़ा बांज-देवदार वन'],
    keyAttractionsEn: ['Dol Ashram & Sri Yantra', 'Malay Nath Temple', 'Dense Oak & Cedar Forests'],
    focusAreasHi: ['तीर्थ स्थल अपशिष्ट निवारण', 'ठोस अपशिष्ट पृथक्करण प्रोटोकॉल', 'ग्रामीण जल आपूर्ति संधारण'],
    focusAreasEn: ['Pilgrim Site Waste Management', '4-Bin Segregation Compliance', 'Rural Drinking Water Network'],
  },
  {
    id: 'dhauladevi',
    nameHi: 'धौलादेवी',
    nameEn: 'Dhauladevi',
    panchayatsCount: 128,
    hq: 'Dhauladevi',
    hqHi: 'धौलादेवी',
    tehsil: 'Bhanoli',
    tehsilHi: 'भनोली',
    populationApprox: '73,900+',
    descriptionHi: 'भगवान शिव के 8वें ज्योतिर्लिंग जागेश्वर धाम (124 प्राचीन मंदिरों का समूह), वृद्ध जागेश्वर और ग्रामीण तांबे-पीतल हस्तशिल्प का धाम।',
    descriptionEn: 'Abode of sacred Jageshwar Dham (cluster of 124 stone temples), Vriddha Jageshwar, and copper-brass artisan hamlets.',
    keyAttractionsHi: ['जागेश्वर धाम (124 मंदिर समूह)', 'वृद्ध जागेश्वर विहंगम हिमालय दर्शन', 'महामृत्युंजय मंदिर ज्योतिर्लिंग'],
    keyAttractionsEn: ['Jageshwar Dham Temple Complex', 'Vriddha Jageshwar Himalayan View', 'Maha Mrityunjaya Shrine'],
    focusAreasHi: ['जागेश्वर तीर्थ क्षेत्र 100% शून्य अपशिष्ट मिशन', 'बायो-डिग्रेडेबल दोना-पत्तल पहल', 'सार्वजनिक शौचालय रखरखाव'],
    focusAreasEn: ['Jageshwar Zero-Waste Mission', 'Eco-friendly Leaf Plate Policy', 'Modern Public Sanitation Facilities'],
  },
  {
    id: 'bhaisiyachhana',
    nameHi: 'भैंसियाछाना',
    nameEn: 'Bhaisiyachhana',
    panchayatsCount: 68,
    hq: 'Danya / Bhaisiyachhana',
    hqHi: 'दाण्या / भैंसियाछाना',
    tehsil: 'Bhanoli',
    tehsilHi: 'भनोली',
    populationApprox: '41,200+',
    descriptionHi: 'दाण्या बाजार के समीप पूर्वी सीमा पर स्थित शांत विकासखंड; पेटशाल प्रागैतिहासिक रॉक आर्ट, प्राकृतिक सौंदर्य व कृषि प्रधान गांव।',
    descriptionEn: 'Eastern frontier block anchored near Danya market, Petshal prehistoric rock art shelters, and serene farming villages.',
    keyAttractionsHi: ['पेटशाल प्रागैतिहासिक शैलचित्र', 'दाण्या मुख्य पहाड़ी बाजार', 'सरयू-पनार घाटी संगम क्षेत्र'],
    keyAttractionsEn: ['Petshal Prehistoric Rock Art', 'Danya Historic Market Post', 'Saryu-Panar River Confluence'],
    focusAreasHi: ['ग्राम स्वच्छता समिति सशक्तिकरण', 'घरेलू गीला व सूखा कचरा प्रबंधन', 'ग्रामीण सड़क किनारे सफाई अभियान'],
    focusAreasEn: ['Village Sanitation Committee Drives', 'Wet & Dry Waste Separation', 'Roadside Cleanliness Inspection'],
  },
];

export function AlmoraBlocksPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Total stats
  const totalPanchayats = useMemo(
    () => ALMORA_BLOCKS_DATA.reduce((acc, curr) => acc + curr.panchayatsCount, 0),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800">
      
      {/* ── 1. Top Government Banner (Slim & Compact) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800/80 shadow-xs">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title with accent bar */}
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-full shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-white tracking-tight leading-none">
                {isHi ? 'जनपद अल्मोड़ा के 11 विकासखंड' : '11 Development Blocks of Almora'}
              </h1>
            </div>

            {/* Quick Slim Governance Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/15 text-white shadow-sm shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-amber-300 leading-none">11</span>
                <span className="text-[11px] text-slate-300 font-medium">{isHi ? 'विकासखंड' : 'Blocks'}</span>
              </div>
              <span className="text-white/25 hidden xs:inline">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white leading-none">{totalPanchayats}</span>
                <span className="text-[11px] text-slate-300 font-medium">{isHi ? 'ग्राम पंचायतें' : 'GPs'}</span>
              </div>
              <span className="text-white/25 hidden xs:inline">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-emerald-400 leading-none">11</span>
                <span className="text-[11px] text-slate-300 font-medium">{isHi ? 'तहसीलें' : 'Tehsils'}</span>
              </div>
              <span className="text-white/25 hidden xs:inline">|</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-blue-300 leading-none">6.2L+</span>
                <span className="text-[11px] text-slate-300 font-medium">{isHi ? 'जनसंख्या' : 'Rural Pop.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Blocks Grid Display ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALMORA_BLOCKS_DATA.map((block) => (
            <div
              key={block.id}
              className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Top subtle hover accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div>
                {/* Zone Chip & GP Count Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {block.panchayatsCount} {isHi ? 'पंचायतें' : 'GPs'}
                  </span>
                </div>

                {/* Block Name */}
                <div className="mb-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors flex items-baseline gap-2">
                    <span>{isHi ? block.nameHi : block.nameEn}</span>
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {isHi ? block.descriptionHi : block.descriptionEn}
                </p>

                {/* Clean 3-Column Administrative Facts Strip */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/90 rounded-xl border border-slate-100 text-xs mb-3.5">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                      {isHi ? 'मुख्यालय' : 'HQ'}
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5" title={isHi ? block.hqHi : block.hq}>
                      {isHi ? block.hqHi : block.hq}
                    </span>
                  </div>
                  <div className="min-w-0 border-l border-slate-200/70 pl-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                      {isHi ? 'तहसील' : 'Tehsil'}
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5" title={isHi ? block.tehsilHi : block.tehsil}>
                      {isHi ? block.tehsilHi : block.tehsil}
                    </span>
                  </div>
                  <div className="min-w-0 border-l border-slate-200/70 pl-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                      {isHi ? 'आबादी' : 'Pop.'}
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                      {block.populationApprox}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Clean Attractions Highlight */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs">
                <div className="truncate text-[11px] sm:text-xs">
                  <span className="text-slate-400 font-medium mr-1.5">{isHi ? 'प्रमुख स्थल:' : 'Key Sites:'}</span>
                  <span className="text-slate-700 font-semibold">
                    {(isHi ? block.keyAttractionsHi : block.keyAttractionsEn).slice(0, 2).join(' • ')}
                  </span>
                  {(isHi ? block.keyAttractionsHi : block.keyAttractionsEn).length > 2 && (
                    <span className="text-slate-400 font-medium ml-1">
                      +{ (isHi ? block.keyAttractionsHi : block.keyAttractionsEn).length - 2 }
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Three-Tier Panchayati Raj Architecture Overview ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs">
          <div className="max-w-3xl mb-8">
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#0b1b36] mt-1">
              {isHi ? 'त्रि-स्तरीय पंचायती राज व्यवस्था में 11 विकासखंडों की भूमिका' : 'The Role of 11 Blocks in 3-Tier Panchayati Raj'}
            </h2>
            <div className="h-1 w-16 bg-amber-500 rounded-full mt-3 mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level 1: District */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {isHi ? 'जिला पंचायत (शीर्ष स्तर)' : 'Zila Panchayat (Apex Tier)'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHi
                  ? 'जनपद स्तर पर नीति निर्धारण, बजट आवंटन, व जिला स्तरीय अपशिष्ट प्रबंधन का नेतृत्व।'
                  : 'Apex policy making, district budget planning, and regulatory governance at the district level.'}
              </p>
            </div>

            {/* Level 2: Block */}
            <div className="bg-blue-50/60 rounded-xl p-5 border border-blue-200/80 relative">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-amber-400 flex items-center justify-center font-bold text-sm mb-3 shadow-xs">
                2
              </div>
              <h3 className="font-bold text-[#0b1b36] text-base mb-1">
                {isHi ? 'क्षेत्र पंचायत (11 विकासखंड)' : 'Kshetra Panchayat (11 Blocks)'}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {isHi
                  ? 'खंड विकास अधिकारी एवं क्षेत्र प्रमुख के नेतृत्व में 11 ब्लॉकों में विकास योजनाओं व स्वच्छता का क्षेत्रीय क्रियान्वयन।'
                  : 'Led by BDO and Block Pramukh, coordinating field execution, waste collection hubs, and inter-panchayat initiatives.'}
              </p>
            </div>

            {/* Level 3: Gram Panchayat */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {isHi ? 'ग्राम पंचायत (1,160+ पंचायतें)' : 'Gram Panchayat (1,160+ GPs)'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHi
                  ? 'ग्राम प्रधान व पंचायत सचिव के माध्यम से ग्रामीण स्तर पर सीधे नागरिकों को सफाई, सड़क व पेयजल सेवाएं उपलब्ध कराना।'
                  : 'Direct grassroots governance by Gram Pradhan and Panchayat Secretary, ensuring village cleanliness and public amenities.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
