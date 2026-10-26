import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Truck } from 'lucide-react';

export const AboutSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <section id="about" className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Introduction */}
        <div className="pt-2 sm:pt-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            {isHi ? 'ठोस अपशिष्ट प्रबंध - परिचय' : 'About - Solid Waste Management'}
          </h2>
          <div className="h-1 w-20 bg-emerald-400 rounded-full mt-3 mb-6" />

          {/* Introductory Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {isHi ? (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">ठोस अपशिष्ट प्रबंधन (SWM) </strong>
                  का उद्देश्य ग्रामीण क्षेत्रों में उत्पन्न होने वाले कचरे का उचित संग्रहण, पृथक्करण, परिवहन एवं सुरक्षित निस्तारण सुनिश्चित करना है। जिला पंचायत अल्मोड़ा स्वच्छता को बढ़ावा देने, ग्रामीण परिवेश को स्वच्छ बनाए रखने तथा पर्यावरण संरक्षण के प्रति नागरिकों को जागरूक करने की दिशा में प्रयासरत है।
                </p>
                <p>
                  इस पहल के अंतर्गत गीले एवं सूखे कचरे के पृथक्करण, कचरे के पुनर्चक्रण, सार्वजनिक स्थानों की स्वच्छता और जनभागीदारी को प्रोत्साहित करने पर विशेष ध्यान दिया जाता है। नागरिकों, स्थानीय समुदायों और संबंधित विभागों के सहयोग से हमारा लक्ष्य ग्रामीण क्षेत्रों में स्वच्छता के प्रति जिम्मेदारी की भावना विकसित करना और कचरे के अनुचित निस्तारण से होने वाले पर्यावरणीय नुकसान को कम करना है।
                </p>
                <p className="pt-1 text-slate-800 font-medium">
                  <strong className="text-slate-900 font-bold">हमारा संकल्प है</strong> — स्वच्छ गाँव, स्वस्थ नागरिक और हरित अल्मोड़ा।
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">Solid Waste Management (SWM)</strong> aims to ensure the proper collection, segregation, transportation, processing, and safe disposal of waste generated in rural areas. Zila Panchayat Almora is committed to promoting cleanliness, maintaining a clean rural environment, and raising public awareness about environmental protection.
                </p>
                <p>
                  This initiative focuses on the segregation of wet and dry waste, encouraging recycling, maintaining cleanliness in public places, and promoting active community participation. Through the cooperation of citizens, local communities, and concerned departments, we aim to develop a sense of responsibility towards cleanliness and reduce the environmental damage caused by improper waste disposal.
                </p>
                <p className="pt-1 text-slate-800 font-medium">
                  <strong className="text-slate-900 font-bold">Our Commitment</strong> — Clean Villages, Healthy Citizens, and a Greener Almora.
                </p>
              </>
            )}
          </div>
        </div>

        {/* What We Offer Through This Portal */}
        <div className="mt-10 sm:mt-12">
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              {isHi ? 'इस पोर्टल के माध्यम से मुख्य सुविधाएं' : 'What We Offer Through This Portal'}
            </h3>
            <div className="h-1 w-16 bg-emerald-400 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Do Complaint */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 font-poppins">
                  {isHi ? 'नागरिक शिकायत पंजीकरण एवं निवारण' : 'Public Grievance Redressal'}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {isHi
                    ? 'ग्रामीण व अर्ध-शहरी क्षेत्रों में कूड़ा निस्तारण, सफाई व्यवस्था या कचरा गाड़ी न पहुँचने पर नागरिक सीधे ऑनलाइन शिकायत दर्ज कर सकते हैं। शिकायत की स्थिति को संदर्भ संख्या द्वारा आसानी से ट्रैक किया जा सकता है।'
                    : 'Citizens can report waste disposal issues, unattended garbage, or delayed collection vehicles directly through the portal, receiving a unique reference ID for transparent tracking.'}
                </p>
              </div>
            </div>

            {/* Card 2: Track Vehicle */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 font-poppins">
                  {isHi ? 'स्वच्छता वाहन लाइव जीपीएस ट्रैकिंग' : 'Live Fleet GPS Tracking'}
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                  {isHi
                    ? 'जनपद अल्मोड़ा के समस्त विकासखंडों में संचालित कूड़ा संग्रहण वाहनों की डिजिटल निगरानी। वाहनों के दैनिक रूट, गति और समय की लाइव जीपीएस ट्रैकिंग से नियमित सेवा सुनिश्चित की जाती है। यह एडमिन द्वारा वाहनों की निगरानी करने के लिए उपयोग किया जाता है।'
                    : 'Digital monitoring of waste collection vehicles across all blocks of Almora. Real-time GPS tracking ensures route adherence, timely collection schedules, and transparent monitoring. This is accessed by the Admin to monitor the vehicles.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
