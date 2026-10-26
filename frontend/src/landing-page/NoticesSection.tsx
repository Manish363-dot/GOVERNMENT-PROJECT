import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  ShieldCheck, 
  X, 
  Printer, 
  MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DailyWorkSection } from '@/landing-page/DailyWorkSection';

export interface Notice {
  id: string;
  image: string;
  date: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  fullTextEn: string;
  fullTextHi: string;
}

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';
const encodeImg = (filename: string) => `${S3_BUCKET}/media/${filename}`;

const NOTICES_DATA: Notice[] = [
  {
    id: 'notice-1',
    image: encodeImg('1790647197817-60806429.jpeg'),
    date: '28 Sep 2026',
    titleEn: 'Mandatory Segregation of Wet & Dry Waste at Source Across All Sectors',
    titleHi: 'समस्त ग्रामीण व व्यावसायिक क्षेत्रों में गीले व सूखे कचरे का अनिवार्य पृथक्करण',
    summaryEn: 'Under Uttarakhand Solid Waste Management Bylaws, all households and commercial establishments must hand over separated waste in Green and Blue bins. Non-compliance invites penalties.',
    summaryHi: 'उत्तराखंड ठोस अपशिष्ट प्रबंधन उपविधियों के अंतर्गत समस्त परिवारों व व्यावसायिक प्रतिष्ठानों को गीला व सूखा कचरा अलग-अलग पात्रों (हरे व नीले) में ही वाहन को सौंपना अनिवार्य है।',
    fullTextEn: 'Pursuant to the directives of the Department of Panchayati Raj, Government of Uttarakhand, it is hereby mandated for all citizens, shopkeepers, commercial establishments, and hotels under District Panchayat Almora to enforce 100% source segregation of municipal solid waste. All collection vehicles equipped with onboard GPS tracking shall strictly record vehicle halts and collection compliance.',
    fullTextHi: 'उत्तराखंड शासन के पंचायती राज अनुभाग के निर्देशों के अनुपालन में, जिला पंचायत अल्मोड़ा के अधिकार क्षेत्र अंतर्गत समस्त ग्राम पंचायतों, बाजारों, होटल व्यवसायियों एवं नागरिकों को सूचित किया जाता है कि ठोस अपशिष्ट का शत-प्रतिशत पृथक्करण अनिवार्य है। प्रत्येक जीपीएस ट्रैक्ड कचरा संग्रहण वाहन में नियत समय पर ही कचरा दें।',
  },
  {
    id: 'notice-2',
    image: encodeImg('1790648931238-10068149.jpeg'),
    date: '24 Sep 2026',
    titleEn: 'Special Hill Drainage Clearing & Monsoon Waste Removal Deployment Plan',
    titleHi: 'पर्वतीय नालों की सफाई एवं विशेष वर्षाकालीन कचरा निस्तारण कार्ययोजना',
    summaryEn: 'Special rapid-action Paryavaran Mitra squads deployed across vulnerable hill slopes, culverts, and pilgrimage road links to eliminate garbage clogging and prevent road overflow.',
    summaryHi: 'पर्वतीय ढलानों, नालियों एवं प्रमुख तीर्थ-पर्यटन मार्गों पर जलभराव व कचरा अवरोध रोकने हेतु विशेष पर्यावरण मित्र क्विक रिस्पांस टीमों की तैनाती की गई है।',
    fullTextEn: 'In view of continuous seasonal rainfall and potential hill landslide debris, special guidelines have been issued for intensive clearing of road culverts, drainage points, and village market garbage collection centers. Block Development Officers and Sanitation Supervisors will conduct daily inspections.',
    fullTextHi: 'वर्षाकाल के दृष्टिगत जनपद के समस्त कस्बों, बाजार क्षेत्रों एवं संवेदनशील पर्वतीय मोड़ों पर कचरा जमाव रोकने हेतु विशेष अभियान संचालित है। संबंधित खंड विकास अधिकारी एवं स्वच्छता पर्यवेक्षक प्रतिदिन अपने-अपने क्षेत्रों का भौतिक सत्यापन कर रिपोर्ट प्रेषित करेंगे।',
  },
  {
    id: 'notice-3',
    image: encodeImg('1790648931953-195645006.jpeg'),
    date: '20 Sep 2026',
    titleEn: 'Zero-Tolerance Enforcement on Single-Use Plastic & Open Burning',
    titleHi: 'सिंगल-यूज़ प्लास्टिक पर पूर्ण प्रतिबंध एवं खुले में कचरा जलाने पर रोक',
    summaryEn: 'Strict enforcement drives initiated against sale, storage, and distribution of banned polythene and thermocol cutleries. Open burning of waste carries an immediate environmental penalty.',
    summaryHi: 'प्रतिबंधित पॉलीथीन एवं थर्मोकोल कटलरी के विक्रय, भंडारण एवं उपयोग पर सघन चेकिंग अभियान। खुले में कचरा जलाने पर राष्ट्रीय हरित अधिकरण (NGT) के नियमानुसार दंडात्मक कार्रवाई।',
    fullTextEn: 'To protect the fragile Himalayan ecology and water catchment basins of Almora, zero-tolerance enforcement of the Plastic Waste Management Rules is mandated. All trade associations, merchant unions, and tourism stakeholders are requested to switch to cloth bags and compostable alternatives.',
    fullTextHi: 'अल्मोड़ा जनपद के संवेदनशील हिमालयी पर्यावरण एवं जलस्रोतों को प्रदूषण मुक्त रखने हेतु प्लास्टिक अपशिष्ट प्रबंधन नियमों का कठोरता से अनुपालन कराया जा रहा है। सभी व्यापार मंडलों व नागरिकों से अपील है कि वे कपड़े के थैले व पर्यावरण-अनुकूल विकल्पों को प्राथमिकता दें।',
  },
  {
    id: 'notice-4',
    image: encodeImg('1790648991473-976248359.jpeg'),
    date: '14 Sep 2026',
    titleEn: 'Optimized Morning Door-to-Door GPS Waste Collection Vehicle Timetable',
    titleHi: 'डोर-टू-डोर जीपीएस कचरा वाहन का नया समय चक्र व प्रातःकालीन रूट रोस्टर',
    summaryEn: 'Updated morning route schedules for dedicated tippers and compactor trucks (06:30 AM to 11:30 AM). Track vehicle live location directly from the Live GPS Tracking section.',
    summaryHi: 'समस्त कचरा संग्रहण टिपर व कंपैक्टर वाहनों के नए रूट और प्रातः 06:30 से 11:30 बजे का समय जारी। नागरिक पोर्टल के "लाइव ट्रैकिंग" सेक्शन में वाहन की वास्तविक लोकेशन देख सकते हैं।',
    fullTextEn: 'In response to public feedback received through ward meetings, the vehicle deployment timetable has been restructured for optimal coverage and minimal traffic disruption. Citizens are urged to dispose of their household waste only in the official Zila Panchayat vehicle during these hours.',
    fullTextHi: 'ग्राम स्तर पर प्राप्त जन-सुझावों के आधार पर वाहनों के फेरों और समय में आवश्यक संशोधन किया गया है ताकि किसी भी मार्ग पर कचरा छूटने न पाए। सभी से अनुरोध है कि निर्धारित समय पर ही वाहन में कचरा डालें और सड़कों के किनारे कूड़ा फेंकने से बचें।',
  },
  {
    id: 'notice-5',
    image: encodeImg('1790648931752-397379307.jpeg'),
    date: '08 Sep 2026',
    titleEn: 'Digital Cleanliness Grievance Redressal: Committed 24 to 48 Hour Resolution',
    titleHi: 'डिजिटल स्वच्छता शिकायत निवारण: 24 से 48 घंटे में समाधान की प्रतिबद्धता',
    summaryEn: 'Citizens can report unattended garbage dumps, non-arrival of vehicles, or irregular cleaning via our online complaint form. Track status in real-time with automatic SMS updates.',
    summaryHi: 'कचरा न उठने, वाहन के न आने अथवा गंदगी की सूचना नागरिक हमारे ऑनलाइन शिकायत पोर्टल पर फोटो सहित दर्ज कर सकते हैं। स्थिति की लाइव ट्रैकिंग व एसएमएस अलर्ट उपलब्ध है।',
    fullTextEn: 'The digital portal guarantees rapid resolution of community sanitation complaints. Every complaint receives a unique tracking ID and is routed directly to the designated ward sanitary inspector. Failure to resolve complaints within 48 hours is automatically escalated to higher administrative authorities.',
    fullTextHi: 'जिला पंचायत अल्मोड़ा नागरिक शिकायतों के त्वरित व पारदर्शी समाधान हेतु प्रतिबद्ध है। प्रत्येक शिकायत को एक यूनिक ट्रैकिंग नंबर प्रदान किया जाता है। 48 घंटे में निस्तारण न होने पर मामला स्वतः उच्चाधिकारियों को प्रेषित हो जाता है।',
  },
  {
    id: 'notice-6',
    image: encodeImg('1790648931904-641586205.jpeg'),
    date: '02 Sep 2026',
    titleEn: 'Safety Equipment & Health Screening Camp for Frontline Paryavaran Mitras',
    titleHi: 'स्वच्छता कर्मियों (पर्यावरण मित्रों) हेतु सुरक्षा किट वितरण व स्वास्थ्य परीक्षण',
    summaryEn: 'Distribution of high-visibility safety jackets, puncture-proof safety boots, heavy-duty gloves, and quarterly medical checkup drives for all waste handling staff.',
    summaryHi: 'कचरा प्रबंधन में सेवारत समस्त पर्यावरण मित्रों को सुरक्षा जैकेट, सुरक्षा जूते, दस्ताने व निशुल्क स्वास्थ्य परीक्षण का व्यापक अभियान संपन्न।',
    fullTextEn: 'Our Paryavaran Mitras are the frontline warriors safeguarding the health and purity of our mountain ecosystem. The administration is dedicated to ensuring their utmost occupational safety, dignifying their service, and providing continuous medical care.',
    fullTextHi: 'हमारे पर्यावरण मित्र हिमालयी पर्यावरण व जनस्वास्थ्य की रक्षा करने वाले अग्रिम पंक्ति के कर्मयोगी हैं। प्रशासन उनकी कार्यस्थल सुरक्षा, गरिमा और निरंतर स्वास्थ्य देखभाल सुनिश्चित करने हेतु पूर्णतः समर्पित है।'
  }
];

export const NoticesSection = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalNotice, setActiveModalNotice] = useState<Notice | null>(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [expandedNoticeIds, setExpandedNoticeIds] = useState<Record<string, boolean>>({});
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleExpandNotice = (id: string) => {
    setExpandedNoticeIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Responsive items per view
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

  const maxIndex = Math.max(0, NOTICES_DATA.length - cardsPerView);

  // Auto-play slider (pauses on hover)
  useEffect(() => {
    if (NOTICES_DATA.length <= cardsPerView) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [maxIndex, cardsPerView]);

  const prevSlide = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section 
      id="Notices" 
      className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200"
    >
      {/* Anchor duplicate for lowercase compatibility */}
      <div id="notices" className="absolute -top-16 left-0 h-1 w-1 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Section with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              {isHi ? 'सूचनाएं, आदेश एवं अपडेट' : 'Government Notice & Updates'}
            </h2>
            <div className="h-1 w-20 bg-amber-400 rounded-full mt-3 mb-6" />
          </div>

          {/* Slider Controls (Prev / Next Buttons) */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              onClick={prevSlide}
              aria-label="Previous Notice"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Notice"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* 1. Slider / Carousel Container */}
        <div 
          className="relative overflow-hidden -mx-2 px-2 py-2"
          onMouseEnter={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); }}
          onMouseLeave={() => {
            if (NOTICES_DATA.length > cardsPerView) {
              autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
              }, 5000);
            }
          }}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-5"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
            }}
          >
            {NOTICES_DATA.map((notice) => (
              <div
                key={notice.id}
                className="shrink-0 group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden hover:border-navy-300"
                style={{
                  width: `calc(${100 / cardsPerView}% - ${(20 * (cardsPerView - 1)) / cardsPerView}px)`
                }}
              >
                <div>
                  {/* Photo with Overlay Badge and Date */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={notice.image} 
                      alt={isHi ? notice.titleHi : notice.titleEn}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Date Pill */}
                    <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                      <span>{notice.date}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-poppins text-base font-bold text-navy-900 group-hover:text-navy-700 transition-colors line-clamp-2 leading-snug mb-2.5">
                      {isHi ? notice.titleHi : notice.titleEn}
                    </h3>

                    {/* Summary with Inline Expand / Collapse (View More / View Less) */}
                    {(() => {
                      const summary = isHi ? notice.summaryHi : notice.summaryEn;
                      const isExpanded = !!expandedNoticeIds[notice.id];
                      const isLong = summary.length > 80;

                      return (
                        <div className="mb-2">
                          <p className={`text-slate-600 text-xs sm:text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {summary}
                          </p>
                          {isLong && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandNotice(notice.id);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer mt-1.5 focus:outline-none"
                            >
                              <span>
                                {isExpanded 
                                  ? (isHi ? 'कम देखें' : 'View Less') 
                                  : (isHi ? 'और पढ़ें' : 'View More')}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-7 bg-navy-900' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* 4. Daily Operations & Work Progress (दैनिक कार्य एवं संचालन प्रगति) */}
        <div className="mt-14 pt-12 border-t border-slate-200">
          <DailyWorkSection embedded />
        </div>
      </div>
    </section>
  );
});
