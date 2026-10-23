import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function OurInitiativePage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const initiatives = [
    {
      id: '01',
      title: 'Swachh Almora – Digital Safai Mission',
      titleHi: 'स्वच्छ अल्मोड़ा – डिजिटल सफाई मिशन',
      desc: isHi
        ? 'पब्लिक फोटो और लोकेशन के साथ सफाई शिकायतें सीधे पोर्टल पर सबमिट कर सके।'
        : 'Citizens can submit cleanliness and waste complaints directly with photo and live GPS location.',
    },
    {
      id: '02',
      title: 'Smart Garbage Vehicle Tracking',
      titleHi: 'स्मार्ट कचरा वाहन ट्रैकिंग',
      desc: isHi
        ? 'जीपीएस से कचरा वाहनों की लाइव लोकेशन और मूवमेंट रीयल-टाइम में ट्रैक हो।'
        : 'Real-time live location and route movement tracking of garbage vehicles via GPS telematics.',
    },
    {
      id: '03',
      title: 'Before & After Safai Proof',
      titleHi: 'सफाई पूर्व व पश्चात प्रमाण',
      desc: isHi
        ? 'शिकायत का समाधान होने पर स्टाफ तस्वीरें अपलोड करे और नागरिक समाधान की पुष्टि कर सके।'
        : 'Staff uploads before & after photos upon complaint resolution, allowing citizens to confirm satisfactory resolution.',
    },
    {
      id: '04',
      title: 'Adopt-a-Village Cleanliness Program',
      titleHi: 'ग्राम स्वच्छता अंगीकरण कार्यक्रम',
      desc: isHi
        ? 'गांवों में स्वच्छता अभियान और निरीक्षण आयोजित हों।'
        : 'Cleanliness drives and regular field inspections organized across rural villages.',
    },
    {
      id: '05',
      title: 'Safai Inspection & Audit System',
      titleHi: 'सफाई निरीक्षण एवं ऑडिट प्रणाली',
      desc: isHi
        ? 'अधिकारी डिजिटल चेकलिस्ट और तस्वीरों से फील्ड निरीक्षण रिकॉर्ड करें।'
        : 'Administrative officials record on-ground field inspections using digital checklists and photos.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Top Government Banner (Same as Complaint Page Header) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-10 sm:py-14 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-white tracking-tight leading-tight mb-3">
                {isHi ? 'हमारी पहल' : 'Our Initiative'}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत ठोस अपशिष्ट प्रबंधन, सफाई व्यवस्था एवं वाहन संचालन संबंधी समस्याओं का समयबद्ध समाधान व पारदर्शी डिजिटल ट्रैकिंग।'
                  : 'District Panchayat Almora — Timely redressal and 100% transparent tracking for solid waste management, sanitation issues, and vehicle operations under Swachh Bharat Mission (Grameen).'}
              </p>
            </div>
          </div>

          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6"></div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="space-y-8">
          
          {/* Section 1: Overview */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-2xl font-bold text-navy-900 mb-3">
              {isHi ? 'पृष्ठभूमि एवं उद्देश्य' : 'Background & Objectives'}
            </h2>
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-3">
              <p>
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा का उद्देश्य नवीन डिजिटल पहलों के माध्यम से स्वच्छता, पारदर्शिता और बेहतर जनसेवाओं को बढ़ावा देना है। हमारा लक्ष्य “स्मार्ट स्वच्छ अल्मोड़ा” प्रणाली विकसित करना है, जिसके अंतर्गत नागरिक ऑनलाइन शिकायत पोर्टल के माध्यम से स्वच्छता संबंधी समस्याओं की शिकायत दर्ज कर सकेंगे तथा अधिकारी उन शिकायतों की निगरानी कर उनका प्रभावी ढंग से निस्तारण कर सकेंगे। यह प्रणाली कूड़ा संग्रहण वाहनों की जीपीएस आधारित ट्रैकिंग की सुविधा भी प्रदान करेगी, जिससे अधिकारी वाहनों की गतिविधियों पर नजर रख सकेंगे और कार्य संचालन की दक्षता में सुधार कर सकेंगे।'
                  : 'Zila Panchayat Almora aims to promote cleanliness, transparency, and better public services through innovative digital initiatives. Our vision is to develop a Smart Swachh Almora system that enables citizens to report sanitation-related issues through an online complaint portal, while allowing officials to monitor and resolve complaints efficiently. The system also supports GPS-based tracking of garbage collection vehicles, helping administrators monitor vehicle movements and improve operational efficiency.'}
              </p>
              <p>
                {isHi
                  ? 'इसके अतिरिक्त, सफाई कार्य पूरा होने के बाद उसके पहले और बाद की तस्वीरें अपलोड की जाएंगी, जिससे कार्य पूर्ण होने का प्रमाण उपलब्ध होगा। नागरिकों की प्रतिक्रिया के माध्यम से शिकायतों के निस्तारण की पुष्टि करने में भी सहायता मिलेगी। ग्राम स्तर पर स्वच्छता कार्यक्रमों तथा डिजिटल निरीक्षण एवं ऑडिट सुविधाओं के माध्यम से हमारा उद्देश्य जनभागीदारी को प्रोत्साहित करना, जवाबदेही को मजबूत बनाना तथा अल्मोड़ा को अधिक स्वच्छ, स्मार्ट और टिकाऊ जिला बनाना है।'
                  : 'Additionally, before-and-after photographs provide photographic evidence of completed cleaning activities, while citizen feedback helps verify complaint resolution. Through village-level cleanliness programs and digital inspection and audit facilities, we aim to encourage community participation, strengthen accountability, and build a cleaner, smarter, and more sustainable Almora.'}
              </p>
            </div>
          </div>

          {/* Section 2: 5 Core Digital Initiatives (Simple Clean Text) */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <div className="border-b border-slate-200 pb-3 mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-navy-900">
                {isHi ? 'प्रमुख पहल एवं कार्यप्रणाली' : 'Key Initiatives & Operating Framework'}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {isHi ? 'डिजिटल तकनीक एवं पारदर्शी जन-भागीदारी पर आधारित पांच प्रमुख बिंदु' : 'Five primary pillars driven by digital technology and civic participation'}
              </p>
            </div>

            <div className="space-y-4">
              {initiatives.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-navy-900 text-amber-400 shrink-0 mt-0.5">
                      {item.id}
                    </span>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg text-navy-900 leading-snug">
                        {isHi ? item.titleHi : item.title}
                      </h3>
                      <p className="text-slate-700 text-sm sm:text-base mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Ground Operations & Facilities */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-2xl font-bold text-navy-900 mb-4">
              {isHi ? 'बुनियादी सुविधाएं एवं जमीनी संचालन' : 'Ground Infrastructure & Support Operations'}
            </h2>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-700 text-sm sm:text-base leading-relaxed">
              <li>
                <strong className="text-slate-900">{isHi ? 'पर्यावरण मित्र (Paryavaran Mitras):' : 'Paryavaran Mitras:'}</strong>{' '}
                {isHi
                  ? 'समस्त वार्डों एवं ग्रामीण बाजारों में समर्पित स्वच्छता कर्मियों की तैनाती जो प्रतिदिन सुबह सफाई व घर-घर कचरा एकत्रीकरण करते हैं।'
                  : 'Dedicated sanitation workers deployed across wards and rural markets for regular morning waste collection.'}
              </li>
              <li>
                <strong className="text-slate-900">{isHi ? 'मैटेरियल रिकवरी सेंटर (MRF):' : 'Material Recovery Facilities (MRF):'}</strong>{' '}
                {isHi
                  ? 'एकत्रित सूखे कचरे का श्रेणीवार (प्लास्टिक, गत्ता, कांच, धातु) पृथक्करण करने हेतु विकासखंडों में आधुनिक एमआरएफ केंद्रों की स्थापना।'
                  : 'Modern MRF centers established across blocks to sort recyclable paper, cardboard, glass, and metals.'}
              </li>
              <li>
                <strong className="text-slate-900">{isHi ? 'प्लास्टिक कॉम्पेक्टर एवं बेलिंग:' : 'Plastic Compactors & Baling Units:'}</strong>{' '}
                {isHi
                  ? 'प्लास्टिक कचरे को उच्च दबाव बेलिंग मशीनों द्वारा संपीड़ित कर अधिकृत रीसाइक्लर्स को वैज्ञानिक पुनर्उपयोग हेतु भेजना।'
                  : 'Hydraulic baling units to compress plastic waste into dense bales for authorized eco-friendly recycling.'}
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
