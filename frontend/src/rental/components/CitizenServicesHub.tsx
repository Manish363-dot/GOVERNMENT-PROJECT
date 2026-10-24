import React from 'react';
import {
  CreditCard,
  Store,
  FileText,
  BookOpen,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Award,
  PhoneCall,
  Gavel,
  Receipt,
  Download,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const CitizenServicesHub: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { requireAuth } = useAuth();

  const handlePayRentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const el = document.getElementById('quick-pay');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 'quick-pay');
  };

  const secondaryServices = [
    {
      id: 'notices',
      titleHi: 'शासकीय विज्ञप्तियां व आदेश',
      titleEn: 'Official Gazette & Notices',
      descHi: 'दुकान आवंटन, किराया निर्धारण एवं विभागीय सार्वजनिक सूचनाएं।',
      descEn: 'Executive orders, rent revisions, and official circulars.',
      icon: FileText,
      link: '#notices',
      badgeHi: 'अद्यतन आदेश',
      badgeEn: 'Latest Orders',
    },
    {
      id: 'documents',
      titleHi: 'पंचायती राज उपविधियां व प्रारूप',
      titleEn: 'Panchayati Raj Bylaws & Forms',
      descHi: 'दुकान आवंटन नियमावली, शपथ-पत्र एवं लीज अनुबंध प्रारूप।',
      descEn: 'Allotment bylaws, affidavits, and standard lease agreement formats.',
      icon: BookOpen,
      link: '#documents',
      badgeHi: 'विधिक प्रारूप',
      badgeEn: 'Statutory Acts',
    },
    {
      id: 'feedback',
      titleHi: 'नागरिक शिकायत व सुझाव सेल',
      titleEn: 'Citizen Grievance Cell',
      descHi: 'दुकान रखरखाव, बिलिंग या परिसर संबंधी शिकायत का 48 घंटे में समाधान।',
      descEn: 'File grievance for shop maintenance or billing with tracking reference ID.',
      icon: MessageSquare,
      link: '#feedback',
      badgeHi: '48 घंटे में समाधान',
      badgeEn: '48h Resolution',
    },
    {
      id: 'contact',
      titleHi: 'सहायता केंद्र एवं हेल्पलाइन',
      titleEn: 'Helpdesk & Support Center',
      descHi: 'टोल-फ्री हेल्पलाइन: 1800-185-1850 एवं कार्य दिवसों में व्यक्तिगत सहायता।',
      descEn: 'Toll-free helpline 1800-185-1850 and working hours citizen desk.',
      icon: PhoneCall,
      link: '#contact',
      badgeHi: 'निःशुल्क सेवा',
      badgeEn: 'Toll-Free Help',
    },
  ];

  return (
    <section id="services-hub" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Matching Safai Portal Exactly) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-3">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? 'ई-गवर्नेंस एवं विभागीय सेवाएं' : 'e-Governance & Citizen Portals'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-poppins">
            {isHi
              ? 'जिला पंचायत की प्रमुख नागरिक सेवाएं एवं डिजिटल पोर्टल'
              : 'Major Civic Services & Digital Portals'}
          </h2>

          <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 mx-auto rounded-full mt-3 mb-4" />

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-inter">
            {isHi
              ? 'नागरिकों एवं दुकान आवंटियों की सुविधा हेतु जिला पंचायत अल्मोड़ा द्वारा संचालित आधुनिक तकनीक आधारित पारदर्शी किराया भुगतान, ई-आवंटन एवं जन-सुविधाएं।'
              : 'Empowering Almora citizens and commercial tenants through modern digital governance, verified online rent collection, transparent e-auctions, and public amenities.'}
          </p>
        </div>

        {/* 2 Primary Featured Portal Cards (Exact Safai Portal Design) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* FEATURED CARD 1: ONLINE RENT & DUES (Active & Live - Emerald Gradient) */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {isHi ? 'सक्रिय ई-सेवा (Live Portal)' : 'Active Portal'}
                </span>
                <span className="text-xs text-emerald-200/80 font-mono">
                  E-Revenue & Rent Cell
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors font-poppins">
                  {isHi ? 'ई-किराया ऑनलाइन भुगतान एवं चालान प्रणाली' : 'Online Rent Payment & Dues Portal'}
                </h3>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-6 font-inter">
                {isHi
                  ? 'दुकान संख्या अथवा मोबाइल नंबर दर्ज कर तत्काल बकाया किराया देखें, सुरक्षित ऑनलाइन गेटवे द्वारा भुगतान करें और अधिकृत सरकारी डिजिटल रसीद 24x7 डाउनलोड करें।'
                  : 'Instant dues lookup by shop number, online payment via SBI ePay/UPI gateway, and immediate verified digital receipt generation with complete transparency.'}
              </p>

              {/* Feature Highlights with Green Checkmarks */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'ऑनलाइन चालान व बकाया जांच' : 'Online Dues Verification'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'तत्काल अधिकृत डिजिटल रसीद' : 'Verified Digital Receipt'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? '100% सुरक्षित सरकारी गेटवे' : 'Bank-Grade Cyber Security'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isHi ? 'ई-लेजर व भुगतान इतिहास' : 'Download Payment History'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-3">
              <a
                href="#quick-pay"
                onClick={handlePayRentClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-colors shadow-md cursor-pointer"
              >
                <span>{isHi ? 'किराया अभी जमा करें' : 'Pay Rent Online'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#quick-pay"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 transition-colors border border-white/15 cursor-pointer"
              >
                <span>{isHi ? 'बकाया जांचें' : 'Check Dues'}</span>
              </a>
            </div>
          </div>

          {/* FEATURED CARD 2: PUBLIC PROPERTIES & E-AUCTION (Navy / Indigo Gradient) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold tracking-wide">
                  <Gavel className="w-3.5 h-3.5 text-amber-300" />
                  {isHi ? 'सार्वजनिक संपत्ति पंजी (Public Assets)' : 'Public Property Register'}
                </span>
                <span className="text-xs text-indigo-300/80 font-mono">
                  Asset & Lease Management
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors font-poppins">
                  {isHi ? 'व्यापारिक दुकानें, मार्केट परिसर एवं ई-नीलामी' : 'Commercial Assets & E-Auction System'}
                </h3>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-6 font-inter">
                {isHi
                  ? 'जनपद अल्मोड़ा के 11 विकासखंडों में स्थित 240+ दुकानों, बाजारों व सामुदायिक हॉल्स का क्षेत्रफल, मानक किराया विवरण तथा रिक्त दुकानों के पारदर्शी ई-आवंटन की निविदाएं।'
                  : 'Comprehensive directory of 240+ commercial shops and venues across Almora with monthly base rent, area metrics, and vacant unit e-auction bid notifications.'}
              </p>

              {/* Feature Highlights with Checkmarks */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? '11 विकासखंडों की संपत्ति पंजी' : '11 District Blocks Registry'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? 'रिक्त दुकानों की ई-नीलामी' : 'Vacant Unit E-Auctions'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? 'धरोहर राशि (EMD) नियम' : 'EMD & Tender Terms'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{isHi ? '100% पारदर्शी शासकीय आवंटन' : '100% Transparent Allotment'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="pt-4 border-t border-indigo-800/60 flex flex-wrap items-center gap-3">
              <a
                href="#properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm hover:bg-amber-300 transition-colors shadow-md cursor-pointer"
              >
                <span>{isHi ? 'उपलब्ध संपत्तियां देखें' : 'View Properties'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#notices"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs sm:text-sm hover:bg-white/20 transition-colors border border-white/15 cursor-pointer"
              >
                <span>{isHi ? 'नीलामी विज्ञप्ति' : 'Auction Notices'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Secondary Essential Services Grid (Matching Safai Portal Exactly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {secondaryServices.map((srv) => {
            const Icon = srv.icon;
            return (
              <a
                key={srv.id}
                href={srv.link}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-lg transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-[#0b1b36] group-hover:text-amber-400 transition-colors shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {isHi ? srv.badgeHi : srv.badgeEn}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors font-poppins">
                    {isHi ? srv.titleHi : srv.titleEn}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-inter">
                    {isHi ? srv.descHi : srv.descEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>{isHi ? 'विवरण देखें' : 'View Details'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
