import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  ShieldCheck, 
  X, 
  Printer, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DailyWorkSection } from '@/landing-page/DailyWorkSection';
import type { Notice } from './media/media.data';
import {NOTICES_DATA} from'./media/media.data';


export const NoticesSection = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeModalNotice, setActiveModalNotice] = useState<Notice | null>(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [expandedNoticeIds, setExpandedNoticeIds] = useState<Record<string, boolean>>({});
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleExpandNotice = (id: string) => {
    setExpandedNoticeIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, NOTICES_DATA.length - cardsPerView);

  // Auto-play slider (pauses on hover)
  useEffect(() => {
    if (NOTICES_DATA.length <= cardsPerView) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [maxIndex, cardsPerView]);

  const prevSlide = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const nextSlide = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section 
      id="Notices" 
      className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200"
    >
      {/* Anchor duplicate for lowercase compatibility */}
      <div id="notices" className="absolute -top-16 left-0 h-1 w-1 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Section with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              {isHi ? 'सूचनाएं, आदेश एवं अपडेट' : 'Government Notice & Updates'}
            </h2>
            <div className="h-1 w-20 bg-amber-400 rounded-full mt-3 mb-6" />
          </div>

          {/* Slider Controls (Prev / Next Buttons) */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <button
              onClick={prevSlide}
              aria-label="Previous Notice"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Notice"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* 1. Slider / Carousel Container */}
        <div 
          className="relative overflow-hidden -mx-2 px-2 py-2"
          onMouseEnter={() => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); }}
          onMouseLeave={() => {
            if (NOTICES_DATA.length > cardsPerView) {
              autoPlayRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
              }, 5000);
            }
          }}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-5"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
            }}
          >
            {NOTICES_DATA.map((notice) => (
              <div
                key={notice.id}
                className="shrink-0 group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden hover:border-navy-300"
                style={{
                  width: `calc(${100 / cardsPerView}% - ${(20 * (cardsPerView - 1)) / cardsPerView}px)`
                }}
              >
                <div>
                  {/* Photo with Overlay Badge and Date */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={notice.image} 
                      alt={isHi ? notice.titleHi : notice.titleEn}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Date Pill */}
                   {notice.date?.trim() && (
                      <div className="absolute top-3 right-3 bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                        <span>{notice.date}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-poppins text-base font-bold text-navy-900 group-hover:text-navy-700 transition-colors line-clamp-2 leading-snug mb-2.5">
                      {isHi ? notice.titleHi : notice.titleEn}
                    </h3>

                    {/* Summary with Inline Expand / Collapse (View More / View Less) */}
                    {(() => {
                      const summary = isHi ? notice.summaryHi : notice.summaryEn;
                      const isExpanded = !!expandedNoticeIds[notice.id];
                      const isLong = summary.length > 80;

                      return (
                        <div className="mb-2">
                          <p className={`text-slate-600 text-xs sm:text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {summary}
                          </p>
                          {isLong && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandNotice(notice.id);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer mt-1.5 focus:outline-none"
                            >
                              <span>
                                {isExpanded 
                                  ? (isHi ? 'कम देखें' : 'View Less') 
                                  : (isHi ? 'और पढ़ें' : 'View More')}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      );
                    })()}

                    {/* Optional Notice Link (Only rendered if notice.link exists) */}
                    {notice.link && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center">
                        <a
                          href={notice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer group/link"
                        >
                          <span>{isHi ? 'संबंधित लिंक देखें' : 'View Related Link'}</span>
                          <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Slider Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx 
                  ? 'w-7 bg-navy-900' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        {/* 4. Daily Operations & Work Progress (दैनिक कार्य एवं संचालन प्रगति) */}
        <div className="mt-14 pt-12 border-t border-slate-200">
          <DailyWorkSection embedded />
        </div>
      </div>
    </section>
  );
});
