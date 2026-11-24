import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export const HeroSimple: React.FC = () => {
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const isHi = (i18n.language === 'hi' || language === 'hi') && !i18n.language?.startsWith('en');

  return (
    <div className="relative bg-white text-slate-900 border-b border-slate-200 overflow-hidden py-12 sm:py-16 md:py-20">
      {/* 🖼️ Hero Background Picture (Full visibility) */}
      <img
        src="/rental-hero-bg.jpg"
        alt="Zila Panchayat Commercial Property Background"
        className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* H1 Title - Hindi / English */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
            {isHi
              ? 'दुकान आवंटन, संपत्ति एवं किराया प्रबंधन पोर्टल'
              : 'Commercial Asset, Shop Allotment & Rental Management Portal'}
          </h1>

          {/* Action Buttons - Phone Responsive (Stacked on mobile, side-by-side on sm+) */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 font-inter max-w-xs sm:max-w-none mx-auto">
            {/* 1. Amber CTA -> Safai Portal */}
            <Link
              to="/safai-portal"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-102 cursor-pointer"
            >
              <span>{isHi ? 'ठोस अपशिष्ट प्रबंधन प्रकोष्ठ' : 'Solid Waste Management Cell'}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>

            {/* 2. Emerald Button -> Check Rent Page */}
            <Link
              to="/rental/check-status"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer"
            >
              <span>{isHi ? 'किराया जांचें' : 'Check Rent'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSimple;
