import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Shield, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export function StaffDirectoryPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const leadershipTeam = useMemo(() => [
    {
      title: isHi ? 'अध्यक्ष (Chairperson)' : 'Chairperson',
      subtitle: isHi ? 'जिला पंचायत, अल्मोड़ा' : 'District Panchayat, Almora',
      badge: isHi ? 'सर्वोच्च नेतृत्व' : 'Apex Leadership',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: isHi
        ? 'जिला पंचायत अल्मोड़ा के विकास कार्यों, स्वच्छता नीतियों और जन-कल्याणकारी पहलों का सर्वोच्च नेतृत्व एवं मार्गदर्शन।'
        : 'Leading civic development policies, sanitation initiatives, and rural governance across District Almora.',
      role: isHi ? 'नीति निर्धारण एवं समग्र नेतृत्व' : 'Policy Formulation & Governance',
      office: isHi ? 'अध्यक्ष कक्ष, जिला पंचायत कार्यालय, माल रोड, अल्मोड़ा' : 'Chairperson Secretariat, ZP Almora',
    },
    {
      title: isHi ? 'मुख्य विकास अधिकारी (CDO)' : 'Chief Development Officer (CDO)',
      subtitle: isHi ? 'जिला प्रशासन, अल्मोड़ा' : 'District Administration, Almora',
      badge: isHi ? 'प्रशासनिक समन्वय' : 'Executive Coordination',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: isHi
        ? 'जिले में समस्त ग्रामीण विकास योजनाओं, स्वच्छ भारत मिशन (ग्रामीण) और अंतर-विभागीय समन्वय का प्रशासनिक पर्यवेक्षण।'
        : 'Administrative oversight of rural development, Swachh Bharat Mission (Grameen), and inter-departmental synergy.',
      role: isHi ? 'मुख्य प्रशासनिक एवं विकास समन्वय' : 'District Executive & SWM Supervision',
      office: isHi ? 'विकास भवन, पांडेखोला, अल्मोड़ा' : 'Vikas Bhawan, Pandeykhola, Almora',
    },
    {
      title: isHi ? 'अपर मुख्य अधिकारी (AMA)' : 'Additional Chief Officer (AMA)',
      subtitle: isHi ? 'जिला पंचायत कार्यालय, अल्मोड़ा' : 'Zila Panchayat Office, Almora',
      badge: isHi ? 'कार्यान्वयन प्रमुख' : 'Operations Head',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: isHi
        ? 'जिला पंचायत के दैनिक प्रशासनिक संचालन, ठोस अपशिष्ट प्रबंधन निविदाओं, उपविधियों और वित्तीय अनुश्रवण के प्रभारी।'
        : 'Overall in-charge of operational execution, sanitation bylaws, fleet tenders, and administrative governance.',
      role: isHi ? 'प्रशासनिक संचालन एवं अपशिष्ट प्रबंधन' : 'Administrative Operations & SWM Head',
      office: isHi ? 'अपर मुख्य अधिकारी कक्ष, जिला पंचायत, अल्मोड़ा' : 'AMA Office, ZP Almora',
    },
    {
      title: isHi ? 'जिला पंचायत राज अधिकारी (DPRO)' : 'District Panchayati Raj Officer (DPRO)',
      subtitle: isHi ? 'पंचायती राज विभाग, अल्मोड़ा' : 'Panchayati Raj Dept, Almora',
      badge: isHi ? 'पंचायती राज नोडल' : 'Panchayati Raj Nodal',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      description: isHi
        ? 'ग्राम पंचायतों में स्वच्छता अभियानों, सोक पिट्स, कम्पोस्ट इकाइयों और स्वच्छ भारत मिशन ग्रामीण योजनाओं का क्रियान्वयन।'
        : 'Coordinating gram panchayat cleanliness campaigns, community waste management, and SBM-G schemes.',
      role: isHi ? 'पंचायती स्वच्छता व ग्राम स्तरीय समन्वय' : 'Gram Panchayat Cleanliness Coordination',
      office: isHi ? 'जिला पंचायत राज अधिकारी कार्यालय, अल्मोड़ा' : 'DPRO Office, Almora',
    },
    {
      title: isHi ? 'स्वच्छता एवं जीपीएस नोडल अधिकारी' : 'Sanitation & GPS Telematics Officer',
      subtitle: isHi ? 'सॉलिड वेस्ट मैनेजमेंट सेल, जिला पंचायत अल्मोड़ा' : 'SWM Cell, Zila Panchayat Almora',
      badge: isHi ? 'तकनीकी व मॉनिटरिंग नोडल' : 'Tech & Fleet Nodal',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      description: isHi
        ? 'कचरा संग्रहण वाहनों की रीयल-टाइम जीपीएस ट्रैकिंग (MilliTrack), रूट अनुपालन, एमआरएफ केंद्र प्रबंधन एवं नागरिक शिकायत निवारण।'
        : 'Real-time vehicle GPS fleet monitoring, route compliance, Material Recovery Facilities (MRF), and public grievances.',
      role: isHi ? 'वाहन ट्रैकिंग, रूट प्रबंधन व जन-शिकायत सेल' : 'Fleet Telematics & Grievance Redressal',
      office: isHi ? 'एसडब्ल्यूएम कंट्रोल रूम, जिला पंचायत अल्मोड़ा' : 'SWM Control Room, ZP Almora',
    },
    {
      title: isHi ? 'क्षेत्रीय सुपरवाइजर एवं पर्यावरण मित्र दल' : 'Sanitation Supervisors & Field Team',
      subtitle: isHi ? 'समस्त 11 विकासखंड एवं ग्रामीण बाजार, अल्मोड़ा' : 'All 11 Blocks & Rural Markets, Almora',
      badge: isHi ? 'फील्ड स्वच्छता योद्धा' : 'Sanitation Warriors',
      badgeColor: 'bg-green-100 text-green-900 border-green-300',
      description: isHi
        ? 'हवालबाग, रानीखेत, द्वाराहाट, ताड़ीखेत, भिकियासैंण, चौखुटिया आदि विकासखंडों में प्रतिदिन सुबह कचरा एकत्रीकरण व प्लास्टिक निष्कासन।'
        : 'Frontline field workforce carrying out morning door-to-door segregated collection across Hawalbagh, Ranikhet, Dwarahat, and more.',
      role: isHi ? 'डोर-टू-डोर कचरा एकत्रीकरण व प्लास्टिक रीसाइक्लिंग' : 'Door-to-Door Waste Collection & Sorting',
      office: isHi ? 'विकासखंड वार स्वच्छता डिपो एवं एमआरएफ केंद्र' : 'Block-wise Sanitation Depots & MRF Centers',
    },
  ], [isHi]);

  const blockCoverage = useMemo(() => [
    { name: isHi ? 'हवालबाग (Hawalbagh)' : 'Hawalbagh Block', status: isHi ? 'सक्रिय वाहन व एमआरएफ' : 'Active Fleet & MRF' },
    { name: isHi ? 'द्वाराहाट (Dwarahat)' : 'Dwarahat Block', status: isHi ? 'सक्रिय वाहन व एमआरएफ' : 'Active Fleet & MRF' },
    { name: isHi ? 'रानीखेत (Ranikhet)' : 'Ranikhet Block', status: isHi ? 'सक्रिय वाहन व एमआरएफ' : 'Active Fleet & MRF' },
    { name: isHi ? 'ताड़ीखेत (Tarikhet)' : 'Tarikhet Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'भिकियासैंण (Bhikiyasain)' : 'Bhikiyasain Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'चौखुटिया (Chaukhutiya)' : 'Chaukhutiya Block', status: isHi ? 'सक्रिय वाहन व एमआरएफ' : 'Active Fleet & MRF' },
    { name: isHi ? 'ताकुला (Takula)' : 'Takula Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'सोमेश्वर (Someshwar)' : 'Someshwar Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'लमगड़ा (Lamgara)' : 'Lamgara Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'भैंसियाछाना (Bhaisiachhana)' : 'Bhaisiachhana Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
    { name: isHi ? 'धौलादेवी (Dhaula Devi)' : 'Dhaula Devi Block', status: isHi ? 'सक्रिय वाहन व स्वच्छता दल' : 'Active Fleet & Team' },
  ], [isHi]);

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
                {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff & Officers Directory'}
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
        <div className="space-y-10">

          {/* Key Leadership Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                  {isHi ? 'प्रमुख प्रशासनिक नेतृत्व एवं नोडल अधिकारी' : 'Key Administrative Leadership & Nodal Officers'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {isHi ? 'जिला पंचायत अल्मोड़ा के नीति निर्धारक एवं परिचालन अधिकारी' : 'Policy makers and executive heads of District Panchayat Almora'}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadershipTeam.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${member.badgeColor}`}>
                        {member.badge}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-navy-900 flex items-center justify-center group-hover:bg-navy-900 group-hover:text-amber-400 transition-colors">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-navy-900 leading-snug group-hover:text-blue-900 transition-colors">
                      {member.title}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      {member.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                      {member.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5 text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span className="font-medium">
                        <strong className="text-slate-800">{isHi ? 'दायित्व: ' : 'Role: '}</strong>
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="truncate">{member.office}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block Coverage & Field Team Breakdown */}
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <Briefcase className="w-6 h-6 text-emerald-700" />
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900">
                {isHi ? 'विकासखंड वार स्वच्छता कवरेज एवं क्षेत्रीय दल' : 'Block-wise Sanitation Fleet & Field Team Coverage'}
              </h2>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {isHi
                ? 'जिला पंचायत अल्मोड़ा के अंतर्गत 11 विकासखंडों में डोर-टू-डोर स्वच्छता वाहन एवं पर्यावरण मित्र दल तैनात हैं। प्रत्येक विकासखंड में नोडल सुपरवाइजर द्वारा प्रतिदिन सुबह कचरा एकत्रीकरण का पर्यवेक्षण किया जाता है।'
                : 'Sanitation vehicles and dedicated Paryavaran Mitras operate across all 11 development blocks of Almora under designated block supervisors.'}
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {blockCoverage.map((b, idx) => (
                <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-navy-900 block">{b.name}</span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Assistance & Helpdesk Banner */}
          <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 border border-navy-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {isHi ? 'सचिवालय संपर्क एवं जनसुनवाई' : 'Official Secretariat & Public Hearing'}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  {isHi ? 'जिला पंचायत अल्मोड़ा — प्रशासनिक सचिवालय' : 'District Panchayat Almora — Administrative Secretariat'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {isHi
                    ? 'कार्यालय दिवस में किसी भी प्रशासनिक या ठोस अपशिष्ट प्रबंधन संबंधी सहायता अथवा जनसुनवाई हेतु संपर्क करें।'
                    : 'For official inquiries, tenders, grievance redressal, or public hearings, contact our administrative helpdesk.'}
                </p>
                <div className="mt-2 text-xs text-slate-400 flex items-center justify-center lg:justify-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isHi ? 'जिला पंचायत कार्यालय, माल रोड, अल्मोड़ा, उत्तराखंड - 263601' : 'Zila Panchayat Office, Mall Road, Almora, Uttarakhand - 263601'}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 shrink-0">
                <div className="flex items-center gap-2.5 bg-navy-800/80 border border-navy-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">{isHi ? 'हेल्पलाइन' : 'Toll-Free'}</span>
                    <span className="font-bold text-white">1800-185-1850</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-navy-800/80 border border-navy-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">{isHi ? 'आधिकारिक ईमेल' : 'Official Mail'}</span>
                    <span className="font-bold text-white">zp-almora@uk.gov.in</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-navy-800/80 border border-navy-700/80 px-4 py-2.5 rounded-xl text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-none">{isHi ? 'समय' : 'Working Hours'}</span>
                    <span className="font-bold text-white">10:00 AM - 05:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
