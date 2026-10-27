

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

 export const NOTICES_DATA: Notice[] = [
  {
  id: 'notice-1',

    image: '/assets/notice 1.webp',
  date: '10 Feb 2026',
  titleEn:'Action Ordered Against Littering to Protect Kosi and Ramganga Rivers',
  titleHi:'कोसी और रामगंगा नदियों की सुरक्षा के लिए कूड़ा फैलाने वालों पर कार्रवाई के निर्देश',
summaryEn:'Almora District Magistrate Anshul Singh ordered notices for people littering in public places and challans for repeated violations. The district administration also reviewed riverbank cleaning, solid-waste disposal, sewerage improvement, and public awareness measures.',
summaryHi:'अल्मोड़ा जिलाधिकारी अंशुल सिंह ने सार्वजनिक स्थानों पर कूड़ा फेंकने वालों को पहले नोटिस और नियमों का उल्लंघन जारी रखने पर चालान करने के निर्देश दिए। बैठक में नदी तटों की सफाई, ठोस कचरा निस्तारण, सीवरेज व्यवस्था और जन-जागरूकता पर भी चर्चा हुई।',
fullTextEn:'During a meeting of the District Ganga Safety Committee, Almora District Magistrate Anshul Singh directed the District Panchayati Raj Department to issue notices to people who dump waste in public places and take challan action if violations continue. Instructions were also issued to keep the Kosi and Ramganga riverbanks clean, improve solid-waste disposal and sewerage systems, conduct awareness campaigns in all wards, and monitor the floodplain zones of both rivers.',
fullTextHi:'जिला गंगा सुरक्षा समिति की बैठक में अल्मोड़ा जिलाधिकारी अंशुल सिंह ने जिला पंचायत राज विभाग को सार्वजनिक स्थानों पर कूड़ा फेंकने वालों को नोटिस जारी करने और नियमों का उल्लंघन जारी रखने पर चालान की कार्रवाई करने के निर्देश दिए। कोसी और रामगंगा नदियों के तटीय क्षेत्रों की सफाई, ठोस कचरा निस्तारण, सीवरेज व्यवस्था को मजबूत करने, सभी वार्डों में जागरूकता अभियान चलाने और दोनों नदियों के फ्लड प्लेन जोन की निगरानी के निर्देश भी दिए गए।',
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

  fullTextEn:
    'Zila Panchayat Almora organized the Ashirwad Ka Diya programme at Jageshwar in September 2026 under the Seva Sankalp Abhiyan. The programme was held on the occasion of Prime Minister Narendra Modi’s birthday and the completion of 25 years of his public service. Lighting diyas represented hope, positivity, light, and the removal of darkness. The initiative expressed wishes for his good health, long life, and continued dedication to national service.',

  fullTextHi:
    'जिला पंचायत अल्मोड़ा द्वारा सितंबर 2026 में सेवा संकल्प अभियान के तहत जागेश्वर में आशीर्वाद का दीया कार्यक्रम आयोजित किया गया। यह कार्यक्रम प्रधानमंत्री नरेंद्र मोदी के जन्मदिवस और सार्वजनिक जीवन में 25 वर्षों की सेवा पूर्ण होने के अवसर पर आयोजित हुआ। कार्यक्रम में जलाया गया दीया आशा, सकारात्मकता, प्रकाश और अंधकार को दूर करने का प्रतीक रहा। इस पहल के माध्यम से प्रधानमंत्री के उत्तम स्वास्थ्य, दीर्घायु और राष्ट्रसेवा के प्रति उनके समर्पण के लिए शुभकामनाएं व्यक्त की गईं।',
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

// social media section
