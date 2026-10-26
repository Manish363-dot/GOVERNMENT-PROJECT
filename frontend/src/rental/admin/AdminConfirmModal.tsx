import React, { useEffect } from 'react';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  UserX,
  RefreshCw,
  X,
} from 'lucide-react';

export interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  subject?: string;
  confirmText?: string;
  denyText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  iconType?: 'trash' | 'warning' | 'shield' | 'check' | 'userX';
  loading?: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  message,
  subject,
  confirmText = 'पुष्टि करें (Confirm)',
  denyText = 'रद्द करें (Cancel)',
  variant = 'danger',
  iconType,
  loading = false,
  onConfirm,
  onDeny,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onDeny();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onDeny]);

  if (!isOpen) return null;

  // Determine Icon
  const getIcon = () => {
    if (iconType === 'trash') return Trash2;
    if (iconType === 'warning') return AlertTriangle;
    if (iconType === 'userX') return UserX;
    if (iconType === 'check') return CheckCircle2;
    if (iconType === 'shield') return ShieldAlert;

    // Default icon based on variant
    switch (variant) {
      case 'danger':
        return Trash2;
      case 'warning':
        return AlertTriangle;
      case 'success':
        return CheckCircle2;
      case 'primary':
      default:
        return ShieldAlert;
    }
  };

  const IconComponent = getIcon();

  // Variant styling
  const variantConfig = {
    danger: {
      topBorder: 'bg-rose-500',
      badgeBg: 'bg-rose-500 text-white shadow-md shadow-rose-500/25',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:bg-rose-800',
      accentColor: 'text-rose-600',
      highlightBorder: 'border-rose-100 bg-rose-50/50',
    },
    warning: {
      topBorder: 'bg-amber-400',
      badgeBg: 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/25',
      confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 active:bg-amber-700',
      accentColor: 'text-amber-600',
      highlightBorder: 'border-amber-100 bg-amber-50/50',
    },
    primary: {
      topBorder: 'bg-[#0b1b36]',
      badgeBg: 'bg-[#0b1b36] text-amber-400 shadow-md shadow-slate-900/20',
      confirmBtn: 'bg-[#0b1b36] hover:bg-slate-800 text-amber-400 shadow-md shadow-slate-900/20 active:bg-slate-900',
      accentColor: 'text-blue-700',
      highlightBorder: 'border-blue-100 bg-blue-50/50',
    },
    success: {
      topBorder: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25',
      confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:bg-emerald-800',
      accentColor: 'text-emerald-600',
      highlightBorder: 'border-emerald-100 bg-emerald-50/50',
    },
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => {
        if (!loading) onDeny();
      }}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Top Colored Accent Strip (Exact design from user reference) */}
        <div className={`h-1.5 w-full ${variantConfig.topBorder}`} />

        {/* Modal Inner Container */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Close button on top-right */}
          <button
            type="button"
            onClick={onDeny}
            disabled={loading}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 2. Side-by-side Layout: Circular Action Icon on Left + Title/Warning on Right */}
          <div className="flex items-start gap-4">
            {/* Left: Prominent Circular Icon Badge */}
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 ${variantConfig.badgeBg}`}
            >
              <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            {/* Right: Title & Warning Description */}
            <div className="space-y-1.5 pt-0.5 flex-1 min-w-0 pr-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* 3. Subject Info Pill / Warning Callout (if provided) */}
          {subject && (
            <div
              className={`rounded-xl px-3.5 py-2.5 border text-xs font-mono font-semibold text-slate-800 break-all ${variantConfig.highlightBorder}`}
            >
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                चयनित विवरण (Target Subject):
              </span>
              {subject}
            </div>
          )}

          {/* 4. Action Buttons (Centered with balanced, clean gap) */}
          <div className="pt-3 flex items-center justify-center gap-4 w-full">
            <button
              type="button"
              onClick={onDeny}
              disabled={loading}
              className="min-w-[120px] px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 text-center"
            >
              {denyText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`min-w-[120px] px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 text-center ${variantConfig.confirmBtn}`}
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
