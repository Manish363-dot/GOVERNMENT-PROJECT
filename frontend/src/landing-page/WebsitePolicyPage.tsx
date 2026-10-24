import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export function WebsitePolicyPage() {
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
          {isHi ? 'वेबसाइट नीतियां' : 'Website Policies'}
        </h1>
        <div className="h-1 w-20 bg-amber-500 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-slate-700 leading-relaxed space-y-8 text-sm sm:text-base">
          
          <p>
            {isHi ?
            'इस पोर्टल का उद्देश्य नागरिकों को सफाई एवं स्वच्छता से संबंधित जानकारी और सेवाएं उपलब्ध कराना तथा नागरिकों की शिकायतों एवं सुझावों को संबंधित प्राधिकारी तक पहुँचाना है':'The objective of this portal is to provide information and services related to cleanliness and hygiene to the citizens and to forward the grievances and suggestions of the citizens to the concerned authority.'}
            {isHi ? 'पोर्टल के उपयोग से संबंधित विभिन्न नीतियां नीचे दी गई हैं।' : 'The various policies related to the use of the portal are given below.'}
          </p>

          <hr className="border-slate-200" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">1. {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</h2>
            <p>{isHi ? 'इस पोर्टल पर आपकी गोपनीयता का सम्मान किया जाता है। पोर्टल का उपयोग करते समय आवश्यकतानुसार आपका नाम, मोबाइल नंबर, ई-मेल, पता, शिकायत से संबंधित जानकारी, फोटो, स्थान संबंधी जानकारी तथा अन्य आवश्यक जानकारी ली जा सकती है।' : 'Your privacy is respected on this portal. While using the portal, your name, mobile number, e-mail, address, information related to the complaint, photo, location information, and other necessary information may be collected as required.'}</p>
            <p>{isHi ? 'आपकी व्यक्तिगत जानकारी को लागू कानूनों के अनुसार सुरक्षित रखने का उचित प्रयास किया जाएगा।' : 'Reasonable efforts will be made to keep your personal information secure in accordance with applicable laws.'}
            {isHi ? 'जानकारी संबंधित सरकारी अधिकारी, विभाग या अधिकृत सेवा प्रदाता के साथ केवल संबंधित कार्य के लिए साझा की जा सकती है।' : 'Information may be shared with concerned government officials, departments or authorized service providers only for relevant tasks.'}
            {isHi ? 'पोर्टल की सुरक्षा और संचालन के लिए तकनीकी जानकारी जैसे IP Address, Browser Information, Device Information और Access Logs भी रिकॉर्ड किए जा सकते हैं।' : 'Technical information such as IP Address, Browser Information, Device Information, and Access Logs may also be recorded for the security and operation of the portal.'}</p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">2. {isHi ? 'कॉपीराइट नीति' : 'Copyright Policy'}</h2>
            <p>{isHi ? 'इस पोर्टल पर उपलब्ध टेक्स्ट, डिजाइन, ग्राफिक्स, लोगो, दस्तावेज और अन्य सामग्री संबंधित अधिकारधारी की संपत्ति हो सकती है।' : 'The text, design, graphics, logos, documents, and other materials available on this portal may be the property of the respective copyright holder.'}
            {isHi ? 'पोर्टल की सामग्री को बिना अनुमति व्यावसायिक या भ्रामक तरीके से उपयोग, कॉपी या पुनः प्रकाशित नहीं किया जाना चाहिए।' : 'The content of the portal must not be used, copied, or republished in a commercial or misleading manner without permission.'}
            {isHi ? 'यदि किसी सामग्री के पुनः उपयोग की अनुमति दी जाती है, तो उसका सही स्रोत और संदर्भ देना आवश्यक होगा।' : 'If permission is granted to reuse any content, its correct source and reference must be given.'}
            {isHi ? 'किसी तीसरे पक्ष की सामग्री पर उस संबंधित पक्ष के कॉपीराइट और उपयोग की शर्तें लागू हो सकती हैं।' : 'Copyright and terms of use of the respective third party may apply to any third-party content.'}
            {isHi ? 'किसी सामग्री के उपयोग की अनुमति के लिए संबंधित प्राधिकारी से संपर्क किया जा सकता है।' : 'The concerned authority may be contacted for permission to use any content.'}</p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">3. {isHi ? 'हाइपरलिंकिंग नीति' : 'Hyperlinking Policy'}</h2>
            <p>{isHi ? 'इस पोर्टल पर नागरिकों की सुविधा के लिए अन्य सरकारी या बाहरी वेबसाइटों के लिंक दिए जा सकते हैं।' : 'For the convenience of citizens, links to other government or external websites may be provided on this portal.'}
            {isHi ? 'किसी बाहरी वेबसाइट का लिंक उपलब्ध होने का अर्थ यह नहीं है कि पोर्टल उस वेबसाइट की सामग्री या सेवाओं का समर्थन या अनुमोदन करता है।' : 'The availability of a link to an external website does not imply that the portal endorses or approves the content or services of that website.'}
            {isHi ? 'बाहरी वेबसाइटों की सामग्री, सुरक्षा, उपलब्धता और गोपनीयता नीति के लिए संबंधित वेबसाइट का संचालक जिम्मेदार होगा।' : 'The operator of the respective website will be responsible for the content, security, availability, and privacy policy of external websites.'}
            {isHi ? 'इस पोर्टल की किसी अन्य वेबसाइट पर लिंकिंग के संबंध में आवश्यकता होने पर संबंधित प्राधिकारी की अनुमति ली जा सकती है।' : 'Permission from the concerned authority may be taken if linking to this portal is required on any other website.'}</p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">4. {isHi ? 'सामग्री एवं उपयोगकर्ता योगदान नीति' : 'Content & User Contribution Policy'}</h2>
            <p>{isHi ? 'उपयोगकर्ता शिकायत दर्ज करते समय फोटो, विवरण, स्थान या अन्य जानकारी उपलब्ध करा सकते हैं।' : 'Users may provide photos, details, location, or other information while registering a complaint.'}</p>
            <p>{isHi ? 'उपयोगकर्ता द्वारा दी गई सामग्री:' : 'Content provided by the user must:'}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{isHi ? 'सही और वास्तविक होनी चाहिए।' : 'Be correct and authentic.'}</li>
              <li>{isHi ? 'शिकायत से संबंधित होनी चाहिए।' : 'Be related to the complaint.'}</li>
              <li>{isHi ? 'किसी अन्य व्यक्ति की निजी जानकारी का अनावश्यक खुलासा नहीं करना चाहिए।' : 'Not unnecessarily disclose the personal information of any other person.'}</li>
              <li>{isHi ? 'गैर-कानूनी, आपत्तिजनक या भ्रामक नहीं होनी चाहिए।' : 'Not be illegal, objectionable, or misleading.'}</li>
              <li>{isHi ? 'किसी अन्य व्यक्ति के कॉपीराइट या अन्य अधिकारों का उल्लंघन नहीं करना चाहिए।' : 'Not violate the copyright or other rights of any other person.'}</li>
            </ul>
            <p>{isHi ? 'पोर्टल प्राधिकारी ऐसी सामग्री को हटाने, अस्वीकार करने या उस पर कार्रवाई करने का अधिकार रखते हैं जो इन नियमों के विरुद्ध हो।' : 'The portal authority reserves the right to remove, reject, or take action on such content that violates these rules.'}
            {isHi ? 'उपयोगकर्ता द्वारा उपलब्ध कराई गई जानकारी का उपयोग शिकायत के सत्यापन, समाधान और संबंधित प्रशासनिक कार्य के लिए किया जा सकता है।' : 'The information provided by the user may be used for the verification, resolution of the complaint, and relevant administrative tasks.'}</p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">5. {isHi ? 'शिकायत एवं संपर्क नीति' : 'Grievance & Contact'}</h2>
            <p>{isHi ? 'पोर्टल से संबंधित किसी समस्या, शिकायत या सुझाव के लिए उपयोगकर्ता पोर्टल पर उपलब्ध आधिकारिक संपर्क माध्यमों का उपयोग कर सकते हैं।' : 'For any problem, complaint, or suggestion related to the portal, users may use the official contact channels available on the portal.'}
            {isHi ? 'शिकायत दर्ज करते समय उपयोगकर्ता को समस्या से संबंधित सही जानकारी और आवश्यक विवरण देना चाहिए।' : 'While registering a complaint, the user must provide correct information and necessary details related to the problem.'}
            {isHi ? 'शिकायत प्राप्त होने के बाद उसे संबंधित अधिकारी या विभाग को आवश्यक कार्रवाई के लिए भेजा जा सकता है।' : 'After receiving the complaint, it may be forwarded to the concerned officer or department for necessary action.'}
            {isHi ? 'शिकायत की स्थिति उपलब्ध होने पर उपयोगकर्ता को पोर्टल के माध्यम से इसकी जानकारी दी जा सकती है।' : 'Users may be informed about the status of the complaint through the portal when available.'}
            {isHi ? 'यदि किसी शिकायत के लिए अतिरिक्त जानकारी या दस्तावेज की आवश्यकता होगी, तो संबंधित प्राधिकारी उपयोगकर्ता से संपर्क कर सकता है।' : 'If additional information or documents are required for any complaint, the concerned authority may contact the user.'}</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 inline-block mt-2">
              <p><strong>{isHi ? 'संपर्क:' : 'Contact:'}</strong></p>
              <p>{isHi ? 'ई-मेल:' : 'Email:'} amazpalmora@gmail.com</p>
              <p>{isHi ? 'फोन:' : 'Phone:'} 1800-185-1850</p>
              <p>{isHi ? 'कार्यालय: धारानौला जिला पंचायत अल्मोड़ा, उत्तराखंड - 263601' : 'Office: Dharanaula Zila Panchayat Almora, Uttarakhand - 263601'}</p>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">6. {isHi ? 'सुरक्षा नीति' : 'Security Policy'}</h2>
            <p>{isHi ? 'पोर्टल की सुरक्षा बनाए रखने के लिए उचित तकनीकी और प्रशासनिक उपाय किए जाते हैं।' : 'Appropriate technical and administrative measures are taken to maintain the security of the portal.'}</p>
            <p>{isHi ? 'इनमें आवश्यकता के अनुसार:' : 'These may include as required:'}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{isHi ? 'सुरक्षित HTTPS कनेक्शन।' : 'Secure HTTPS connections.'}</li>
              <li>{isHi ? 'उपयोगकर्ता प्रमाणीकरण।' : 'User authentication.'}</li>
              <li>{isHi ? 'पासवर्ड की सुरक्षित सुरक्षा।' : 'Secure storage of passwords.'}</li>
              <li>{isHi ? 'भूमिका के अनुसार सिस्टम एक्सेस।' : 'Role-based system access.'}</li>
              <li>{isHi ? 'अनधिकृत गतिविधियों की निगरानी।' : 'Monitoring of unauthorized activities.'}</li>
              <li>{isHi ? 'सर्वर एवं डेटाबेस सुरक्षा।' : 'Server and database security.'}</li>
              <li>{isHi ? 'नियमित बैकअप और सुरक्षा जांच।' : 'Regular backups and security checks.'}</li>
            </ul>
            <p>{isHi ? 'शामिल हो सकते हैं।' : ''}</p>
            <p>{isHi ? 'किसी भी उपयोगकर्ता को पोर्टल की सुरक्षा को नुकसान पहुँचाने, अनधिकृत तरीके से सिस्टम में प्रवेश करने, डेटा बदलने या सिस्टम को बाधित करने का प्रयास नहीं करना चाहिए।' : 'No user should attempt to damage the security of the portal, access the system in an unauthorized manner, alter data, or disrupt the system.'}
            {isHi ? 'यदि किसी उपयोगकर्ता को पोर्टल में कोई सुरक्षा संबंधी समस्या दिखाई देती है, तो उसे सार्वजनिक रूप से साझा करने के बजाय संबंधित प्राधिकारी को सूचित करना चाहिए।' : 'If a user identifies any security-related issue in the portal, they should inform the concerned authority instead of sharing it publicly.'}</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 inline-block mt-2">
              <p><strong>Security Contact:</strong></p>
              <p>{isHi ? 'ई-मेल:' : 'Email:'} amazpalmora@gmail.com</p>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">7. {isHi ? 'वेबसाइट रखरखाव एवं सेवा उपलब्धता सूचना' : 'Website Maintenance Notice'}</h2>
            <p>{isHi ? 'पोर्टल को बेहतर और सुरक्षित बनाए रखने के लिए समय-समय पर रखरखाव और तकनीकी कार्य किया जा सकता है।' : 'Maintenance and technical work may be carried out from time to time to keep the portal better and secure.'}
            {isHi ? 'रखरखाव के दौरान पोर्टल की कुछ सेवाएं अस्थायी रूप से बंद या सीमित हो सकती हैं।' : 'During maintenance, some services of the portal may be temporarily suspended or limited.'}
            {isHi ? 'तकनीकी समस्या, सर्वर समस्या, नेटवर्क समस्या, आपातकालीन रखरखाव या अन्य परिस्थितियों के कारण भी पोर्टल की सेवाएं कुछ समय के लिए उपलब्ध नहीं हो सकती हैं।' : 'Due to technical issues, server issues, network issues, emergency maintenance, or other circumstances, portal services may be unavailable for some time.'}
            {isHi ? 'जहाँ संभव होगा, निर्धारित रखरखाव की जानकारी उपयोगकर्ताओं को पहले दी जाएगी।' : 'Where possible, users will be informed in advance about scheduled maintenance.'}
            {isHi ? 'आपातकालीन स्थिति में सेवाओं को बिना पूर्व सूचना के भी अस्थायी रूप से बंद किया जा सकता है।' : 'In emergency situations, services may be temporarily suspended without prior notice.'}</p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">8. {isHi ? 'अभिगम्यता विवरण' : 'Accessibility Statement'}</h2>
            <p>{isHi ? 'इस पोर्टल को अधिक से अधिक लोगों के लिए आसानी से उपयोग करने योग्य बनाने का प्रयास किया गया है।' : 'Efforts have been made to make this portal easily usable for as many people as possible.'}
            {isHi ? 'पोर्टल को विभिन्न स्क्रीन आकार और सामान्य उपकरणों पर उपयोग करने योग्य बनाने का प्रयास किया जाता है।' : 'Efforts are made to make the portal usable across various screen sizes and common devices.'}
            {isHi ? 'जहाँ संभव हो, स्पष्ट भाषा, उचित टेक्स्ट आकार, रंगों में पर्याप्त अंतर और सरल नेविगेशन जैसी सुविधाओं का ध्यान रखा जाता है।' : 'Where possible, features such as clear language, appropriate text size, adequate color contrast, and simple navigation are taken care of.'}
            {isHi ? 'यदि किसी उपयोगकर्ता को पोर्टल का उपयोग करने में किसी प्रकार की अभिगम्यता संबंधी समस्या आती है, तो वह नीचे दिए गए संपर्क माध्यम से इसकी जानकारी दे सकता है।' : 'If a user faces any accessibility-related issue while using the portal, they may report it through the contact channel provided below.'}</p>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 inline-block mt-2">
              <p><strong>Accessibility Contact:</strong></p>
              <p>{isHi ? 'ई-मेल:' : 'Email:'} amazpalmora@gmail.com</p>
            </div>
          </section>

          <hr className="border-slate-200" />

          {/* Final Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">{isHi ? 'नीति में बदलाव' : 'Policy Changes'}</h2>
            <p>{isHi ? 'आवश्यकता पड़ने पर इन नीतियों में समय-समय पर बदलाव किया जा सकता है। किसी महत्वपूर्ण बदलाव की स्थिति में पोर्टल पर इसकी जानकारी उपलब्ध कराई जा सकती है।' : 'These policies may be changed from time to time as required. In case of any significant change, information regarding the same may be made available on the portal.'}</p>
            <p>{isHi ? 'उपयोगकर्ताओं को समय-समय पर इन नीतियों को देखने की सलाह दी जाती है।' : 'Users are advised to review these policies from time to time.'}</p>
            <div className="mt-6 text-sm text-slate-500">
              <p><strong>{isHi ? 'अंतिम अपडेट:' : 'Last Updated:'}</strong> {new Date().toLocaleDateString('en-IN')}</p>
              <p><strong>{isHi ? 'संबंधित प्राधिकारी:' : 'Concerned Authority:'}</strong> {isHi ? 'जिला पंचायत अल्मोड़ा' : 'District Panchayat Almora'}</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
