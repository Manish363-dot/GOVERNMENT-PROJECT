import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, Building2 } from 'lucide-react';
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
    <div className="relative bg-white text-slate-900 border-b border-slate-200 overflow-hidden py-14 sm:py-20">
      {/* 🖼️ SWM Hero Background Picture */}
      <img
        src="/swm-hero-bg.jpg"
        alt="Zila Panchayat Solid Waste Management Background"
        className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
            {isHi ? 'ठोस अपशिष्ट प्रबंधन एवं नागरिक शिकायत निवारण पोर्टल' : 'Solid Waste Management & Citizen Grievance Portal'}
          </h1>

          {/* Action Buttons: Pledge & Rental Portal */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4 max-w-2xl mx-auto w-full">
            {/* 1. Swachhata Pledge Button */}
            <button
              onClick={scrollToPledge}
              className="group relative flex-1 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-600/90 via-emerald-700/90 to-teal-700/90 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 backdrop-blur-md text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-700/20 hover:shadow-2xl hover:shadow-emerald-700/30 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 border border-emerald-400/50 ring-1 ring-white/30 overflow-hidden"
            >
              {/* Glossy glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
    
              <span className="tracking-wide relative z-10 drop-shadow-xs whitespace-nowrap">
                {isHi ? `स्वच्छता शपथ लें (${count})` : `Take Swachhata Pledge (${count})`}
              </span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform shrink-0 relative z-10" />
            </button>

            {/* 2. Commercial Asset & Rental Portal Button */}
            <Link
              to="/rental"
              className="group relative flex-1 py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-blue-700/95 via-blue-800/95 to-[#0b1b36]/95 hover:from-blue-600 hover:via-blue-700 hover:to-blue-900 backdrop-blur-md text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-900/25 hover:shadow-2xl hover:shadow-blue-900/35 active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 border border-blue-400/40 ring-1 ring-white/30 overflow-hidden"
            >
              {/* Glossy glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent pointer-events-none" />
              <span className="tracking-wide relative z-10 drop-shadow-xs whitespace-nowrap">
                {isHi ? 'दुकान आवंटन एवं किराया पोर्टल' : 'Asset & Rental Portal'}
              </span>
              <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform shrink-0 relative z-10" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
});

SafaiHeroBanner.displayName = 'SafaiHeroBanner';
