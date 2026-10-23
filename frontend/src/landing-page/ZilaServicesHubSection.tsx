import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Trash2, 
  Store, 
  FileText, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Lock,
  ExternalLink,
  Award
} from 'lucide-react';

export const ZilaServicesHubSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <section id="services-hub" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-3">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? 'ई-गवर्नेंस एवं विभागीय पोर्टल' : 'e-Governance & Citizen Portals'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isHi ? 'जिला पंचायत की प्रमुख सेवाएं एवं डिजिटल पोर्टल' : 'Major Civic Services & Digital Portals'}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 to-blue-600 mx-auto rounded-full mt-3 mb-4" />
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isHi
              ? 'नागरिकों की सुविधा हेतु जिला पंचायत अल्मोड़ा द्वारा संचालित आधुनिक तकनीक आधारित स्वच्छता, शिकायत निवारण, एवं विभागीय सेवाएं।'
              : 'Empowering Almora citizens through digital governance, live sanitation management, transparent grievance handling, and departmental services.'}
          </p>
        </div>

        {/* 2 Primary Featured Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          
          {/* PORTAL 1: SAFAI PORTAL (Active & Live) */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isHi ? 'सक्रिय पोर्टल (Live Portal)' : 'Active Portal'}
                </span>
                <span className="text-xs text-emerald-200/80 font-mono">
                  SWM & Grievance Cell
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {isHi ? 'ठोस अपशिष्ट प्रबंधन एवं सफाई पोर्टल' : 'Solid Waste Management & Safai Portal'}
                </h3>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-6">
                {isHi
                  ? 'जनपद अल्मोड़ा के ग्रामीण व उपनगरीय क्षेत्रों में कचरा संकलन, शिकायत पंजीकरण, जीपीएस वाहन लाइव ट्रैकिंग, कचरा पृथक्करण दिशा-निर्देश, एवं स्वच्छता शपथ प्रणाली।'
                  : 'District-wide rural waste collection, live GPS sanitation fleet tracking, instant citizen grievance registration & tracking, and Swachhata pledge.'}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'ऑनलाइन शिकायत पंजीकरण' : 'Online Grievance Filing'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'वाहन लाइव जीपीएस ट्रैकिंग' : 'Live Fleet Tracking'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'दैनिक सफाई कार्य प्रगति' : 'Daily Work Media Logs'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'स्वच्छता शपथ व प्रमाण-पत्र' : 'Swachhata Pledge & Certificate'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-3">
              <Link
                to="/safai-portal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-colors shadow-md"
              >
                <span>{isHi ? 'सफाई पोर्टल में प्रवेश करें' : 'Open Safai Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/complaints/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 transition-colors border border-white/15"
              >
                <span>{isHi ? 'शिकायत दर्ज करें' : 'File Complaint'}</span>
              </Link>
            </div>
          </div>

          {/* PORTAL 2: COMMERCIAL RENTAL & LEASE (Coming Soon / Future System) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold tracking-wide">
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  {isHi ? 'आगामी डिजिटल प्रणाली (Coming Soon)' : 'Under Development (Coming Soon)'}
                </span>
                <span className="text-xs text-indigo-300/80 font-mono">
                  Asset & Lease Management
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {isHi ? 'पंचायती परिसंपत्ति एवं दुकान किराया प्रणाली' : 'Commercial Asset & Rental Management'}
                </h3>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा की व्यावसायिक दुकानों, मार्केट परिसरों, एवं डाक बंगलों का पारदर्शी डिजिटल आवंटन, लीज अनुबंध, मासिक किराया चालान, व सुरक्षित ऑनलाइन भुगतान।'
                  : 'Automated digital inventory, tenant lease registry, computerized monthly rent billing, and secure government payment gateway for Zila Panchayat commercial shops & assets.'}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? 'दुकान व संपत्ति डायरेक्टरी' : 'Shop & Property Registry'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? 'डिजिटल रेंट चालान व रसीद' : 'Online Invoicing & Receipts'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? 'किरायेदार सुरक्षित डैशबोर्ड' : 'Secure Tenant Portal'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? '256-बिट बैंक-ग्रेड सुरक्षा' : 'Bank-Grade Cyber Security'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-indigo-800/60 flex items-center justify-between">
              <span className="text-xs text-amber-300/90 font-medium">
                {isHi ? '⚙️ सुरक्षा व वित्तीय ऑडिट के तहत विकासाधीन' : '⚙️ Under Development with Full Cyber Security'}
              </span>
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-semibold text-xs sm:text-sm border border-slate-700 cursor-not-allowed"
              >
                <span>{isHi ? 'जल्द उपलब्ध होगा' : 'Coming Soon'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* 4 Secondary Essential Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              titleHi: 'ई-निविदाएं एवं खरीद',
              titleEn: 'e-Tenders & Procurement',
              descHi: 'जिला पंचायत के निर्माण कार्यों की पारदर्शी निविदाएं एवं विज्ञप्तियां।',
              descEn: 'Transparent e-tendering for civil contracts and rural infrastructure.',
              icon: Briefcase,
              link: '#notices',
            },
            {
              titleHi: '15वां वित्त आयोग कार्य',
              titleEn: '15th Finance Commission',
              descHi: 'ग्रामीण पेयजल, स्वच्छता व अवसंरचना विकास परियोजनाओं का विवरण।',
              descEn: 'Central grants for rural drinking water, sanitation, and village roads.',
              icon: Award,
              link: '/our-initiative',
            },
            {
              titleHi: 'उपनियम एवं नियमावली',
              titleEn: 'Bylaws & Regulations',
              descHi: 'स्वच्छता उपनियम 2026 एवं ठोस अपशिष्ट प्रबंधन नियम व विनियम।',
              descEn: 'Cleanliness Bylaws 2026, user fees, and civic enforcement.',
              icon: FileText,
              link: '/cleanliness-bylaws',
            },
            {
              titleHi: 'नागरिक अधिकार व आरटीआई',
              titleEn: 'Citizen Charter & RTI',
              descHi: 'सूचना का अधिकार (RTI) नियमावली, लोक सूचना अधिकारी एवं अपील।',
              descEn: 'Right to Information, Public Information Officers, and Citizen Charter.',
              icon: ShieldCheck,
              link: '/about-website',
            },
          ].map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <Link
                key={idx}
                to={srv.link}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {isHi ? srv.titleHi : srv.titleEn}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {isHi ? srv.descHi : srv.descEn}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>{isHi ? 'और देखें' : 'View Details'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
});

ZilaServicesHubSection.displayName = 'ZilaServicesHubSection';
