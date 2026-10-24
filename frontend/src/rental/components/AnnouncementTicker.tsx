import React from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AnnouncementTicker: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const items = t.hero.tickerItems || [];

  return (
    <div className="w-full bg-[#0b1b36] border-y border-amber-500/30 text-white relative z-20 shadow-sm">
      <style>{`
        @keyframes rentalTickerScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .rental-ticker-track {
          display: flex;
          width: max-content;
          animation: rentalTickerScroll 35s linear infinite;
          will-change: transform;
        }
        .rental-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="uk-tricolor-line" />
      <div className="max-w-7xl mx-auto flex items-center gap-3 py-2 px-3 sm:px-6">
        {/* Ticker Badge */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-2.5 py-1 rounded text-xs font-bold shrink-0 uppercase tracking-wide shadow-xs z-10">
          <Bell className="w-3.5 h-3.5 animate-pulse text-slate-950" />
          <span>{t.hero.tickerTitle}</span>
        </div>

        {/* Marquee Ticker with continuous loop and pause on hover */}
        <div className="overflow-hidden whitespace-nowrap flex-1 text-xs sm:text-sm text-slate-200">
          <div className="rental-ticker-track">
            {/* First Set */}
            {items.map((item, idx) => (
              <a
                key={`t1-${idx}`}
                href="#notices"
                className="inline-flex items-center mx-6 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 mr-1.5 inline shrink-0" />
                <span>{item}</span>
              </a>
            ))}
            {/* Duplicated Set for Seamless Infinite 0 to -50% Loop */}
            {items.map((item, idx) => (
              <a
                key={`t2-${idx}`}
                href="#notices"
                className="inline-flex items-center mx-6 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 mr-1.5 inline shrink-0" />
                <span>{item}</span>
              </a>
            ))}
          </div>
        </div>

        {/* View all notices link */}
        <a
          href="#notices"
          className="hidden sm:inline-flex items-center text-[11px] font-bold text-amber-300 hover:text-amber-200 underline whitespace-nowrap shrink-0 z-10"
        >
          {isHi ? 'सभी देखें →' : 'View All →'}
        </a>
      </div>
    </div>
  );
};

