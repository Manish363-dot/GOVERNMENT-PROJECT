import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
} from 'lucide-react';

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL;

export interface InitiativeItem {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  imageUrl: string;
}
const image_01 = `${S3_BUCKET}/Initiative/Intiative1.webp`;
const image_02 = `${S3_BUCKET}/Initiative/Intiative2.webp`;
const image_03 = `${S3_BUCKET}/Initiative/Intiative3.webp`;
const image_04 = `${S3_BUCKET}/Initiative/Intiative4.webp`;
const image_05 = `${S3_BUCKET}/Initiative/Intiative5.webp`;
const image_06 = `${S3_BUCKET}/Initiative/Intiative6.webp`;
const image_07 = `${S3_BUCKET}/Initiative/Intiative7.webp`;
const image_08 = `${S3_BUCKET}/Initiative/Intiative8.webp`;
const image_09 = `${S3_BUCKET}/Initiative/Intiative9.webp`;
const image_10 = `${S3_BUCKET}/Initiative/Intiative10.webp`;
export const INITIATIVES_DATA: InitiativeItem[] = [
  {
    id: '01',
    titleHi: 'ग्रामीण विकास मिशन',
    titleEn: 'Rural Development Mission',
    descHi: 'ग्रामीण क्षेत्रों में बुनियादी सुविधाओं का विस्तार, संपर्क मार्गों में सुधार और गाँवों के समग्र विकास को बढ़ावा देना।',
    descEn: 'Promote overall rural development, essential facilities, and better living standards across village communities.',
    imageUrl: image_01
  },
  {
    id: '02',
    titleHi: 'ग्रामीण बुनियादी ढाँचा विकास',
    titleEn: 'Rural Infrastructure Development',
    descHi: 'ग्रामीण सड़कों, सार्वजनिक भवनों, सामुदायिक स्थलों और अन्य आवश्यक सुविधाओं के विकास एवं रखरखाव को प्रोत्साहित करना।',
    descEn: 'Support the development and maintenance of rural roads, public buildings, community spaces, and essential infrastructure.',
    imageUrl: image_02
  },
  {
    id: '03',
    titleHi: 'स्वच्छ एवं स्वस्थ ग्राम अभियान',
    titleEn: 'Clean & Healthy Village Initiative',
    descHi: 'स्वच्छता, कचरा प्रबंधन, स्वच्छ सार्वजनिक स्थानों और नागरिक जागरूकता के माध्यम से स्वस्थ ग्रामीण वातावरण बनाना।',
    descEn: 'Encourage sanitation, waste management, clean public spaces, and community cleanliness across rural wards.',
    imageUrl: image_03
  },
  {
    id: '04',
    titleHi: 'डिजिटल पंचायत एवं ई-गवर्नेंस',
    titleEn: 'Digital Panchayat & E-Governance',
    descHi: 'ऑनलाइन आवेदन, डिजिटल भुगतान, प्रमाणपत्र संबंधी जानकारी और नागरिक सेवाओं को तकनीक के माध्यम से सुगम बनाना।',
    descEn: 'Improve access to online applications, digital payments, public information, and citizen services.',
    imageUrl: image_04
  },
  {
    id: '05',
    titleHi: 'जनशिकायत एवं समाधान प्रणाली',
    titleEn: 'Public Grievance & Resolution System',
    descHi: 'नागरिकों को ऑनलाइन शिकायत दर्ज करने, उनकी स्थिति ट्रैक करने और पारदर्शी समाधान अपडेट प्राप्त करने की सुविधा।',
    descEn: 'Enable citizens to register complaints, track their status, and access transparent resolution updates.',
    imageUrl: image_05
  },
  {
    id: '06',
    titleHi: 'ग्रामीण आजीविका एवं स्वरोजगार',
    titleEn: 'Rural Livelihood & Self-Employment',
    descHi: 'स्थानीय उद्यमियों, शिल्पकारों, स्वयं सहायता समूहों और ग्रामीण रोजगार के नए अवसरों को प्रोत्साहित करना।',
    descEn: 'Support local entrepreneurs, artisans, self-help groups, and rural employment opportunities.',
    imageUrl: image_06
  },
  {
    id: '07',
    titleHi: 'कृषि एवं प्राकृतिक संसाधन संरक्षण',
    titleEn: 'Agriculture & Natural Resource Conservation',
    descHi: 'स्थानीय पर्वतीय कृषि, जल संचयन, मृदा संरक्षण और प्राकृतिक संपदा के सतत एवं विवेकपूर्ण उपयोग को बढ़ावा।',
    descEn: 'Promote local agriculture, water conservation, soil protection, and responsible use of natural resources.',
    imageUrl: image_07
  },
  {
    id: '08',
    titleHi: 'स्थानीय संस्कृति एवं पर्यटन प्रोत्साहन',
    titleEn: 'Local Culture & Tourism Promotion',
    descHi: 'अल्मोड़ा की सांस्कृतिक धरोहर, पारंपरिक हस्तशिल्प, स्थानीय उत्पादों एवं ग्रामीण पर्यटन के अवसरों को वैश्विक पहचान दिलाना।',
    descEn: "Highlight Almora's cultural heritage, traditional crafts, local products, and rural tourism opportunities.",
    imageUrl: image_08
  },
  {
    id: '09',
    titleHi: 'पेयजल एवं स्वच्छता',
    titleEn: 'Drinking Water & Sanitation',
    descHi: 'स्वच्छ पेयजल की उपलब्धता, जल संचयन और पर्यावरण संरक्षण के लिए आवश्यक प्रयास।',
    descEn: 'Ensure clean drinking water, rainwater harvesting, and environmental protection initiatives.',
    imageUrl: image_09
  },
  {
    id: '10',
    titleHi: 'सरकारी योजनाएँ एवं जनजागरूकता',
    titleEn: 'Government Schemes & Public Awareness',
    descHi: 'केंद्रीय व राज्य वित्त आयोग की जनकल्याणकारी योजनाओं, पात्रता नियमों, आवश्यक दस्तावेजों और प्रक्रियाओं की सुगम जानकारी।',
    descEn: 'Help citizens understand applicable government schemes, eligibility criteria, required documents, and application procedures.',
    imageUrl: image_10
  }
];

export function OurInitiativePage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
    // Preload the first 2 visible initiative images immediately
    const img1 = new Image();
    img1.src = image_01;
    const img2 = new Image();
    img2.src = image_02;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Top Government Banner (Slim) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0c2a52] text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800 shadow-xs">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-full shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-white tracking-tight leading-none">
              {isHi ? 'हमारी पहल' : 'Our Initiatives'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="space-y-8 sm:space-y-10">

          {/* Section Introduction Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 font-poppins mb-4">
              {isHi
                ? 'समावेशी ग्रामीण विकास एवं पारदर्शी सुशासन'
                : 'Inclusive Rural Progress & Transparent Governance'}
            </h2>

            <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-4">
              <p>
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा का उद्देश्य बेहतर बुनियादी सुविधाओं, डिजिटल प्रशासन, स्वच्छता, जनकल्याण, आजीविका के अवसरों, पर्यावरण संरक्षण और पारदर्शी प्रशासन के माध्यम से समावेशी ग्रामीण विकास को बढ़ावा देना है। हमारी पहल ग्रामीण समुदायों को सशक्त बनाने, जनसेवाओं तक पहुँच आसान करने और नागरिकों की भागीदारी एवं सतत विकास के माध्यम से स्वच्छ, स्वस्थ और आत्मनिर्भर अल्मोड़ा का निर्माण करने पर केंद्रित है।'
                  : 'Zila Panchayat Almora aims to promote inclusive rural development through improved infrastructure, digital governance, sanitation, public welfare, livelihood opportunities, environmental protection, and transparent administration. Our initiatives focus on empowering rural communities, improving access to public services, and building a cleaner, healthier, and more self-reliant Almora through citizen participation and sustainable development.'}
              </p>
              <p className="text-slate-600 text-xs sm:text-sm pt-1 border-t border-slate-100">
                {isHi
                  ? 'यह पहलें अल्मोड़ा जनपद की 1,160+ ग्राम पंचायतों, 11 विकासखंडों और स्थानीय नागरिकों के सर्वांगीण उत्थान को समर्पित हैं।'
                  : 'These initiatives are dedicated to the holistic upliftment of 1,160+ Gram Panchayats, 11 Development Blocks, and rural citizens across Almora district.'}
              </p>
            </div>
          </div>

          {/* 14 Comprehensive Initiatives List - 2 Items Per Row, Image on Left, Text on Right */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-sm">
            <div className="border-b border-slate-200 pb-4 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-poppins">
                {isHi ? 'प्रमुख विकास एवं जनकल्याण पहलें' : 'Core Development & Public Welfare Initiatives'}
              </h2>
            </div>

            {/* 2 items in one row (grid-cols-1 md:grid-cols-2) without boxed cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-10">
              {INITIATIVES_DATA.map((item, idx) => {
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 sm:gap-5 pb-6 border-b border-slate-200/80 group"
                  >
                    {/* Left Thumbnail Image */}
                    <div className="w-28 h-20 sm:w-36 sm:h-24 md:w-40 md:h-26 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 shadow-xs">
                      <img
                        src={item.imageUrl}
                        alt={isHi ? item.titleHi : item.titleEn}
                        width={160}
                        height={104}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading={idx < 4 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={idx < 2 ? "high" : "auto"}
                      />
                    </div>

                    {/* Right Content */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-poppins font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-900 transition-colors">
                        {idx + 1}. {isHi ? item.titleHi : item.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                        {isHi ? item.descHi : item.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
