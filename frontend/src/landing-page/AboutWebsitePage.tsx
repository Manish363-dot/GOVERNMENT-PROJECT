import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { ZilaServicesCarousel } from './ZilaServicesCarousel';

export function AboutWebsitePage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
          {isHi ? 'जिला पंचायत अल्मोड़ा पोर्टल के बारे में' : 'About Zila Panchayat Almora Portal'}
        </h1>
        <div className="h-1 w-20 bg-amber-500 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-slate-700 leading-relaxed space-y-8 text-sm sm:text-base">
          
          <p>
            {isHi ? (
              <>
                यह आधिकारिक पोर्टल <strong>जिला पंचायत अल्मोड़ा, उत्तराखंड</strong> द्वारा नागरिकों को सार्वजनिक सेवाओं, महत्वपूर्ण सूचनाओं और डिजिटल सुविधाओं तक आसान पहुँच प्रदान करने के लिए विकसित किया गया है। पोर्टल का उद्देश्य एक ही डिजिटल प्लेटफॉर्म के माध्यम से सेवा वितरण में सुधार करना, पारदर्शिता को बढ़ावा देना और प्रशासनिक सेवाओं को नागरिकों के लिए अधिक सुलभ बनाना है।
              </>
            ) : (
              <>
                This official portal has been developed by <strong>Zila Panchayat Almora, Uttarakhand</strong>, to provide citizens with easy access to public services, important information, and digital facilities. The portal aims to improve service delivery, promote transparency, and make administrative services more accessible to citizens through a single digital platform.
              </>
            )}
          </p>

          <hr className="border-slate-200" />

          {/* Services for Citizens */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">
              {isHi ? 'नागरिकों के लिए सेवाएं' : 'Services for Citizens'}
            </h2>
            <p>
              {isHi 
                ? 'वर्तमान में पोर्टल निम्नलिखित सेवाओं तक पहुँच प्रदान करता है:' 
                : 'The portal currently provides access to the following services:'}
            </p>

            <div className="space-y-4 pt-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-navy-900 mb-1">
                  {isHi ? '1. ठोस अपशिष्ट प्रबंधन (SWM)' : '1. Solid Waste Management (SWM)'}
                </h3>
                <p>
                  {isHi ? (
                    <>
                      ठोस अपशिष्ट प्रबंधन (SWM) सेवा ग्रामीण क्षेत्रों में स्वच्छता, उचित कचरा प्रबंधन और पर्यावरण संरक्षण पर केंद्रित है। इस सेवा के माध्यम से, नागरिक स्वच्छता गतिविधियों के बारे में जानकारी प्राप्त कर सकते हैं, स्वच्छता संबंधी शिकायतें दर्ज कर सकते हैं और उपलब्ध होने पर शिकायत की स्थिति को ट्रैक कर सकते हैं। अधिकृत अधिकारी बेहतर समन्वय और प्रबंधन का समर्थन करने के लिए स्वच्छता कार्यों में उपयोग किए जाने वाले वाहनों की निगरानी भी कर सकते हैं।
                    </>
                  ) : (
                    <>
                      The SWM service focuses on cleanliness, proper waste management, and environmental protection in rural areas. Through this service, citizens can access information about cleanliness activities, register sanitation-related complaints, and track complaint status when available. Authorized officials can also monitor vehicles used in sanitation operations to support better coordination and management.
                    </>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-navy-900 mb-1">
                  {isHi ? '2. रेंटल सेवाएं' : '2. Rental Services'}
                </h3>
                <p>
                  {isHi ? (
                    <>
                      रेंटल सेवा अनुभाग जिला पंचायत अल्मोड़ा के तहत किराये की संपत्तियों और संबंधित सेवाओं के प्रबंधन के लिए एक डिजिटल प्लेटफॉर्म प्रदान करता है। नागरिक उपलब्ध संपत्तियों, जैसे दुकानों और अन्य निर्दिष्ट संपत्तियों की जानकारी प्राप्त कर सकते हैं और किराये से संबंधित प्रक्रियाओं के लिए पोर्टल की सुविधाओं का उपयोग कर सकते हैं। अधिकृत अधिकारी संपत्ति रिकॉर्ड, उपयोगकर्ता पंजीकरण, किराये का विवरण और संबंधित प्रशासनिक गतिविधियों का प्रबंधन कर सकते हैं।(जल्द ही आ रहा है)
                    </>
                  ) : (
                    <>
                      The Rental Services section provides a digital platform for managing rental properties and related services under Zila Panchayat Almora. Citizens can access information about available properties, such as shops and other designated properties, and use the portal's facilities for rental-related processes. Authorized officials can manage property records, user registrations, rental details, and related administrative activities.(COMING SOON)
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Objectives */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">
              {isHi ? 'उद्देश्य' : 'Objectives'}
            </h2>
            <p>
              {isHi ? 'इस पोर्टल के मुख्य उद्देश्य हैं:' : 'The main objectives of this portal are to:'}
            </p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                {isHi 
                  ? 'नागरिकों को जिला पंचायत की सेवाओं तक सुविधाजनक पहुँच प्रदान करना।' 
                  : 'Provide citizens with convenient access to Zila Panchayat services.'}
              </li>
              <li>
                {isHi 
                  ? 'सार्वजनिक सेवा वितरण का डिजिटलीकरण और सरलीकरण करना।' 
                  : 'Digitize and simplify public service delivery.'}
              </li>
              <li>
                {isHi 
                  ? 'प्रशासनिक प्रक्रियाओं में पारदर्शिता और जवाबदेही को बढ़ावा देना।' 
                  : 'Promote transparency and accountability in administrative processes.'}
              </li>
              <li>
                {isHi 
                  ? 'प्रभावी ठोस अपशिष्ट प्रबंधन और स्वच्छता पहलों का समर्थन करना।' 
                  : 'Support effective solid waste management and cleanliness initiatives.'}
              </li>
              <li>
                {isHi 
                  ? 'किराये की संपत्ति प्रबंधन के लिए डिजिटल सुविधाएं प्रदान करना।' 
                  : 'Provide digital facilities for rental property management.'}
              </li>
              <li>
                {isHi 
                  ? 'नागरिकों और संबंधित विभागों के बीच संवाद में सुधार करना।' 
                  : 'Improve communication between citizens and the concerned departments.'}
              </li>
              <li>
                {isHi 
                  ? 'एक ही प्लेटफॉर्म के माध्यम से सार्वजनिक जानकारी और आवश्यक सेवाओं को सुलभ बनाना।' 
                  : 'Make public information and essential services accessible through a single platform.'}
              </li>
            </ul>

            <p className="pt-2">
              {isHi ? (
                <>
                  यह पोर्टल डिजिटल गवर्नेंस, बेहतर सार्वजनिक सेवाओं और ग्रामीण विकास की दिशा में <strong>जिला पंचायत अल्मोड़ा</strong> की एक पहल है। जैसे-जैसे पोर्टल विकसित होता रहेगा, अतिरिक्त सेवाएं और सुविधाएं भी शुरू की जा सकती हैं।
                </>
              ) : (
                <>
                  This portal is an initiative of <strong>Zila Panchayat Almora</strong> towards digital governance, improved public services, and rural development. Additional services and facilities may be introduced as the portal continues to develop.
                </>
              )}
            </p>
          </section>

          <div className="pt-4">
            <ZilaServicesCarousel />
          </div>

        </div>
      </div>
    </div>
  );
}
