import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function TermsOfUsePage() {
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
          {isHi ? 'उपयोग की शर्तें' : 'Terms of use'}
        </h1>
        <div className="h-1 w-20 bg-amber-500 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-slate-700 leading-relaxed space-y-6">
          
          <section>
            <h2 className="text-xl font-bold text-navy-800 mb-4">
              {isHi ? 'अस्वीकरण' : 'Disclaimer'}
            </h2>
            
            <div className="space-y-4 text-sm sm:text-base">
              <p>
                {isHi ? 'यह पोर्टल जिला पंचायत विभाग, अल्मोड़ा, उत्तराखंड द्वारा डिज़ाइन, विकसित, होस्ट और प्रबंधित किया गया है।':'This Portal is designed, developed, hosted and managed by Department of Zila Panchayat, Almora, Uttarakhand.'}
              </p>
              <p>
                {isHi 
                  ? 'यद्यपि इस पोर्टल की सामग्री की सटीकता और प्रासंगिकता सुनिश्चित करने के लिए सभी प्रयास किए गए हैं, लेकिन इसे कानूनी बयान के रूप में नहीं समझा जाना चाहिए या किसी कानूनी उद्देश्यों के लिए उपयोग नहीं किया जाना चाहिए। किसी भी स्थिति में सरकार इस पोर्टल के उपयोग से होने वाले किसी भी खर्च, हानि या क्षति के लिए उत्तरदायी नहीं होगी।' 
                  : 'Though all efforts have been made to ensure the accuracy and currency of the content on this Portal, the same should not be construed as a statement of law or used for any legal purposes. In no event will the Government be liable for any expense, loss or damage including, without limitation, indirect or consequential loss or damage, or any expense, loss or damage whatsoever arising from use, or loss of use, of data, arising out of or in connection with the use of this Portal.'}
              </p>
              <p>
                {isHi 
                  ? 'इस पोर्टल पर उपलब्ध जानकारी एवं सेवाएँ सामान्य जन-सूचना एवं सुविधा प्रदान करने के उद्देश्य से उपलब्ध कराई गई हैं। पोर्टल पर उपलब्ध जानकारी को यथासंभव सही एवं अद्यतन रखने के लिए उचित प्रयास किए गए हैं। तथापि, पोर्टल पर उपलब्ध किसी भी जानकारी की पूर्णता, शुद्धता, विश्वसनीयता अथवा समयानुकूलता की पूर्ण गारंटी नहीं दी जाती है।' 
                  : 'The information and services provided through this Portal are intended for general public information and facilitation purposes. Every effort has been made to ensure that the information available on the Portal is accurate and up to date. However, no guarantee is given regarding the completeness, accuracy, reliability, or timeliness of the information.'}
              </p>
              <p>
                {isHi 
                  ? 'लागू कानूनों द्वारा अनुमत सीमा तक, इस पोर्टल पर उपलब्ध जानकारी अथवा सेवाओं के उपयोग या उन पर निर्भर रहने के कारण होने वाली किसी भी प्रत्यक्ष या अप्रत्यक्ष हानि, क्षति, व्यय अथवा असुविधा के लिए पोर्टल के संबंधित प्राधिकारी उत्तरदायी नहीं होंगे।' 
                  : 'The Portal authorities shall not be responsible for any loss, damage, expense, or inconvenience arising from the use of, or reliance upon, the information or services provided through this Portal, to the extent permitted under applicable law.'}
              </p>
              <p>
                {isHi 
                  ? 'उपयोगकर्ताओं द्वारा पोर्टल पर प्रस्तुत की गई शिकायतें, सुझाव, फीडबैक, फोटो, स्थान संबंधी जानकारी तथा अन्य सामग्री का उपयोग स्वच्छता एवं सफाई से संबंधित सेवाओं के प्रसंस्करण, सत्यापन, निगरानी एवं सेवाओं में सुधार के उद्देश्य से किया जा सकता है। उपयोगकर्ता द्वारा प्रस्तुत की गई जानकारी की सत्यता, वैधता एवं प्रामाणिकता की जिम्मेदारी संबंधित उपयोगकर्ता की होगी।' 
                  : 'Information submitted by users, including complaints, feedback, photographs, location details, and other content, may be used for the purpose of processing, verification, monitoring, and improvement of sanitation and cleanliness-related services. Users are responsible for ensuring that the information submitted by them is accurate and lawful.'}
              </p>
              <p>
                {isHi 
                  ? 'इस पोर्टल पर जन-सुविधा के उद्देश्य से अन्य बाहरी वेबसाइटों या संसाधनों के लिंक उपलब्ध कराए जा सकते हैं। ऐसे लिंक उपलब्ध कराया जाना संबंधित बाहरी वेबसाइट की सामग्री, सेवाओं, उपलब्धता अथवा उसकी गोपनीयता संबंधी नीतियों का समर्थन या अनुमोदन नहीं माना जाएगा और उनके लिए पोर्टल प्राधिकारी उत्तरदायी नहीं होंगे।' 
                  : 'The Portal may contain links to external websites or resources for public convenience. The inclusion of such links does not imply endorsement or responsibility for the content, availability, privacy practices, or services provided by those external websites.'}
              </p>
              <p>
                {isHi 
                  ? 'पोर्टल की सुरक्षा, उपलब्धता एवं सुचारु संचालन सुनिश्चित करने के लिए उचित तकनीकी एवं प्रशासनिक उपाय किए जाते हैं। तथापि, रखरखाव, तकनीकी त्रुटि, नेटवर्क संबंधी समस्या, सर्वर संबंधी समस्या अथवा पोर्टल प्राधिकारी के नियंत्रण से बाहर की अन्य परिस्थितियों के कारण सेवाओं में अस्थायी व्यवधान हो सकता है। ऐसी किसी भी स्थिति में पोर्टल प्राधिकारी उपयोगकर्ताओं के प्रति उत्तरदायी नहीं होंगे।' 
                  : 'While reasonable measures are taken to maintain the security, availability, and proper functioning of the Portal, temporary interruption, maintenance, technical errors, network failures, or other circumstances beyond the control of the Portal authorities may affect the availability of services. In such an event, the Portal authorities shall not be liable to users.'}
              </p>
              <p>
                {isHi ? 'यदि पोर्टल पर उपलब्ध किसी जानकारी में सक्षम प्राधिकारी द्वारा जारी किसी आधिकारिक निर्णय, आदेश, अधिसूचना अथवा निर्देश से कोई असंगति पाई जाती है, तो सक्षम प्राधिकारी द्वारा जारी आधिकारिक निर्णय, आदेश, अधिसूचना अथवा निर्देश मान्य होगा। इस अस्वीकरण की कोई भी बात ऐसे दायित्व को सीमित या समाप्त नहीं करती जिसे लागू भारतीय कानून के अंतर्गत कानूनी रूप से सीमित या समाप्त नहीं किया जा सकता।यह अस्वीकरण भारत के लागू कानूनों के अनुसार शासित एवं व्याख्यायित होगा।' : 'Any official decision, action, notice, or order issued by the competent authority shall prevail over information provided on this Portal in case of any inconsistency.Nothing contained in this Disclaimer shall limit or exclude any liability that cannot legally be limited or excluded under applicable Indian law.This Disclaimer shall be governed by and construed in accordance with the applicable laws of India.'}
              </p>
              
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
