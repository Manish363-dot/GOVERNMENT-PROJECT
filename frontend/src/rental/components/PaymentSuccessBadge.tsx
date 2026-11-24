import React, { useEffect } from 'react';

interface PaymentSuccessIllustrationProps {
  className?: string;
  size?: number;
}

export const PaymentSuccessIllustration: React.FC<PaymentSuccessIllustrationProps> = ({
  className = '',
  size = 180,
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes successPopIn {
          0% { transform: scale(0.2); opacity: 0; }
          65% { transform: scale(1.15); opacity: 1; }
          85% { transform: scale(0.96); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkmarkStroke {
          0% { stroke-dashoffset: 60; opacity: 0; }
          40% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes particlesRadiateOut {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes subtlePulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.95; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .anim-pop-badge {
          animation: successPopIn 1.0s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .anim-checkmark-draw {
          stroke-dasharray: 60;
          stroke-dashoffset: 0;
          animation: checkmarkStroke 0.7s ease-out 0.25s forwards;
        }
        .anim-particles-burst {
          transform-origin: center;
          animation: particlesRadiateOut 1.1s ease-out forwards, subtlePulseGlow 3s ease-in-out infinite 0.75s;
        }
      `}</style>

      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="anim-pop-badge drop-shadow-md select-none"
      >
        {/* Outer soft pale mint halo circle */}
        <circle cx="100" cy="100" r="58" fill="#E8FDF3" />

        {/* Inner vibrant spring green circle */}
        <circle cx="100" cy="100" r="38" fill="#00E676" />

        {/* Thick white rounded checkmark */}
        <path
          d="M87 101 L96 110 L115 90"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="anim-checkmark-draw"
        />

        {/* Surrounding Radiating Particles (5-pointed Stars & Bubbles matching user specification) */}
        <g className="anim-particles-burst">
          {/* Top Star */}
          <polygon
            points="100.0,10.0 102.1,15.2 107.6,15.5 103.3,19.1 104.7,24.5 100.0,21.5 95.3,24.5 96.7,19.1 92.4,15.5 97.9,15.2"
            fill="#00E676"
          />
          {/* Top small dot */}
          <circle cx="100" cy="34" r="3.5" fill="#00E676" />

          {/* Top-Right large dot */}
          <circle cx="144" cy="38" r="8" fill="#00E676" />

          {/* Right small dot */}
          <circle cx="152" cy="94" r="3.5" fill="#00E676" />
          {/* Right Star */}
          <polygon
            points="166.0,92.0 168.1,97.2 173.6,97.5 169.3,101.1 170.7,106.5 166.0,103.5 161.3,106.5 162.7,101.1 158.4,97.5 163.9,97.2"
            fill="#00E676"
          />

          {/* Bottom-Right medium dot */}
          <circle cx="150" cy="150" r="6" fill="#00E676" />

          {/* Bottom dot */}
          <circle cx="104" cy="172" r="4" fill="#00E676" />
          {/* Bottom Star */}
          <polygon
            points="104.0,176.0 106.1,181.2 111.6,181.5 107.3,185.1 108.7,190.5 104.0,187.5 99.3,190.5 100.7,185.1 96.4,181.5 101.9,181.2"
            fill="#00E676"
          />

          {/* Bottom-Left large dot */}
          <circle cx="60" cy="156" r="8" fill="#00E676" />

          {/* Left small dot */}
          <circle cx="52" cy="120" r="3.5" fill="#00E676" />
          {/* Left Star */}
          <polygon
            points="46.0,92.0 48.1,97.2 53.6,97.5 49.3,101.1 50.7,106.5 46.0,103.5 41.3,106.5 42.7,101.1 38.4,97.5 43.9,97.2"
            fill="#00E676"
          />

          {/* Top-Left medium dot */}
          <circle cx="64" cy="56" r="7" fill="#00E676" />
        </g>
      </svg>
    </div>
  );
};

interface CelebrationScreenProps {
  amount: number;
  receiptNumber: string;
  billNumber?: string;
  isHi?: boolean;
  onContinue: () => void;
  autoTransitionMs?: number;
}

export const PaymentCelebrationCard: React.FC<CelebrationScreenProps> = ({
  amount,
  receiptNumber,
  billNumber,
  isHi = true,
  onContinue,
  autoTransitionMs = 1600,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, autoTransitionMs);
    return () => clearTimeout(timer);
  }, [onContinue, autoTransitionMs]);

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
      {/* 1. Exact Success SVG Icon with Popping Particles */}
      <PaymentSuccessIllustration size={180} className="mx-auto" />

      {/* 2. Text Details */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isHi ? 'भुगतान सफलतापूर्वक दर्ज किया गया!' : 'Payment Recorded Successfully!'}
        </h2>

      </div>

      {/* 3. Details Chip */}
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs font-mono font-bold text-emerald-950">
        <span>{isHi ? 'रसीद संख्या:' : 'Receipt No:'} <strong>{receiptNumber}</strong></span>
        {billNumber && (
          <>
            <span className="text-emerald-300">•</span>
            <span>{billNumber}</span>
          </>
        )}
      </div>

      {/* 4. Automated Transition Indicator with Skip Button */}
      <div className="space-y-3 pt-2">



        {/* Progress bar line */}
        <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
            style={{
              animation: `growWidth ${autoTransitionMs}ms linear forwards`,
            }}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={onContinue}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline transition cursor-pointer pt-1"
          >
            {isHi ? 'रसीद अभी देखें →' : 'View receipt now →'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

