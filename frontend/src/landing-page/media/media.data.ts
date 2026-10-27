

export interface Notice {
  id: string;
  image: string;
  date?: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  link?: string; // Optional: link to official order, news article, or document
}

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';

const encodeImg = (filename: string) => `${S3_BUCKET}/media/${filename}`;

 export const NOTICES_DATA: Notice[] = [
  {
  id: 'notice-1',

    image: '/assets/notice 1.webp',
  date: '10 Feb 2026',
  titleEn:'Action Ordered Against Littering to Protect Kosi and Ramganga Rivers',
  titleHi:'कोसी और रामगंगा नदियों की सुरक्षा के लिए कूड़ा फैलाने वालों पर कार्रवाई के निर्देश',
summaryEn:'Almora District Magistrate Anshul Singh ordered notices for people littering in public places and challans for repeated violations. The district administration also reviewed riverbank cleaning, solid-waste disposal, sewerage improvement, and public awareness measures.',
summaryHi:'अल्मोड़ा जिलाधिकारी अंशुल सिंह ने सार्वजनिक स्थानों पर कूड़ा फेंकने वालों को पहले नोटिस और नियमों का उल्लंघन जारी रखने पर चालान करने के निर्देश दिए। बैठक में नदी तटों की सफाई, ठोस कचरा निस्तारण, सीवरेज व्यवस्था और जन-जागरूकता पर भी चर्चा हुई।',
},
{
  id: 'notice-2',
  image: '/assets/notice2.jpeg',
  date: '17 Sep 2026',

  titleEn:
    'Ashirwad Ka Diya Programme Organized at Jageshwar by Zila Panchayat Almora',
  titleHi:
    'जिला पंचायत अल्मोड़ा द्वारा जागेश्वर में आशीर्वाद का दीया कार्यक्रम आयोजित',

  summaryEn:
    'Under the Seva Sankalp Abhiyan, Zila Panchayat Almora organized the Ashirwad Ka Diya programme at Jageshwar to mark Prime Minister Narendra Modi’s birthday and 25 years of public service.',

  summaryHi:
    'सेवा संकल्प अभियान के तहत जिला पंचायत अल्मोड़ा द्वारा जागेश्वर में आशीर्वाद का दीया कार्यक्रम आयोजित किया गया। यह कार्यक्रम प्रधानमंत्री नरेंद्र मोदी के जन्मदिवस और सार्वजनिक जीवन में 25 वर्षों की सेवा पूर्ण होने के अवसर पर आयोजित हुआ।',
},
  {
    id: 'notice-3',
    image: encodeImg('1790648931953-195645006.jpeg'),
    date: '20 Sep 2026',
    titleEn: 'Zero-Tolerance Enforcement on Single-Use Plastic & Open Burning',
    titleHi: 'सिंगल-यूज़ प्लास्टिक पर पूर्ण प्रतिबंध एवं खुले में कचरा जलाने पर रोक',
    summaryEn: 'Strict enforcement drives initiated against sale, storage, and distribution of banned polythene and thermocol cutleries. Open burning of waste carries an immediate environmental penalty.',
    summaryHi: 'अल्मोड़ा के हवालबाग विकासखंड के कोसी बाजार में निराश्रित गोवंश की समस्या से निजात दिलाने के लिए जिला पंचायत और पशुपालन विभाग ने संयुक्त अभियान चलाया। इसके तहत 22 गोवंश को पकड़कर गौशाला भेजा गया। ',
  },
  {
    id: 'notice-4',
    image: encodeImg('1790648991473-976248359.jpeg'),
    date: '14 Sep 2026',
    titleEn: 'Optimized Morning Door-to-Door GPS Waste Collection Vehicle Timetable',
    titleHi: 'डोर-टू-डोर जीपीएस कचरा वाहन का नया समय चक्र व प्रातःकालीन रूट रोस्टर',
    summaryEn: 'Updated morning route schedules for dedicated tippers and compactor trucks (06:30 AM to 11:30 AM). Track vehicle live location directly from the Live GPS Tracking section.',
    summaryHi: 'समस्त कचरा संग्रहण टिपर व कंपैक्टर वाहनों के नए रूट और प्रातः 06:30 से 11:30 बजे का समय जारी। नागरिक पोर्टल के "लाइव ट्रैकिंग" सेक्शन में वाहन की वास्तविक लोकेशन देख सकते हैं।',
  },
  {
    id: 'notice-5',
    image: encodeImg('1790648931752-397379307.jpeg'),
    date: '08 Sep 2026',
    titleEn: 'Digital Cleanliness Grievance Redressal: Committed 24 to 48 Hour Resolution',
    titleHi: 'डिजिटल स्वच्छता शिकायत निवारण: 24 से 48 घंटे में समाधान की प्रतिबद्धता',
    summaryEn: 'Citizens can report unattended garbage dumps, non-arrival of vehicles, or irregular cleaning via our online complaint form. Track status in real-time with automatic SMS updates.',
    summaryHi: 'कचरा न उठने, वाहन के न आने अथवा गंदगी की सूचना नागरिक हमारे ऑनलाइन शिकायत पोर्टल पर फोटो सहित दर्ज कर सकते हैं। स्थिति की लाइव ट्रैकिंग व एसएमएस अलर्ट उपलब्ध है।',
  },
  {
    id: 'notice-6',
    image: encodeImg('1790648931904-641586205.jpeg'),
    date: '02 Sep 2026',
    titleEn: 'Safety Equipment & Health Screening Camp for Frontline Paryavaran Mitras',
    titleHi: 'स्वच्छता कर्मियों (पर्यावरण मित्रों) हेतु सुरक्षा किट वितरण व स्वास्थ्य परीक्षण',
    summaryEn: 'Distribution of high-visibility safety jackets, puncture-proof safety boots, heavy-duty gloves, and quarterly medical checkup drives for all waste handling staff.',
    summaryHi: 'कचरा प्रबंधन में सेवारत समस्त पर्यावरण मित्रों को सुरक्षा जैकेट, सुरक्षा जूते, दस्ताने व निशुल्क स्वास्थ्य परीक्षण का व्यापक अभियान संपन्न।',
  }
];

// -------------------------------------------------------------
// Latest Updates & Notifications Data (Flexible Fields)
// -------------------------------------------------------------
export interface NotificationUpdateItem {
  id: string;
  titleEn: string;
  titleHi?: string;
  date?: string;          // optional: e.g. "29 May 2026"
  placeEn?: string;       // optional: e.g. "Almora Headquarter"
  placeHi?: string;       // optional: e.g. "अल्मोड़ा मुख्यालय"
  departmentEn?: string;  // optional: e.g. "DoPR Uttarakhand"
  departmentHi?: string;  // optional: e.g. "पंचायती राज विभाग"
  descriptionEn?: string; // optional summary
  descriptionHi?: string; // optional summary
  tagEn?: string;         // optional: e.g. "Meeting", "Report", "Notice"
  tagHi?: string;         // optional: e.g. "बैठक", "प्रतिवेदन", "सूचना"
}

export const LATEST_UPDATES_DATA: NotificationUpdateItem[] = [
  {
    id: 'update-1',
    titleEn: 'DoPR Annual Transfer Meeting Scheduled on Dt 01-06-2026',
    titleHi: 'पंचायती राज विभाग (DoPR) वार्षिक स्थानांतरण बैठक 01-06-2026 को निर्धारित',
    date: '29 May 2026',
    placeEn: 'Almora Headquarter',
    placeHi: 'अल्मोड़ा मुख्यालय',
    departmentEn: 'DoPR Uttarakhand',
    departmentHi: 'पंचायती राज विभाग',
    tagEn: 'Meeting',
    tagHi: 'बैठक'
  },
  {
    id: 'update-2',
    titleEn: 'Report on the committee on enhancing the quality of GPDP',
    titleHi: 'ग्राम पंचायत विकास योजना (GPDP) की गुणवत्ता संवर्धन समिति का प्रतिवेदन',
    date: '22 May 2026',
    tagEn: 'Report',
    tagHi: 'प्रतिवेदन'
  },
  {
    id: 'update-3',
    titleEn: 'Action Ordered Against Littering to Protect Kosi and Ramganga Rivers',
    titleHi: 'कोसी और रामगंगा नदियों की सुरक्षा के लिए कूड़ा फैलाने वालों पर कार्रवाई के निर्देश',
    date: '10 Feb 2026',
    placeEn: 'River Catchment Zones',
    placeHi: 'नदी तटीय क्षेत्र',
    tagEn: 'Order',
    tagHi: 'आदेश',
    descriptionEn: 'Almora District Administration issued strict guidelines and notice protocol against dumping of waste in natural water bodies.',
    descriptionHi: 'प्राकृतिक जल स्रोतों और नदी किनारों पर कचरा फेंकने वालों के विरुद्ध नोटिस व दंडात्मक चालान के सख्त निर्देश।'
  },
  {
    id: 'update-4',
    titleEn: 'Zero-Tolerance Enforcement on Single-Use Plastic in Commercial Markets',
    titleHi: 'व्यावसायिक बाजारों में सिंगल-यूज़ प्लास्टिक पर पूर्ण प्रतिबंध एवं सघन चेकिंग अभियान',
    placeEn: 'All Market Areas, Almora',
    placeHi: 'समस्त बाजार क्षेत्र, अल्मोड़ा',
    tagEn: 'Compliance',
    tagHi: 'निगरानी अभियान'
  },
  {
    id: 'update-5',
    titleEn: 'Public Advisory on Segregation of Wet and Dry Household Waste at Source',
    titleHi: 'घरों में गीले व सूखे कचरे के प्राथमिक पृथक्करण हेतु सार्वजनिक परामर्श',
    tagEn: 'Public Advisory',
    tagHi: 'जन परामर्श'
  },
  {
    id: 'update-6',
    titleEn: 'Ashirwad Ka Diya Programme Organized at Jageshwar by Zila Panchayat Almora',
    titleHi: 'जिला पंचायत अल्मोड़ा द्वारा जागेश्वर में आशीर्वाद का दीया कार्यक्रम आयोजित',
    date: '17 Sep 2026',
    placeEn: 'Jageshwar Dham',
    placeHi: 'जागेश्वर धाम',
    tagEn: 'Programme',
    tagHi: 'कार्यक्रम'
  },
  {
    id: 'update-7',
    titleEn: 'Door-to-Door GPS Waste Collection Vehicle Timetable & Fleet Roster Published',
    titleHi: 'डोर-टू-डोर जीपीएस कचरा संग्रहण वाहनों की समय सारणी एवं रूट रोस्टर प्रकाशित',
    date: '14 Sep 2026',
    departmentEn: 'Solid Waste Management Cell',
    departmentHi: 'ठोस अपशिष्ट प्रबंधन प्रकोष्ठ'
  }
];
