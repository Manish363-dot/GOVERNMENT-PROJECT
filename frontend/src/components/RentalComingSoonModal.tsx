import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRentalComingSoon } from '@/contexts/RentalComingSoonContext';
import { Clock, ArrowLeft, X } from 'lucide-react';

export const RentalComingSoonModal: React.FC = () => {
  const { isOpen, closeRentalComingSoon } = useRentalComingSoon();
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRentalComingSoon();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeRentalComingSoon]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeRentalComingSoon}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 sm:p-7 text-center animate-in zoom-in-95 duration-200"
      >
        {/* Tricolor Government Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Close (X) Button */}
        <button
          onClick={closeRentalComingSoon}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Minimal Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 mt-2 shadow-xs">
          <Clock className="w-7 h-7 text-amber-500 animate-pulse" />
        </div>

        {/* Title: Only Coming Soon... */}
        <h2 className="text-2xl font-extrabold text-navy-950 font-poppins tracking-tight mb-1">
          Coming Soon...
        </h2>

        {/* Subtle bilingual touch */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          {isHi ? 'शीघ्र उपलब्ध होगा...' : 'Under Development'}
        </p>

        {/* Only "Go Back" Button */}
        <button
          type="button"
          onClick={closeRentalComingSoon}
          className="w-full py-3 px-5 rounded-xl bg-navy-900 hover:bg-navy-800 active:scale-[0.98] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isHi ? 'वापस जाएं (Go Back)' : 'Go Back'}</span>
        </button>
      </div>
    </div>
  );
};
