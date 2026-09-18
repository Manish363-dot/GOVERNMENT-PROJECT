import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Truck, ShieldCheck, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TopBarLogos } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const PLACEHOLDER_IMAGES = [
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.09 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.08 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.04 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.14 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.00 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.14 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.13 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.15 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.16 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.13 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM (2).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.01 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.54 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.03 PM.jpeg',
];

// All images for bottom grid (complete collection)
const ALL_GALLERY_IMAGES = [
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.38.57 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.38.59 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.39.01 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.39.05 PM copy.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.39.05 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.39.50 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.40.20 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.40.35 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.40.37 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.40.55 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.40.56 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.41.00 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.41.01 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.41.02 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.41.04 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.41.05 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.54 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM (2).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.43.56 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.00 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.01 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.03 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.03 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.04 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.04 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.05 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.07 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.08 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.09 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.11 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.13 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.13 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.14 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.14 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.15 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.16 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.17 PM (1).jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.17 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.20 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.21 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.22 PM.jpeg',
    '/assets/gallery/WhatsApp Image 2026-09-14 at 6.44.23 PM.jpeg',
    '/assets/gallery/image copy 2.png',
    '/assets/gallery/image copy.png',

];

// Single Grid Item Component with progressive image loading & skeleton preview
function GalleryGridItem({ src, index, onClick }: { src: string; index: number; onClick: () => void }) {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div
            onClick={onClick}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-950/80 border border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:border-amber-400/60 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group transform-gpu"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60 z-10 pointer-events-none"></div>

            {/* Skeleton Pulse during initial decode */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-navy-900/90 animate-pulse flex items-center justify-center z-0">
                    <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Optimized Grid Image */}
            <img
                loading="lazy"
                decoding="async"
                src={src}
                alt={`Gallery photo ${index + 1}`}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}

export function BlogGalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Touch Swipe Ref
    const touchStartX = useRef(0);

    // 1. Instant Background Image Preloader for zero lag during slideshow
    useEffect(() => {
        if (!isOpen) return;

        // Preload all carousel images immediately into browser cache
        PLACEHOLDER_IMAGES.forEach((src) => {
            const img = new Image();
            img.src = src;
        });

        // Preload grid images in background
        const timer = setTimeout(() => {
            ALL_GALLERY_IMAGES.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [isOpen]);

    // 2. GUARANTEED CONTINUOUS AUTO-SLIDE EVERY 2 SECONDS
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % PLACEHOLDER_IMAGES.length);
        }, 2000);

        return () => clearInterval(timer);
    }, [isOpen]);

    // 3. Keyboard navigation & Body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % PLACEHOLDER_IMAGES.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + PLACEHOLDER_IMAGES.length) % PLACEHOLDER_IMAGES.length);
    };

    // Touch Swipe Handlers for mobile smoothness
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        if (diff > 40) nextImage();
        else if (diff < -40) prevImage();
    };

    const prevIndex = (currentIndex - 1 + PLACEHOLDER_IMAGES.length) % PLACEHOLDER_IMAGES.length;
    const nextIndex = (currentIndex + 1) % PLACEHOLDER_IMAGES.length;

    // Handle clicking a grid item
    const handleGridItemClick = (src: string) => {
        const carouselIdx = PLACEHOLDER_IMAGES.indexOf(src);
        if (carouselIdx !== -1) {
            setCurrentIndex(carouselIdx);
        }
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
            {/* Ambient Background Image */}
            <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                    backgroundImage: `url('https://i.pinimg.com/1200x/87/10/6a/87106a39570e3ebd36a5ef2fd97f9995.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            {/* ── Main Header Navbar ── */}
            <header className="relative z-20 shrink-0 bg-white border-b border-slate-200 shadow-xs">
                {/* 1. Top logos strip */}
                <TopBarLogos variant="public" />

                {/* 2. Official Government Strip */}
                <div className="bg-navy-900 text-slate-200 text-[11px] py-1.5 px-4 sm:px-6 border-b border-navy-800">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                            <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-ukgreen-900/60 text-emerald-300 text-[10px] font-semibold tracking-wide uppercase border border-emerald-700/40">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                {t('nav.govBadgeHi')}
                            </span>
                            <span className="hidden md:inline text-slate-300">|</span>
                            <span className="hidden sm:inline text-slate-300">{t('nav.govSubtitle')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="hidden lg:flex items-center gap-1.5 text-[11px]">
                                <PhoneCall className="w-3 h-3 text-amber-400" />
                                <span>{t('nav.helpline')}: <strong className="text-white">1800-185-1850</strong></span>
                            </div>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>

                {/* 3. Tricolor bar */}
                <div className="uk-tricolor-line" />

                {/* 4. Brand row + Close button */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo & Identity */}
                        <div className="flex items-center gap-3">
                            <img src="/assets/app-logo.png" alt="Zila Panchayat Safai Logo" className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-lg shadow-xs" />
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-poppins font-bold text-navy-900 text-lg sm:text-xl tracking-tight leading-none">
                                        {t('nav.brandName')}
                                    </span>
                                </div>
                                <span className="text-[11px] font-bold text-ukgreen-800 tracking-wide uppercase block mt-0.5">
                                    {t('nav.brandTagline')}
                                </span>
                            </div>
                        </div>

                        {/* Page title pill */}
                        <div className="hidden md:flex flex-col items-center text-center">
                            <span className="font-poppins font-extrabold text-navy-900 text-base sm:text-lg tracking-tight leading-tight">
                                {t('nav.gallerySlogan')}
                            </span>
                            <span className="text-[10px] font-bold text-ukgreen-800 tracking-[0.15em] uppercase mt-0.5">
                                {t('nav.gallerySloganSub')}
                            </span>
                        </div>

                        {/* Close button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="group flex items-center gap-2 border-slate-300 text-navy-900 hover:bg-red-50 hover:border-red-400 hover:text-red-600 font-bold transition-all duration-200"
                            aria-label="Close gallery"
                        >
                            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="hidden sm:inline">बंद करें</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <div
                ref={scrollAreaRef}
                id="modal-scroll-area"
                className="relative z-10 px-4 sm:px-8 py-6 flex flex-col overflow-y-auto overflow-x-hidden flex-1 scroll-smooth transform-gpu"
            >
                {/* Carousel Area — Smooth GPU Crossfade Stack */}
                <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative w-full max-w-7xl mx-auto flex items-center justify-center select-none py-6 pb-12"
                >
                    {/* Left Tilted Image (Previous) */}
                    <div className="hidden sm:block absolute left-0 md:left-8 top-1/2 -translate-y-1/2 w-[25%] md:w-[22%] aspect-[4/3] z-0 opacity-[0.65] shadow-lg border border-slate-200/50 p-1.5 bg-white -rotate-[3deg] scale-[0.85] transition-all duration-700 pointer-events-none rounded-sm blur-[1px] overflow-hidden">
                        {PLACEHOLDER_IMAGES.map((imgSrc, idx) => (
                            <img
                                key={`prev-${imgSrc}`}
                                loading="eager"
                                decoding="async"
                                src={imgSrc}
                                alt=""
                                className={`absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] object-cover rounded-sm grayscale-[15%] transition-opacity duration-700 ease-in-out transform-gpu ${idx === prevIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Right Tilted Image (Next) */}
                    <div className="hidden sm:block absolute right-0 md:right-8 top-1/2 -translate-y-1/2 w-[25%] md:w-[22%] aspect-[4/3] z-0 opacity-[0.65] shadow-lg border border-slate-200/50 p-1.5 bg-white rotate-[3deg] scale-[0.85] transition-all duration-700 pointer-events-none rounded-sm blur-[1px] overflow-hidden">
                        {PLACEHOLDER_IMAGES.map((imgSrc, idx) => (
                            <img
                                key={`next-${imgSrc}`}
                                loading="eager"
                                decoding="async"
                                src={imgSrc}
                                alt=""
                                className={`absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] object-cover rounded-sm grayscale-[15%] transition-opacity duration-700 ease-in-out transform-gpu ${idx === nextIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Left Arrow */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        className="absolute left-1 sm:left-1/4 md:left-[21%] z-30 p-2.5 sm:p-3 bg-white/95 hover:bg-white hover:scale-110 active:scale-95 text-navy-900 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200 transition-all focus:outline-none cursor-pointer"
                        aria-label="Previous Image"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-navy-900" />
                    </button>

                    {/* Main Image Container — Stacked Hardware Accelerated Crossfade */}
                    <div className="relative z-10 w-full sm:w-[65%] md:w-[50%] lg:w-[42%] flex flex-col items-center group">
                        {/* Soft depth shadow layer */}
                        <div className="absolute inset-0 bg-black/10 translate-y-3 blur-xl rounded-md transition-all duration-500"></div>

                        {/* Main Polaroid Frame */}
                        <div className="relative w-full aspect-[4/3] p-1.5 sm:p-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/80 rounded-md overflow-hidden transform-gpu">
                            {PLACEHOLDER_IMAGES.map((imgSrc, idx) => (
                                <img
                                    key={imgSrc}
                                    loading="eager"
                                    decoding="async"
                                    src={imgSrc}
                                    alt={`Gallery featured image ${idx + 1}`}
                                    className={`absolute inset-1.5 sm:inset-2 w-[calc(100%-12px)] sm:w-[calc(100%-16px)] h-[calc(100%-12px)] sm:h-[calc(100%-16px)] object-cover rounded-[2px] transition-all duration-700 ease-in-out transform-gpu will-change-[opacity,transform] ${idx === currentIndex
                                        ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                                        : 'opacity-0 scale-[1.03] z-0 pointer-events-none'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-1 sm:right-1/4 md:right-[21%] z-30 p-2.5 sm:p-3 bg-white/95 hover:bg-white hover:scale-110 active:scale-95 text-navy-900 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200 transition-all focus:outline-none cursor-pointer"
                        aria-label="Next Image"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-navy-900" />
                    </button>
                </div>

                {/* Editorial Caption Area */}
                <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 mt-6 sm:mt-8 mb-6 z-10 relative">
                    <div className="text-white font-semibold text-base sm:text-lg font-poppins drop-shadow-md">
                        स्वच्छता अभियान — अल्मोड़ा
                    </div>
                    <div className="text-slate-200 text-xs sm:text-sm font-medium mt-1 drop-shadow-md">
                        Community Cleanliness Initiative
                    </div>
                    <div className="inline-flex items-center justify-center gap-1.5 mt-3 px-4 py-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-full shadow-sm text-[11px] sm:text-xs font-semibold text-slate-700 tracking-wider">
                        {String(currentIndex + 1).padStart(2, '0')} <span className="text-slate-300">/</span> {PLACEHOLDER_IMAGES.length}
                    </div>
                </div>

                {/* ── Official Government Quote & Ministers Banner ── */}
                <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 mt-4 mb-10">
                    <div
                        className="w-full p-4 sm:p-6 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-amber-500/40 relative overflow-hidden backdrop-blur-2xl"
                        style={{
                            background: 'radial-gradient(circle at 15% 15%, #0e274c 0%, #08162e 60%, #040d1c 100%)'
                        }}
                    >
                        {/* Top Tricolor Accent Line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1.5 shadow-sm"
                            style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }}
                        ></div>

                        {/* Subtle Background Glows */}
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mt-1 relative z-10">
                            {/* Main Quote Card (PM Modi) */}
                            <div
                                className="lg:col-span-8 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-amber-400/40 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 33, 64, 0.85) 0%, rgba(7, 18, 38, 0.95) 100%)'
                                }}
                            >
                                {/* PM Photo Frame */}
                                <div className="shrink-0 w-36 h-44 sm:w-48 sm:h-56 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(245,158,11,0.2)] border-2 border-amber-400/60 bg-navy-950 relative group-hover:border-amber-300 transition-colors">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkYc-5pA2MCec7QWTqpfvgBUTortuntJNrFuQgU82KEg&s=10"
                                        alt="Shri Narendra Modi"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-navy-950 to-transparent"></div>
                                </div>

                                {/* Quote Text Content */}
                                <div className="flex-1 flex flex-col justify-between text-center sm:text-left text-white h-full py-1">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase mb-3 shadow-inner">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                            SWACHH BHARAT MISSION URBAN 2.0
                                        </div>

                                        <p className="text-slate-100 text-base sm:text-lg md:text-xl font-semibold leading-relaxed tracking-wide drop-shadow-md font-poppins">
                                            “The goal of the{' '}
                                            <span className="text-amber-300 font-bold underline decoration-amber-400/40 underline-offset-4">
                                                'Swachh Bharat Mission'
                                            </span>{' '}
                                            is to make a garbage-free city, a city completely free of garbage.”
                                        </p>
                                    </div>

                                    <div className="mt-5 border-t border-white/10 pt-3.5 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-2">
                                        <div>
                                            <p className="text-amber-400 font-bold text-base sm:text-lg tracking-wide drop-shadow">
                                                Shri Narendra Modi
                                            </p>
                                            <p className="text-slate-300 text-xs font-semibold tracking-wider uppercase mt-0.5">
                                                Hon'ble Prime Minister of India
                                            </p>
                                        </div>

                                        <div className="opacity-90 hover:opacity-100 transition-opacity">
                                            <span
                                                className="text-amber-300/80 text-xl font-extrabold italic tracking-widest select-none drop-shadow"
                                                style={{ fontFamily: 'Georgia, serif' }}
                                            >
                                                नरेन्द्र मोदी
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minister 1 Card (CM Pushkar Singh Dhami) */}
                            <div
                                className="lg:col-span-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 33, 64, 0.85) 0%, rgba(7, 18, 38, 0.95) 100%)'
                                }}
                            >
                                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/50 mb-3 bg-navy-950 relative group-hover:border-amber-300 transition-colors">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwLYm9zrN7a6xEJTtVp9Wc_RJ7rNJ41Mbh-6SmuF5Hld3NI3rtQsdTGqELMyivItcMzyHYBRNq3UBZeG5RVcwsDM87oCQOdxKc-zBjzYHC&s=10"
                                        alt="Shri Pushkar Singh Dhami"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <p className="text-white font-extrabold text-xs sm:text-sm leading-tight group-hover:text-amber-300 transition-colors">
                                    Shri Pushkar Singh Dhami
                                </p>
                                <p className="text-amber-400 text-[10px] sm:text-xs font-semibold mt-1">
                                    Hon'ble Chief Minister
                                </p>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] font-semibold mt-1">
                                    Uttarakhand
                                </span>
                            </div>

                            {/* Minister 2 Card (Satpal Maharaj) */}
                            <div
                                className="lg:col-span-2 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-amber-400/40 hover:-translate-y-1 transition-all duration-300"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(15, 33, 64, 0.85) 0%, rgba(7, 18, 38, 0.95) 100%)'
                                }}
                            >
                                <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-400/50 mb-3 bg-navy-950 relative group-hover:border-amber-300 transition-colors">
                                    <img
                                        loading="lazy"
                                        decoding="async"
                                        src="https://upload.wikimedia.org/wikipedia/commons/2/25/Shri_Satpal_Maharaj.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                                        alt="Shri Satpal Maharaj"
                                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                <p className="text-white font-extrabold text-xs sm:text-sm leading-tight group-hover:text-amber-300 transition-colors">
                                    Shri Satpal Maharaj
                                </p>
                                <p className="text-amber-400 text-[10px] sm:text-xs font-semibold mt-1">
                                    Hon'ble Cabinet Minister
                                </p>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] font-semibold mt-1">
                                    Uttarakhand
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Media Grid Section */}
                <div className="w-full max-w-7xl mx-auto mb-16 px-2 sm:px-6 mt-4">
                    <div className="flex flex-col items-center justify-center mb-10 text-center">
                        <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-tight font-poppins">
                            {t('nav.galleryGridTitle')}
                        </h3>
                        <p className="text-amber-300/90 text-xs sm:text-sm font-medium max-w-2xl px-4 leading-relaxed drop-shadow">
                            {t('nav.galleryGridSubtitle')}
                        </p>
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full mt-3 opacity-80"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {ALL_GALLERY_IMAGES.map((img, idx) => (
                            <GalleryGridItem
                                key={img + idx}
                                src={img}
                                index={idx}
                                onClick={() => handleGridItemClick(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Executive Work Summary & Impact Overview Section ── */}
                <div className="w-full max-w-7xl mx-auto mb-20 px-2 sm:px-6">
                    <div className="w-full p-6 sm:p-8 rounded-3xl bg-navy-900/80 backdrop-blur-xl border border-white/15 shadow-[0_15px_45px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* Top Tricolor Accent Line */}
                        <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{ background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }}
                        ></div>

                        {/* Heading */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
                            <div>
                                <h4 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow font-poppins">
                                    {t('nav.gallerySummaryTitle')}
                                </h4>
                                <p className="text-amber-400 text-xs font-semibold tracking-wider uppercase mt-1">
                                    {t('nav.gallerySummarySub')}
                                </p>
                            </div>
                            <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
                                📸 {t('nav.gallerySummaryBadge')}
                            </span>
                        </div>

                        {/* 3 Key Gallery Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {/* Highlight 1 */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold shrink-0 text-sm">
                                    🚛
                                </div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1">{t('nav.galleryHighlight1Title')}</h5>
                                    <p className="text-slate-300 text-xs leading-relaxed">
                                        {t('nav.galleryHighlight1Desc')}
                                    </p>
                                </div>
                            </div>

                            {/* Highlight 2 */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-300 font-bold shrink-0 text-sm">
                                    🧹
                                </div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1">{t('nav.galleryHighlight2Title')}</h5>
                                    <p className="text-slate-300 text-xs leading-relaxed">
                                        {t('nav.galleryHighlight2Desc')}
                                    </p>
                                </div>
                            </div>

                            {/* Highlight 3 */}
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all duration-300 flex items-start gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold shrink-0 text-sm">
                                    🏔️
                                </div>
                                <div>
                                    <h5 className="text-white font-bold text-sm mb-1">{t('nav.galleryHighlight3Title')}</h5>
                                    <p className="text-slate-300 text-xs leading-relaxed">
                                        {t('nav.galleryHighlight3Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Subtext */}
                        <div className="mt-5 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
                            <span>{t('nav.galleryFooterLeft')}</span>
                            <span className="font-semibold text-amber-300">{t('nav.gallerySlogan')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
