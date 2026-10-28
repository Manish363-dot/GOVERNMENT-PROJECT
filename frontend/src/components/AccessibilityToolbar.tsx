import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Contrast, ImageOff, Check, RotateCcw, X, SlidersHorizontal, Link2 } from 'lucide-react';

type FontSize = 'sm' | 'normal' | 'lg';

export const AccessibilityToolbar: React.FC = () => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [hideImages, setHideImages] = useState<boolean>(false);
  const [bigCursor, setBigCursor] = useState<boolean>(false);
  const [highlightLinks, setHighlightLinks] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = (localStorage.getItem('gov_font_size') as FontSize) || 'normal';
      const savedContrast = localStorage.getItem('gov_high_contrast') === 'true';
      const savedHideImages = localStorage.getItem('gov_hide_images') === 'true';
      const savedBigCursor = localStorage.getItem('gov_big_cursor') === 'true';
      const savedHighlightLinks = localStorage.getItem('gov_highlight_links') === 'true';

      setFontSize(savedFont);
      applyFontSize(savedFont);

      setIsHighContrast(savedContrast);
      applyContrast(savedContrast);

      setHideImages(savedHideImages);
      applyHideImages(savedHideImages);

      setBigCursor(savedBigCursor);
      applyBigCursor(savedBigCursor);

      setHighlightLinks(savedHighlightLinks);
      applyHighlightLinks(savedHighlightLinks);
    } catch {
      // ignore storage access issues
    }
  }, []);

  // Close menu when clicking outside on desktop
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement;
    if (size === 'sm') {
      root.style.fontSize = '90%';
    } else if (size === 'lg') {
      root.style.fontSize = '112%';
    } else {
      root.style.fontSize = '100%';
    }
  };

  const applyContrast = (contrast: boolean) => {
    const root = document.documentElement;
    if (contrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  const applyHideImages = (hide: boolean) => {
    const root = document.documentElement;
    if (hide) {
      root.classList.add('hide-images');
    } else {
      root.classList.remove('hide-images');
    }
  };

  const applyBigCursor = (cursor: boolean) => {
    const root = document.documentElement;
    if (cursor) {
      root.classList.add('big-cursor');
    } else {
      root.classList.remove('big-cursor');
    }
  };

  const applyHighlightLinks = (highlight: boolean) => {
    const root = document.documentElement;
    if (highlight) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }
  };

  const handleFontChange = (size: FontSize) => {
    setFontSize(size);
    applyFontSize(size);
    try {
      localStorage.setItem('gov_font_size', size);
    } catch {
      // ignore
    }
  };

  const handleContrastToggle = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    applyContrast(next);
    try {
      localStorage.setItem('gov_high_contrast', String(next));
    } catch {
      // ignore
    }
  };

  const handleHideImagesToggle = () => {
    const next = !hideImages;
    setHideImages(next);
    applyHideImages(next);
    try {
      localStorage.setItem('gov_hide_images', String(next));
    } catch {
      // ignore
    }
  };

  const handleBigCursorToggle = () => {
    const next = !bigCursor;
    setBigCursor(next);
    applyBigCursor(next);
    try {
      localStorage.setItem('gov_big_cursor', String(next));
    } catch {
      // ignore
    }
  };

  const handleHighlightLinksToggle = () => {
    const next = !highlightLinks;
    setHighlightLinks(next);
    applyHighlightLinks(next);
    try {
      localStorage.setItem('gov_highlight_links', String(next));
    } catch {
      // ignore
    }
  };

  const handleResetAll = () => {
    setFontSize('normal');
    applyFontSize('normal');
    setIsHighContrast(false);
    applyContrast(false);
    setHideImages(false);
    applyHideImages(false);
    setBigCursor(false);
    applyBigCursor(false);
    setHighlightLinks(false);
    applyHighlightLinks(false);

    try {
      localStorage.removeItem('gov_font_size');
      localStorage.removeItem('gov_high_contrast');
      localStorage.removeItem('gov_hide_images');
      localStorage.removeItem('gov_big_cursor');
      localStorage.removeItem('gov_highlight_links');
    } catch {
      // ignore
    }
  };

  const hasAnyActiveFeature = fontSize !== 'normal' || isHighContrast || hideImages || bigCursor || highlightLinks;

  return (
    <div className="relative inline-flex items-center" ref={menuRef}>
      {/* ── Top Bar Inline Strip ── */}
      <div
        className="inline-flex items-center gap-1 bg-navy-950/70 p-0.5 rounded-md border border-navy-700/70 text-slate-200 select-none shadow-xs"
        role="toolbar"
        aria-label={isHi ? 'पहुंच सुगमता नियंत्रण' : 'Accessibility Controls'}
      >
        {/* Decrease Font Size */}
        <button
          type="button"
          onClick={() => handleFontChange('sm')}
          title={isHi ? 'फॉन्ट छोटा करें (A-)' : 'Decrease Font (A-)'}
          aria-label={isHi ? 'फॉन्ट छोटा करें (A-)' : 'Decrease Font (A-)'}
          className={`h-6 px-1.5 min-w-[24px] text-[11px] font-bold rounded transition-colors flex items-center justify-center ${
            fontSize === 'sm'
              ? 'bg-amber-400 text-navy-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
        >
          A-
        </button>

        {/* Normal / Reset Font Size */}
        <button
          type="button"
          onClick={() => handleFontChange('normal')}
          title={isHi ? 'सामान्य फॉन्ट (A)' : 'Normal Font (A)'}
          aria-label={isHi ? 'सामान्य फॉन्ट (A)' : 'Normal Font (A)'}
          className={`h-6 px-1.5 min-w-[24px] text-[11px] font-bold rounded transition-colors flex items-center justify-center ${
            fontSize === 'normal'
              ? 'bg-amber-400 text-navy-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
        >
          A
        </button>

        {/* Increase Font Size */}
        <button
          type="button"
          onClick={() => handleFontChange('lg')}
          title={isHi ? 'फॉन्ट बड़ा करें (A+)' : 'Increase Font (A+)'}
          aria-label={isHi ? 'फॉन्ट बड़ा करें (A+)' : 'Increase Font (A+)'}
          className={`h-6 px-1.5 min-w-[24px] text-[11px] font-bold rounded transition-colors flex items-center justify-center ${
            fontSize === 'lg'
              ? 'bg-amber-400 text-navy-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
        >
          A+
        </button>

        <span className="w-px h-3.5 bg-navy-700 mx-0.5" aria-hidden="true" />

        {/* High Contrast Toggle */}
        <button
          type="button"
          onClick={handleContrastToggle}
          title={isHighContrast ? (isHi ? 'सामान्य दृश्य' : 'Normal View') : (isHi ? 'उच्च कंट्रास्ट दृश्य' : 'High Contrast View')}
          aria-label={isHighContrast ? 'सामान्य दृश्य' : 'उच्च कंट्रास्ट दृश्य'}
          aria-pressed={isHighContrast}
          className={`h-6 w-6 rounded transition-colors flex items-center justify-center ${
            isHighContrast
              ? 'bg-amber-400 text-navy-950 shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
        >
          <Contrast className="w-3.5 h-3.5" />
        </button>

        <span className="w-px h-3.5 bg-navy-700 mx-0.5 hidden sm:inline" aria-hidden="true" />
        <span className="w-px h-3.5 bg-navy-700 mx-0.5" aria-hidden="true" />
        {/* Accessibility Menu Opener Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title={isHi ? 'सुगमता सेटिंग्स एवं विकल्प' : 'Accessibility Settings & Tools'}
          aria-label={isHi ? 'सुगमता मेन्यू' : 'Accessibility Menu'}
          aria-expanded={isMenuOpen}
          className={`h-6 px-1.5 rounded transition-colors flex items-center gap-1 text-[10px] font-semibold ${
            isMenuOpen || hasAnyActiveFeature
              ? 'bg-navy-800 text-amber-300 border border-navy-600'
              : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 text-amber-400" />
          <span className="hidden md:inline">{isHi ? 'सुगमता' : 'Accessibility'}</span>
        </button>
      </div>

      {/* ── Dropdown Accessibility Panel (Fully Responsive: Centered on mobile, anchored on desktop) ── */}
      {isMenuOpen && (
        <>
          {/* Mobile Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 sm:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Container */}
          <div
            className="fixed inset-x-3 top-14 z-50 max-w-[360px] mx-auto sm:max-w-none sm:mx-0 sm:fixed-none sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] bg-[#0b1322] border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 animate-scale-in"
            style={{ transformOrigin: 'top right' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isHi ? 'सुगमता सेटिंग्स' : 'Accessibility'}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {hasAnyActiveFeature && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    title={isHi ? 'सभी सेटिंग्स रीसेट करें' : 'Reset All Settings'}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-amber-300 hover:text-amber-200 bg-navy-900 hover:bg-navy-800 border border-amber-500/30 rounded transition-colors"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>{isHi ? 'रीसेट' : 'Reset'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Font Size Controls */}
            <div className="mb-3.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>{isHi ? 'अक्षर आकार' : 'Text Size'}</span>
                <span className="font-semibold text-slate-200">
                  {fontSize === 'sm'
                    ? (isHi ? 'छोटा (90%)' : 'Small (90%)')
                    : fontSize === 'lg'
                    ? (isHi ? 'बड़ा (112%)' : 'Large (112%)')
                    : (isHi ? 'सामान्य (100%)' : 'Normal (100%)')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-black/40 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleFontChange('sm')}
                  className={`py-1 text-xs font-bold rounded transition-colors ${
                    fontSize === 'sm' ? 'bg-amber-400 text-navy-950 font-extrabold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => handleFontChange('normal')}
                  className={`py-1 text-xs font-bold rounded transition-colors ${
                    fontSize === 'normal' ? 'bg-amber-400 text-navy-950 font-extrabold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontChange('lg')}
                  className={`py-1 text-xs font-bold rounded transition-colors ${
                    fontSize === 'lg' ? 'bg-amber-400 text-navy-950 font-extrabold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  A+
                </button>
              </div>
            </div>

            {/* ── "Others" Section (3 Cards: Hide Images, Big Cursor, Highlight Links) ── */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <span> { isHi ? 'अन्य सुविधाएं' : 'Others' }</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Card 1: Hide Images */}
                <button
                  type="button"
                  onClick={handleHideImagesToggle}
                  className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all text-center select-none group ${
                    hideImages
                      ? 'bg-slate-900 border-pink-500/80 shadow-md ring-1 ring-pink-500/40'
                      : 'bg-black/50 border-slate-700/80 hover:border-slate-500 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Pink checkmark badge in top-right when active */}
                  {hideImages && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#db2777] text-white flex items-center justify-center shadow-lg border-2 border-[#0b1322] animate-scale-in">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Lime Green Hide Images Icon */}
                  <div className="w-7 h-7 flex items-center justify-center text-lime-300 mb-1 group-hover:scale-110 transition-transform">
                    <ImageOff className="w-5 h-5 stroke-[1.8]" />
                  </div>

                  <span className="text-[11px] font-medium text-slate-100 tracking-tight leading-tight">
                    { isHi ? 'छवियां छिपाएं' : 'Hide Images' }
                  </span>
                </button>

                {/* Card 2: Big Cursor */}
                <button
                  type="button"
                  onClick={handleBigCursorToggle}
                  className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all text-center select-none group ${
                    bigCursor
                      ? 'bg-slate-900 border-pink-500/80 shadow-md ring-1 ring-pink-500/40'
                      : 'bg-black/50 border-slate-700/80 hover:border-slate-500 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Pink checkmark badge in top-right when active */}
                  {bigCursor && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#db2777] text-white flex items-center justify-center shadow-lg border-2 border-[#0b1322] animate-scale-in">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Lime Green Radiating Pointer Cursor Icon */}
                  <div className="w-7 h-7 flex items-center justify-center text-lime-300 mb-1 group-hover:scale-110 transition-transform">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M12 2v2" />
                      <path d="M19 5l-1.5 1.5" />
                      <path d="M22 12h-2" />
                      <path d="M5 5l1.5 1.5" />
                      <path d="M2 12h2" />
                      <path d="M10 9l8 6-3.5 1 2.5 4.5-2 1-2.5-4.5-3.5 2.5z" fill="currentColor" />
                    </svg>
                  </div>

                  <span className="text-[11px] font-medium text-slate-100 tracking-tight leading-tight">
                    { isHi ? 'बड़ा कर्सर' : 'Big Cursor' }
                  </span>
                </button>

                {/* Card 3: Highlight Links */}
                <button
                  type="button"
                  onClick={handleHighlightLinksToggle}
                  className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border transition-all text-center select-none group ${
                    highlightLinks
                      ? 'bg-slate-900 border-pink-500/80 shadow-md ring-1 ring-pink-500/40'
                      : 'bg-black/50 border-slate-700/80 hover:border-slate-500 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Pink checkmark badge in top-right when active */}
                  {highlightLinks && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#db2777] text-white flex items-center justify-center shadow-lg border-2 border-[#0b1322] animate-scale-in">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}

                  {/* Lime Green Link Icon */}
                  <div className="w-7 h-7 flex items-center justify-center text-lime-300 mb-1 group-hover:scale-110 transition-transform">
                    <Link2 className="w-5 h-5 stroke-[2]" />
                  </div>

                  <span className="text-[11px] font-medium text-slate-100 tracking-tight leading-tight">
                    { isHi ? 'लिंक उभारें' : 'Highlight Links' }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
