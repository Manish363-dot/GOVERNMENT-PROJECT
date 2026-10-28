import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SEOConfig {
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  canonicalPath?: string;
  robots?: string;
}

const DOMAIN = 'https://zilapanchayatalmora.in';

// Helper to set or create <meta> tags
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Helper to set or create <link> tags (e.g. canonical)
function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

const SEO_MAP: Record<string, SEOConfig> = {
  // ── Public Main Pages ──
  '/': {
    titleHi: 'जिला पंचायत अल्मोड़ा',
    titleEn: 'Zila Panchayat Almora',
    descHi: 'कार्यालय जिला पंचायत अल्मोड़ा, उत्तराखण्ड शासन। पंचायती राज, 11 विकासखंड, ग्रामीण अवसंरचना, नागरिक सेवाएं एवं संपूर्ण जनपद विवरण।',
    descEn: 'Official Portal of Zila Panchayat Almora, Govt. of Uttarakhand. Panchayati Raj, 11 Development Blocks, rural infrastructure, citizen services, and administrative governance.',
    canonicalPath: '/',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  },
  '/safai': {
    titleHi: 'ठोस अपशिष्ट एवं स्वच्छता प्रबंधन पोर्टल | जिला पंचायत अल्मोड़ा',
    titleEn: 'Solid Waste & Sanitation Management Portal | Zila Panchayat Almora',
    descHi: 'कार्यालय जिला पंचायत अल्मोड़ा, उत्तराखण्ड शासन। लाइव जीपीएस कचरा वाहन ट्रैकिंग, ऑनलाइन नागरिक सफाई शिकायत निवारण एवं स्वच्छता प्रतिज्ञा पोर्टल।',
    descEn: 'Dedicated Solid Waste Management (SWM) portal of Zila Panchayat Almora. Real-time GPS fleet tracking and citizen grievance redressal.',
    canonicalPath: '/safai',
    robots: 'index, follow',
  },
  '/blocks': {
    titleHi: 'जनपद अल्मोड़ा के 11 विकासखंड एवं ग्राम पंचायतें | जिला पंचायत अल्मोड़ा',
    titleEn: '11 Development Blocks & Gram Panchayats of Almora | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के अंतर्गत कुल 11 विकासखंड (हवालबाग, ताकुला, ताड़ीखेत, द्वाराहाट, चौखुटिया, भिकियासैंण, सल्ट, स्यालदे, लमगड़ा, धौलादेवी, भैंसियाछाना) एवं 1160+ ग्राम पंचायतों का संपूर्ण विवरण।',
    descEn: 'Comprehensive directory of 11 development blocks and 1,160+ Gram Panchayats under District Panchayat Almora, Uttarakhand.',
    canonicalPath: '/blocks',
    robots: 'index, follow',
  },
  '/media': {
    titleHi: 'हमारा मीडिया एवं छायाचित्र गैलरी | जिला पंचायत अल्मोड़ा',
    titleEn: 'Our Media & Press Photo Gallery | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के विकास कार्यों, जन-जागरूकता अभियानों, स्वच्छता मिशन, प्राकृतिक धरोहर एवं प्रशासनिक गतिविधियों का सचित्र संग्रह।',
    descEn: 'Official photo and media gallery of Zila Panchayat Almora documenting rural sanitation, development milestones, and community initiatives.',
    canonicalPath: '/media',
    robots: 'index, follow',
  },
  '/gallery': {
    titleHi: 'हमारा मीडिया एवं छायाचित्र गैलरी | जिला पंचायत अल्मोड़ा',
    titleEn: 'Our Media & Press Photo Gallery | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के विकास कार्यों, जन-जागरूकता अभियानों, स्वच्छता मिशन, प्राकृतिक धरोहर एवं प्रशासनिक गतिविधियों का सचित्र संग्रह।',
    descEn: 'Official photo and media gallery of Zila Panchayat Almora documenting rural sanitation, development milestones, and community initiatives.',
    canonicalPath: '/media',
    robots: 'index, follow',
  },
  '/notices': {
    titleHi: 'शासकीय सूचनाएं, आदेश एवं स्वच्छता अपडेट | जिला पंचायत अल्मोड़ा',
    titleEn: 'Official Notices, Orders & Sanitation Updates | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा द्वारा जारी नवीनतम शासकीय आदेश, स्वच्छता निविदाएं, सार्वजनिक नोटिस एवं अपशिष्ट प्रबंधन नियम।',
    descEn: 'Latest official notices, sanitation tenders, government orders, and waste management circulars by Zila Panchayat Almora.',
    canonicalPath: '/notices',
    robots: 'index, follow',
  },
  '/notices-and-updates': {
    titleHi: 'शासकीय सूचनाएं, आदेश एवं स्वच्छता अपडेट | जिला पंचायत अल्मोड़ा',
    titleEn: 'Official Notices, Orders & Sanitation Updates | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा द्वारा जारी नवीनतम शासकीय आदेश, स्वच्छता निविदाएं, सार्वजनिक नोटिस एवं अपशिष्ट प्रबंधन नियम।',
    descEn: 'Latest official notices, sanitation tenders, government orders, and waste management circulars by Zila Panchayat Almora.',
    canonicalPath: '/notices',
    robots: 'index, follow',
  },
  '/pledge': {
    titleHi: 'स्वच्छता शपथ लें एवं ई-सर्टिफिकेट पाएं | जिला पंचायत अल्मोड़ा',
    titleEn: 'Take Swachhata Pledge & Download E-Certificate | Zila Panchayat Almora',
    descHi: 'स्वच्छता प्रतिज्ञा (Pledge) लें, अपना नाम दर्ज करें और तुरंत जिला पंचायत अल्मोड़ा का आधिकारिक डिजिटल ई-प्रमाणपत्र डाउनलोड करें।',
    descEn: 'Take the Clean Almora pledge and immediately download your verified digital Swachhata e-certificate.',
    canonicalPath: '/pledge',
    robots: 'index, follow',
  },
  '/swachhata-pledge': {
    titleHi: 'स्वच्छता शपथ लें एवं ई-सर्टिफिकेट पाएं | जिला पंचायत अल्मोड़ा',
    titleEn: 'Take Swachhata Pledge & Download E-Certificate | Zila Panchayat Almora',
    descHi: 'स्वच्छता प्रतिज्ञा (Pledge) लें, अपना नाम दर्ज करें और तुरंत जिला पंचायत अल्मोड़ा का आधिकारिक डिजिटल ई-प्रमाणपत्र डाउनलोड करें।',
    descEn: 'Take the Clean Almora pledge and immediately download your verified digital Swachhata e-certificate.',
    canonicalPath: '/pledge',
    robots: 'index, follow',
  },
  '/daily-work': {
    titleHi: 'दैनिक स्वच्छता कार्य एवं गतिविधियां (Daily Operations) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Daily Sanitation Operations & Activities | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा जनपद की ग्राम पंचायतों में प्रतिदिन चलाए जा रहे स्वच्छता अभियानों, कचरा उठान एवं दैनिक गतिविधियों का विवरण।',
    descEn: 'Daily sanitation drives, waste collection logs, and cleanliness field operations across Almora district.',
    canonicalPath: '/daily-work',
    robots: 'index, follow',
  },
  '/dailywork': {
    titleHi: 'दैनिक स्वच्छता कार्य एवं गतिविधियां (Daily Operations) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Daily Sanitation Operations & Activities | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा जनपद की ग्राम पंचायतों में प्रतिदिन चलाए जा रहे स्वच्छता अभियानों, कचरा उठान एवं दैनिक गतिविधियों का विवरण।',
    descEn: 'Daily sanitation drives, waste collection logs, and cleanliness field operations across Almora district.',
    canonicalPath: '/daily-work',
    robots: 'index, follow',
  },
  '/waste-protocol': {
    titleHi: 'कचरा स्रोत पृथक्करण प्रोटोकॉल (4-Dustbin Rule) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Waste Source Segregation Protocol (4-Dustbin Rule) | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट का वैज्ञानिक पृथक्करण: गीला कचरा (हरा डस्टबिन), सूखा कचरा (नीला), घरेलू हानिकारक कचरा (लाल/काला) - नियम व दिशानिर्देश।',
    descEn: 'Standard 4-bin waste segregation protocol and guidelines for households and commercial establishments in Almora.',
    canonicalPath: '/waste-protocol',
    robots: 'index, follow',
  },
  '/waste-segregation': {
    titleHi: 'कचरा स्रोत पृथक्करण प्रोटोकॉल (4-Dustbin Rule) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Waste Source Segregation Protocol (4-Dustbin Rule) | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट का वैज्ञानिक पृथक्करण: गीला कचरा (हरा डस्टबिन), सूखा कचरा (नीला), घरेलू हानिकारक कचरा (लाल/काला) - नियम व दिशानिर्देश।',
    descEn: 'Standard 4-bin waste segregation protocol and guidelines for households and commercial establishments in Almora.',
    canonicalPath: '/waste-protocol',
    robots: 'index, follow',
  },
  '/complaints': {
    titleHi: 'नागरिक शिकायत दर्ज करें एवं स्थिति जांचें | जिला पंचायत अल्मोड़ा',
    titleEn: 'Citizen Grievance Redressal & Status Tracking | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा जनपद के ग्रामीण व कस्बाई क्षेत्रों में सफाई, कचरा न उठने या वाहन न आने की ऑनलाइन शिकायत दर्ज करें एवं निवारण स्थिति ट्रैक करें।',
    descEn: 'File citizen complaints online for waste collection or sanitation issues and track redressal status in Almora district.',
    canonicalPath: '/complaints',
    robots: 'index, follow',
  },
  '/complaint': {
    titleHi: 'नागरिक शिकायत दर्ज करें एवं स्थिति जांचें | जिला पंचायत अल्मोड़ा',
    titleEn: 'Citizen Grievance Redressal & Status Tracking | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा जनपद के ग्रामीण व कस्बाई क्षेत्रों में सफाई, कचरा न उठने या वाहन न आने की ऑनलाइन शिकायत दर्ज करें एवं निवारण स्थिति ट्रैक करें।',
    descEn: 'File citizen complaints online for waste collection or sanitation issues and track redressal status in Almora district.',
    canonicalPath: '/complaints',
    robots: 'index, follow',
  },
  '/complaints/register': {
    titleHi: 'ऑनलाइन सफाई शिकायत दर्ज करें (Do Complaint) | जिला पंचायत अल्मोड़ा',
    titleEn: 'File Online Cleanliness Complaint (Do Complaint) | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा में कूड़ा न उठने, सफाईकर्मी न आने अथवा कचरा वाहन न पहुँचने की ऑनलाइन जन शिकायत तुरंत दर्ज करें।',
    descEn: 'Register sanitation, garbage collection, and waste vehicle grievances online in Almora district.',
    canonicalPath: '/complaints/register',
    robots: 'index, follow',
  },
  '/complaint/register': {
    titleHi: 'ऑनलाइन सफाई शिकायत दर्ज करें (Do Complaint) | जिला पंचायत अल्मोड़ा',
    titleEn: 'File Online Cleanliness Complaint (Do Complaint) | Zila Panchayat Almora',
    descHi: 'अल्मोड़ा में कूड़ा न उठने, सफाईकर्मी न आने अथवा कचरा वाहन न पहुँचने की ऑनलाइन जन शिकायत तुरंत दर्ज करें।',
    descEn: 'Register sanitation, garbage collection, and waste vehicle grievances online in Almora district.',
    canonicalPath: '/complaints/register',
    robots: 'index, follow',
  },
  '/complaints/track': {
    titleHi: 'शिकायत निवारण स्थिति ट्रैक करें (Track Complaint) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Track Grievance Redressal Status (Track Complaint) | Zila Panchayat Almora',
    descHi: 'शिकायत संख्या / ट्रैकिंग आईडी अथवा मोबाइल नंबर दर्ज कर अपनी सफाई शिकायत का लाइव निस्तारण स्टेटस जांचें।',
    descEn: 'Track real-time status and action history of your filed sanitation complaint using Tracking ID or Mobile number.',
    canonicalPath: '/complaints/track',
    robots: 'index, follow',
  },
  '/complaint/track': {
    titleHi: 'शिकायत निवारण स्थिति ट्रैक करें (Track Complaint) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Track Grievance Redressal Status (Track Complaint) | Zila Panchayat Almora',
    descHi: 'शिकायत संख्या / ट्रैकिंग आईडी अथवा मोबाइल नंबर दर्ज कर अपनी सफाई शिकायत का लाइव निस्तारण स्टेटस जांचें।',
    descEn: 'Track real-time status and action history of your filed sanitation complaint using Tracking ID or Mobile number.',
    canonicalPath: '/complaints/track',
    robots: 'index, follow',
  },
  '/staff-directory': {
    titleHi: 'अधिकारी एवं कर्मचारी निर्देशिका | जिला पंचायत अल्मोड़ा',
    titleEn: 'Official Staff & Officer Directory | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के प्रशासनिक अधिकारियों, अभियंताओं, स्वच्छता निरीक्षकों एवं कर्मचारियों के संपर्क सूत्र व पदनाम।',
    descEn: 'Official directory of administrative officers, engineers, and sanitation staff at Zila Panchayat Almora.',
    canonicalPath: '/staff-directory',
    robots: 'index, follow',
  },
  '/staff-info': {
    titleHi: 'अधिकारी एवं कर्मचारी निर्देशिका | जिला पंचायत अल्मोड़ा',
    titleEn: 'Official Staff & Officer Directory | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के प्रशासनिक अधिकारियों, अभियंताओं, स्वच्छता निरीक्षकों एवं कर्मचारियों के संपर्क सूत्र व पदनाम।',
    descEn: 'Official directory of administrative officers, engineers, and sanitation staff at Zila Panchayat Almora.',
    canonicalPath: '/staff-directory',
    robots: 'index, follow',
  },
  '/contact': {
    titleHi: 'संपर्क सूत्र एवं आधिकारिक हेल्पलाइन | जिला पंचायत अल्मोड़ा',
    titleEn: 'Contact Us & Official Helplines | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा कार्यालय का पता, फोन नंबर, ईमेल एवं आपातकालीन स्वच्छता नियंत्रण कक्ष हेल्पलाइन।',
    descEn: 'Contact details, official address, telephone numbers, and citizen helpdesk for Zila Panchayat Almora.',
    canonicalPath: '/contact',
    robots: 'index, follow',
  },
  '/our-initiative': {
    titleHi: 'हमारी पहल एवं स्वच्छता अभियान | जिला पंचायत अल्मोड़ा',
    titleEn: 'Our Initiatives & Sanitation Drives | Zila Panchayat Almora',
    descHi: 'देवभूमि अल्मोड़ा के पर्वतीय क्षेत्रों, पर्यटन स्थलों एवं ग्राम पंचायतों में ठोस अपशिष्ट प्रबंधन एवं प्लास्टिक मुक्ति अभियान।',
    descEn: 'Key sanitation drives, eco-tourism cleanliness, and waste management initiatives by Zila Panchayat Almora.',
    canonicalPath: '/our-initiative',
    robots: 'index, follow',
  },
  '/initiative': {
    titleHi: 'हमारी पहल एवं स्वच्छता अभियान | जिला पंचायत अल्मोड़ा',
    titleEn: 'Our Initiatives & Sanitation Drives | Zila Panchayat Almora',
    descHi: 'देवभूमि अल्मोड़ा के पर्वतीय क्षेत्रों, पर्यटन स्थलों एवं ग्राम पंचायतों में ठोस अपशिष्ट प्रबंधन एवं प्लास्टिक मुक्ति अभियान।',
    descEn: 'Key sanitation drives, eco-tourism cleanliness, and waste management initiatives by Zila Panchayat Almora.',
    canonicalPath: '/our-initiative',
    robots: 'index, follow',
  },
  '/vision-mission': {
    titleHi: 'उद्देश्य एवं विजन | जिला पंचायत अल्मोड़ा',
    titleEn: 'Vision & Mission | Zila Panchayat Almora',
    descHi: 'स्वच्छ, हरित एवं आत्मनिर्भर अल्मोड़ा के निर्माण हेतु जिला पंचायत का संकल्प, उद्देश्य एवं कार्ययोजना।',
    descEn: 'Vision and mission of Zila Panchayat Almora for sustainable waste management and clean environment.',
    canonicalPath: '/vision-mission',
    robots: 'index, follow',
  },
  '/cleanliness-bylaws': {
    titleHi: 'सफाई एवं स्वच्छता उपनियम (By-laws) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Cleanliness By-laws & Regulations | Zila Panchayat Almora',
    descHi: 'उत्तराखंड पंचायती राज अधिनियम के अंतर्गत जिला पंचायत अल्मोड़ा के अधिकृत सफाई उपनियम, शुल्क व नागरिक दिशा-निर्देश।',
    descEn: 'Official cleanliness by-laws, regulations, and public notices under Uttarakhand Panchayati Raj Act.',
    canonicalPath: '/cleanliness-bylaws',
    robots: 'index, follow',
  },
  '/bylaws': {
    titleHi: 'सफाई एवं स्वच्छता उपनियम (By-laws) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Cleanliness By-laws & Regulations | Zila Panchayat Almora',
    descHi: 'उत्तराखंड पंचायती राज अधिनियम के अंतर्गत जिला पंचायत अल्मोड़ा के अधिकृत सफाई उपनियम, शुल्क व नागरिक दिशा-निर्देश।',
    descEn: 'Official cleanliness by-laws, regulations, and public notices under Uttarakhand Panchayati Raj Act.',
    canonicalPath: '/cleanliness-bylaws',
    robots: 'index, follow',
  },
  '/bylaws/cleanliness': {
    titleHi: 'सफाई एवं स्वच्छता उपनियम (By-laws) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Cleanliness By-laws & Regulations | Zila Panchayat Almora',
    descHi: 'उत्तराखंड पंचायती राज अधिनियम के अंतर्गत जिला पंचायत अल्मोड़ा के अधिकृत सफाई उपनियम, शुल्क व नागरिक दिशा-निर्देश।',
    descEn: 'Official cleanliness by-laws, regulations, and public notices under Uttarakhand Panchayati Raj Act.',
    canonicalPath: '/cleanliness-bylaws',
    robots: 'index, follow',
  },
  '/swm-rules-2026': {
    titleHi: 'ठोस अपशिष्ट प्रबंधन नियम | जिला पंचायत अल्मोड़ा',
    titleEn: 'Solid Waste Management Rules | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट पृथक्करण (गीला, सूखा, हानिकारक कचरा), नियम व दंड प्रावधान - जिला पंचायत अल्मोड़ा।',
    descEn: 'Solid waste management rules, waste segregation guidelines, and penal provisions in Almora.',
    canonicalPath: '/swm-rules-2026',
    robots: 'index, follow',
  },
  '/rules': {
    titleHi: 'ठोस अपशिष्ट प्रबंधन नियम | जिला पंचायत अल्मोड़ा',
    titleEn: 'Solid Waste Management Rules | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट पृथक्करण (गीला, सूखा, हानिकारक कचरा), नियम व दंड प्रावधान - जिला पंचायत अल्मोड़ा।',
    descEn: 'Solid waste management rules, waste segregation guidelines, and penal provisions in Almora.',
    canonicalPath: '/swm-rules-2026',
    robots: 'index, follow',
  },
  '/bylaws/swm-rules-2026': {
    titleHi: 'ठोस अपशिष्ट प्रबंधन नियम | जिला पंचायत अल्मोड़ा',
    titleEn: 'Solid Waste Management Rules | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट पृथक्करण (गीला, सूखा, हानिकारक कचरा), नियम व दंड प्रावधान - जिला पंचायत अल्मोड़ा।',
    descEn: 'Solid waste management rules, waste segregation guidelines, and penal provisions in Almora.',
    canonicalPath: '/swm-rules-2026',
    robots: 'index, follow',
  },
  '/bylaws/rules-2026': {
    titleHi: 'ठोस अपशिष्ट प्रबंधन नियम | जिला पंचायत अल्मोड़ा',
    titleEn: 'Solid Waste Management Rules | Zila Panchayat Almora',
    descHi: 'ठोस अपशिष्ट पृथक्करण (गीला, सूखा, हानिकारक कचरा), नियम व दंड प्रावधान - जिला पंचायत अल्मोड़ा।',
    descEn: 'Solid waste management rules, waste segregation guidelines, and penal provisions in Almora.',
    canonicalPath: '/swm-rules-2026',
    robots: 'index, follow',
  },
  '/about-website': {
    titleHi: 'वेबसाइट के बारे में | जिला पंचायत अल्मोड़ा',
    titleEn: 'About Website | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के आधिकारिक डिजिटल स्वच्छता एवं वाहन ट्रैकिंग पोर्टल की संरचना एवं विवरण।',
    descEn: 'About the official digital sanitation and GPS tracking portal of Zila Panchayat Almora.',
    canonicalPath: '/about-website',
    robots: 'index, follow',
  },
  '/website-policy': {
    titleHi: 'वेबसाइट नीतियां एवं गोपनीयता | जिला पंचायत अल्मोड़ा',
    titleEn: 'Website Policies & Privacy | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा पोर्टल की डेटा सुरक्षा, गोपनीयता एवं नियम व शर्तें।',
    descEn: 'Privacy policy, copyright, and hyperlinking policy of Zila Panchayat Almora portal.',
    canonicalPath: '/website-policy',
    robots: 'index, follow',
  },
  '/terms-of-use': {
    titleHi: 'उपयोग की शर्तें | जिला पंचायत अल्मोड़ा',
    titleEn: 'Terms of Use | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा के ऑनलाइन नागरिक पोर्टल के उपयोग की कानूनी व विधिक शर्तें।',
    descEn: 'Terms and conditions for utilizing citizen services on the Zila Panchayat Almora portal.',
    canonicalPath: '/terms-of-use',
    robots: 'index, follow',
  },
  '/sitemap': {
    titleHi: 'साइटमैप (पोर्टल नेविगेशन) | जिला पंचायत अल्मोड़ा',
    titleEn: 'Sitemap | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा पोर्टल के सभी पृष्ठों और सेवाओं की संपूर्ण सूची।',
    descEn: 'Complete sitemap and navigation index of Zila Panchayat Almora portal.',
    canonicalPath: '/sitemap',
    robots: 'index, follow',
  },

  // ── Authentication Pages (Noindex) ──
  '/signin': {
    titleHi: 'विभागीय लॉगिन | जिला पंचायत अल्मोड़ा',
    titleEn: 'Departmental Sign In | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा स्वच्छता पोर्टल - अधिकृत अधिकारियों व चालकों हेतु सुरक्षित लॉगिन।',
    descEn: 'Authorized administrative and driver sign-in portal for Zila Panchayat Almora.',
    canonicalPath: '/signin',
    robots: 'noindex, nofollow',
  },
  '/signup': {
    titleHi: 'विभागीय पंजीकरण | जिला पंचायत अल्मोड़ा',
    titleEn: 'Official Registration | Zila Panchayat Almora',
    descHi: 'अधिकृत प्रशासनिक कर्मियों एवं वाहन चालकों का विभागीय पंजीकरण पोर्टल।',
    descEn: 'Official registration portal for authorized personnel and drivers.',
    canonicalPath: '/signup',
    robots: 'noindex, nofollow',
  },
  '/forgot-password': {
    titleHi: 'पासवर्ड पुनर्प्राप्ति | जिला पंचायत अल्मोड़ा',
    titleEn: 'Forgot Password | Zila Panchayat Almora',
    descHi: 'विभागीय खाता पासवर्ड पुनर्प्राप्ति एवं ओटीपी सत्यापन।',
    descEn: 'Account recovery and OTP verification for departmental accounts.',
    canonicalPath: '/forgot-password',
    robots: 'noindex, nofollow',
  },

  // ── Administrative Dashboard Pages (Protected & Noindex) ──
  '/dashboard': {
    titleHi: 'प्रशासनिक नियंत्रण कक्ष | जिला पंचायत अल्मोड़ा',
    titleEn: 'Admin Control Panel Dashboard | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा - वाहन ट्रैकिंग, रूट मॉनिटरिंग एवं नागरिक शिकायत निवारण नियंत्रण कक्ष।',
    descEn: 'Central administrative dashboard for tracking sanitation fleet and managing citizen grievances.',
    canonicalPath: '/dashboard',
    robots: 'noindex, nofollow',
  },
  '/dashboard/tracking': {
    titleHi: 'लाइव जीपीएस वाहन ट्रैकिंग | जिला पंचायत अल्मोड़ा',
    titleEn: 'Live GPS Vehicle Tracking | Zila Panchayat Almora',
    descHi: 'कचरा एकत्रीकरण वाहनों की वास्तविक समय (रियल-टाइम) जीपीएस लोकेशन ट्रैकिंग।',
    descEn: 'Real-time GPS tracking for waste collection and sanitation vehicles.',
    canonicalPath: '/dashboard/tracking',
    robots: 'noindex, nofollow',
  },
  '/dashboard/history': {
    titleHi: 'वाहन मार्ग इतिहास | जिला पंचायत अल्मोड़ा',
    titleEn: 'Vehicle Route History | Zila Panchayat Almora',
    descHi: 'सफाई वाहनों का दैनिक मार्ग इतिहास, तय की गई दूरी एवं ठहराव रिपोर्ट।',
    descEn: 'Daily route history, distance travelled, and stoppage analytics for sanitation vehicles.',
    canonicalPath: '/dashboard/history',
    robots: 'noindex, nofollow',
  },
  '/dashboard/route-replay': {
    titleHi: 'वाहन रूट इतिहास व रीप्ले | जिला पंचायत अल्मोड़ा',
    titleEn: 'Vehicle Route History & Replay | Zila Panchayat Almora',
    descHi: 'सफाई वाहनों के ऐतिहासिक रूट का समयबद्ध एनीमेशन रीप्ले व ऑडिट विश्लेषण।',
    descEn: 'Interactive animated playback and audit of past sanitation vehicle routes.',
    canonicalPath: '/dashboard/history',
    robots: 'noindex, nofollow',
  },
  '/dashboard/complaints': {
    titleHi: 'शिकायत निवारण प्रबंधन | जिला पंचायत अल्मोड़ा',
    titleEn: 'Grievance Redressal Management | Zila Panchayat Almora',
    descHi: 'नागरिकों द्वारा दर्ज की गई स्वच्छता एवं कचरा शिकायतों का निस्तारण व निगरानी।',
    descEn: 'Manage, assign, and resolve citizen cleanliness and garbage complaints.',
    canonicalPath: '/dashboard/complaints',
    robots: 'noindex, nofollow',
  },
  '/dashboard/vehicles': {
    titleHi: 'सफाई वाहन प्रबंधन | जिला पंचायत अल्मोड़ा',
    titleEn: 'Fleet Management | Zila Panchayat Almora',
    descHi: 'कचरा ढोने वाले वाहनों, ड्राइवरों एवं जीपीएस उपकरणों का संपूर्ण प्रबंधन।',
    descEn: 'Manage waste collection vehicles, drivers, and GPS tracking hardware.',
    canonicalPath: '/dashboard/vehicles',
    robots: 'noindex, nofollow',
  },
  '/dashboard/media': {
    titleHi: 'मीडिया एवं दैनिक कार्य | जिला पंचायत अल्मोड़ा',
    titleEn: 'Media & Daily Work | Zila Panchayat Almora',
    descHi: 'जिला पंचायत अल्मोड़ा की दैनिक कार्य रिपोर्ट, चित्र संग्रह एवं प्रेस मीडिया।',
    descEn: 'Daily work reports, photo archives, and public media updates.',
    canonicalPath: '/dashboard/media',
    robots: 'noindex, nofollow',
  },

  // ── Standalone Status / Error Pages (Noindex) ──
  '/500': {
    titleHi: 'आंतरिक सर्वर त्रुटि (500) | जिला पंचायत अल्मोड़ा',
    titleEn: '500 Server Error | Zila Panchayat Almora',
    descHi: 'तकनीकी समस्या के कारण सर्वर अनुरोध पूरा नहीं कर सका। कृपया कुछ समय पश्चात पुनः प्रयास करें।',
    descEn: 'The server encountered an internal error. Please try again shortly.',
    canonicalPath: '/500',
    robots: 'noindex, nofollow',
  },
  '/error': {
    titleHi: 'आंतरिक सर्वर त्रुटि (500) | जिला पंचायत अल्मोड़ा',
    titleEn: '500 Server Error | Zila Panchayat Almora',
    descHi: 'तकनीकी समस्या के कारण सर्वर अनुरोध पूरा नहीं कर सका। कृपया कुछ समय पश्चात पुनः प्रयास करें।',
    descEn: 'The server encountered an internal error. Please try again shortly.',
    canonicalPath: '/500',
    robots: 'noindex, nofollow',
  },
  '/maintenance': {
    titleHi: 'रखरखाव कार्य प्रगति पर है | जिला पंचायत अल्मोड़ा',
    titleEn: 'System Under Maintenance | Zila Panchayat Almora',
    descHi: 'पोर्टल पर नियमित तकनीकी रखरखाव कार्य चल रहा है। सेवा शीघ्र उपलब्ध होगी।',
    descEn: 'The system is undergoing scheduled maintenance. Services will resume shortly.',
    canonicalPath: '/maintenance',
    robots: 'noindex, nofollow',
  },
  '/under-maintenance': {
    titleHi: 'रखरखाव कार्य प्रगति पर है | जिला पंचायत अल्मोड़ा',
    titleEn: 'System Under Maintenance | Zila Panchayat Almora',
    descHi: 'पोर्टल पर नियमित तकनीकी रखरखाव कार्य चल रहा है। सेवा शीघ्र उपलब्ध होगी।',
    descEn: 'The system is undergoing scheduled maintenance. Services will resume shortly.',
    canonicalPath: '/maintenance',
    robots: 'noindex, nofollow',
  },
};

export function RouteSEO() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    // Check if the current route is recognized in our SEO map
    const knownConfig = SEO_MAP[pathname];

    let title: string;
    let description: string;
    let canonicalPath: string;
    let robots: string;

    if (knownConfig) {
      title = isHi ? knownConfig.titleHi : knownConfig.titleEn;
      description = isHi ? knownConfig.descHi : knownConfig.descEn;
      canonicalPath = knownConfig.canonicalPath || pathname;
      robots = knownConfig.robots || (
        pathname.startsWith('/dashboard') || pathname.startsWith('/signin') || pathname.startsWith('/signup')
          ? 'noindex, nofollow'
          : 'index, follow'
      );
    } else {
      // ── Custom 404 Not Found SEO Handling ──
      // Do NOT fallback to homepage! Tell search engines and users this is a 404 page.
      title = isHi 
        ? 'पृष्ठ नहीं मिला (404 - Page Not Found) | जिला पंचायत अल्मोड़ा' 
        : '404 - Page Not Found | Zila Panchayat Almora';
      description = isHi
        ? 'क्षमा करें, आपके द्वारा खोजा गया पृष्ठ उपलब्ध नहीं है अथवा हटा दिया गया है। कृपया जिला पंचायत अल्मोड़ा के मुख्य पृष्ठ पर जाएं।'
        : 'Sorry, the page you are looking for does not exist or has been moved. Please navigate to Zila Panchayat Almora home page.';
      canonicalPath = pathname;
      robots = 'noindex, nofollow'; // Critical: tells Google NOT to index broken/404 URLs!
    }

    const canonicalUrl = `${DOMAIN}${canonicalPath}`;

    // 1. Update Document Title
    document.title = title;

    // 2. Set or Create Meta Description & Robots
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', robots);

    // 3. Set or Create Open Graph (Facebook / WhatsApp) Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', isHi ? 'जिला पंचायत अल्मोड़ा' : 'Zila Panchayat Almora');
    setMetaTag('property', 'og:image', `${DOMAIN}/assets/logos/logo1.png`);
    setMetaTag('property', 'og:locale', isHi ? 'hi_IN' : 'en_IN');

    // 4. Set or Create Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', `${DOMAIN}/assets/logos/logo1.png`);

    // 5. Set or Create Canonical Link
    setLinkTag('canonical', canonicalUrl);
  }, [pathname, isHi]);

  return null;
}
