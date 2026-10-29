import React, { useState, useEffect } from 'react';

export const WelcomeSplash: React.FC = () => {
  // ONLY show on the starting of the website (home page '/')
  // Works on every refresh of '/', but NEVER on subpages like /notices, /swm, /contact, etc.
  const [shouldRun] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path === '/' || path === '';
  });

  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isMounted, setIsMounted] = useState(shouldRun);

  useEffect(() => {
    if (!shouldRun) return;

    // Disable background scrolling while splash is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let isCancelled = false;

    // Phase 1: 0% -> 60% (~1.8 seconds)
    let current = 0;
    const interval1 = setInterval(() => {
      if (isCancelled) {
        clearInterval(interval1);
        return;
      }

      current += 1;
      setProgress(current);

      if (current >= 60) {
        clearInterval(interval1);

        // Phase 2: Pause at 60% for exactly 2 seconds (2000ms)
        setTimeout(() => {
          if (isCancelled) return;

          // Phase 3: 61% -> 100% (~500ms)
          let fastCurrent = 60;
          const interval2 = setInterval(() => {
            if (isCancelled) {
              clearInterval(interval2);
              return;
            }

            fastCurrent += 2;
            if (fastCurrent >= 100) {
              fastCurrent = 100;
              setProgress(100);
              clearInterval(interval2);

              // Phase 4: Wait 350ms at 100%, then smooth fade-out
              setTimeout(() => {
                if (isCancelled) return;
                setIsFading(true);

                // Phase 5: Complete unmount
                setTimeout(() => {
                  if (isCancelled) return;
                  setIsMounted(false);
                  document.body.style.overflow = originalOverflow;
                }, 700);
              }, 350);
            } else {
              setProgress(fastCurrent);
            }
          }, 14);
        }, 2000);
      }
    }, 28);

    return () => {
      isCancelled = true;
      clearInterval(interval1);
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldRun]);

  // If not on the starting home page, render nothing
  if (!shouldRun || !isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col justify-between items-center bg-[#f8fafc] text-slate-900 select-none transition-all duration-700 ease-out overflow-hidden ${
        isFading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🇮🇳 Top Indian Tricolor Line (Single line: Orange -> White -> Green) */}
      <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 w-full bg-gradient-to-r from-[#FF671F] via-white to-[#046A38] z-50 shadow-xs pointer-events-none" />

      {/* Top Spacer */}
      <div className="h-6 sm:h-12" />

      {/* 🌟 Center Masterpiece: Big Bold Text with Minimal Inter-line Gap */}
      <div className="flex flex-col items-center justify-center text-center px-4 w-full max-w-6xl my-auto">
        
        {/* Line 1: 'जिला पंचायत' (Big bold text, zero clipping) */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none m-0 p-0 whitespace-nowrap">
          <span className="gradient-text-flow">
            जिला पंचायत
          </span>
        </h1>

        {/* Line 2: 'अल्मोड़ा' (Natural tight gap with negative margin) */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none m-0 p-0 -mt-2 sm:-mt-5 md:-mt-7 lg:-mt-9 whitespace-nowrap">
          <span className="gradient-text-flow">
            अल्मोड़ा
          </span>
        </h1>

        {/* Line 3: 'में आपका हार्दिक स्वागत है' (Subtitle) */}
        <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-slate-600 tracking-wide mt-4 sm:mt-6 md:mt-8">
          में आपका हार्दिक स्वागत है
        </p>

      </div>

      {/* 🚀 Bottom Sleek Progress Bar Section */}
      <div className="w-full max-w-md px-8 pb-12 sm:pb-16 flex flex-col items-center">
        
        {/* Top Status & Percentage Line */}
        <div className="w-full flex items-center justify-between text-xs sm:text-sm font-medium text-slate-600 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="tracking-wide">
              {progress < 100 ? 'पोर्टल लोड हो रहा है...' : 'स्वागतम्! तैयार...'}
            </span>
          </div>

          <div className="font-mono font-bold text-slate-800 text-xs sm:text-sm">
            {progress}%
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* 🎨 Flowing Liquid Gradient Animation (Room for matras, zero clipping) */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .gradient-text-flow {
          background: linear-gradient(
            135deg,
            #0e3a53 0%,
            #0284c7 25%,
            #0f766e 50%,
            #0d9488 75%,
            #0e3a53 100%
          );
          background-size: 300% 300%;
          animation: gradientFlow 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          padding-top: 0.16em;
          padding-bottom: 0.08em;
          padding-left: 0.04em;
          padding-right: 0.04em;
          line-height: 1.06;
          overflow: visible;
        }
      `}</style>
    </div>
  );
};
