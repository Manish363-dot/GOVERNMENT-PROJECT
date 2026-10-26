import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Maximize2, Sparkles, Image as ImageIcon, Grid, Layers } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface MediaPhoto {
  id: string;
  url: string;
  created_at?: string;
}

export function MediaGalleryPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [photos, setPhotos] = useState<MediaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch real uploaded media from database
  useEffect(() => {
    let isMounted = true;
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/media/blog`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && isMounted) {
            // Filter only valid image items
            const valid = data.filter((item: any) => item && typeof item.url === 'string' && item.url.trim().length > 0);
            setPhotos(valid);
          }
        }
      } catch (err) {
        console.error('Failed to load official media', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMedia();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard controls for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, photos.length]);

  const displayedPhotos = useMemo(() => {
    return photos.slice(0, visibleCount);
  }, [photos, visibleCount]);

  const handleThumbnailClick = (idx: number) => {
    setFeaturedIndex(idx);
    const container = thumbnailStripRef.current;
    if (container) {
      const child = container.children[idx] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  const nextFeatured = useCallback(() => {
    if (photos.length === 0) return;
    setFeaturedIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevFeatured = useCallback(() => {
    if (photos.length === 0) return;
    setFeaturedIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-28 text-slate-800">

      {/* ── 1. Top Government Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800/80 shadow-xs">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Uttarakhand tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-full shrink-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-poppins text-white tracking-tight leading-none">
                {isHi ? 'हमारा मीडिया' : 'Our Media Gallery'}
              </h1>
            </div>

            {/* Quick Slim Badge */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-1.5 border border-white/15 text-white shrink-0 shadow-sm flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-amber-300 leading-none">
                {photos.length > 0 ? photos.length : '—'}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium leading-none">
                {isHi ? 'छायाचित्र' : 'Official Photos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Modern Interactive Showcase (High-Impact Hero Photo) ── */}
      {photos.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 shadow-sm overflow-hidden">
            
            {/* Featured Big Canvas */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[500px] rounded-2xl overflow-hidden bg-slate-900 group">
              <img
                src={photos[featuredIndex]?.url}
                alt=""
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
              />

              {/* Gradient Vignette for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

              {/* Left Navigation Arrow */}
              <button
                type="button"
                onClick={prevFeatured}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-white/90 hover:bg-white text-navy-950 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Previous Featured"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                type="button"
                onClick={nextFeatured}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 bg-white/90 hover:bg-white text-navy-950 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Next Featured"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Photo Index Tag */}
              <div className="absolute bottom-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/15 text-white text-xs font-bold">
                {featuredIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Horizontal Thumbnail Strip for quick jumping */}
            <div
              ref={thumbnailStripRef}
              className="flex items-center gap-2.5 mt-3 sm:mt-4 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
              style={{ scrollbarWidth: 'none' }}
            >
              {photos.map((item, idx) => {
                const isActive = idx === featuredIndex;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => handleThumbnailClick(idx)}
                    className={`relative shrink-0 w-20 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'ring-2 ring-amber-400 scale-[1.03] shadow-md border-transparent'
                        : 'opacity-65 hover:opacity-100 border border-slate-200 hover:scale-102'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* ── 3. The Grand Photo Wall (Clean Static Grid, No Paragraphs) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Section Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-navy-900 tracking-tight">
              {isHi ? 'छायाचित्र दीर्घा' : 'Photo Gallery Wall'}
            </h2>
          </div>
        </div>

        {/* Loading state skeleton */}
        {isLoading && photos.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-xs">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold text-sm">
              {isHi ? 'वर्तमान में कोई छायाचित्र उपलब्ध नहीं है।' : 'No photos uploaded currently.'}
            </p>
          </div>
        ) : (
          <>
            {/* High-Quality Grid: Clean pure photos, no paragraphs, click to enlarge */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {displayedPhotos.map((item, index) => (
                <div
                  key={item.id || index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  title={isHi ? 'क्लिक करके बड़ा देखें' : 'Click to view full screen'}
                >
                  <img
                    loading="lazy"
                    src={item.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Ambient dark gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Floating Maximize Icon Badge */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="p-3 bg-black/60 backdrop-blur-md rounded-full text-amber-300 border border-amber-400/40 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {visibleCount < photos.length && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 12, photos.length))}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{isHi ? 'और तस्वीरें देखें' : 'View More Photos'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-semibold">
                    +{Math.min(12, photos.length - visibleCount)}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 4. Premium Fullscreen Lightbox ── */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar with Counter and Close Button */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto z-50 py-2">
            <div className="text-xs sm:text-sm font-bold text-white/90 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              {lightboxIndex + 1} / {photos.length}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(null);
              }}
              className="p-2 sm:p-2.5 bg-white/15 hover:bg-red-600/80 text-white rounded-full transition-colors cursor-pointer border border-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Center Main Lightbox Stage */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-7xl mx-auto my-auto overflow-hidden">
            {/* Prev Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
              }}
              className="absolute left-2 sm:left-4 z-50 p-3 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/15"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* Main Full-Res Photo */}
            <div
              className="max-h-[75vh] sm:max-h-[80vh] max-w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightboxIndex].url}
                alt=""
                className="max-h-[75vh] sm:max-h-[80vh] max-w-full w-auto object-contain rounded-xl select-none"
              />
            </div>

            {/* Next Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
              }}
              className="absolute right-2 sm:right-4 z-50 p-3 bg-white/10 hover:bg-white/25 active:scale-95 text-white rounded-full transition-all cursor-pointer backdrop-blur-md border border-white/15"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Bottom Thumbnails inside Lightbox for easy browsing */}
          <div
            className="w-full max-w-3xl mx-auto flex items-center gap-2 overflow-x-auto py-2 px-1 z-50 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
            style={{ scrollbarWidth: 'none' }}
          >
            {photos.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`shrink-0 w-12 sm:w-16 aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  idx === lightboxIndex
                    ? 'border-amber-400 ring-2 ring-amber-400 scale-105'
                    : 'border-white/20 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default MediaGalleryPage;
