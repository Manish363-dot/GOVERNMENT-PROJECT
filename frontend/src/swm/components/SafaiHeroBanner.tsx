
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Award, Building2 } from 'lucide-react';
import { usePledgeCount } from '@/hooks/usePledgeCount';
import { useRentalComingSoon } from '@/contexts/RentalComingSoonContext';

export const SafaiHeroBanner = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const { count } = usePledgeCount();
  const { openRentalComingSoon } = useRentalComingSoon();

  const scrollToPledge = () => {
    const el = document.getElementById('pledge');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';
  return (
    <section
      className="relative w-full overflow-hidden border-b border-slate-200 bg-white min-h-[300px] sm:min-h-[330px] md:min-h-[350px] lg:min-h-[365px] flex items-center"
    >
      {/* Background image — object-cover pinned to bottom so truck, wheels and road are 100% visible */}
      <img
        src="/swm-hero-bg.png"
        alt="Zila Panchayat Almora — Solid Waste Management"
        className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        style={{
          objectPosition: 'center bottom',
        }}
      />

      {/* Smooth white gradient: solid white behind text on left, gentle feathering into transparent so truck and mountains stay vibrant */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #ffffff 0%, #ffffff 32%, rgba(255,255,255,0.94) 40%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.15) 60%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 md:py-12 lg:px-14">
        <div className="flex flex-col max-w-[640px] lg:max-w-[700px]">

          {/* Heading — exactly 2 lines, bigger, bold and balanced */}
          <h1
            className="mb-6 font-extrabold leading-[1.18] tracking-tight text-[#0b2447]"
            style={{
              fontSize: 'clamp(1.7rem, 3.1vw, 2.5rem)',
            }}
          >
            {isHi ? (
              <>
                <span className="block sm:whitespace-nowrap">ठोस अपशिष्ट प्रबंधन एवं</span>
                <span className="block sm:whitespace-nowrap">नागरिक शिकायत निवारण पोर्टल</span>
              </>
            ) : (
              <>
                <span className="block sm:whitespace-nowrap">Solid Waste Management &amp;</span>
                <span className="block sm:whitespace-nowrap">Citizen Grievance Portal</span>
              </>
            )}
          </h1>

          {/* Buttons — comfortable width so icons and text have plenty of space without clipping */}
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center w-full max-w-[580px]">

            {/* Swachhata Pledge */}
            <button
              id="swm-hero-pledge-btn"
              onClick={scrollToPledge}
              className="group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl border border-emerald-400/50 bg-gradient-to-r from-emerald-600/90 via-emerald-700/90 to-teal-700/90 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-700/20 ring-1 ring-white/30 transition-all duration-300 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 hover:shadow-2xl active:scale-[0.99] cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent" />
              <span className="relative z-10 tracking-wide shrink-0">
                {isHi
                  ? `स्वच्छता शपथ लें (${count})`
                  : `Take Swachhata Pledge (${count})`}
              </span>

              <ArrowRight className="relative z-10 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Asset & Rental Portal */}
            <button
              id="swm-hero-rental-btn"
              onClick={openRentalComingSoon}
              className="group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-xl border border-blue-400/40 bg-gradient-to-r from-blue-700/95 via-blue-800/95 to-[#0b1b36]/95 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-900/25 ring-1 ring-white/30 transition-all duration-300 hover:from-blue-600 hover:via-blue-700 hover:to-blue-900 hover:shadow-2xl active:scale-[0.99] cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-transparent" />
              <span className="relative z-10 tracking-wide shrink-0">
                {isHi
                  ? 'दुकान आवंटन एवं किराया पोर्टल'
                  : 'Asset & Rental Portal'}
              </span>

              <ArrowRight className="relative z-10 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </button>

          </div>
        </div>
      </div>
    </section>
  );
});

SafaiHeroBanner.displayName = 'SafaiHeroBanner';
