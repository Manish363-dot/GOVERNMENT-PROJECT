import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function VisionMissionPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const coreValues = isHi
    ? [
        {
          num: '1',
          title: 'जनसेवा एवं नागरिक कल्याण',
          desc: 'नागरिकों का कल्याण हमारे कार्यों का केंद्र है। हमारा प्रयास ग्रामीण समुदायों की आवश्यकताओं को समझना और ऐसी पहलों को प्रोत्साहित करना है जो सार्वजनिक सुविधाओं तथा आवश्यक सेवाओं तक उनकी पहुँच बेहतर बनाएँ। नागरिक-केंद्रित दृष्टिकोण अपनाकर हम प्रशासन को अधिक संवेदनशील, सुलभ और प्रभावी बनाने की दिशा में कार्य करते हैं। हमारा उद्देश्य अल्मोड़ा जिले के ग्रामीण क्षेत्रों में रहने वाले लोगों के जीवन स्तर को बेहतर बनाने में योगदान देना है।'
        },
        {
          num: '2',
          title: 'समावेशी एवं संतुलित विकास',
          desc: 'हमारा मानना है कि विकास के अवसर समाज के प्रत्येक वर्ग और जिले के सभी क्षेत्रों तक पहुँचने चाहिए। हमारा दृष्टिकोण ग्रामीण क्षेत्रों की संतुलित प्रगति, गाँवों में आवश्यक सुविधाओं के विस्तार और विभिन्न समुदायों की जरूरतों पर ध्यान देने पर आधारित है। हम ऐसी विकास पहलों को प्रोत्साहित करना चाहते हैं जिनसे पूरे समुदाय को लाभ मिले और एक अधिक समान, जुड़ा हुआ तथा समृद्ध ग्रामीण वातावरण विकसित हो।'
        },
        {
          num: '3',
          title: 'स्वच्छता एवं पर्यावरण संरक्षण',
          desc: 'अल्मोड़ा की प्राकृतिक सुंदरता और पर्यावरणीय संसाधनों की रक्षा करना सतत विकास का एक महत्वपूर्ण हिस्सा है। हम स्वच्छता, जिम्मेदार अपशिष्ट प्रबंधन, पर्यावरण के प्रति जागरूकता और स्वच्छ परिवेश बनाए रखने में सामुदायिक भागीदारी को प्रोत्साहित करते हैं। पर्यावरण-अनुकूल आदतों और स्थानीय स्वच्छता पहलों को बढ़ावा देकर हमारा लक्ष्य जिले की प्राकृतिक विरासत को सुरक्षित रखना और वर्तमान तथा आने वाली पीढ़ियों के लिए स्वच्छ एवं स्वस्थ गाँवों के निर्माण में योगदान देना है।'
        },
        {
          num: '4',
          title: 'पारदर्शिता एवं जवाबदेही',
          desc: 'हम जिम्मेदार प्रशासन, स्पष्ट प्रक्रियाओं और सार्वजनिक सेवाओं में जवाबदेही को महत्व देते हैं। हमारा उद्देश्य नागरिकों को सार्वजनिक जानकारी तक बेहतर पहुँच उपलब्ध कराने, उनकी समस्याओं के समयबद्ध निस्तारण को प्रोत्साहित करने और स्थानीय शासन के प्रति विश्वास मजबूत करने की दिशा में कार्य करना है। व्यवस्थित प्रक्रियाओं और जिम्मेदार निर्णयों को बढ़ावा देकर हम यह सुनिश्चित करने का प्रयास करते हैं कि विकास संबंधी गतिविधियाँ जनहित और सामुदायिक कल्याण पर केंद्रित रहें।'
        },
        {
          num: '5',
          title: 'डिजिटल नवाचार एवं सुलभ सेवाएँ',
          desc: 'हम मानते हैं कि तकनीक सार्वजनिक सेवाओं को अधिक सरल, सुलभ और व्यवस्थित बनाने में महत्वपूर्ण भूमिका निभा सकती है। उपयुक्त डिजिटल पहलों के माध्यम से हमारा उद्देश्य सार्वजनिक जानकारी की उपलब्धता बेहतर बनाना, सेवा संबंधी प्रक्रियाओं को सरल करना और नागरिकों को स्थानीय प्रशासन से जुड़ने के सुविधाजनक माध्यम उपलब्ध कराने में योगदान देना है। हमारा ध्यान तकनीक के जिम्मेदार उपयोग पर है, ताकि प्रशासनिक कार्यक्षमता, संवाद और ग्रामीण समुदायों की सेवाओं तक पहुँच में सुधार हो सके।'
        },
        {
          num: '6',
          title: 'जनभागीदारी एवं सहयोग',
          desc: 'हमारा विश्वास है कि स्थायी विकास तभी संभव है जब नागरिक, स्थानीय जनप्रतिनिधि, सामुदायिक समूह और सरकारी विभाग मिलकर कार्य करें। जनभागीदारी से स्थानीय आवश्यकताओं को बेहतर ढंग से समझने, साझा जिम्मेदारी विकसित करने और विकास पहलों के प्रति सामुदायिक स्वामित्व को मजबूत करने में सहायता मिलती है। हम सहयोग और सामूहिक प्रयासों को प्रोत्साहित करना चाहते हैं, ताकि नागरिक अपने गाँवों के सुधार और अल्मोड़ा के उज्ज्वल भविष्य के निर्माण में सक्रिय योगदान दे सकें।'
        },
        {
          num: '7',
          title: 'ग्रामीण सशक्तिकरण एवं स्थानीय विकास',
          desc: 'सशक्त ग्रामीण समुदाय जिले की समग्र प्रगति के लिए आवश्यक हैं। हमारा उद्देश्य स्थानीय विकास को बढ़ावा देना, ग्रामीण आर्थिक गतिविधियों को सहयोग देना और आत्मनिर्भरता तथा आजीविका में सुधार के अवसरों को प्रोत्साहित करना है। स्थानीय कौशल, संसाधनों और सामुदायिक क्षमताओं को महत्व देते हुए हम अल्मोड़ा की विशिष्ट पहचान एवं सांस्कृतिक समृद्धि को सुरक्षित रखते हुए सतत विकास की दिशा में कार्य करना चाहते हैं।'
        },
        {
          num: '8',
          title: 'गुणवत्तापूर्ण सेवाएँ एवं निरंतर सुधार',
          desc: 'हमारा मानना है कि नागरिकों की बदलती आवश्यकताओं के अनुरूप सार्वजनिक सेवाओं में निरंतर सुधार होना चाहिए। हमारा दृष्टिकोण सेवाओं में मौजूद कमियों को पहचानने, व्यावहारिक समाधान खोजने और जनसुविधाओं के बेहतर संचालन के लिए समन्वय को प्रोत्साहित करने पर आधारित है। अनुभव, सहयोग और जिम्मेदार क्रियान्वयन के माध्यम से हम प्रभावी स्थानीय शासन और ग्रामीण समुदायों के लिए बेहतर परिणाम प्राप्त करने की दिशा में योगदान देना चाहते हैं।'
        }
      ]
    : [
        {
          num: '1',
          title: 'Public Service & Citizen Welfare',
          desc: 'The welfare of citizens is at the heart of our work. We strive to understand the needs of rural communities and support initiatives that improve access to public facilities and essential services. By maintaining a citizen-focused approach, we aim to make public administration more responsive, approachable, and effective. Our goal is to contribute to a better quality of life for people living across the villages of Almora district.'
        },
        {
          num: '2',
          title: 'Inclusive & Balanced Development',
          desc: 'We believe that development should create opportunities for every community and reach all parts of the district. Our approach emphasizes balanced rural progress, improved village facilities, and attention to the needs of different sections of society. We aim to encourage development initiatives that benefit communities collectively and help create a more equitable, connected, and prosperous rural environment.'
        },
        {
          num: '3',
          title: 'Cleanliness & Environmental Sustainability',
          desc: 'Protecting the natural beauty and environmental resources of Almora is an important part of sustainable development. We encourage cleanliness, responsible waste management, environmental awareness, and community participation in maintaining clean surroundings. By promoting environmentally responsible practices and supporting local cleanliness initiatives, we aim to preserve the district\'s natural heritage and contribute to healthier, cleaner villages for present and future generations.'
        },
        {
          num: '4',
          title: 'Transparency & Accountability',
          desc: 'We value responsible administration, clear processes, and accountability in public service delivery. Our aim is to promote better access to public information, encourage the timely handling of citizen concerns, and strengthen public confidence in local governance. By supporting systematic processes and responsible decision-making, we strive to ensure that development initiatives remain focused on public needs and community welfare.'
        },
        {
          num: '5',
          title: 'Digital Innovation & Accessibility',
          desc: 'We recognize the importance of technology in making public services easier to access and manage. Through suitable digital initiatives, we aim to improve the availability of information, simplify service-related processes, and provide convenient ways for citizens to connect with local administration. Our focus is on using technology responsibly to support efficient administration, improve communication, and help bridge the gap between public institutions and rural communities.'
        },
        {
          num: '6',
          title: 'Community Participation & Cooperation',
          desc: 'We believe that lasting development is possible when citizens, local representatives, community groups, and government departments work together. Public participation helps identify genuine local needs, encourages shared responsibility, and strengthens community ownership of development initiatives. We aim to promote cooperation and collective action so that people can contribute actively to improving their villages and building a stronger future for Almora.'
        },
        {
          num: '7',
          title: 'Rural Empowerment & Local Growth',
          desc: 'Strong rural communities are essential for the overall progress of the district. We aim to encourage local development, support rural economic activities, and promote opportunities that contribute to self-reliance and improved livelihoods. By recognizing local skills, resources, and community strengths, we seek to support sustainable growth while preserving the distinctive identity and cultural richness of Almora.'
        },
        {
          num: '8',
          title: 'Quality Services & Continuous Improvement',
          desc: 'We believe public services should continuously improve to meet the changing needs of citizens. Our approach focuses on identifying service gaps, encouraging practical solutions, and supporting better coordination in the delivery of public facilities. Through learning, cooperation, and responsible implementation, we aim to contribute to more effective local governance and improved outcomes for rural communities.'
        }
      ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* ── Top Government Banner (Slim) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0c2a52] text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800 shadow-xs">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-full shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-white tracking-tight leading-none">
              {isHi ? 'हमारा मिशन एवं विज़न' : 'Our Mission & Vision'}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Main Content Area (Clean Text Layout - Full Width Container) ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 lg:p-12 space-y-10">

          {/* Section 1: Our Mission */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900">
              {isHi ? 'हमारा मिशन' : 'Our Mission'}
            </h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा का प्रमुख मिशन जिले के ग्रामीण क्षेत्रों में समावेशी, सतत एवं संतुलित विकास को बढ़ावा देना है। हमारा उद्देश्य ग्रामीण समुदायों के जीवन स्तर में सुधार लाना, सार्वजनिक बुनियादी ढाँचे को मजबूत करना, आवश्यक जनसुविधाओं को बेहतर बनाना, स्वच्छता को प्रोत्साहित करना, प्राकृतिक पर्यावरण का संरक्षण करना तथा ग्रामीण विकास से जुड़ी पहलों के प्रभावी क्रियान्वयन में योगदान देना है।'
                  : 'Zila Panchayat Almora is committed to promoting inclusive, sustainable, and balanced development across the rural regions of Almora district. Our mission is to improve the quality of life of rural communities by strengthening public infrastructure, improving essential facilities, encouraging cleanliness, protecting the natural environment, and supporting the effective implementation of rural development initiatives.'}
              </p>
              <p>
                {isHi
                  ? 'हम जिम्मेदार प्रशासन, जनभागीदारी और डिजिटल तकनीक के उचित उपयोग के माध्यम से सार्वजनिक सेवाओं को अधिक सुलभ, सरल और नागरिक-केंद्रित बनाने के लिए प्रयासरत हैं। स्थानीय निकायों, सरकारी विभागों, जनप्रतिनिधियों और नागरिकों के साथ समन्वय स्थापित करके हमारा लक्ष्य स्थानीय आवश्यकताओं को समझना और उनके लिए व्यावहारिक एवं दीर्घकालिक समाधान की दिशा में कार्य करना है।'
                  : 'We aim to make public services more accessible, efficient, and citizen-friendly by promoting responsible administration, community participation, and the appropriate use of digital technology. Through coordination with local bodies, government departments, elected representatives, and citizens, we strive to identify local needs and work towards practical, long-term solutions.'}
              </p>
              <p>
                {isHi
                  ? 'हमारा मिशन ग्रामीण आजीविका को प्रोत्साहित करने, स्थानीय आर्थिक गतिविधियों को सहयोग देने, गाँवों के बुनियादी ढाँचे में सुधार करने और प्रत्येक समुदाय को विकास की प्रक्रिया में भागीदार बनाने पर भी केंद्रित है। हमारा मानना है कि वास्तविक विकास गाँवों से शुरू होता है और जिले की प्रगति में प्रत्येक नागरिक की महत्वपूर्ण भूमिका होती है।'
                  : 'Our mission also focuses on strengthening rural livelihoods, supporting local economic activities, improving village infrastructure, and creating an environment where every community can participate in the development process. We believe that meaningful development begins at the village level and that every citizen should have the opportunity to contribute to the progress of the district.'}
              </p>
            </div>
          </section>

          {/* Section 2: Our Vision */}
          <section className="space-y-4 border-t border-slate-200/80 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900">
              {isHi ? 'हमारा विज़न' : 'Our Vision'}
            </h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                {isHi
                  ? 'हमारा विज़न एक स्वच्छ, समृद्ध, आत्मनिर्भर और विकसित अल्मोड़ा का निर्माण करना है, जहाँ प्रत्येक गाँव को बेहतर जनसुविधाएँ, आवश्यक सेवाएँ और सतत विकास के अवसर प्राप्त हों। हम ऐसे ग्रामीण समुदायों की कल्पना करते हैं जो आधुनिक आवश्यकताओं के अनुरूप आगे बढ़ते हुए अपनी सांस्कृतिक विरासत, प्राकृतिक सुंदरता और पारंपरिक मूल्यों को भी सुरक्षित रखें।'
                  : 'Our vision is to build a clean, prosperous, self-reliant, and well-developed Almora where every village has access to improved public facilities, essential services, and opportunities for sustainable growth. We aspire to create rural communities that are equipped to meet modern challenges while preserving their cultural heritage, natural beauty, and traditional values.'}
              </p>
              <p>
                {isHi
                  ? 'हमारा लक्ष्य ऐसा भविष्य बनाना है जहाँ विकास का लाभ समाज के सभी वर्गों तक पहुँचे, सार्वजनिक सेवाएँ नागरिकों के लिए सुलभ हों और लोग स्थानीय निर्णयों तथा सामुदायिक सुधार में सक्रिय भागीदारी निभाएँ। पर्यावरण के प्रति जिम्मेदारी को बढ़ावा देकर, गाँवों के बुनियादी ढाँचे को मजबूत करके, डिजिटल सेवाओं की पहुँच बेहतर बनाकर और स्थानीय विकास पहलों को प्रोत्साहित करके हम एक सशक्त एवं आत्मनिर्भर ग्रामीण जिले के निर्माण में योगदान देना चाहते हैं।'
                  : 'We envision a future in which development reaches every section of society, public services are accessible to all, and citizens actively participate in local decision-making and community improvement. By encouraging environmental responsibility, strengthening village-level infrastructure, promoting digital accessibility, and supporting local development initiatives, we aim to contribute to a stronger and more resilient rural district.'}
              </p>
              <p>
                {isHi
                  ? 'हमारा दीर्घकालिक विज़न अल्मोड़ा को उत्तराखंड में जनभागीदारी पर आधारित ग्रामीण विकास का एक उत्कृष्ट उदाहरण बनाना है, जहाँ प्रगति का मूल्यांकन केवल सड़कों और सुविधाओं के निर्माण से नहीं, बल्कि जीवन स्तर में सुधार, पर्यावरण संरक्षण, जनभागीदारी और नागरिकों के कल्याण से भी किया जाए।'
                  : 'Our long-term vision is to make Almora a model of community-driven rural development in Uttarakhand—where progress is measured not only by infrastructure and facilities but also by improved living standards, environmental sustainability, public participation, and the well-being of its people.'}
              </p>
            </div>
          </section>

          {/* Section 3: Our Core Values (8 Values) */}
          <section className="space-y-6 border-t border-slate-200/80 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900">
              {isHi ? 'हमारे मूल मूल्य' : 'Our Core Values'}
            </h2>

            <div className="space-y-6">
              {coreValues.map((val) => (
                <div key={val.num} className="text-sm sm:text-base leading-relaxed space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {val.num}. {val.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Our Commitment */}
          <section className="space-y-4 border-t border-slate-200/80 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900">
              {isHi ? 'हमारी प्रतिबद्धता' : 'Our Commitment'}
            </h2>
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा जिले के ग्रामीण समुदायों के सामाजिक, आर्थिक और बुनियादी ढाँचे से जुड़े विकास के लिए कार्य करने हेतु प्रतिबद्ध है। हम समझते हैं कि वास्तविक प्रगति के लिए निरंतर प्रयास, सहयोग, जिम्मेदार योजना और नागरिकों की सक्रिय भागीदारी आवश्यक है।'
                  : 'Zila Panchayat Almora is dedicated to working towards the social, economic, and infrastructural development of the district\'s rural communities. We recognize that meaningful progress requires consistent effort, cooperation, responsible planning, and active participation from the public.'}
              </p>
              <p>
                {isHi
                  ? 'हमारी प्रतिबद्धता ऐसी पहलों को प्रोत्साहित करना है जो गाँवों की सुविधाओं में सुधार करें, आवश्यक सेवाओं को मजबूत बनाएँ, स्वच्छता को बढ़ावा दें, पर्यावरण की रक्षा करें और नागरिकों के कल्याण में योगदान दें। समुदायों, स्थानीय जनप्रतिनिधियों और संबंधित सरकारी विभागों के साथ समन्वय के माध्यम से हमारा लक्ष्य स्थानीय प्राथमिकताओं पर ध्यान देना और सतत विकास को आगे बढ़ाना है।'
                  : 'We are committed to encouraging initiatives that improve village facilities, strengthen essential services, promote cleanliness, protect the environment, and support the welfare of citizens. By working in coordination with communities, local representatives, and relevant government departments, we aim to address local priorities and contribute to sustainable development.'}
              </p>
              <p>
                {isHi
                  ? 'हम जनकल्याण को अपने प्रयासों के केंद्र में रखते हुए ऐसे अल्मोड़ा के निर्माण की दिशा में कार्य करना चाहते हैं जहाँ गाँव सशक्त हों, सेवाएँ अधिक सुलभ हों, समुदाय आत्मनिर्भर बनें और आने वाली पीढ़ियों को स्वच्छ, स्वस्थ एवं समृद्ध वातावरण प्राप्त हो।'
                  : 'Our commitment is to keep public welfare at the center of our efforts and to work towards an Almora where villages are stronger, services are more accessible, communities are empowered, and future generations can benefit from a cleaner, healthier, and more prosperous environment.'}
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
