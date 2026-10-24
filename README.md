# 🏛️ जिला पंचायत अल्मोड़ा — एकीकृत डिजिटल ई-गवर्नेंस एवं स्मार्ट नागरिक सेवा पोर्टल
# Zila Panchayat Almora — Unified Digital Governance & Smart Citizen Services Platform

> **आधिकारिक शासकीय वेब पोर्टल (Official Government Web Portal)**  
> **पंचायती राज विभाग • उत्तराखण्ड शासन (Department of Panchayati Raj, Govt. of Uttarakhand)**  
> Built under **Swachh Bharat Mission 2.0 (Rural)** & **Digital India Initiative** 🇮🇳

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-v6.19-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-010101?logo=socketdotio&logoColor=white)](https://socket.io/)

---

## 📋 अवलोकन (Project Overview)

**जिला पंचायत अल्मोड़ा एकीकृत वेब पोर्टल (Zila Panchayat Almora Unified Portal)** एक आधुनिक, सुरक्षित और स्केलेबल **Modular Monolith (Vertical Slice)** ई-गवर्नेंस प्लेटफॉर्म है। यह पोर्टल अल्मोड़ा जनपद के नागरिकों, व्यापारियों, पर्यटकों और प्रशासनिक अधिकारियों को एक ही एकीकृत डिजिटल छत के नीचे पारदर्शी एवं त्वरित सेवाएं प्रदान करता है।

पोर्टल चार प्रमुख डिजिटल स्तंभों (Architectural Pillars) पर आधारित है:

1. **🏛️ मुख्य नागरिक पोर्टल (Citizen Landing Portal - `landing-page/`):**
   - अल्मोड़ा के 11 विकासखंडों (Blocks) की संपूर्ण भौगोलिक, प्रशासनिक एवं जनसांख्यिकीय डायरेक्टरी।
   - विज़न एवं मिशन, चालू विकास योजनाएं, ई-निविदाएं (e-Tenders), सार्वजनिक विज्ञप्तियां एवं सूचनाएं।
   - आधिकारिक सोशल मीडिया जुड़ाव (निराश्रित गोवंश संरक्षण, गौशाला निर्माण, ग्रामीण विकास के लाइव वीडियो)।
   - अधिकारी/कर्मचारी संपर्क डायरेक्टरी एवं नागरिक पूछताछ सहायता डेस्क।

2. **🟢 ठोस अपशिष्ट एवं सफाई प्रबंधन (SWM & Fleet GPS Telematics - `swm/`):**
   - **MilliTrack IoT Integration:** सफाई वाहनों की प्रत्येक 4 सेकंड में ऑटोमेटेड लाइव जीपीएस ट्रैकिंग एवं रूट रीप्ले।
   - **नागरिक शिकायत निवारण (Grievance Redressal):** जियो-टैग्ड फोटो अपलोड (AWS S3) के साथ त्वरित ऑनलाइन शिकायत पंजीकरण एवं ट्रैकिंग।
   - **डिजिटल स्वच्छता शपथ (Swachhata Pledge):** नागरिक ई-शपथ ग्रहण एवं तुरंत शासकीय डिजिटल प्रमाण-पत्र डाउनलोड।
   - **सफाई उपविधियां एवं SWM रूल्स 2026:** ठोस कचरा पृथक्करण, यूजर चार्जेस और उल्लंघन पर आधिकारिक अर्थदंड नियमावली।
   - **एडमिन टेलीमेटिक्स डैशबोर्ड:** फ्लीट स्वास्थ्य, लाइव मैप, वाहन इतिहास, रूट रीप्ले एवं शिकायत निस्तारण।

3. **🔵 व्यावसायिक दुकान एवं परिसंपत्ति किराया प्रणाली (Commercial Rental Platform - `rental/`):**
   - जिला पंचायत स्वामित्व वाली 240+ दुकानों, परिसरों व डाक बंगलों का डिजिटल रजिस्टर (धारानौला, मॉल रोड, चौघानपाटा आदि)।
   - **नागरिक Quick Pay (बकाया खोज):** दुकान नंबर या आवंटी के नाम द्वारा लंबित किराया चालान की त्वरित खोज।
   - **ई-नीलामी व लीज अनुबंध सूचनाएं:** रिक्त संपत्तियों के पारदर्शी ई-आवंटन एवं विज्ञप्ति सूचनाएं।
   - किरायेदार सुझाव, शिकायत दर्ज करने की सुविधा एवं सुरक्षित एडमिन लॉगिन।

4. **💳 सरकारी ई-चालान एवं पेमेंट्स (Payments Module - `payments/`):**
   - दुकान किराया, लाइसेंस शुल्क एवं सफाई यूजर चार्जेस के लिए मानकीकृत ई-चालान जनरेशन।
   - ट्रेजरी / SBI ePay / Razorpay एकीकरण हेतु मानकीकृत सत्यापन, रसीद सृजन एवं वेबहुक सुरक्षा।

---

## 🏛️ वास्तुकला सिद्धांत (Architecture & Design Philosophy)

### 1. सिंगल सर्वर आर्किटेक्चर (Modular Monolith)
- **एक ही बैकएंड सर्वर प्रोसेस (`backend`):** पोर्ट `3001` पर चलता है। कोई जटिल मल्टी-कंटेनर ऑर्केस्ट्रेशन या एकाधिक `package.json` का झंझट नहीं।
- **डोमेन सेपरेशन (Domain Isolation):** `src/modules/` के अंतर्गत प्रत्येक डोमेन (`swm`, `rental`, `payments`) अपने स्वयं के कंट्रोलर, सर्विस, राउट्स और वैलिडेशन स्कीमा रखता है।
- **शेयर्ड कोर (`src/shared/`):** प्रमाणीकरण (`auth`), कॉन्फ़िगरेशन (`config`), संपर्क (`contact`), सुरक्षा मिडलवेयर (`middleware`), नोटिफिकेशन (`notifications`), और यूटिलिटीज (`utils`) सभी डोमेन द्वारा साझा किए जाते हैं।
- **पिछली संगतता (Backward Compatibility):** मौजूदा फ्रंटएंड और बाहरी डिवाइस बिना किसी व्यवधान के कार्य कर सकें, इसके लिए लीगेसी राउट्स (`/api/vehicles`, `/api/tracking`, `/api/complaints`, `/api/pledge` आदि) सुरक्षित रूप से क्रियाशील हैं।

### 2. उच्च-प्रदर्शन फ्रंटएंड (Vite + React SPA)
- **एक ही एकीकृत फ्रंटएंड (`frontend`):** Vite 5.4 और React 18.3 पर निर्मित।
- **कोड स्प्लिटिंग एवं लेज़ी लोडिंग (`React.lazy` + `Suspense`):** प्रत्येक पेज का जावास्क्रिप्ट बंडल तभी लोड होता है जब यूजर उस पेज पर जाता है, जिससे प्रारंभिक लोड समय न्यूनतम रहता है।
- **सख्त द्विभाषी लोकलाइजेशन (i18next):** संपूर्ण पोर्टल हिंदी और अंग्रेजी दोनों भाषाओं में 100% सुलभ है।
- **उत्तराखंड शासन आधिकारिक डिज़ाइन टोकन्स:** नेवी ब्लू (`#0b1b36`), देवभूमि केसरिया (`#c2410c`), और हिमालयी हरा (`#15803d`) का सामंजस्यपूर्ण उपयोग।

---

## 📂 विस्तृत प्रोजेक्ट संरचना (Project Directory Structure)

```tree
zila-panchayat-almora/
│
├── frontend/                                   # 🌐 एकीकृत फ्रंटएंड (Vite + React + Tailwind)
│   ├── public/                                 # लोगो, बैनर, शासकीय सील, बैकग्राउंड्स
│   │   ├── favicon.ico
│   │   ├── rental-hero-bg.jpg                  # रेंटल पोर्टल का आधिकारिक बैकग्राउंड
│   │   ├── uk-gov-logo.png
│   │   └── zila-panchayat-logo.png
│   │
│   ├── src/
│   │   ├── App.tsx                             # 🚦 मास्टर रूटिंग गेटवे (Lazy Loading + SEO)
│   │   ├── main.tsx                            # रिएक्ट 18 रूट इनिशियलाइज़ेशन
│   │   ├── index.css                           # डिज़ाइन टोकन्स, फॉन्ट्स, एवं शासकीय यूटिलिटीज
│   │   │
│   │   ├── landing-page/                       # 🏛️ 1. मुख्य नागरिक लैंडिंग पोर्टल
│   │   │   ├── MainLandingPage.tsx             # मुख्य होमपेज
│   │   │   ├── NavbarLandingPage.tsx           # 3-टियर शासकीय नैविगेशन बार
│   │   │   ├── HeroSection.tsx                 # अल्मोड़ा सांस्कृतिक व प्रशासनिक हीरो बैनर
│   │   │   ├── ZilaServicesHubSection.tsx      # दोनों प्रमुख सेवाओं (SWM व Rental) का प्रवेश द्वार
│   │   │   ├── AlmoraBlocksSection.tsx         # 11 विकासखंडों की संपूर्ण डायरेक्टरी
│   │   │   ├── NoticesSection.tsx              # सार्वजनिक सूचनाएं एवं ई-निविदाएं
│   │   │   ├── SocialMediaSection.tsx          # आधिकारिक फेसबुक वीडियो व गतिविधियां
│   │   │   ├── ZilaPanchayatAboutSection.tsx   # जिला पंचायत इतिहास एवं कार्यप्रणाली
│   │   │   ├── ZilaServicesCarousel.tsx        # सेवाओं का ऑटो-स्क्रॉलिंग कैरोसेल
│   │   │   ├── BlogGalleryModal.tsx            # मीडिया एवं विकास कार्य गैलरी मोडल
│   │   │   ├── VisionMissionPage.tsx           # विज़न और मिशन पेज
│   │   │   ├── OurInitiativePage.tsx           # विशेष विकास पहलें व योजनाएं
│   │   │   ├── StaffDirectoryPage.tsx          # अधिकारी एवं कर्मचारी विवरण सूची
│   │   │   ├── ContactPage.tsx                 # संपर्क सूत्र एवं नागरिक पूछताछ फॉर्म
│   │   │   ├── MediaGalleryPage.tsx            # फोटो एवं वीडियो गैलरी
│   │   │   ├── TermsOfUsePage.tsx              # उपयोग की शर्तें
│   │   │   ├── AboutWebsitePage.tsx            # वेबसाइट के बारे में
│   │   │   ├── WebsitePolicyPage.tsx           # शासकीय वेबसाइट नीतियां
│   │   │   ├── SiteMapPage.tsx                 # संपूर्ण साइटमैप
│   │   │   ├── ServerErrorPage.tsx             # 500 एरर पेज
│   │   │   ├── MaintenancePage.tsx             # साइट मेंटेनेंस पेज
│   │   │   └── NotFoundPage.tsx                # 404 पेज
│   │   │
│   │   ├── swm/                                # 🟢 2. ठोस अपशिष्ट एवं सफाई प्रबंधन (SWM)
│   │   │   ├── components/                     # नागरिक पोर्टल कंपोनेंट्स
│   │   │   │   ├── NavbarSafaiPortal.tsx       # SWM विशिष्ट नैविगेशन
│   │   │   │   ├── SafaiHeroBanner.tsx         # स्वच्छता मिशन बैनर
│   │   │   │   ├── ComplaintForm.tsx           # ऑनलाइन शिकायत दर्ज फॉर्म (S3 फोटो अपलोड)
│   │   │   │   ├── ComplaintTrack.tsx          # शिकायत स्थिति ट्रैकर (OTP आधारित)
│   │   │   │   ├── SwachhataPledgeSection.tsx  # स्वच्छता शपथ एवं डिजिटल प्रमाण-पत्र
│   │   │   │   ├── WasteSegregationSection.tsx # गीला/सूखा/हानिकारक कचरा पृथक्करण गाइड
│   │   │   │   ├── DailyWorkSection.tsx        # दैनिक सफाई कार्य सचित्र लॉग
│   │   │   │   ├── DocumentsSection.tsx        # उपविधियां एवं SWM रूल्स 2026 डाउनलोड
│   │   │   │   ├── LiveQuotesSection.tsx       # स्वच्छता संदेश
│   │   │   │   └── AboutSection.tsx            # SWM परिचालन विवरण
│   │   │   │
│   │   │   ├── dashboard/                      # एडमिन जीपीएस फ्लीट डैशबोर्ड
│   │   │   │   ├── DashboardPage.tsx           # फ्लीट अवलोकन (कुल वाहन, सक्रिय, शिकायतें)
│   │   │   │   ├── LiveTrackingPage.tsx        # रीयल-टाइम लीफलेट जीपीएस मैप (Socket.io)
│   │   │   │   ├── VehicleHistoryPage.tsx      # वाहन इतिहास व माइलेज
│   │   │   │   ├── RouteReplayPage.tsx         # वाहन का रूट रीप्ले एनिमेशन
│   │   │   │   ├── ComplaintsPage.tsx          # शिकायत निस्तारण व एक्शन मैनेजमेंट
│   │   │   │   ├── VehiclesPage.tsx            # वाहन मास्टर (पंजीकरण, प्रकार, स्थिति)
│   │   │   │   ├── GpsDevicesPage.tsx          # जीपीएस डिवाइस मैपिंग व स्टेटस
│   │   │   │   ├── MediaDailyWorkPage.tsx      # दैनिक कार्य मीडिया अपलोड व प्रबंधन
│   │   │   │   └── KPICard.tsx                 # केपीआई सांख्यिकी कार्ड कंपोनेंट
│   │   │   │
│   │   │   ├── pages/                          # SWM स्टैंडअलोन पेजेस
│   │   │   │   ├── SafaiPortalPage.tsx         # मुख्य SWM पोर्टल पेज
│   │   │   │   ├── ComplaintPage.tsx           # समर्पित शिकायत दर्ज व ट्रैक पेज
│   │   │   │   ├── CleanlinessBylawsPage.tsx   # स्वच्छता उपविधियां पेज
│   │   │   │   ├── SwmRulesPage.tsx            # SWM रूल्स 2026 पेज
│   │   │   │   ├── SignInPage.tsx              # एडमिन लॉगिन
│   │   │   │   ├── SignUpPage.tsx              # एडमिन पासकी आधारित पंजीकरण
│   │   │   │   └── ForgotPasswordPage.tsx      # पासवर्ड रीसेट (OTP आधारित)
│   │   │   │
│   │   │   └── index.ts                        # SWM बैरल एक्सपोर्ट
│   │   │
│   │   ├── rental/                             # 🔵 3. व्यावसायिक दुकान व परिसंपत्ति किराया प्रणाली
│   │   │   ├── components/                     # रेंटल कंपोनेंट्स
│   │   │   │   ├── RentalNavbar.tsx            # रेंटल हेडर
│   │   │   │   ├── HeroSection.tsx             # रेंटल हीरो सेक्शन (`rental-hero-bg.jpg` युक्त)
│   │   │   │   ├── QuickPaySection.tsx         # बकाया किराया खोज (दुकान संख्या / नाम द्वारा)
│   │   │   │   ├── PropertiesSection.tsx       # जिला पंचायत संपत्तियों का विवरण
│   │   │   │   ├── NoticesSection.tsx          # ई-नीलामी व आवंटन सूचनाएं
│   │   │   │   ├── DocumentsSection.tsx        # लीज डीड व अनुबंध फॉर्म डाउनलोड
│   │   │   │   ├── FeedbackSection.tsx         # किरायेदार शिकायत व सुझाव
│   │   │   │   ├── CitizenServicesHub.tsx      # सेवा केंद्र
│   │   │   │   ├── AnnouncementTicker.tsx      # लाइव घोषणा पट्टी
│   │   │   │   ├── AboutSection.tsx            # परिसंपत्ति विभाग अवलोकन
│   │   │   │   └── TopBarLogos.tsx             # शीर्ष शासकीय लोगो पट्टी
│   │   │   │
│   │   │   ├── pages/                          # रेंटल पेजेस
│   │   │   │   └── AdminSignInPage.tsx         # रेंटल एडमिन/किरायेदार लॉगिन
│   │   │   │
│   │   │   ├── context/                        # Rental LanguageContext & AuthContext
│   │   │   ├── translations/                   # द्विभाषी शब्दकोश (हिंदी/अंग्रेजी)
│   │   │   ├── RentalPortalPage.tsx            # मुख्य रेंटल नागरिक पोर्टल पेज
│   │   │   └── RentalAdminSignInPage.tsx       # रेंटल लॉगिन गेटवे
│   │   │
│   │   ├── components/                         # ⚪ सामान्य/साझा UI कंपोनेंट्स
│   │   │   ├── Footer.tsx                      # एकीकृत शासकीय फुटर
│   │   │   ├── ProtectedRoute.tsx              # एडमिन राउट गार्ड
│   │   │   ├── GooglePasskeyModal.tsx          # गूगल ऑथ पासकी मोडल
│   │   │   ├── AuthRedirectHandler.tsx         # ऑथेंटिकेशन रीडायरेक्ट हैंडलर
│   │   │   ├── RouteSEO.tsx                    # डायनेमिक पेज टाइटल व मेटा टैग्स
│   │   │   └── ErrorBoundary.tsx               # रिएक्ट एरर बाउंड्री
│   │   │
│   │   ├── layouts/                            # ⚪ सामान्य लेआउट्स
│   │   │   ├── PublicLayout.tsx                # सार्वजनिक पेजेस लेआउट (Header + Footer)
│   │   │   └── DashboardLayout.tsx             # एडमिन डैशबोर्ड लेआउट (Sidebar + Topbar)
│   │   │
│   │   ├── contexts/                           # ⚪ AuthContext (JWT & रोल स्टेट)
│   │   ├── services/                           # ⚪ API क्लाइंट्स (Axios/Fetch विथ CSRF टोकन)
│   │   ├── hooks/                              # ⚪ कस्टम रिएक्ट हुक्स
│   │   ├── i18n/                               # ⚪ i18next कॉन्फ़िगरेशन
│   │   └── types/                              # ⚪ शेयर्ड टाइप डेफिनिशन्स
│   │
│   └── package.json
│
├── backend/                                    # ⚙️ एकीकृत बैकएंड सर्वर (Express + TypeScript)
│   ├── src/
│   │   ├── server.ts                           # HTTP + Socket.io सर्वर (Port 3001)
│   │   ├── app.ts                              # एक्सप्रेस ऐप, सिक्योरिटी एवं मास्टर राउट्स
│   │   │
│   │   ├── modules/                            # 🏛️ डोमेन मॉड्यूल्स (Vertical Slices)
│   │   │   ├── swm/                            # 🟢 SWM Domain (फ्लीट, जीपीएस, शिकायतें, शपथ)
│   │   │   │   ├── controllers/                # vehicle, gpsDevice, tracking, complaint, media, pledge
│   │   │   │   ├── services/                   # millitrack (लाइव GPS सिंक), vehicle, complaint...
│   │   │   │   ├── routes/                     # swm.routes (मास्टर) + vehicle, tracking, complaint...
│   │   │   │   └── schemas/                    # zod इनपुट वैलिडेशन स्कीमा
│   │   │   │
│   │   │   ├── rental/                         # 🔵 Rental Domain (दुकानें, बकाया किराया, चालान)
│   │   │   │   ├── controllers/                # rental.controller
│   │   │   │   ├── services/                   # rental.service (बकाया खोज, किरायेदार फीडबैक)
│   │   │   │   └── routes/                     # rental.routes
│   │   │   │
│   │   │   └── payments/                       # 💳 Payments Domain (सरकारी ई-चालान व सत्यापन)
│   │   │       ├── controllers/                # payment.controller
│   │   │       ├── services/                   # payment.service
│   │   │       └── routes/                     # payment.routes
│   │   │
│   │   └── shared/                             # ⚪ साझा कोर इन्फ्रास्ट्रक्चर
│   │       ├── auth/                           # एडमिन ऑथ (JWT, Passkey, Google OAuth, OTP)
│   │       ├── contact/                        # नागरिक संपर्क डेस्क
│   │       ├── config/                         # env.ts (पर्यावरण चर), prisma.ts (डीबी कनेक्शन)
│   │       ├── middleware/                     # auth, csrf, errorHandler, upload (S3/Multer), validate
│   │       ├── notifications/                  # email.service (SMTP), whatsapp.service (Meta API)
│   │       ├── types/                          # AuthenticatedRequest, शेयर्ड इंटरफेसेज
│   │       └── utils/                          # response.util (sendSuccess, sendError)
│   │
│   ├── prisma/
│   │   └── schema.prisma                       # PostgreSQL डेटाबेस स्कीमा (11 मॉडल्स)
│   ├── data/
│   │   └── pledge-stats.json                   # शपथ काउंटर (सर्वर रीलोड मुक्त स्टोरेज)
│   ├── tsconfig.json                           # पाथ एलियास (`@/*`, `@modules/*`, `@shared/*`)
│   └── package.json
│
├── design.md                                   # आधिकारिक डिज़ाइन सिस्टम एवं कलर टोकन्स
├── PROJECT_RULES.md                            # आर्किटेक्चरल एवं डेवलपमेंट दिशानिर्देश
└── README.md                                   # संपूर्ण तकनीकी दस्तावेज़ीकरण
```

---

## 🔌 विस्तृत एपीआई संदर्भ (API Reference)

सर्वर **पोर्ट 3001** पर चलता है। सभी एंडपॉइंट्स JSON प्रारूप में उत्तर देते हैं:

### 1. सिस्टम एवं शेयर्ड एंडपॉइंट्स (System & Shared)

| Method | Endpoint | Access | विवरण (Description) |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | सर्वर लाइव स्टेटस व वेलकम मैसेज |
| `GET` | `/api/health` | Public | **मास्टर हेल्थ चेक** (SWM, Rental, Payments, Auth की स्थिति) |
| `POST` | `/api/auth/signup` | Protected | नया एडमिन पंजीकरण (`ADMIN_PASSKEY` आवश्यक) |
| `POST` | `/api/auth/login` | Public | ईमेल व पासवर्ड आधारित एडमिन लॉगिन |
| `POST` | `/api/auth/verify-otp` | Public | 6-अंकों का ईमेल OTP सत्यापन |
| `POST` | `/api/auth/forgot-password` | Public | पासवर्ड रीसेट हेतु OTP अनुरोध |
| `POST` | `/api/auth/verify-reset-otp` | Public | रीसेट OTP सत्यापन |
| `POST` | `/api/auth/reset-password` | Public | नया पासवर्ड सेट करना |
| `POST` | `/api/auth/resend-otp` | Public | OTP पुनः प्रेषण |
| `POST` | `/api/auth/google` | Public | Google OAuth टोकन सत्यापन |
| `POST` | `/api/contact` | Public | नागरिक पूछताछ व संदेश पंजीकरण (ईमेल अलर्ट सहित) |

### 2. ठोस अपशिष्ट एवं सफाई प्रबंधन (`/api/swm/` एवं कंपैटिबिलिटी एलियास)

| Method | Endpoint | Compatibility Alias | Access | विवरण (Description) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/swm/health` | — | Public | SWM डोमेन हेल्थ एवं एक्टिव सर्विसेज |
| `GET` | `/api/swm/tracking/live` | `/api/tracking/live` | Public | सभी सक्रिय सफाई वाहनों की लाइव GPS लोकेशन |
| `GET` | `/api/swm/history/:vehicleId` | `/api/history/:vehicleId` | Public | वाहन का तिथि-वार रूट इतिहास व माइलेज |
| `GET` | `/api/swm/vehicles` | `/api/vehicles` | Admin | सभी पंजीकृत वाहनों की सूची |
| `POST` | `/api/swm/vehicles` | `/api/vehicles` | Admin | नए वाहन का पंजीकरण |
| `GET` | `/api/swm/vehicles/:id` | `/api/vehicles/:id` | Admin | विशिष्ट वाहन का विवरण |
| `PUT` | `/api/swm/vehicles/:id` | `/api/vehicles/:id` | Admin | वाहन विवरण अपडेट |
| `DELETE` | `/api/swm/vehicles/:id`| `/api/vehicles/:id` | Admin | वाहन रिकॉर्ड हटाना |
| `GET` | `/api/swm/gps-devices` | `/api/gps-devices` | Admin | जीपीएस डिवाइस सूची |
| `POST` | `/api/swm/gps-devices` | `/api/gps-devices` | Admin | नए जीपीएस डिवाइस का पंजीकरण |
| `POST` | `/api/swm/complaints` | `/api/complaints` | Public | नागरिक ऑनलाइन शिकायत पंजीकरण (फोटो अपलोड) |
| `GET` | `/api/swm/complaints` | `/api/complaints` | Admin | सभी शिकायतों की सूची एवं स्टेटस फिल्टर |
| `GET` | `/api/swm/complaints/:id`| `/api/complaints/:id` | Public | शिकायत संख्या द्वारा स्थिति ट्रैकिंग |
| `PATCH`| `/api/swm/complaints/:id`| `/api/complaints/:id` | Admin | शिकायत की स्थिति अपडेट (In Progress / Resolved) |
| `GET` | `/api/swm/pledge/count` | `/api/pledge/count` | Public | स्वच्छता शपथ लेने वाले नागरिकों की वास्तविक संख्या |
| `POST` | `/api/swm/pledge/increment`| `/api/pledge/increment`| Public | नई शपथ पंजीकरण एवं संख्या वृद्धि |
| `GET` | `/api/swm/media/daily-work`| `/api/media/daily-work`| Public | दैनिक सफाई कार्यों का सचित्र विवरण |
| `POST` | `/api/swm/media/daily-work`| `/api/media/daily-work`| Admin | नए दैनिक कार्य का फोटो व विवरण अपलोड |

### 3. दुकान एवं परिसंपत्ति किराया प्रणाली (`/api/rental/`)

| Method | Endpoint | Access | विवरण (Description) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/rental/health` | Public | रेंटल डोमेन हेल्थ चेक |
| `GET` | `/api/rental/dues/search` | Public | दुकान संख्या (`shopNo`) या नाम (`name`) द्वारा बकाया किराया खोज |
| `POST` | `/api/rental/feedback` | Public | किरायेदार शिकायत, समस्या अथवा सुझाव पंजीकरण |

### 4. सरकारी ई-चालान एवं पेमेंट्स (`/api/payments/`)

| Method | Endpoint | Access | विवरण (Description) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments/health` | Public | पेमेंट्स डोमेन हेल्थ चेक |
| `POST` | `/api/payments/challan` | Admin/Citizen | नया सरकारी ई-चालान जनरेट करना |
| `POST` | `/api/payments/verify` | Public | चालान भुगतान सत्यापन एवं आधिकारिक रसीद सृजन |
| `POST` | `/api/payments/webhook` | Gateway/Bank | बैंक/ट्रेजरी पेमेंट गेटवे वेबहुक हैंडलर |

---

## 🗄️ डेटाबेस स्कीमा (Prisma PostgreSQL Models)

डेटाबेस में कुल **11 टेबल्स** हैं जो पूर्ण रेफरेंशियल इंटीग्रिटी एवं इंडेक्सिंग के साथ संरचित हैं:

```mermaid
erDiagram
    Profile ||--o{ ComplaintUpdate : "updates"
    Vehicle ||--o{ VehicleGpsAssignment : "has"
    GpsDevice ||--o{ VehicleGpsAssignment : "assigned to"
    Vehicle ||--o{ VehicleCurrentLocation : "current position"
    GpsDevice ||--o{ VehicleCurrentLocation : "reports"
    Vehicle ||--o{ VehicleLocationHistory : "historical breadcrumbs"
    GpsDevice ||--o{ VehicleLocationHistory : "recorded via"
    Complaint ||--o{ ComplaintUpdate : "status updates"

    Profile {
        string id PK
        string full_name
        string email UK
        string role
        string passwordHash
        boolean isVerified
        string authProvider
    }

    Vehicle {
        string id PK
        string vehicle_number UK
        string vehicle_name
        VehicleType vehicle_type
        VehicleStatus status
    }

    GpsDevice {
        string id PK
        string device_identifier UK
        string imei
        DeviceStatus status
        datetime last_seen_at
    }

    Complaint {
        string id PK
        string complaint_number UK
        string name
        string mobile
        string area
        ComplaintType complaint_type
        ComplaintStatus status
        string attachment_url
    }

    DailyWork {
        string id PK
        string url
        string type
        date date
        string description
    }
```

1. **`Profile`:** एडमिन एवं विभागीय स्टाफ प्रोफाइल्स (भूमिका, पासवर्ड हैश, गूगल आईडी)।
2. **`PendingRegistration`:** नए एडमिन पंजीकरण हेतु 15 मिनट की समय-सीमा वाले OTPs।
3. **`PendingPasswordReset`:** पासवर्ड पुनर्प्राप्ति हेतु सुरक्षित OTP सत्यापन टोकन्स।
4. **`Vehicle`:** सफाई एवं कचरा संग्रहण वाहन मास्टर (`truck`, `mini_truck`, `auto`, आदि)।
5. **`GpsDevice`:** वाहनों पर स्थापित IoT ट्रैकिंग डिवाइसेज का हार्डवेयर डेटा।
6. **`VehicleGpsAssignment`:** वाहन और जीपीएस डिवाइस के बीच सक्रिय/निष्क्रिय मैपिंग इतिहास।
7. **`VehicleCurrentLocation`:** प्रत्येक वाहन की सबसे हालिया स्थिति (अक्षांश, देशांतर, गति, दिशा)।
8. **`VehicleLocationHistory`:** रूट रीप्ले एवं ऑडिट हेतु ऐतिहासिक जीपीएस बिंदु।
9. **`Complaint`:** नागरिकों द्वारा दर्ज की गई स्वच्छता शिकायतें (जियो-फोटो लिंक सहित)।
10. **`ComplaintUpdate`:** शिकायत पर की गई प्रशासनिक कार्रवाई एवं स्थिति परिवर्तन लॉग।
11. **`DailyWork` / `BlogMedia`:** वार्ड-वार दैनिक सफाई कार्य एवं विकास पहलों का सचित्र रिकॉर्ड।

---

## 🗺️ संपूर्ण फ्रंटएंड राउट मैट्रिक्स (Frontend Routes & Pages)

| Route Path | Associated Page Component | Module / Purpose |
| :--- | :--- | :--- |
| `/` | `MainLandingPage.tsx` | 🏛️ आधिकारिक मुख्य नागरिक होमपेज |
| `/safai-portal` / `/swm` | `SafaiPortalPage.tsx` | 🟢 ठोस अपशिष्ट प्रबंधन (SWM) नागरिक पोर्टल |
| `/complaint` / `/complaints` | `ComplaintPage.tsx` | 📝 नागरिक स्वच्छता शिकायत दर्ज व ट्रैक करें |
| `/bylaws` | `CleanlinessBylawsPage.tsx` | 📜 जिला पंचायत स्वच्छता उपविधियां |
| `/rules` / `/swm-rules-2026` | `SwmRulesPage.tsx` | ⚖️ ठोस अपशिष्ट प्रबंधन नियम 2026 |
| `/pledge` / `/swachhata-pledge`| `SafaiPortalPage.tsx` | 🤝 स्वच्छता ई-शपथ एवं प्रमाण-पत्र |
| `/rental` / `/rental-system` | `RentalPortalPage.tsx` | 🔵 व्यावसायिक दुकान एवं संपत्ति किराया पोर्टल |
| `/rental/signin` | `RentalAdminSignInPage.tsx` | 🔑 किरायेदार / नागरिक पोर्टल लॉगिन |
| `/rental/admin/login` | `RentalAdminSignInPage.tsx` | 🛡️ परिसंपत्ति एडमिन लॉगिन |
| `/our-initiative` | `OurInitiativePage.tsx` | 🌿 जिला पंचायत की विशेष विकास पहलें |
| `/vision-mission` | `VisionMissionPage.tsx` | 🎯 विज़न, मिशन एवं लक्ष्य |
| `/staff-directory` | `StaffDirectoryPage.tsx` | 👥 अधिकारी एवं कर्मचारी विवरण सूची |
| `/contact` | `ContactPage.tsx` | 📩 संपर्क सूत्र एवं नागरिक पूछताछ डेस्क |
| `/gallery` / `/media` | `MediaGalleryPage.tsx` | 📸 विकास कार्यों की फोटो व वीडियो गैलरी |
| `/terms-of-use` | `TermsOfUsePage.tsx` | 📄 उपयोग की शर्तें |
| `/about-website` | `AboutWebsitePage.tsx` | ℹ️ वेबसाइट निर्माण एवं तकनीकी विवरण |
| `/website-policy` | `WebsitePolicyPage.tsx` | 🔒 शासकीय वेबसाइट सुरक्षा नीति |
| `/sitemap` | `SiteMapPage.tsx` | 🗺️ संपूर्ण साइटमैप |
| `/maintenance` | `MaintenancePage.tsx` | 🚧 पोर्टल रखरखाव सूचना पेज |
| `/500` | `ServerErrorPage.tsx` | ⚠️ आंतरिक सर्वर त्रुटि पेज |
| `*` (Catch-All) | `NotFoundPage.tsx` | 🔍 404 पेज नहीं मिला |
| `/signin` | `SignInPage.tsx` | 🔐 SWM एडमिन लॉगिन |
| `/signup` | `SignUpPage.tsx` | 📝 नया एडमिन खाता (Passkey संरक्षित) |
| `/forgot-password` | `ForgotPasswordPage.tsx` | 🔑 पासवर्ड रीसेट |
| `/dashboard` | `DashboardPage.tsx` | 📊 **सुरक्षित एडमिन फ्लीट डैशबोर्ड** |
| `/dashboard/tracking` | `LiveTrackingPage.tsx` | 🛰️ **सफाई वाहनों की लाइव GPS ट्रैकिंग** |
| `/dashboard/history` | `VehicleHistoryPage.tsx` | 📅 **वाहन रूट इतिहास व किलोमीटर विवरण** |
| `/dashboard/route-replay` | `RouteReplayPage.tsx` | 🔁 **वाहन रूट रीप्ले एनिमेशन** |
| `/dashboard/complaints` | `ComplaintsPage.tsx` | 📑 **शिकायत प्रबंधन व एक्शन डेस्क** |
| `/dashboard/vehicles` | `VehiclesPage.tsx` | 🚛 **सफाई वाहन मास्टर प्रबंधन** |
| `/dashboard/media` | `MediaDailyWorkPage.tsx` | 🖼️ **दैनिक कार्य फोटो/वीडियो अपलोड** |

---

## 🔒 सुरक्षा एवं बैंक-ग्रेड अनुपालन (Security Architecture)

1. **🛡️ Helmet.js Content Security:** सख्त CSP (Content Security Policy), HSTS (HTTP Strict Transport Security), X-Content-Type-Options: nosniff, एवं X-Frame-Options: DENY।
2. **🔐 डबल सबमिट एंटी-CSRF:** कुकी एवं हेडर (`X-CSRF-Token`) आधारित टोकन सुरक्षा, जिससे अनधिकृत क्रॉस-साइट अनुरोध पूर्णतः निष्प्रभावी हो जाते हैं।
3. **⚡ मल्टी-टियर रेट लिमिटिंग:**
   - **ग्लोबल सीमा:** 1000 अनुरोध / 15 मिनट प्रति IP।
   - **ऑथेंटिकेशन सीमा:** 10 प्रयास / 15 मिनट प्रति IP (ब्रूट-फोर्स प्रहार से पूर्ण सुरक्षा)।
   - **शिकायत पंजीकरण सीमा:** 100 शिकायतें / 1 घंटा प्रति IP।
   - **फाइल अपलोड सीमा:** 20 अपलोड्स / 1 घंटा प्रति IP (AWS S3 सुरक्षा)।
4. **🔑 एडमिन पासकी सुरक्षा:** अनधिकृत साइनअप रोकने हेतु `ADMIN_PASSKEY` गुप्त कुंजी अनिवार्य है।
5. **🍪 HTTP-Only एवं SameSite कुकीज:** संवेदनशील JWT टोकन्स जावास्क्रिप्ट द्वारा पढ़े नहीं जा सकते (XSS सुरक्षा)।
6. **📝 Zod स्कीमा वैलिडेशन:** सभी इनकमिंग HTTP अनुरोधों के पेलोड को प्रोसेस करने से पूर्व कड़े प्रकार (strict typing) से परखा जाता है।

---

## 🚀 स्थानीय परिनियोजन एवं सेटअप (Setup & Local Run Guide)

### पूर्वापेक्षाएं (Prerequisites)
- **Node.js:** v18.0.0 अथवा उच्चतर
- **npm:** v9.0.0 अथवा उच्चतर
- **PostgreSQL:** v14.0+ (अथवा AWS Aurora Serverless)
- **AWS S3 Bucket:** फोटो व मीडिया अपलोड्स के लिए (वैकल्पिक, लोकल टेस्ट हेतु)

---

### 1. प्रोजेक्ट क्लोन करें (Clone Repository)

```bash
git clone https://github.com/Manish363-dot/GOVERNMENT-PROJECT.git
cd GOVERNMENT-PROJECT
```

---

### 2. बैकएंड सेटअप (Backend Setup)

```bash
cd backend
npm install
```

`backend/.env` फ़ाइल तैयार करें:
```env
PORT=3001
NODE_ENV=development

# डेटाबेस कनेक्शन स्ट्रिंग (PostgreSQL)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/zila_panchayat_db?schema=public"

# सुरक्षा कुंजियां
JWT_SECRET="super-strong-jwt-secret-key-minimum-32-characters"
ADMIN_PASSKEY="SecureZilaAdminPasskey2026!"
WEBHOOK_API_KEY="zp-gps-webhook-secret-key"

# CORS अनुमत ओरिजिन्स (अल्पविराम से अलग)
FRONTEND_URL="http://localhost:5173,http://localhost:5175"

# AWS S3 (क्लाउड स्टोरेज)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="zila-panchayat-almora-storage"

# SMTP ईमेल सूचनाएं (Gmail App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="zp-almora-notifications@gmail.com"
SMTP_PASS="your-16-char-app-password"

# Meta WhatsApp Cloud API (वैकल्पिक)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
```

डेटाबेस माइग्रेट करें और सर्वर प्रारंभ करें:
```bash
npx prisma generate
npm run dev
```

> **सत्यापन:** टर्मिनल में निम्न संदेश प्रदर्शित होगा:  
> `🏛️ Zila Panchayat Almora — Modular Monolith Server running on Port: 3001`  
> मास्टर हेल्थ चेक: `http://localhost:3001/api/health`

---

### 3. फ्रंटएंड सेटअप (Frontend Setup)

एक नया टर्मिनल खोलें:
```bash
cd frontend
npm install
```

`frontend/.env` फ़ाइल तैयार करें (वैकल्पिक):
```env
VITE_API_BASE_URL="http://localhost:3001"
VITE_MAINTENANCE_MODE="false"
```

डेवलपमेंट सर्वर प्रारंभ करें:
```bash
npm run dev
```

> **सत्यापन:** ब्राउज़र में `http://localhost:5173` खोलें।

---

### 4. प्रोडक्शन बिल्ड (Production Build)

```bash
# बैकएंड टाइप-चेक एवं कंपाइल
cd backend
npm run typecheck
npm run build

# फ्रंटएंड प्रोडक्शन बंडल
cd ../frontend
npm run build
```

---

## 🎨 डिज़ाइन सिस्टम एवं कलर टोकन्स (Design System Tokens)

उत्तराखंड शासन के गौरव और कुमाऊंनी संस्कृति के अनुरूप मानकीकृत कलर पैलेट:

| Token Name | Hex Code | Tailwind Class | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Government Navy 900** | `#0b1b36` | `bg-navy-900` / `text-navy-900` | आधिकारिक हेडर, मुख्य बटन, शीर्ष प्रशासनिक बैनर |
| **Himalayan Navy 950** | `#030712` | `bg-navy-950` / `text-navy-950` | डीप नेवबार, मोडल बैकड्रॉप, उच्च-कंट्रास्ट टेक्स्ट |
| **Uttarakhand Green 700**| `#15803d` | `bg-ukgreen-700` / `text-ukgreen-700` | स्वच्छ भारत बैज, निस्तारित शिकायतें, ई-शपथ |
| **Himalayan Saffron 600**| `#ea580c` | `bg-uksaffron-600` / `text-uksaffron-600`| महत्वपूर्ण सार्वजनिक सूचनाएं, हाई-प्रायोरिटी अलर्ट्स |
| **Amber Gold 500** | `#d97706` | `bg-amber-500` / `text-amber-500` | देवभूमि बॉर्डर रिबन, स्टार रेटिंग, आधिकारिक एक्सेंट |
| **Surface White** | `#ffffff` | `bg-white` | कार्ड्स, इनपुट फॉर्म्स, डायलॉग्स |
| **Gov Canvas Gray** | `#eef1f6` | `bg-[#eef1f6]` / `bg-slate-50` | मुख्य पृष्ठ पृष्ठभूमि |

---

## 📞 आधिकारिक संपर्क एवं सहायता (Official Contact Information)

**कार्यालय जिला पंचायत अल्मोड़ा (District Panchayat Almora)**  
पंचायती राज विभाग • उत्तराखण्ड शासन  
निकट कलेक्ट्रेट परिसर, अल्मोड़ा - 263601 (उत्तराखण्ड), भारत  

- 📞 **टोल फ्री नागरिक हेल्पलाइन:** `1800-185-1850`  
- ☎️ **कार्यालय दूरभाष:** `05962-230045`  
- 📧 **आधिकारिक ईमेल:** `zp-almora@uk.gov.in`  
- 🌐 **वेबसाइट:** [https://almora.nic.in](https://almora.nic.in)  

---

<div align="center">
  <sub>🇮🇳 <b>सत्यमेव जयते</b> • स्वच्छ अल्मोड़ा — सुंदर अल्मोड़ा • <b>डिजिटल उत्तराखण्ड</b> 🇮🇳</sub>
</div>
