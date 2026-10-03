import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

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
          {isHi ? 'इस वेबसाइट के बारे में' : 'About This Website'}
        </h1>
        <div className="h-1 w-20 bg-amber-500 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-slate-700 leading-relaxed space-y-8 text-sm sm:text-base">
          
          <p>
            {isHi 
              ? <>यह वेबसाइट <strong>जिला पंचायत अल्मोड़ा</strong> द्वारा जिले में सफाई एवं स्वच्छता से संबंधित गतिविधियों को नागरिकों तक आसानी से पहुँचाने और सेवाओं को अधिक व्यवस्थित बनाने के उद्देश्य से विकसित की गई है।</>
              : <>This website has been developed by <strong>District Panchayat Almora</strong> with the objective of making activities related to cleanliness and hygiene easily accessible to the citizens in the district and to make services more organized.</>
            }
          </p>

          <hr className="border-slate-200" />

          {/* Section 1: For Citizens */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">{isHi ? 'नागरिकों के लिए' : 'For Citizens'}</h2>
            <p>
              {isHi 
                ? 'इस पोर्टल के माध्यम से नागरिक जिले में प्रतिदिन होने वाली सफाई एवं स्वच्छता से संबंधित गतिविधियों की जानकारी देख सकते हैं। इसका उद्देश्य नागरिकों को अपने क्षेत्र में चल रहे सफाई कार्यों की जानकारी उपलब्ध कराना और सफाई व्यवस्था में पारदर्शिता बढ़ाना है।'
                : 'Through this portal, citizens can view information about the daily activities related to cleanliness and hygiene in the district. Its objective is to provide citizens with information about the ongoing cleaning work in their area and to increase transparency in the sanitation system.'
              }
              {isHi 
                ? ' नागरिक इस पोर्टल के माध्यम से सफाई से संबंधित समस्या या शिकायत भी दर्ज कर सकते हैं। दर्ज की गई शिकायत संबंधित अधिकारी या विभाग तक पहुँचाई जा सकती है और उपलब्ध होने पर उसकी स्थिति भी देखी जा सकती है।'
                : ' Citizens can also register a problem or complaint related to cleanliness through this portal. The registered complaint can be forwarded to the concerned officer or department, and its status can also be viewed when available.'
              }
            </p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2: Monitoring of Vehicles */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">{isHi ? 'वाहनों की निगरानी' : 'Monitoring of Vehicles'}</h2>
            <p>
              {isHi 
                ? 'पोर्टल में अधिकृत अधिकारियों के लिए सफाई कार्यों में उपयोग किए जा रहे वाहनों की निगरानी और ट्रैकिंग की सुविधा उपलब्ध कराई गई है। इससे संबंधित अधिकारी वाहनों की गतिविधि और स्थिति की निगरानी कर सकते हैं तथा सफाई कार्यों के संचालन को बेहतर तरीके से व्यवस्थित कर सकते हैं।'
                : 'The portal provides authorized officers with the facility to monitor and track the vehicles being used in cleaning operations. With this, the concerned officers can monitor the activity and status of the vehicles and better organize the operation of cleaning works.'
              }
            </p>
          </section>

          <hr className="border-slate-200" />

          {/* Section 3: Objectives */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-navy-800">{isHi ? 'उद्देश्य' : 'Objectives'}</h2>
            <p>
              {isHi ? 'इस पोर्टल का मुख्य उद्देश्य:' : 'The main objective of this portal is to:'}
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isHi ? 'जिले में होने वाली सफाई एवं स्वच्छता गतिविधियों को नागरिकों तक पहुँचाना।' : 'Make cleanliness and hygiene activities happening in the district accessible to citizens.'}</li>
              <li>{isHi ? 'नागरिकों को सफाई संबंधी शिकायत दर्ज करने की सुविधा देना।' : 'Provide a facility for citizens to register cleanliness-related complaints.'}</li>
              <li>{isHi ? 'शिकायतों को संबंधित अधिकारी तक पहुँचाने में सहायता करना।' : 'Assist in forwarding complaints to the concerned officer.'}</li>
              <li>{isHi ? 'सफाई कार्यों में उपयोग होने वाले वाहनों की निगरानी में सहायता करना।' : 'Assist in monitoring the vehicles used in cleaning operations.'}</li>
              <li>{isHi ? 'सफाई व्यवस्था को अधिक व्यवस्थित, पारदर्शी और नागरिक-केंद्रित बनाना।' : 'Make the sanitation system more organized, transparent, and citizen-centric.'}</li>
            </ul>
            <p className="pt-2">
              {isHi 
                ? <>यह पोर्टल <strong>जिला पंचायत अल्मोड़ा</strong> की सफाई एवं स्वच्छता संबंधी गतिविधियों और सेवाओं को डिजिटल माध्यम से नागरिकों तक पहुँचाने की दिशा में एक पहल है।</>
                : <>This portal is an initiative by <strong>District Panchayat Almora</strong> to deliver its cleanliness and hygiene-related activities and services to citizens through a digital medium.</>
              }
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
