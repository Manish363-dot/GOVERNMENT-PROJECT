import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BackToTop: React.FC = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (currentScrollY > 280) {
      setIsVisible(true);
      if (maxScroll > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / maxScroll) * 100));
        setScrollProgress(progress);
      }
    } else {
      setIsVisible(false);
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular progress calculation
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-navy-900 text-white shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 hover:bg-navy-800 transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 active:scale-95 cursor-pointer"
        aria-label={isHi ? 'शीर्ष पर जाएं' : 'Back to top'}
        title={isHi ? 'शीर्ष पर जाएं (Back to top)' : 'Back to top'}
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-12 h-12 -rotate-90 pointer-events-none select-none"
          viewBox="0 0 48 48"
        >
          {/* Track Circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-white/20 fill-transparent"
            strokeWidth="2.5"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-amber-400 fill-transparent transition-[stroke-dashoffset] duration-150 ease-out"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>

        {/* Center Arrow Icon */}
        <ArrowUp className="w-5 h-5 text-amber-400 group-hover:text-amber-300 group-hover:-translate-y-0.5 transition-all duration-300 relative z-10" />
      </button>
    </div>
  );
});

BackToTop.displayName = 'BackToTop';
