

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

const notice_1_image = `${S3_BUCKET}/Social-Media-Section/notice 1.webp`;
const notice_2_image = `${S3_BUCKET}/Social-Media-Section/notice2.webp`;
const notice_3_image = `${S3_BUCKET}/Social-Media-Section/notice3.webp`;
const notice_4_image = `${S3_BUCKET}/Social-Media-Section/notice4.webp`;
const notice_5_image = `${S3_BUCKET}/Social-Media-Section/notice5.webp`;
const notice_6_image = `${S3_BUCKET}/Social-Media-Section/notice6.webp`;
const notice_7_image = `${S3_BUCKET}/Social-Media-Section/notice7.webp`;

const encodeImg = (filename: string) => `${S3_BUCKET}/media/${filename}`;

 export const NOTICES_DATA: Notice[] = [
  {
  id: 'notice-1',

    image: notice_1_image,
  date: '10 Feb 2026',
  titleEn:'Action Ordered Against Littering to Protect Kosi and Ramganga Rivers',
  titleHi:'कोसी और रामगंगा नदियों की सुरक्षा के लिए कूड़ा फैलाने वालों पर कार्रवाई के निर्देश',
summaryEn:'Almora District Magistrate Anshul Singh ordered notices for people littering in public places and challans for repeated violations. The district administration also reviewed riverbank cleaning, solid-waste disposal, sewerage improvement, and public awareness measures.',
summaryHi:'अल्मोड़ा जिलाधिकारी अंशुल सिंह ने सार्वजनिक स्थानों पर कूड़ा फेंकने वालों को पहले नोटिस और नियमों का उल्लंघन जारी रखने पर चालान करने के निर्देश दिए। बैठक में नदी तटों की सफाई, ठोस कचरा निस्तारण, सीवरेज व्यवस्था और जन-जागरूकता पर भी चर्चा हुई।',
},
{
  id: 'notice-2',
  image: notice_2_image,
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
    image: notice_3_image,
    date: '24 Oct 2026',
    titleEn: '22 Stray Cattle Found in Almora',
    titleHi: 'अल्मोड़ा में 22 गोवंश पाए गए',
    summaryEn: 'To address the problem of stray cattle in Kosi Bazaar, Hawalbagh block of Almora, the Zila Panchayat and Animal Husbandry Department conducted a joint drive. During the drive, 22 stray cattle were rescued and sent to a cow shelter.',
    summaryHi: 'अल्मोड़ा के हवालबाग विकासखंड के कोसी बाजार में निराश्रित गोवंश की समस्या से निजात दिलाने के लिए जिला पंचायत और पशुपालन विभाग ने संयुक्त अभियान चलाया। इसके तहत 22 गोवंश को पकड़कर गौशाला भेजा गया। ',
    link:'https://www.facebook.com/share/v/1CRmFERkNK/'
  },
  {
    id: 'notice-4',
    image: notice_4_image,
    titleEn: 'Mann ki Baat with Prime Minister Narendra Modi',
    titleHi: 'प्रधानमंत्री नरेंद्र मोदी के साथ मन की बात',
    summaryEn: 'Prime Minister Narendra Modi addressed the nation in his monthly Mann Ki Baat radio programme. He urged citizens to take part in the Swachhata Abhiyan and maintain cleanliness in public places.',
    summaryHi: 'प्रधानमंत्री नरेंद्र मोदी ने अपने मासिक रेडियो कार्यक्रम मन की बात में देश को संबोधित किया। उन्होंने नागरिकों से स्वच्छता अभियान में भाग लेने और सार्वजनिक स्थानों पर स्वच्छता बनाए रखने का आग्रह किया।',
    link:'https://www.youtube.com/watch?v=0qR6gK9d8s4'
  },
  {
    id: 'notice-5',
    image: notice_5_image,
    titleEn: 'Construction of Five New Cow Shelters in Rural Almora',
    titleHi: 'ग्रामीण क्षेत्रों में पाँच नई गौशालाओं का निर्माण',
    summaryEn: 'To provide relief to farmers from the problem of stray and abandoned cattle in rural areas of Almora district, five new cow shelters are being constructed, while two existing cow shelters are being expanded to accommodate and care for more cattle.',
    summaryHi: 'अल्मोड़ा जिले के ग्रामीण क्षेत्रों में निराश्रित और आवारा गोवंश की समस्या से किसानों को राहत दिलाने के लिए पांच नई गौशालाओं का निर्माण किया जा रहा है, जबकि दो गौशालाओं का विस्तारीकरण किया जा रहा है।',
    link:'https://www.facebook.com/share/v/18YZ6kmwKb/'
  },
  {
    id: 'notice-6',
    image: notice_6_image,
    titleEn: 'Masi Traders Association Organizes Cleanliness Drive Under “Swachhata Hi Seva” Campaign',
    titleHi: 'स्वच्छता ही सेवा के तहत मासी व्यापार मंडल ने चलाया स्वस्थता अभियान',
    summaryEn: 'The Masi Traders Association organized a cleanliness drive under the Swachhata Hi Seva campaign in Masi Bazaar, Almora. The drive was conducted with the support of the District Panchayat Almora and involved participation from local traders and residents. The initiative aimed to promote cleanliness and hygiene in the market area and raise awareness about the importance of waste management.',
    summaryHi: 'मासी व्यापार मंडल ने स्वच्छता ही सेवा अभियान के तहत मासी बाजार, अल्मोड़ा में स्वच्छता अभियान चलाया। यह अभियान जिला पंचायत अल्मोड़ा के सहयोग से चलाया गया और इसमें स्थानीय व्यापारियों और निवासियों ने भाग लिया। इस पहल का उद्देश्य बाजार क्षेत्र में स्वच्छता और स्वच्छता को बढ़ावा देना और कचरा प्रबंधन के महत्व के बारे में जागरूकता बढ़ाना था।',
    link:'https://www.facebook.com/share/v/1FGZx4tChj/?mibextid=wwXIfr'
  },
  {
    id: 'notice-7',
    image: notice_7_image,
    titleEn: 'New System of Waste Management, New Path to Cleanliness',
    titleHi: 'कचरा प्रबंधन की क्या है नई व्यवस्था, स्वच्छता की नई राह',
    summaryEn: 'Under the new waste management system, people are being encouraged to dispose of waste in different coloured dustbins. This campaign aims to educate people about the importance of separating wet and dry waste and ensuring proper waste management',
    summaryHi: 'कचरा प्रबंधन की नई व्यवस्था के तहत, कचरे को अलग-अलग रंगों के कूड़ेदानों में फेंकने के लिए जागरूक किया जा रहा है। यह अभियान लोगों को गीले और सूखे कचरे को अलग करने के महत्व के बारे में शिक्षित करने और यह सुनिश्चित करने के लिए डिज़ाइन किया गया है कि कचरे को ठीक से प्रबंधित किया जाए।',
    link:'https://youtu.be/Ol8WONcr9Tw?si=n3rLeUwBqswtbFn3'
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
