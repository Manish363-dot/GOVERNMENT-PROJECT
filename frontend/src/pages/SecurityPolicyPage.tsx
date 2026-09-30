import { useTranslation } from 'react-i18next';
import { Shield, Lock, FileKey, Server, Users } from 'lucide-react';
import { useEffect } from 'react';

export function SecurityPolicyPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const policies = [
    {
      icon: <Lock className="w-6 h-6 text-emerald-500" />,
      titleEn: "End-to-End Encryption (E2EE)",
      titleHi: "एंड-टू-एंड एन्क्रिप्शन",
      descEn: "All live tracking data and telemetry metrics transmitted from GPS devices to our servers are fully encrypted. This ensures that vehicle locations cannot be intercepted during transit.",
      descHi: "GPS उपकरणों से सर्वर तक प्रसारित होने वाला सभी लाइव ट्रैकिंग डेटा पूरी तरह से एन्क्रिप्टेड है। यह सुनिश्चित करता है कि रास्ते में वाहन की लोकेशन से कोई छेड़छाड़ नहीं की जा सकती।"
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      titleEn: "Strict Access Control",
      titleHi: "सख्त एक्सेस नियंत्रण (RBAC)",
      descEn: "Only authorized government officials and designated department administrators have access to historical logs and route replays. Citizens can only track vehicles in active operational zones.",
      descHi: "केवल अधिकृत सरकारी अधिकारियों और नामित विभाग प्रशासकों के पास ऐतिहासिक लॉग और रूट रिप्ले तक पहुंच है। आम नागरिक केवल सक्रिय क्षेत्रों में वाहनों को ट्रैक कर सकते हैं।"
    },
    {
      icon: <Server className="w-6 h-6 text-amber-500" />,
      titleEn: "Secure Cloud Infrastructure",
      titleHi: "सुरक्षित क्लाउड इंफ्रास्ट्रक्चर",
      descEn: "The portal is hosted on secure, compliant cloud environments conforming to Indian government (MeitY) guidelines. Database backups are encrypted and stored safely.",
      descHi: "पोर्टल सुरक्षित और भारत सरकार (MeitY) के दिशानिर्देशों के अनुरूप क्लाउड वातावरण पर होस्ट किया गया है। डेटाबेस बैकअप एन्क्रिप्टेड और सुरक्षित रूप से सहेजे जाते हैं।"
    },
    {
      icon: <FileKey className="w-6 h-6 text-purple-500" />,
      titleEn: "Audit Trails & Monitoring",
      titleHi: "ऑडिट ट्रेल और निगरानी",
      descEn: "Every login, configuration change, and device assignment is logged in our immutable audit trails to prevent unauthorized modifications to the vehicle register.",
      descHi: "वाहन रजिस्टर में अनधिकृत संशोधनों को रोकने के लिए प्रत्येक लॉगिन, बदलाव और डिवाइस असाइनमेंट को हमारे ऑडिट ट्रेल में सुरक्षित रूप से दर्ज किया जाता है।"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      {/* Header Banner */}
      <div className="bg-navy-950 text-white pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-800 border-2 border-emerald-500/30 mb-6 shadow-xl shadow-emerald-900/20">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-poppins mb-4 tracking-tight">
            {isHi ? 'डिजिटल सुरक्षा एवं डेटा गोपनीयता नीति' : 'Digital Security & Data Privacy Policy'}
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            {isHi 
              ? 'जिला पंचायत अल्मोड़ा के GIS टेलीमैटिक्स और नागरिक शिकायत निवारण पोर्टल के लिए हमारी सुरक्षा प्रतिबद्धता।' 
              : 'Our commitment to data protection and cybersecurity for the GIS Telematics and Citizen Grievance Redressal Portal of District Panchayat Almora.'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Intro paragraph */}
            <div className="text-slate-700 leading-relaxed text-sm sm:text-base text-center sm:text-left">
              {isHi 
                ? 'उत्तराखंड सरकार नागरिकों और प्रशासनिक डेटा की सुरक्षा को सर्वोच्च प्राथमिकता देती है। इस पोर्टल को राष्ट्रीय सुरक्षा मानकों और GIGW (भारत सरकार की वेबसाइटों के लिए दिशानिर्देश) का पालन करते हुए डिज़ाइन किया गया है।'
                : 'The Government of Uttarakhand places the highest priority on the security of citizen and administrative data. This portal has been designed adhering to national security standards and GIGW (Guidelines for Indian Government Websites).'}
            </div>

            <div className="h-px bg-slate-200 w-full my-8"></div>

            {/* Policy Points */}
            <div className="grid sm:grid-cols-2 gap-8">
              {policies.map((policy, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                      {policy.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">
                      {isHi ? policy.titleHi : policy.titleEn}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {isHi ? policy.descHi : policy.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-200 w-full my-8"></div>

            {/* Contact Security Team */}
            <div className="bg-[#f0f4f9] rounded-lg p-6 border border-slate-200 text-center">
              <h4 className="font-bold text-navy-900 mb-2">
                {isHi ? 'सुरक्षा संबंधी चिंता की रिपोर्ट करें' : 'Report a Security Concern'}
              </h4>
              <p className="text-sm text-slate-600 mb-4 max-w-lg mx-auto">
                {isHi 
                  ? 'यदि आपको इस पोर्टल में किसी भी प्रकार की तकनीकी भेद्यता या डेटा सुरक्षा से संबंधित चिंता दिखाई देती है, तो कृपया हमारी तकनीकी टीम से संपर्क करें।'
                  : 'If you notice any technical vulnerability or have concerns regarding data security on this portal, please reach out to our technical team immediately.'}
              </p>
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-300 font-mono text-sm font-bold text-navy-800 shadow-sm">
                <span>IT Cell:</span>
                <a href="mailto:amazpalmora@gmail.com" className="text-blue-600 hover:underline">amazpalmora@gmail.com</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
