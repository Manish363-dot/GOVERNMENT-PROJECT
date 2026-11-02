
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

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL;

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
  date?: string;
  placeEn?: string;
  placeHi?: string;    
  departmentEn?: string;  
  departmentHi?: string;  
  descriptionEn?: string; 
  descriptionHi?: string; 
  timeEn?: string;
  timeHi?: string;             
}

export const LATEST_UPDATES_DATA: NotificationUpdateItem[] = [
  {
    id: 'update-1',
    titleEn: 'A special Cleanliness Fortnight Programme is being organized in Almora district to promote cleanliness and environmental conservation. The main objective of this programme is to raise public awareness about cleanliness and ensure that public places remain clean and well-maintained.',
    titleHi: 'अल्मोड़ा जिले में स्वच्छता और पर्यावरण संरक्षण को बढ़ावा देने के लिए एक विशेष स्वच्छता पखवाड़ा कार्यक्रम का आयोजन किया जा रहा है। इस कार्यक्रम का मुख्य उद्देश्य आम जनता को स्वच्छता के प्रति जागरूक करना और सार्वजनिक स्थलों को साफ-सुथरा बनाना है',
    date: '3 Nov 2026',
    placeEn: 'From Kosi Mahadev Temple to Kosi Market, Almora.',
    placeHi: 'कोसी महादेव मंदिर से कोसी मार्केट, अल्मोड़ा तक',
    departmentEn:'District Ganga Protection Committee, Almora & Zila Panchayat, Almora.',
    departmentHi:'जिला गंगा सुरक्षा समिति अल्मोड़ा एवं जिला पंचायत अल्मोड़ा',
    descriptionEn: 'Major Activities and Objectives – Cleanliness Drive: <br />Waste collection and cleaning activities will be carried out from the premises of Kosi Mahadev Temple to the Kosi Market area. Local shopkeepers, residents, and tourists will be encouraged not to litter and to stop using single-use plastics.<br/>Officials and members of the Zila Panchayat and DGC, along with local volunteers, will actively contribute to this campaign. We request all residents of the area to extend their support for this noble cause and participate in the programme to make it a success. <strong>"Clean Almora, Beautiful Almora"</strong>',
    descriptionHi: 'प्रमुख गतिविधियां और उद्देश्य - सफाई अभियान: <br />कोसी महादेव मंदिर परिसर से लेकर कोसी बाजार क्षेत्र तक कचरा संग्रहण और साफ-सफाई की जाएगी। स्थानीय दुकानदारों, निवासियों और पर्यटकों को कूड़ा न फैलाने तथा सिंगल-यूज प्लास्टिक का उपयोग बंद करने के लिए प्रेरित किया जाएगा।<br/>जिला पंचायत और डीजीसी के पदाधिकारियों, सदस्यों और स्थानीय स्वयंसेवकों द्वारा इस अभियान में सक्रिय योगदान दिया जाएगा। आप सभी क्षेत्रवासियों से अनुरोध है कि इस पुनीत कार्य में अपना सहयोग दें और कार्यक्रम में शामिल होकर इसे सफल बनाएं। <strong> "स्वच्छ अल्मोड़ा, सुंदर अल्मोड़ा"</strong>',
    timeEn : 'From 11:00 AM to 01:00 PM.',
    timeHi : 'सुबह 11:00 बजे से दोपहर 01:00 बजे तक',
  },
  {
    id: 'update-2',
    titleEn: 'Ashirwad Ka Diya Programme Organized at Jageshwar by Zila Panchayat Almora',
    titleHi: 'जिला पंचायत अल्मोड़ा द्वारा जागेश्वर में आशीर्वाद का दीया कार्यक्रम आयोजित',
    date: '17 Sep 2026',
    placeEn: 'Jageshwar Dham',
    placeHi: 'जागेश्वर धाम',
  }
];
