import React, { useState, useEffect } from 'react';

export const WelcomeSplash: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
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
        setIsPaused(true);

        // Phase 2: Pause at 60% for exactly 2 seconds (2000ms)
        setTimeout(() => {
          if (isCancelled) return;
          setIsPaused(false);

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
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col justify-between items-center bg-[#fafbfc] select-none transition-all duration-700 ease-out overflow-hidden ${
        isFading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* 🔮 Soft Atmospheric Backdrop Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Top Thin National Accent Border */}
      <div className="w-full h-1 flex relative z-10">
        <div className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
      </div>

      {/* Top Spacer */}
      <div className="h-6" />

      {/* 🌟 Center Stage: Beautiful Open Gradient Text (No heavy box, matras unclipped) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-4xl -mt-6">
    

        {/* 🌈 Line 1: 'जिला पंचायत अल्मोड़ा' (Flowing Shimmering Gradient with ample headroom for matras) */}
        <h1 className="welcome-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-normal leading-[1.35] py-2">
          <span className="gradient-text-flow">
            जिला पंचायत अल्मोड़ा
          </span>
        </h1>

        {/* 💫 Dynamic Pulse Divider Line */}
        <div className="w-24 sm:w-36 h-[2.5px] rounded-full my-2 bg-gradient-to-r from-transparent via-emerald-600 to-transparent animate-pulse" />

        {/* ✨ Line 2: 'में आपका स्वागत है' */}
        <h2 className="welcome-subtitle text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide leading-[1.4] py-1 mt-1">
          <span className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-800 bg-clip-text text-transparent">
            में आपका हार्दिक स्वागत है
          </span>
        </h2>
      </div>

      {/* 🚀 Bottom Sleek Modern Loading Bar */}
      <div className="relative z-10 w-full max-w-md px-8 pb-14 flex flex-col items-center">
        
        {/* Progress & Live Status Counter */}
        <div className="w-full flex items-center justify-between text-xs sm:text-sm font-semibold mb-2.5">
          <div className="flex items-center gap-2 text-slate-500">
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isPaused ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'
              }`}
            />
            <span className="tracking-wide">
              {progress < 60 && 'पोर्टल लोड हो रहा है...'}
              {progress === 60 && isPaused && 'प्रशासनिक डाटा व सुरक्षा सत्यापन...'}
              {progress > 60 && progress < 100 && 'प्रारंभ किया जा रहा है...'}
              {progress === 100 && 'तैयार! स्वागतम्...'}
            </span>
          </div>

          <div className="font-mono font-black text-slate-900 text-lg sm:text-xl">
            {progress}%
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative w-full h-2 bg-slate-200/80 rounded-full overflow-hidden p-[1px] shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 transition-all duration-100 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer sweep animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      {/* 🎨 Inline Styles for Smooth Animation & Non-Clipping Gradient Text */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmerSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes cinematicEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }

        .gradient-text-flow {
          background: linear-gradient(
            135deg,
            #0f172a 0%,
            #065f46 25%,
            #0284c7 50%,
            #047857 75%,
            #0f172a 100%
          );
          background-size: 300% 300%;
          animation: gradientFlow 5s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
          /* Essential padding to guarantee zero clipping on Hindi matras */
          padding-top: 0.18em;
          padding-bottom: 0.18em;
          padding-left: 0.05em;
          padding-right: 0.05em;
        }

        .welcome-title {
          animation: cinematicEntrance 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .welcome-subtitle {
          animation: cinematicEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }

        .welcome-tag {
          animation: cinematicEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-shimmer {
          animation: shimmerSweep 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};
