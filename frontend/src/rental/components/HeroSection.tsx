import React from 'react';
import { CreditCard, Store, Search, Gavel, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';


export const HeroSimple: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const { requireAuth } = useAuth();

  const handlePayRentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const el = document.getElementById('quick-pay');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 'quick-pay');
  };

  return (
    <div className="relative bg-white text-slate-900 border-b border-slate-200 overflow-hidden py-14 sm:py-20">
      {/* 🖼️ Hero Background Picture Only */}
      <img
        src="/rental-hero-bg.jpg"
        alt="Zila Panchayat Commercial Property Background"
        className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none z-0"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
       

          {/* H1 Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-navy-950 tracking-tight leading-tight">
            {isHi
              ? 'दुकान आवंटन, संपत्ति एवं किराया प्रबंधन पोर्टल'
              : 'Commercial Asset, Shop Allotment & Rental Management Portal'}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-slate-700 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {isHi
              ? 'अल्मोड़ा जनपद के अंतर्गत जिला पंचायत स्वामित्व वाली व्यावसायिक दुकानों, मार्केट परिसरों के पारदर्शी ई-आवंटन, ऑनलाइन किराया चालान एवं डिजिटल रसीद की आधिकारिक व्यवस्था।'
              : 'Dedicated official platform for transparent commercial shop allotments, online monthly rent collection, verified receipts, and asset registry across Almora.'}
          </p>

          {/* Quick Action Buttons Grid */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-inter">
            {/* 1. Amber Primary CTA */}
            <a
              href="#quick-pay"
              onClick={handlePayRentClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-102 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>{isHi ? 'किराया ऑनलाइन जमा करें' : 'Pay Rent Online'}</span>
            </a>



            {/* 3. Emerald Button */}
            <a
              href="#properties"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Store className="w-4 h-4 text-white" />
              <span>{isHi ? 'उपलब्ध दुकानें (240+)' : 'View Properties (240+)'}</span>
            </a>


          </div>
        </div>
      </div>
    </div>
  );
};
