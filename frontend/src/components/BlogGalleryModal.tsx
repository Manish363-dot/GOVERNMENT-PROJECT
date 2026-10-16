import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, ShieldCheck, PhoneCall, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TopBarLogos, PANCHAYATI_RAJ_LOGO_URL } from '@/components/TopBarLogos';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Single Grid Item Component with progressive image loading & skeleton preview
const GalleryGridItem = React.memo(({ src, index, onClick }: { src: string; index: number; onClick: (index: number) => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleClick = useCallback(() => {
        onClick(index);
    }, [onClick, index]);

    return (
        <div
            onClick={handleClick}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-950/80 border border-white/15 shadow-[0_8px_25px_rgba(0,0,0,0.4)] hover:border-amber-400/60 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group transform-gpu"
        >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60 z-10 pointer-events-none"></div>

            {/* Hover Expand Icon Badge */}
            <div className="absolute inset-0 bg-navy-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                <div className="p-2.5 bg-black/60 backdrop-blur-md rounded-full text-amber-300 border border-amber-400/40 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 className="w-5 h-5" />
                </div>
            </div>

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
});

export const BlogGalleryModal = React.memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Touch Swipe Refs
    const touchStartX = useRef(0);
    const touchLightboxStartX = useRef(0);

    // 1. Fetch Dynamic Media from API
    const [mediaList, setMediaList] = useState<string[]>([]);
    const [gridMedia, setGridMedia] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/media/blog`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const urls = data.map((m: any) => m.url);
                        setMediaList(urls);
                        setGridMedia(urls);
                    } else {
                        setMediaList([]);
                        setGridMedia([]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch blog media:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    // 2. GUARANTEED CONTINUOUS AUTO-SLIDE EVERY 2 SECONDS
    useEffect(() => {
        if (!isOpen || mediaList.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % mediaList.length);
        }, 2000);

        return () => clearInterval(timer);
    }, [isOpen, mediaList]);

    const nextImage = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.max(1, mediaList.length));
    }, [mediaList.length]);

    const prevImage = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + mediaList.length) % Math.max(1, mediaList.length));
    }, [mediaList.length]);

    // Handle clicking a grid item -> Open in full-screen large view
    const handleGridItemClick = useCallback((index: number) => {
        setLightboxImageIndex(index);
    }, []);

    const nextLightboxImage = useCallback(() => {
        if (gridMedia.length === 0) return;
        setLightboxImageIndex((prev) => (prev !== null ? (prev + 1) % gridMedia.length : 0));
    }, [gridMedia.length]);

    const prevLightboxImage = useCallback(() => {
        if (gridMedia.length === 0) return;
        setLightboxImageIndex((prev) => (prev !== null ? (prev - 1 + gridMedia.length) % gridMedia.length : 0));
    }, [gridMedia.length]);

    const handleLightboxTouchStart = (e: React.TouchEvent) => {
        touchLightboxStartX.current = e.targetTouches[0].clientX;
    };

    const handleLightboxTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchLightboxStartX.current - touchEndX;
        if (diff > 40) {
            nextLightboxImage();
        } else if (diff < -40) {
            prevLightboxImage();
        }
    };

    // 3. Keyboard navigation & Body scroll lock
    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxImageIndex !== null) {
                if (e.key === 'ArrowRight') nextLightboxImage();
                else if (e.key === 'ArrowLeft') prevLightboxImage();
                else if (e.key === 'Escape') setLightboxImageIndex(null);
                return;
            }

            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, nextImage, prevImage, lightboxImageIndex, nextLightboxImage, prevLightboxImage]);

    // Reset lightbox when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setLightboxImageIndex(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

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

    const prevIndex = (currentIndex - 1 + mediaList.length) % Math.max(1, mediaList.length);
    const nextIndex = (currentIndex + 1) % Math.max(1, mediaList.length);

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
                            <img src={PANCHAYATI_RAJ_LOGO_URL} alt="Zila Panchayat Safai Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-lg shadow-xs" />
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
                            <div className="w-full flex justify-between items-center text-[10px] font-bold text-ukgreen-800 tracking-normal uppercase mt-0.5">
                                {t('nav.gallerySloganSub').split('•').map((part, index, array) => (
                                    <React.Fragment key={index}>
                                        <span>{part.trim()}</span>
                                        {index < array.length - 1 && <span>•</span>}
                                    </React.Fragment>
                                ))}
                            </div>
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
                        {mediaList.map((imgSrc, idx) => (
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
                        {mediaList.map((imgSrc, idx) => (
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
                        className="absolute left-1 sm:left-1/4 md:left-[21%] z-30 p-2.5 sm:p-3 bg-white/95 hover:bg-white hover:scale-110 active:scale-95 text-navy-900 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200 transition-all focus:outline-none cursor-pointer disabled:opacity-50"
                        aria-label="Previous Image"
                        disabled={mediaList.length <= 1}
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-navy-900" />
                    </button>

                    {/* Main Image Container — Stacked Hardware Accelerated Crossfade */}
                    <div className="relative z-10 w-full sm:w-[65%] md:w-[50%] lg:w-[42%] flex flex-col items-center group">
                        {/* Soft depth shadow layer */}
                        <div className="absolute inset-0 bg-black/10 translate-y-3 blur-xl rounded-md transition-all duration-500"></div>

                        {/* Main Polaroid Frame */}
                        <div 
                            onClick={() => mediaList.length > 0 && setLightboxImageIndex(currentIndex)}
                            className="relative w-full aspect-[4/3] p-1.5 sm:p-2 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/80 rounded-md overflow-hidden transform-gpu flex items-center justify-center cursor-pointer group/polaroid"
                            title="बड़ी स्क्रीन में देखें / Click to view fullscreen"
                        >
                            {/* Hover Zoom Hint */}
                            <div className="absolute top-3 right-3 z-20 p-1.5 sm:p-2 bg-black/60 backdrop-blur-md rounded-full text-amber-300 opacity-0 group-hover/polaroid:opacity-100 transition-opacity duration-300 shadow-md pointer-events-none">
                                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            {isLoading ? (
                                <div className="absolute inset-1.5 sm:inset-2 w-[calc(100%-12px)] sm:w-[calc(100%-16px)] h-[calc(100%-12px)] sm:h-[calc(100%-16px)] bg-slate-200/50 animate-pulse rounded-[2px]" />
                            ) : mediaList.length > 0 ? mediaList.map((imgSrc, idx) => (
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
                            )) : (
                                <div className="text-slate-400 font-medium">No media uploaded yet</div>
                            )}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        className="absolute right-1 sm:right-1/4 md:right-[21%] z-30 p-2.5 sm:p-3 bg-white/95 hover:bg-white hover:scale-110 active:scale-95 text-navy-900 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.2)] border border-slate-200 transition-all focus:outline-none cursor-pointer disabled:opacity-50"
                        aria-label="Next Image"
                        disabled={mediaList.length <= 1}
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-navy-900" />
                    </button>
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
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, idx) => (
                                <div key={idx} className="aspect-[4/3] rounded-2xl bg-navy-950/80 border border-white/15 animate-pulse"></div>
                            ))
                        ) : gridMedia.length > 0 ? gridMedia.map((img, idx) => (
                            <GalleryGridItem
                                key={img + idx}
                                src={img}
                                index={idx}
                                onClick={() => handleGridItemClick(idx)}
                            />
                        )) : (
                            <div className="col-span-full py-10 text-center text-slate-400 font-medium">
                                No media uploaded yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── High-Definition Fullscreen Lightbox Modal ── */}
            {lightboxImageIndex !== null && gridMedia[lightboxImageIndex] && (
                <div 
                    className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
                    onClick={() => setLightboxImageIndex(null)}
                    onTouchStart={handleLightboxTouchStart}
                    onTouchEnd={handleLightboxTouchEnd}
                >
                    {/* Top Control Bar */}
                    <div 
                        className="w-full max-w-7xl mx-auto flex items-center justify-between z-20 pb-3 border-b border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-amber-400 font-bold text-xs sm:text-sm tracking-wide font-mono bg-white/10 px-3 py-1 rounded-full border border-white/15">
                                {lightboxImageIndex + 1} / {gridMedia.length}
                            </span>
                            <span className="text-white text-xs sm:text-sm font-semibold hidden sm:inline-block">
                                जिला पंचायत अल्मोड़ा • मीडिया संग्रह
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setLightboxImageIndex(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-red-600 text-white transition-all cursor-pointer border border-white/20 text-xs sm:text-sm font-semibold group shadow-md"
                            aria-label="Close fullscreen view"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                            <span>बंद करें</span>
                        </button>
                    </div>

                    {/* Centered Image Viewport with Previous / Next Arrows */}
                    <div 
                        className="relative flex-1 flex items-center justify-center my-3 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Prev Button */}
                        <button
                            type="button"
                            onClick={prevLightboxImage}
                            className="absolute left-1 sm:left-4 md:left-8 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-amber-300 border border-white/20 hover:border-amber-400 transition-all shadow-2xl cursor-pointer"
                            aria-label="Previous photo"
                        >
                            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>

                        {/* Large Image */}
                        <img
                            key={gridMedia[lightboxImageIndex]}
                            src={gridMedia[lightboxImageIndex]}
                            alt={`Fullscreen photo ${lightboxImageIndex + 1}`}
                            className="max-w-[94vw] max-h-[76vh] w-auto h-auto object-contain rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] border border-white/20 animate-in zoom-in-95 duration-200"
                        />

                        {/* Next Button */}
                        <button
                            type="button"
                            onClick={nextLightboxImage}
                            className="absolute right-1 sm:right-4 md:right-8 z-30 p-2.5 sm:p-3.5 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-amber-300 border border-white/20 hover:border-amber-400 transition-all shadow-2xl cursor-pointer"
                            aria-label="Next photo"
                        >
                            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
});
