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
    <div className="relative bg-[#f8fafc] border-b border-slate-200 overflow-hidden py-10 sm:py-16 bg-no-repeat bg-bottom bg-cover"
      style={{
        backgroundImage: `url('/assets/rental-hero-illustration.jpg')`,
      }}
    >
      {/* Subtle top & center light gradient overlay to guarantee text legibility while keeping illustrations crisp on edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-white/80 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Breadcrumb / Tag — Uttarakhand Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold mb-3 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isHi
                ? 'जिला पंचायत अल्मोड़ा • संपत्ति एवं किराया प्रकोष्ठ'
                : 'Zila Panchayat Almora • Commercial Asset Cell'}
            </span>
          </div>

          {/* H1 — Authoritative Official Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#091e42] tracking-tight leading-tight">
            {isHi
              ? 'दुकान आवंटन, संपत्ति एवं किराया प्रबंधन पोर्टल'
              : 'Commercial Asset, Shop Allotment & Rental Management Portal'}
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-slate-700 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            {isHi
              ? 'अल्मोड़ा जनपद के अंतर्गत जिला पंचायत स्वामित्व वाली व्यावसायिक दुकानों, मार्केट परिसरों के पारदर्शी ई-आवंटन, ऑनलाइन किराया चालान एवं डिजिटल रसीद की आधिकारिक व्यवस्था।'
              : 'Dedicated official platform for transparent commercial shop allotments, online monthly rent collection, verified receipts, and asset registry across Almora.'}
          </p>

          {/* Quick Action Buttons Grid */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-inter">
            {/* 1. Amber Primary CTA */}
            <a
              href="#quick-pay"
              onClick={handlePayRentClick}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-102 cursor-pointer border border-amber-300"
            >
              <CreditCard className="w-4 h-4 text-slate-950" />
              <span>{isHi ? 'किराया ऑनलाइन जमा करें' : 'Pay Rent Online'}</span>
            </a>

            {/* 2. White Card Outline */}
            <a
              href="#quick-pay"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>{isHi ? 'दुकान व बकाया खोजें' : 'Search Shop Dues'}</span>
            </a>

            {/* 3. Emerald Button */}
            <a
              href="#properties"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer"
            >
              <Store className="w-4 h-4 text-white" />
              <span>{isHi ? 'उपलब्ध दुकानें (240+)' : 'View Properties (240+)'}</span>
            </a>

            {/* 4. Official Blue Accent Button */}
            <a
              href="#notices"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0d3262] hover:bg-[#154685] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer"
            >
              <Gavel className="w-4 h-4 text-amber-300" />
              <span>{isHi ? 'ई-नीलामी व निविदाएं' : 'E-Auctions & Tenders'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
