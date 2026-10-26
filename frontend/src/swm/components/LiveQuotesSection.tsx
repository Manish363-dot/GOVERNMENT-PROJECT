import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Quote,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';

export interface LiveQuoteItem {
  id: string;
  hindi: string;
  english: string;
  authorHi: string;
  authorEn: string;
  roleHi: string;
  roleEn: string;
  tagHi: string;
  tagEn: string;
}

export const LIVE_QUOTES: LiveQuoteItem[] = [
  {
    id: 'gandhi-cleanliness',
    hindi: 'स्वच्छता स्वतंत्रता से भी अधिक महत्वपूर्ण है, इसे अपने जीवन का संस्कार बनाएं।',
    english: 'Cleanliness is more important than independence; make it an intrinsic way of life.',
    authorHi: 'महात्मा गांधी',
    authorEn: 'Mahatma Gandhi',
    roleHi: 'राष्ट्रपिता',
    roleEn: 'Father of the Nation',
    tagHi: 'राष्ट्रपिता संदेश',
    tagEn: 'National Heritage'
  },
  {
    id: 'sbm-collective',
    hindi: 'एक कदम स्वच्छता की ओर — जब हर नागरिक जुड़ेगा, तभी स्वच्छ व समृद्ध भारत बनेगा।',
    english: 'One step towards cleanliness — when every citizen unites, a clean and vibrant nation is born.',
    authorHi: 'स्वच्छ भारत मिशन (ग्रामीण)',
    authorEn: 'Swachh Bharat Mission (Grameen)',
    roleHi: 'राष्ट्रीय जन-अभियान',
    roleEn: 'National Cleanliness Movement',
    tagHi: 'राष्ट्रीय संकल्प',
    tagEn: 'National Resolve'
  },
  {
    id: 'almora-devbhoomi',
    hindi: 'स्वच्छ देवभूमि, सुंदर अल्मोड़ा — हिमालयी प्रकृति व पवित्र तीर्थों की रक्षा हमारा परम कर्तव्य है।',
    english: 'Pristine Devbhoomi, Scenic Almora — safeguarding mountain ecology and sacred shrines is our highest duty.',
    authorHi: 'जिला पंचायत अल्मोड़ा',
    authorEn: 'Zila Panchayat Almora',
    roleHi: 'उत्तराखंड शासन',
    roleEn: 'Government of Uttarakhand',
    tagHi: 'देवभूमि अल्मोड़ा',
    tagEn: 'Himalayan Heritage'
  },
  {
    id: 'vivekananda-purity',
    hindi: 'पवित्रता, धैर्य और दृढ़ संकल्प ही जीवन में सभी बाधाओं को पार करने की असली शक्ति हैं।',
    english: 'Purity, patience, and perseverance are the three essentials to overcome all obstacles.',
    authorHi: 'स्वामी विवेकानंद',
    authorEn: 'Swami Vivekananda',
    roleHi: 'युवा प्रेरणापुंज',
    roleEn: 'Philosopher & Visionary',
    tagHi: 'युवा प्रेरणा',
    tagEn: 'Youth Inspiration'
  },
  {
    id: 'sant-gadge-sanitation',
    hindi: 'सफाई में ही ईश्वर का वास है, अपने गांव, घर व गलियों को सदैव स्वच्छ व निर्मल रखें।',
    english: 'Cleanliness is the true abode of divinity; keep your villages, homes, and pathways spotless.',
    authorHi: 'संत गाडगे बाबा',
    authorEn: 'Sant Gadge Baba',
    roleHi: 'स्वच्छता आंदोलन प्रणेता',
    roleEn: 'Pioneer of Village Sanitation',
    tagHi: 'ग्राम स्वच्छता',
    tagEn: 'Village Cleanliness'
  },
  {
    id: 'plastic-free-hills',
    hindi: 'प्लास्टिक मुक्त पहाड़, हरा-भरा उत्तराखंड — आने वाली पीढ़ियों के लिए शुद्ध हवा, जल और पर्यावरण।',
    english: 'Plastic-free mountains, evergreen Uttarakhand — pure air, water, and environment for generations to come.',
    authorHi: 'पर्यावरण एवं जैव-विविधता संरक्षण',
    authorEn: 'Eco-Conservation & Mountain Mission',
    roleHi: 'हरित उत्तराखंड संकल्प',
    roleEn: 'Green Uttarakhand Initiative',
    tagHi: 'पर्यावरण चेतना',
    tagEn: 'Eco Mission'
  }
];

// Helper to safely split text into grapheme clusters (prevents breaking Hindi ligatures/matras)
function getGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      // @ts-expect-error Intl.Segmenter is standard in ES2022+
      const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
      // @ts-expect-error Intl.Segmenter segment iteration
      return Array.from(segmenter.segment(text)).map((s: { segment: string }) => s.segment);
    } catch {
      // fallback
    }
  }
  return Array.from(text);
}

export const LiveQuotesSection: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedHi, setDisplayedHi] = useState('');
  const [displayedEn, setDisplayedEn] = useState('');
  const [isTypingHindi, setIsTypingHindi] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const activeQuote = LIVE_QUOTES[currentIndex];

  const hiGraphemes = useMemo(() => getGraphemes(activeQuote.hindi), [activeQuote.hindi]);
  const enGraphemes = useMemo(() => getGraphemes(activeQuote.english), [activeQuote.english]);

  // Next / Previous controls
  const handleNext = useCallback(() => {
    setDisplayedHi('');
    setDisplayedEn('');
    setIsTypingHindi(true);
    setCurrentIndex((prev) => (prev + 1) % LIVE_QUOTES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setDisplayedHi('');
    setDisplayedEn('');
    setIsTypingHindi(true);
    setCurrentIndex((prev) => (prev - 1 + LIVE_QUOTES.length) % LIVE_QUOTES.length);
  }, []);

  const handleSelectQuote = useCallback((idx: number) => {
    if (idx === currentIndex) return;
    setDisplayedHi('');
    setDisplayedEn('');
    setIsTypingHindi(true);
    setCurrentIndex(idx);
  }, [currentIndex]);

  // Smooth Typewriter Engine
  useEffect(() => {
    if (isPaused) return;

    let timeoutId: NodeJS.Timeout;

    // Phase 1: Typing Hindi quote
    if (isTypingHindi) {
      const currentLength = getGraphemes(displayedHi).length;
      if (currentLength < hiGraphemes.length) {
        timeoutId = setTimeout(() => {
          setDisplayedHi(hiGraphemes.slice(0, currentLength + 1).join(''));
        }, 36); // Smooth 36ms per letter
      } else {
        // Hindi finished -> transition to typing English after short 250ms breath
        timeoutId = setTimeout(() => {
          setIsTypingHindi(false);
        }, 250);
      }
    } 
    // Phase 2: Typing English quote
    else {
      const currentLength = getGraphemes(displayedEn).length;
      if (currentLength < enGraphemes.length) {
        timeoutId = setTimeout(() => {
          setDisplayedEn(enGraphemes.slice(0, currentLength + 1).join(''));
        }, 28); // Smooth 28ms per letter
      } else {
        // Both quotes fully typed -> pause for 4.2 seconds to allow full reading, then switch
        timeoutId = setTimeout(() => {
          handleNext();
        }, 4200);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [
    isPaused,
    isTypingHindi,
    displayedHi,
    displayedEn,
    hiGraphemes,
    enGraphemes,
    handleNext
  ]);

  return (
    <section 
      aria-label="Live Quotes Section"
      className="relative bg-gradient-to-b from-[#07162c] via-[#091c38] to-[#07162c] text-white py-14 sm:py-20 overflow-hidden border-b border-blue-900/30"
    >
      {/* Background Decorative Lighting & Atmospheric Mesh */}
      <div 
        className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Large Watermark Quote Icon in Background */}
      <Quote 
        className="absolute right-4 sm:right-16 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 text-white/[0.025] pointer-events-none select-none rotate-12" 
        aria-hidden="true" 
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Top Control Bar: Large Heading + Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10 pb-6 border-b border-white/10">
          
          {/* Large Section Heading */}
          <div>

            <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              {isHi ? 'प्रेरणादायक विचार' : 'Inspirational Quotes'}
            </h2>
            <div className="h-1 w-20 sm:w-24 bg-emerald-400 rounded-full mt-2.5" />
          </div>

          {/* Interactive Navigation & Playback Controls */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            <button
              type="button"
              onClick={() => setIsPaused(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/10 transition shadow-xs"
              title={isPaused ? (isHi ? 'पुनः चालू करें' : 'Resume animation') : (isHi ? 'रोकें' : 'Pause animation')}
              aria-label="Toggle quote animation"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">{isPaused ? (isHi ? 'चालू करें' : 'Play') : (isHi ? 'रोकें' : 'Pause')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition shadow-xs"
              title={isHi ? 'पिछला विचार' : 'Previous Quote'}
              aria-label="Previous Quote"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition shadow-xs"
              title={isHi ? 'अगला विचार' : 'Next Quote'}
              aria-label="Next Quote"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Quotes Container with Large Fonts */}
        <div className="min-h-[220px] sm:min-h-[250px] md:min-h-[280px] flex flex-col justify-center">
          
          {/* Quote Mark */}
          <div className="mb-3 text-amber-400/80">
            <Quote className="w-8 h-8 sm:w-11 sm:h-11 inline-block -rotate-12" />
          </div>

          {/* Large Hindi Typewriter Line with Generous Line Height */}
          <div className="relative">
            <h2 className="font-poppins font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] text-white leading-[1.55] sm:leading-[1.65] lg:leading-[1.7] tracking-normal drop-shadow-sm min-h-[1.6em]">
              “ {displayedHi}
              {isTypingHindi && (
                <span 
                  className="inline-block w-1.5 sm:w-2 h-[0.9em] bg-amber-400 ml-1.5 rounded-xs animate-pulse align-middle shadow-[0_0_8px_rgba(250,204,21,0.8)]"
                  aria-hidden="true" 
                />
              )}
              {isTypingHindi ? '' : ' ”'}
            </h2>
          </div>

          {/* Large English Typewriter Line with Generous Line Height */}
          <div className="relative mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10">
            <p className="font-poppins font-bold text-lg sm:text-2xl md:text-3xl lg:text-[30px] text-amber-300 leading-[1.5] sm:leading-[1.6] lg:leading-[1.65] tracking-normal min-h-[1.5em]">
              “ {displayedEn}
              {!isTypingHindi && (
                <span 
                  className="inline-block w-1.5 sm:w-2 h-[0.9em] bg-emerald-400 ml-1.5 rounded-xs animate-pulse align-middle shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  aria-hidden="true" 
                />
              )}
              {displayedEn.length === enGraphemes.length ? ' ”' : ''}
            </p>
          </div>

          {/* Indicator Dots */}
          <div className="mt-8 flex items-center justify-center gap-2 pt-4 border-t border-white/10" aria-label="Quote index indicators">
            {LIVE_QUOTES.map((quote, idx) => (
              <button
                key={quote.id}
                type="button"
                onClick={() => handleSelectQuote(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 sm:w-10 bg-amber-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Jump to quote ${idx + 1}`}
                title={`Quote ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
