import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2, 
  Megaphone, 
  X, 
  Printer, 
  Building2,
  Sparkles,
  ArrowUpRight,
  MapPin,
  Eye
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export interface Notice {
  id: string;
  image: string;
  date: string;
  locationEn: string;
  locationHi: string;
  priority: 'urgent' | 'active' | 'general';
  isNew?: boolean;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  departmentEn: string;
  departmentHi: string;
  keyPointsEn: string[];
  keyPointsHi: string[];
  fullTextEn: string;
  fullTextHi: string;
  authorityEn: string;
  authorityHi: string;
}

const encodeImg = (filename: string) => `/assets/gallery/${encodeURIComponent(filename)}`;

const NOTICES_DATA: Notice[] = [
  {
    id: 'notice-1',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.38.57 PM.jpeg'),
    date: '28 Sep 2026',
    locationEn: 'Hawalbagh Block, Almora',
    locationHi: 'हवालबाग विकासखंड, अल्मोड़ा',
    priority: 'urgent',
    isNew: true,
    departmentEn: 'Solid Waste Management Cell, Zila Panchayat',
    departmentHi: 'ठोस अपशिष्ट प्रबंधन प्रकोष्ठ, जिला पंचायत',
    titleEn: 'Mandatory Segregation of Wet & Dry Waste at Source Across All Sectors',
    titleHi: 'समस्त ग्रामीण व व्यावसायिक क्षेत्रों में गीले व सूखे कचरे का अनिवार्य पृथक्करण',
    summaryEn: 'Under Uttarakhand Solid Waste Management Bylaws, all households and commercial establishments must hand over separated waste in Green and Blue bins. Non-compliance invites penalties.',
    summaryHi: 'उत्तराखंड ठोस अपशिष्ट प्रबंधन उपविधियों के अंतर्गत समस्त परिवारों व व्यावसायिक प्रतिष्ठानों को गीला व सूखा कचरा अलग-अलग पात्रों (हरे व नीले) में ही वाहन को सौंपना अनिवार्य है।',
    keyPointsEn: [
      'Green Bin: Food leftovers, fruit/vegetable peels, organic kitchen waste.',
      'Blue Bin: Plastic covers, paper, cardboard, metal cans, glass packaging.',
      'GPS-enabled sanitation tippers will strictly accept segregated waste only.',
      'Strict penalty for commercial units and repeat residential violators.'
    ],
    keyPointsHi: [
      'हरा डिब्बा: भोजन का बचा हुआ अंश, फल-सब्जी के छिलके व जैविक कचरा।',
      'नीला डिब्बा: प्लास्टिक थैली, गत्ता, टिन, कांच की बोतलें व सूखा कचरा।',
      'जीपीएस-सज्जित कचरा वाहन केवल अलग-अलग किया हुआ कचरा ही स्वीकार करेंगे।',
      'व्यावसायिक प्रतिष्ठानों व नियमों के उल्लंघनकर्ताओं पर नियमानुसार चालान की कार्रवाई।'
    ],
    fullTextEn: 'Pursuant to the directives of the Department of Panchayati Raj, Government of Uttarakhand, it is hereby mandated for all citizens, shopkeepers, commercial establishments, and hotels under District Panchayat Almora to enforce 100% source segregation of municipal solid waste. All collection vehicles equipped with onboard GPS tracking shall strictly record vehicle halts and collection compliance.',
    fullTextHi: 'उत्तराखंड शासन के पंचायती राज अनुभाग के निर्देशों के अनुपालन में, जिला पंचायत अल्मोड़ा के अधिकार क्षेत्र अंतर्गत समस्त ग्राम पंचायतों, बाजारों, होटल व्यवसायियों एवं नागरिकों को सूचित किया जाता है कि ठोस अपशिष्ट का शत-प्रतिशत पृथक्करण अनिवार्य है। प्रत्येक जीपीएस ट्रैक्ड कचरा संग्रहण वाहन में नियत समय पर ही कचरा दें।',
    authorityEn: 'Chief Development Officer & Executive Officer, Zila Panchayat Almora',
    authorityHi: 'मुख्य विकास अधिकारी / अपर मुख्य अधिकारी, जिला पंचायत अल्मोड़ा'
  },
  {
    id: 'notice-2',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.38.59 PM.jpeg'),
    date: '24 Sep 2026',
    locationEn: 'Central Waste Compactor Station, Almora',
    locationHi: 'केंद्रीय अपशिष्ट कंपैक्टर केंद्र, अल्मोड़ा',
    priority: 'urgent',
    isNew: true,
    departmentEn: 'Sanitation & Emergency Response Wing',
    departmentHi: 'स्वच्छता एवं आपातकालीन रिस्पांस विंग',
    titleEn: 'Special Hill Drainage Clearing & Monsoon Waste Removal Deployment Plan',
    titleHi: 'पर्वतीय नालों की सफाई एवं विशेष वर्षाकालीन कचरा निस्तारण कार्ययोजना',
    summaryEn: 'Special rapid-action Paryavaran Mitra squads deployed across vulnerable hill slopes, culverts, and pilgrimage road links to eliminate garbage clogging and prevent road overflow.',
    summaryHi: 'पर्वतीय ढलानों, नालियों एवं प्रमुख तीर्थ-पर्यटन मार्गों पर जलभराव व कचरा अवरोध रोकने हेतु विशेष पर्यावरण मित्र क्विक रिस्पांस टीमों की तैनाती की गई है।',
    keyPointsEn: [
      '24x7 emergency garbage removal squad active across 11 development blocks.',
      'Citizens can report blocked drains via online complaint portal with instant photo.',
      'Compactor vehicles operating with GPS geofencing along major highway routes.'
    ],
    keyPointsHi: [
      'जनपद के सभी 11 विकासखंडों में 24x7 त्वरित कचरा निस्तारण टीम सक्रिय।',
      'नालों में कचरा जमा होने की स्थिति में नागरिक पोर्टल पर फोटो अपलोड कर तत्काल शिकायत दर्ज कर सकते हैं।',
      'प्रमुख राजमार्गों पर जीपीएस जियोफेंसिंग के माध्यम से नियमित कचरा ढुलाई की सख्त मॉनिटरिंग।'
    ],
    fullTextEn: 'In view of continuous seasonal rainfall and potential hill landslide debris, special guidelines have been issued for intensive clearing of road culverts, drainage points, and village market garbage collection centers. Block Development Officers and Sanitation Supervisors will conduct daily inspections.',
    fullTextHi: 'वर्षाकाल के दृष्टिगत जनपद के समस्त कस्बों, बाजार क्षेत्रों एवं संवेदनशील पर्वतीय मोड़ों पर कचरा जमाव रोकने हेतु विशेष अभियान संचालित है। संबंधित खंड विकास अधिकारी एवं स्वच्छता पर्यवेक्षक प्रतिदिन अपने-अपने क्षेत्रों का भौतिक सत्यापन कर रिपोर्ट प्रेषित करेंगे।',
    authorityEn: 'Nodal Officer (Sanitation), District Panchayat Almora',
    authorityHi: 'नोडल अधिकारी (स्वच्छता), जिला पंचायत अल्मोड़ा'
  },
  {
    id: 'notice-3',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.40.20 PM.jpeg'),
    date: '20 Sep 2026',
    locationEn: 'Dadholi Ward & Village Roads',
    locationHi: 'दाधोली वार्ड एवं ग्रामीण मार्ग, अल्मोड़ा',
    priority: 'active',
    isNew: false,
    departmentEn: 'Environment Protection & Bylaws Enforcement',
    departmentHi: 'पर्यावरण संरक्षण एवं उपविधि प्रवर्तन प्रकोष्ठ',
    titleEn: 'Zero-Tolerance Enforcement on Single-Use Plastic & Open Burning',
    titleHi: 'सिंगल-यूज़ प्लास्टिक पर पूर्ण प्रतिबंध एवं खुले में कचरा जलाने पर रोक',
    summaryEn: 'Strict enforcement drives initiated against sale, storage, and distribution of banned polythene and thermocol cutleries. Open burning of waste carries an immediate environmental penalty.',
    summaryHi: 'प्रतिबंधित पॉलीथीन एवं थर्मोकोल कटलरी के विक्रय, भंडारण एवं उपयोग पर सघन चेकिंग अभियान। खुले में कचरा जलाने पर राष्ट्रीय हरित अधिकरण (NGT) के नियमानुसार दंडात्मक कार्रवाई।',
    keyPointsEn: [
      'Banned items: Polythene bags <120 microns, plastic straw, disposable cutlery.',
      'Penalty for open burning of municipal dry waste: ₹5,000 as per NGT guidelines.',
      'Mobile inspection teams authorized to seize contraband plastic in all weekly markets.'
    ],
    keyPointsHi: [
      'प्रतिबंधित वस्तुएं: 120 माइक्रोन से कम की थैलियां, प्लास्टिक स्ट्रॉ, डिस्पोजेबल कप-प्लेट।',
      'कूड़े के ढेर में आग लगाने पर एनजीटी दिशानिर्देशों के तहत न्यूनतम ₹5,000 का अर्थदंड।',
      'सप्ताहिक हाट-बाजारों व मुख्य पर्यटक स्थलों पर गठित सचल दल द्वारा नियमित जब्ती व चालान।'
    ],
    fullTextEn: 'To protect the fragile Himalayan ecology and water catchment basins of Almora, zero-tolerance enforcement of the Plastic Waste Management Rules is mandated. All trade associations, merchant unions, and tourism stakeholders are requested to switch to cloth bags and compostable alternatives.',
    fullTextHi: 'अल्मोड़ा जनपद के संवेदनशील हिमालयी पर्यावरण एवं जलस्रोतों को प्रदूषण मुक्त रखने हेतु प्लास्टिक अपशिष्ट प्रबंधन नियमों का कठोरता से अनुपालन कराया जा रहा है। सभी व्यापार मंडलों व नागरिकों से अपील है कि वे कपड़े के थैले व पर्यावरण-अनुकूल विकल्पों को प्राथमिकता दें।',
    authorityEn: 'District Magistrate / Administrator, Zila Panchayat',
    authorityHi: 'जिलाधिकारी / प्रशासक, जिला पंचायत'
  },
  {
    id: 'notice-4',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.41.00 PM.jpeg'),
    date: '14 Sep 2026',
    locationEn: 'Rural Connectivity Corridors, Almora',
    locationHi: 'ग्रामीण संपर्क मार्ग एवं बाजार क्षेत्र, अल्मोड़ा',
    priority: 'general',
    isNew: false,
    departmentEn: 'Fleet Logistics & Vehicle Tracking Division',
    departmentHi: 'वाहन बेड़ा प्रबंधन एवं जीपीएस मॉनिटरिंग प्रभाग',
    titleEn: 'Optimized Morning Door-to-Door GPS Waste Collection Vehicle Timetable',
    titleHi: 'डोर-टू-डोर जीपीएस कचरा वाहन का नया समय चक्र व प्रातःकालीन रूट रोस्टर',
    summaryEn: 'Updated morning route schedules for dedicated tippers and compactor trucks (06:30 AM to 11:30 AM). Track vehicle live location directly from the Live GPS Tracking section.',
    summaryHi: 'समस्त कचरा संग्रहण टिपर व कंपैक्टर वाहनों के नए रूट और प्रातः 06:30 से 11:30 बजे का समय जारी। नागरिक पोर्टल के "लाइव ट्रैकिंग" सेक्शन में वाहन की वास्तविक लोकेशन देख सकते हैं।',
    keyPointsEn: [
      'Morning Shift (06:30 AM – 09:30 AM): Residential colonies and inner village paths.',
      'Mid-Day Shift (09:30 AM – 11:30 AM): Commercial markets, tourist spots, and school zones.',
      'Siren alert sounds 3 minutes prior to vehicle arrival at each designated pickup point.'
    ],
    keyPointsHi: [
      'प्रथम चरण (प्रातः 06:30 से 09:30): आवासीय बस्तियां एवं आंतरिक ग्रामीण मार्ग।',
      'द्वितीय चरण (प्रातः 09:30 से 11:30): मुख्य बाजार, पर्यटक स्थल, ढाबा क्षेत्र एवं स्कूल मार्ग।',
      'कचरा वाहन पहुंचने से 3 मिनट पूर्व निर्धारित पिकअप पॉइंट पर सायरन/जिंगल बजाया जाएगा।'
    ],
    fullTextEn: 'In response to public feedback received through ward meetings, the vehicle deployment timetable has been restructured for optimal coverage and minimal traffic disruption. Citizens are urged to dispose of their household waste only in the official Zila Panchayat vehicle during these hours.',
    fullTextHi: 'ग्राम स्तर पर प्राप्त जन-सुझावों के आधार पर वाहनों के फेरों और समय में आवश्यक संशोधन किया गया है ताकि किसी भी मार्ग पर कचरा छूटने न पाए। सभी से अनुरोध है कि निर्धारित समय पर ही वाहन में कचरा डालें और सड़कों के किनारे कूड़ा फेंकने से बचें।',
    authorityEn: 'Transport & Fleet In-charge, Zila Panchayat Almora',
    authorityHi: 'वाहन प्रभारी, जिला पंचायत अल्मोड़ा'
  },
  {
    id: 'notice-5',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.44.00 PM.jpeg'),
    date: '08 Sep 2026',
    locationEn: 'District Control Room, Almora',
    locationHi: 'जिला नियंत्रण कक्ष, अल्मोड़ा',
    priority: 'active',
    isNew: false,
    departmentEn: 'Public Grievance Redressal Cell',
    departmentHi: 'जन शिकायत निवारण प्रकोष्ठ',
    titleEn: 'Digital Cleanliness Grievance Redressal: Committed 24 to 48 Hour Resolution',
    titleHi: 'डिजिटल स्वच्छता शिकायत निवारण: 24 से 48 घंटे में समाधान की प्रतिबद्धता',
    summaryEn: 'Citizens can report unattended garbage dumps, non-arrival of vehicles, or irregular cleaning via our online complaint form. Track status in real-time with automatic SMS updates.',
    summaryHi: 'कचरा न उठने, वाहन के न आने अथवा गंदगी की सूचना नागरिक हमारे ऑनलाइन शिकायत पोर्टल पर फोटो सहित दर्ज कर सकते हैं। स्थिति की लाइव ट्रैकिंग व एसएमएस अलर्ट उपलब्ध है।',
    keyPointsEn: [
      'Toll-Free Grievance Helpline: 1800-185-1850 (Toll Free, 08:00 AM – 08:00 PM).',
      'Upload photos of garbage spots directly from mobile without registration.',
      'Supervisor resolves ticket with before/after verified action photographs.'
    ],
    keyPointsHi: [
      'टोल-फ्री हेल्पलाइन: 1800-185-1850 (निःशुल्क, प्रातः 08:00 से सायं 08:00)।',
      'बिना किसी जटिल लॉगिन के केवल मोबाइल नंबर से फोटो सहित शिकायत दर्ज करें।',
      'सफाई के उपरांत पर्यवेक्षक द्वारा "कार्य से पूर्व व कार्य के बाद" की फोटो सहित समाधान रिपोर्ट दर्ज होगी।'
    ],
    fullTextEn: 'The digital portal guarantees rapid resolution of community sanitation complaints. Every complaint receives a unique tracking ID and is routed directly to the designated ward sanitary inspector. Failure to resolve complaints within 48 hours is automatically escalated to higher administrative authorities.',
    fullTextHi: 'जिला पंचायत अल्मोड़ा नागरिक शिकायतों के त्वरित व पारदर्शी समाधान हेतु प्रतिबद्ध है। प्रत्येक शिकायत को एक यूनिक ट्रैकिंग नंबर प्रदान किया जाता है। 48 घंटे में निस्तारण न होने पर मामला स्वतः उच्चाधिकारियों को प्रेषित हो जाता है।',
    authorityEn: 'Grievance Redressal Officer, District Panchayat',
    authorityHi: 'जन शिकायत निवारण अधिकारी, जिला पंचायत'
  },
  {
    id: 'notice-6',
    image: encodeImg('WhatsApp Image 2026-09-14 at 6.44.08 PM.jpeg'),
    date: '02 Sep 2026',
    locationEn: 'Paryavaran Mitra Seva Kendra',
    locationHi: 'पर्यावरण मित्र सेवा केंद्र, अल्मोड़ा',
    priority: 'general',
    isNew: false,
    departmentEn: 'Sanitation Workers Welfare Board',
    departmentHi: 'पर्यावरण मित्र कल्याण बोर्ड',
    titleEn: 'Safety Equipment & Health Screening Camp for Frontline Paryavaran Mitras',
    titleHi: 'स्वच्छता कर्मियों (पर्यावरण मित्रों) हेतु सुरक्षा किट वितरण व स्वास्थ्य परीक्षण',
    summaryEn: 'Distribution of high-visibility safety jackets, puncture-proof safety boots, heavy-duty gloves, and quarterly medical checkup drives for all waste handling staff.',
    summaryHi: 'कचरा प्रबंधन में सेवारत समस्त पर्यावरण मित्रों को सुरक्षा जैकेट, सुरक्षा जूते, दस्ताने व निशुल्क स्वास्थ्य परीक्षण का व्यापक अभियान संपन्न।',
    keyPointsEn: [
      'All sanitation workers insured under State Health Protection Scheme.',
      'Mandatory use of safety gear during collection and sorting operations.',
      'Quarterly vaccinations and health checkups provided at block health centers.'
    ],
    keyPointsHi: [
      'समस्त सफाई कर्मी राज्य स्वास्थ्य बीमा योजना से आच्छादित।',
      'कचरा संग्रहण व छंटाई के दौरान व्यक्तिगत सुरक्षा उपकरण (PPE) पहनना अनिवार्य।',
      'प्रत्येक त्रैमास में सामुदायिक स्वास्थ्य केंद्रों के माध्यम से निशुल्क जांच व टीकाकरण।'
    ],
    fullTextEn: 'Our Paryavaran Mitras are the frontline warriors safeguarding the health and purity of our mountain ecosystem. The administration is dedicated to ensuring their utmost occupational safety, dignifying their service, and providing continuous medical care.',
    fullTextHi: 'हमारे पर्यावरण मित्र हिमालयी पर्यावरण व जनस्वास्थ्य की रक्षा करने वाले अग्रिम पंक्ति के कर्मयोगी हैं। प्रशासन उनकी कार्यस्थल सुरक्षा, गरिमा और निरंतर स्वास्थ्य देखभाल सुनिश्चित करने हेतु पूर्णतः समर्पित है।',
    authorityEn: 'Secretary, District Panchayat Sanitation Council',
    authorityHi: 'सचिव, जिला पंचायत स्वच्छता परिषद'
  }
];

export const NoticesSection = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalNotice, setActiveModalNotice] = useState<Notice | null>(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-orange-200 text-orange-900 text-xs font-semibold uppercase tracking-wider mb-3.5 border border-orange-200">
              <Megaphone className="w-3.5 h-3.5 text-orange-900 animate-pulse" />
              <span>{isHi ? 'शासकीय सूचनाएं' : 'Official Notices'}</span>
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              {isHi ? 'स्वच्छता सूचनाएं, आदेश एवं सार्वजनिक अपडेट' : 'Government Notices & Sanitation Updates'}
            </h2>

            <p className="text-slate-600 mt-2 text-sm sm:text-base max-w-3xl">
              {isHi 
                ? 'ठोस अपशिष्ट प्रबंधन, डोर-टू-डोर कचरा संग्रहण, मार्ग समय-सारिणी एवं जनहित में जारी आधिकारिक निर्देश व सूचनाएं।'
                : 'Official circulars, solid waste management bylaws, collection timetables, and public advisories issued by Zila Panchayat Almora.'}
            </p>
          </div>

          {/* Slider Controls (Prev / Next Buttons) */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {currentIndex + 1} - {Math.min(currentIndex + cardsPerView, NOTICES_DATA.length)} / {NOTICES_DATA.length}
            </span>
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

        {/* 1. Official Alert / Urgent Ticker Banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white p-3.5 sm:p-4 shadow-sm border border-navy-700 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              {isHi ? 'नवीनतम शासनादेश' : 'Flash Update'}
            </span>
          </div>

          <div className="overflow-hidden text-xs sm:text-sm text-slate-200 flex-1 font-medium leading-relaxed">
            {isHi 
              ? 'जनपद अल्मोड़ा के समस्त ग्राम पंचायतों व वार्डों में गीला व सूखा कचरा पृथक्करण अनिवार्य। उल्लंघन पर नियमानुसार अर्थदंड लागू। समय से वाहन में ही कचरा दें।'
              : 'Mandatory source segregation of wet & dry waste across all 11 development blocks of Almora. Unsegregated garbage will not be collected by GPS tippers.'}
          </div>

          <button 
            onClick={() => setActiveModalNotice(NOTICES_DATA[0])}
            className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-semibold underline underline-offset-4 shrink-0 transition-colors cursor-pointer"
          >
            <span>{isHi ? 'आदेश पढ़ें' : 'Read Order'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Slider / Carousel Container */}
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
                    
                    {/* Top overlay badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {notice.isNew && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs uppercase tracking-wide">
                          <Sparkles className="w-3 h-3 text-emerald-200" />
                          {isHi ? 'नया' : 'NEW'}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shadow-xs ${
                        notice.priority === 'urgent'
                          ? 'bg-rose-600 text-white'
                          : 'bg-navy-900/90 text-white'
                      }`}>
                        {notice.priority === 'urgent' 
                          ? (isHi ? 'अति महत्वपूर्ण' : 'URGENT')
                          : (isHi ? 'शासकीय सूचना' : 'CIRCULAR')}
                      </span>
                    </div>

                    {/* Date Pill */}
                    <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                      <Calendar className="w-3 h-3 text-amber-300" />
                      <span>{notice.date}</span>
                    </div>

                    {/* Location Badge (Bottom of Image) */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-gradient-to-t from-black/85 via-black/50 to-transparent p-1.5 rounded">
                      <span className="inline-flex items-center gap-1 truncate font-medium">
                        <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                        <span className="truncate">{isHi ? notice.locationHi : notice.locationEn}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Department */}
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider line-clamp-1 mb-2">
                      {isHi ? notice.departmentHi : notice.departmentEn}
                    </p>

                    {/* Title */}
                    <h3 className="font-poppins text-base font-bold text-navy-900 group-hover:text-navy-700 transition-colors line-clamp-2 leading-snug mb-2.5">
                      {isHi ? notice.titleHi : notice.titleEn}
                    </h3>

                    {/* Summary */}
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3.5">
                      {isHi ? notice.summaryHi : notice.summaryEn}
                    </p>

                    {/* Key Directive Bullet */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">
                          {isHi ? notice.keyPointsHi[0] : notice.keyPointsEn[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isHi ? 'उत्तराखंड शासन' : 'Govt of Uttarakhand'}
                  </span>

                  <button
                    onClick={() => setActiveModalNotice(notice)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-navy-700 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-200/70 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-navy-700" />
                    <span>{isHi ? 'विवरण देखें' : 'View Details'}</span>
                  </button>
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

      </div>

      {/* 5. Detailed Government Order / Notice Modal */}
      {activeModalNotice && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveModalNotice(null)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative h-56 sm:h-64 w-full bg-slate-900">
              <img 
                src={activeModalNotice.image} 
                alt={isHi ? activeModalNotice.titleHi : activeModalNotice.titleEn}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

              <button 
                onClick={() => setActiveModalNotice(null)}
                className="absolute right-4 top-4 text-white bg-black/60 hover:bg-black/80 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Bottom details on image */}
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? 'कार्यालय जिला पंचायत अल्मोड़ा (उत्तराखंड)' : 'Office of District Panchayat Almora (Uttarakhand)'}</span>
                </div>
                <h3 className="font-poppins text-lg sm:text-xl font-bold leading-snug text-white">
                  {isHi ? activeModalNotice.titleHi : activeModalNotice.titleEn}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-slate-800 text-sm">
              {/* Date & Location bar */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{isHi ? activeModalNotice.locationHi : activeModalNotice.locationEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-navy-600 shrink-0" />
                  <span>{activeModalNotice.date}</span>
                </div>
              </div>

              {/* Department */}
              <div className="text-xs">
                <span className="text-slate-500">{isHi ? 'जारीकर्ता विभाग: ' : 'Department: '}</span>
                <strong className="text-navy-900">{isHi ? activeModalNotice.departmentHi : activeModalNotice.departmentEn}</strong>
              </div>

              {/* Full Notice Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {isHi ? 'आदेश का संक्षिप्त विवरण' : 'Summary & Context'}
                </h4>
                <p className="leading-relaxed text-slate-700 bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/50">
                  {isHi ? activeModalNotice.summaryHi : activeModalNotice.summaryEn}
                </p>
              </div>

              {/* Key Directives / Points */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {isHi ? 'मुख्य निर्देश एवं बिंदु' : 'Key Directives & Action Items'}
                </h4>
                <div className="space-y-2.5">
                  {(isHi ? activeModalNotice.keyPointsHi : activeModalNotice.keyPointsEn).map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="text-slate-700 leading-normal">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Administrative Text */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {isHi ? 'विस्तृत शासनादेश' : 'Full Administrative Directives'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {isHi ? activeModalNotice.fullTextHi : activeModalNotice.fullTextEn}
                </p>
              </div>

              {/* Signature / Authority footer */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <p className="text-[11px] text-slate-400">{isHi ? 'हस्ताक्षर / प्राधिकारी:' : 'Issued by Authority:'}</p>
                  <p className="font-semibold text-navy-900 mt-0.5">
                    {isHi ? activeModalNotice.authorityHi : activeModalNotice.authorityEn}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p>{isHi ? 'स्थान: अल्मोड़ा, उत्तराखंड' : 'Station: Almora, Uttarakhand'}</p>
                  <p>{isHi ? 'डिजिटल रूप से प्रमाणित' : 'Digitally Certified Record'}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रिंट करें' : 'Print Notice'}</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveModalNotice(null)}
                  className="text-xs"
                >
                  {isHi ? 'बंद करें' : 'Close'}
                </Button>
                <a
                  href="#complaint"
                  onClick={() => setActiveModalNotice(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 text-xs font-semibold transition-colors"
                >
                  <span>{isHi ? 'शिकायत करें' : 'Lodge Grievance'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});
