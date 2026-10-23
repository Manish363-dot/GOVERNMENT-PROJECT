import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Building, Users, ChevronRight, Search, Landmark } from 'lucide-react';

interface BlockInfo {
  id: string;
  nameHi: string;
  nameEn: string;
  panchayatsCount: number;
  hq: string;
  descriptionHi: string;
  descriptionEn: string;
  tehsil: string;
}

const ALMORA_BLOCKS: BlockInfo[] = [
  {
    id: 'hawalbagh',
    nameHi: 'हवालबाग (अल्मोड़ा)',
    nameEn: 'Hawalbagh (Almora)',
    panchayatsCount: 132,
    hq: 'Hawalbagh',
    tehsil: 'Almora',
    descriptionHi: 'जनपद मुख्यालय का प्रमुख विकासखंड, ऐतिहासिक व प्रशासनिक केंद्र।',
    descriptionEn: 'Core development block surrounding the district administrative headquarters.',
  },
  {
    id: 'takula',
    nameHi: 'ताकुला',
    nameEn: 'Takula',
    panchayatsCount: 88,
    hq: 'Takula',
    tehsil: 'Someshwar / Almora',
    descriptionHi: 'सोमेश्वर घाटी व कौसानी मार्ग से जुड़ा शांत व समृद्ध ग्रामीण क्षेत्र।',
    descriptionEn: 'Scenic valley block connecting Someshwar valley and Kausani route.',
  },
  {
    id: 'tarikhet',
    nameHi: 'ताड़ीखेत',
    nameEn: 'Tarikhet',
    panchayatsCount: 114,
    hq: 'Tarikhet',
    tehsil: 'Ranikhet',
    descriptionHi: 'रानीखेत छावनी के निकट स्थित ऐतिहासिक गांधी आश्रम व कृषि प्रधान क्षेत्र।',
    descriptionEn: 'Historic region near Ranikhet known for Gandhi Ashram and horticulture.',
  },
  {
    id: 'dwarahat',
    nameHi: 'द्वाराहाट',
    nameEn: 'Dwarahat',
    panchayatsCount: 121,
    hq: 'Dwarahat',
    tehsil: 'Dwarahat',
    descriptionHi: 'मध्यकालीन मंदिरों की नगरी, तकनीकी व शैक्षिक हब (BTKIT)।',
    descriptionEn: 'Historic town of medieval temples and prominent educational/engineering hub.',
  },
  {
    id: 'chaukhutiya',
    nameHi: 'चौखुटिया',
    nameEn: 'Chaukhutiya',
    panchayatsCount: 96,
    hq: 'Chaukhutiya',
    tehsil: 'Chaukhutiya',
    descriptionHi: 'रामगंगा नदी के किनारे उपजाऊ घाटी व प्रमुख व्यापारिक जंक्शन।',
    descriptionEn: 'Fertile Ramganga river valley and major rural commerce gateway.',
  },
  {
    id: 'bhikiyasain',
    nameHi: 'भिकियासैंण',
    nameEn: 'Bhikiyasain',
    panchayatsCount: 104,
    hq: 'Bhikiyasain',
    tehsil: 'Bhikiyasain',
    descriptionHi: 'पश्चिमी अल्मोड़ा का संगम स्थल, सल्ट व रानीखेत का संयोजक केंद्र।',
    descriptionEn: 'River confluence hub connecting western Almora, Sult, and Ranikhet.',
  },
  {
    id: 'sult',
    nameHi: 'सल्ट',
    nameEn: 'Sult (Salt)',
    panchayatsCount: 142,
    hq: 'Manila / Sult',
    tehsil: 'Sult',
    descriptionHi: 'उत्तराखण्ड का बारदोली, स्वतंत्रता आंदोलन की गौरवशाली कर्मभूमि।',
    descriptionEn: 'Known as "Bardoli of Kumaon" for its heroic role in India\'s freedom movement.',
  },
  {
    id: 'syaldey',
    nameHi: 'स्यालदे',
    nameEn: 'Syaldey',
    panchayatsCount: 92,
    hq: 'Syaldey',
    tehsil: 'Syaldey',
    descriptionHi: 'सीमान्त पर्वतीय विकासखंड, कृषि व वन संपदा से परिपूर्ण।',
    descriptionEn: 'Highland mountain development block rich in agriculture and forest wealth.',
  },
  {
    id: 'lamgara',
    nameHi: 'लमगड़ा',
    nameEn: 'Lamgara',
    panchayatsCount: 109,
    hq: 'Lamgara',
    tehsil: 'Bhanoli / Almora',
    descriptionHi: 'दक्षिण-पूर्वी अल्मोड़ा का पर्वतीय ब्लॉक, देवदार व बांज के वनों से आच्छादित।',
    descriptionEn: 'Picturesque pine and oak forest region in south-eastern Almora.',
  },
  {
    id: 'dhauladevi',
    nameHi: 'धौलादेवी',
    nameEn: 'Dhauladevi',
    panchayatsCount: 128,
    hq: 'Dhauladevi',
    tehsil: 'Bhanoli',
    descriptionHi: 'जागेश्वर धाम का पावन परिक्षेत्र, धार्मिक पर्यटन व हस्तशिल्प केंद्र।',
    descriptionEn: 'Abode of sacred Jageshwar Dham temple cluster and rural artisans.',
  },
  {
    id: 'bhaisiyachhana',
    nameHi: 'भैंसियाछाना',
    nameEn: 'Bhaisiyachhana',
    panchayatsCount: 68,
    hq: 'Danya / Bhaisiyachhana',
    tehsil: 'Bhanoli',
    descriptionHi: 'दाण्या बाजार के समीप पूर्वी सीमा पर स्थित शांत व विकासोन्मुख क्षेत्र।',
    descriptionEn: 'Eastern frontier block anchored near Danya market and serene villages.',
  },
];

export const AlmoraBlocksSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<BlockInfo | null>(null);

  const filteredBlocks = ALMORA_BLOCKS.filter((block) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      block.nameHi.toLowerCase().includes(q) ||
      block.nameEn.toLowerCase().includes(q) ||
      block.tehsil.toLowerCase().includes(q) ||
      block.hq.toLowerCase().includes(q)
    );
  });

  const totalPanchayats = ALMORA_BLOCKS.reduce((acc, curr) => acc + curr.panchayatsCount, 0);

  return (
    <section id="blocks" className="py-14 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs sm:text-sm font-semibold mb-3">
            <Building className="w-4 h-4 text-blue-400" />
            <span>{isHi ? 'प्रशासनिक क्षेत्राधिकार (11 विकासखंड)' : 'Administrative Jurisdiction (11 Blocks)'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {isHi ? 'जनपद अल्मोड़ा के विकासखंड एवं ग्राम पंचायतें' : 'Development Blocks & Gram Panchayats of Almora'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-blue-500 mx-auto rounded-full mt-3 mb-4" />
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {isHi
              ? `जिला पंचायत अल्मोड़ा के अंतर्गत कुल 11 विकासखंडों में ${totalPanchayats}+ ग्राम पंचायतें समाहित हैं, जहाँ पारदर्शी पंचायती राज व्यवस्था संचालित है।`
              : `Zila Panchayat Almora oversees ${totalPanchayats}+ Gram Panchayats spread across 11 administrative development blocks.`}
          </p>

          {/* Search Input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'ब्लॉक या तहसील का नाम खोजें...' : 'Search block or tehsil name...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              onClick={() => setSelectedBlock(block)}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/60 rounded-xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-amber-300 border border-slate-600">
                    {block.panchayatsCount} {isHi ? 'पंचायतें' : 'GPs'}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {isHi ? block.nameHi : block.nameEn}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {isHi ? block.descriptionHi : block.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{block.tehsil}</span>
                </span>
                <span className="text-blue-400 font-medium flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  <span>{isHi ? 'विवरण' : 'Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Selected Block Details */}
        {selectedBlock && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setSelectedBlock(null)}
          >
            <div 
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {isHi ? 'विकासखंड विवरण' : 'Block Profile'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {isHi ? selectedBlock.nameHi : selectedBlock.nameEn}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block">{isHi ? 'कुल ग्राम पंचायतें' : 'Gram Panchayats'}</span>
                  <span className="text-lg font-bold text-amber-300">{selectedBlock.panchayatsCount}</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 block">{isHi ? 'संबद्ध तहसील' : 'Tehsil'}</span>
                  <span className="text-lg font-bold text-blue-300">{selectedBlock.tehsil}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {isHi ? selectedBlock.descriptionHi : selectedBlock.descriptionEn}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
});

AlmoraBlocksSection.displayName = 'AlmoraBlocksSection';
