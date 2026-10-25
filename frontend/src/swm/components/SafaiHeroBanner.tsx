import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Trash2, AlertCircle, Search, Truck, Award, ShieldCheck, ArrowRight } from 'lucide-react';
import { usePledgeCount } from '@/hooks/usePledgeCount';

export const SafaiHeroBanner = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const { count } = usePledgeCount();

  const scrollToPledge = () => {
    const el = document.getElementById('pledge');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-gradient-to-r from-[#07182f] via-[#0d3262] to-[#1e3a8a] text-white border-b border-blue-500/30 overflow-hidden py-12 sm:py-16">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {isHi ? 'ठोस अपशिष्ट प्रबंधन एवं नागरिक शिकायत निवारण पोर्टल' : 'Solid Waste Management & Citizen Grievance Portal'}
          </h1>
          <p className="mt-3 text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isHi 
              ? 'अल्मोड़ा जनपद के ग्रामीण व उपनगरीय क्षेत्रों में स्वच्छ पर्यावरण, शत-प्रतिशत कचरा संकलन, एवं त्वरित जन-शिकायत समाधान हेतु समर्पित डिजिटल व्यवस्था।' 
              : 'Dedicated digital platform for door-to-door rural waste collection, fast grievance redressal, and transparent fleet tracking across Almora.'}
          </p>

          {/* Quick Action Buttons Grid */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/complaints/register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-102"
            >
              <AlertCircle className="w-4 h-4 text-slate-950" />
              <span>{isHi ? 'शिकायत दर्ज करें' : 'Register Complaint'}</span>
            </Link>

            <Link
              to="/complaints/track"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 shadow-xs transition-all duration-200"
            >
              <Search className="w-4 h-4 text-slate-200" />
              <span>{isHi ? 'शिकायत की स्थिति जांचें' : 'Track Status'}</span>
            </Link>

            <Link
              to="/dashboard/tracking"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200"
            >
              <Truck className="w-4 h-4 text-white" />
              <span>{isHi ? 'वाहन लाइव ट्रैकिंग' : 'Live Fleet Tracking'}</span>
            </Link>

            <button
              onClick={scrollToPledge}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-blue-100 font-semibold text-xs sm:text-sm border border-blue-400/30 transition-all duration-200"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{isHi ? `स्वच्छता शपथ (${count})` : `Pledge (${count})`}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
});

SafaiHeroBanner.displayName = 'SafaiHeroBanner';
