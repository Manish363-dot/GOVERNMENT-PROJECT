import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BG_IMAGE_NAMES = ['image1.webp','image2.webp', 'image3.webp', 'image4.webp', 'image5.webp','image6.webp'];

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL;

const HERO_IMAGES = BG_IMAGE_NAMES.map(
  (filename) => `${S3_BUCKET}/portal-logos/${filename}`
);

// Dignitary photo image5.jpg from 'portal-logos' bucket
const DIGNITARY_IMAGE_URL = `${S3_BUCKET}/portal-logos/ModiJi.webp`;
const CM_IMAGE_URL = `${S3_BUCKET}/portal-logos/CM.webp`;
const MK_IMAGE_URL = `${S3_BUCKET}/portal-logos/MK.webp`;
const CH_IMAGE_URL = `${S3_BUCKET}/portal-logos/CH.webp`;
const AMA_IMAGE_URL = `${S3_BUCKET}/portal-logos/AMA.webp`;

interface Official {
  id: number;
  nameEn: string;
  nameHi: string;
  designationEn: string;
  designationHi: string;
  image: string;
}

const OFFICIALS: Official[] = [
  {
    id: 1,
    nameEn: "Sh. Pushkar Singh Dhami",
    nameHi: "श्री पुष्कर सिंह धामी",
    designationEn: "Hon'ble Chief Minister of Uttarakhand",
    designationHi: "माननीय मुख्यमंत्री, उत्तराखण्ड",
    image: CM_IMAGE_URL,
  },
  {
    id: 2,
    nameEn: "Sh. Madan Kaushik",
    nameHi: "श्री मदन कौशिक",
    designationEn: "Hon'ble Panchayati Raj Minister, Uttarakhand",
    designationHi: "माननीय पंचायती राज मंत्री, उत्तराखण्ड",
    image: MK_IMAGE_URL,
  },
  {
    id: 3,
    nameEn: "Smt. Hema Gaira",
    nameHi: "श्रीमती हेमा गैरा",
    designationEn: "Chairperson, Zila Panchayat Almora",
    designationHi: "अध्यक्ष, जिला पंचायत अल्मोड़ा",
    image: CH_IMAGE_URL,
  },
  {
    id: 4,
    nameEn: "Sh. Rajesh Kumar",
    nameHi: "श्री राजेश कुमार",
    designationEn: "Apar Mukhya Adhikari (AMA), Almora",
    designationHi: "अपर मुख्य अधिकारी (AMA), अल्मोड़ा",
    image: AMA_IMAGE_URL,
  },
];

export const HeroSection = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [img5Error, setImg5Error] = useState(false);
  const [isAlmoraRolling, setIsAlmoraRolling] = useState(false);
  const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progressive slide loading: Start with slide 0 (immediate) and 1, then load subsequent slides as carousel advances
  const [loadedSlideIndices, setLoadedSlideIndices] = useState<Set<number>>(() => new Set([0, 1]));

  useEffect(() => {
    setLoadedSlideIndices((prev) => {
      const nextIdx = (currentImageIndex + 1) % HERO_IMAGES.length;
      if (prev.has(currentImageIndex) && prev.has(nextIdx)) return prev;
      const updated = new Set(prev);
      updated.add(currentImageIndex);
      updated.add(nextIdx);
      return updated;
    });
  }, [currentImageIndex]);

  const handleAlmoraClick = useCallback(() => {
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
    }
    setIsAlmoraRolling(false);
    requestAnimationFrame(() => {
      setIsAlmoraRolling(true);
      rollTimeoutRef.current = setTimeout(() => {
        setIsAlmoraRolling(false);
      }, 950);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) {
        clearTimeout(rollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToPledge = useCallback(() => {
    const pledgeElement = document.getElementById('pledge');
    if (pledgeElement) {
      pledgeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Prioritized image loading: load primary hero image and dignitary first,
  // then defer the rest of the carousel slides to avoid initial network contention
  useEffect(() => {
    // 1. Immediate priority: First hero slide and dignitary
    const img1 = new Image();
    img1.src = HERO_IMAGES[0];

    const imgDignitary = new Image();
    imgDignitary.src = DIGNITARY_IMAGE_URL;

    // 2. Defer background images for upcoming slides after initial render
    const deferTimer = setTimeout(() => {
      HERO_IMAGES.slice(1).forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }, 2500);

    return () => clearTimeout(deferTimer);
  }, []);

  // Smooth automatic transition every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-[#07182f] text-white border-b border-blue-600/30">
      {/* Background Slideshow with Smooth Cross-Fade Transition */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {HERO_IMAGES.map((imageUrl, idx) => (
          <div
            key={imageUrl}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            style={{ backgroundImage: loadedSlideIndices.has(idx) ? `url(${imageUrl})` : 'none' }}
          />
        ))}

        {/* Lighter Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07182f]/70 via-[#0d3262]/55 to-[#1d4ed8]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-0">
        {/* Main Hero Content - Centered */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center animate-fade-in">
          <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight text-white max-w-4xl mx-auto drop-shadow-md">
            <span className="block text-white">
              {isHi ? (
                <>
                  जिला पंचायत{' '}
                  <span 
                    onClick={handleAlmoraClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAlmoraClick();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Click to roll Almora text"
                    className={`almora-roll-box relative ${isAlmoraRolling ? 'is-rolling' : ''} px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-yellow-400/20 border border-yellow-400/50 text-white backdrop-blur-xs shadow-xs mx-1 cursor-pointer select-none`}
                    title="अल्मोड़ा • Click to Roll"
                  >
                    {['अ', 'ल्मो', 'ड़ा'].map((part, idx) => (
                      <span
                        key={idx}
                        className="almora-roll-letter"
                        style={{ animationDelay: `${idx * 60}ms` }}
                      >
                        {part}
                      </span>
                    ))}
                    {/* Top right sparkle icon (simple & static, non-blinking) */}
                    <Sparkles 
                      className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 drop-shadow-xs pointer-events-none" 
                      aria-hidden="true" 
                    />
                  </span>
                </>
              ) : (
                <>
                  District Panchayat{' '}
                  <span 
                    onClick={handleAlmoraClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAlmoraClick();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Click to roll Almora text"
                    className={`almora-roll-box relative ${isAlmoraRolling ? 'is-rolling' : ''} px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-yellow-400/20 border border-yellow-400/50 text-white backdrop-blur-xs shadow-xs mx-1 cursor-pointer select-none`}
                    title="Click to Roll"
                  >
                    {'Almora'.split('').map((char, idx) => (
                      <span
                        key={idx}
                        className="almora-roll-letter"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        {char}
                      </span>
                    ))}
                    {/* Top right sparkle icon (simple & static, non-blinking) */}
                    <Sparkles 
                      className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 drop-shadow-xs pointer-events-none" 
                      aria-hidden="true" 
                    />
                  </span>
                </>
              )}
            </span>
            <span className="block mt-1 sm:mt-2 text-slate-100 text-lg sm:text-2xl md:text-3xl font-medium tracking-normal">
              {isHi ? 'उत्तराखण्ड शासन • पंचायती राज विभाग' : 'Government of Uttarakhand • Panchayati Raj Department'}
            </span>
            <span className="block mt-1 sm:mt-2 text-yellow-400 font-extrabold text-xl sm:text-2xl md:text-4xl">
              {isHi ? 'मुख्य आधिकारिक पोर्टल' : 'Official Administration Portal'}
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-8 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
            {isHi 
              ? 'कुमाऊं की सांस्कृतिक राजधानी में पंचायती राज तंत्र, समग्र ग्रामीण विकास, एवं जन-कल्याण हेतु समर्पित संवैधानिक प्रशासनिक निकाय।'
              : 'Apex constitutional district local governance body driving sustainable rural progress, modern civic amenities, and citizen empowerment across Almora.'}
          </p>

          {/* Subtle Slide Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-6 sm:mt-8 mb-4">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Dignitary Quote Card Banner & Additional Sections */}
          <div className="mt-6 sm:mt-10 w-full max-w-7xl mx-auto px-2 sm:px-6 relative z-30 translate-y-2 sm:translate-y-[1%] mb-8 sm:-mb-20">
            {/* Main PM Card */}
            <div className="relative bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:py-5 sm:px-6 sm:pl-28 md:pl-32 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 min-h-[100px] mb-4">
              {/* Dignitary Photo */}
              <div className="sm:absolute -top-8 sm:top-1/2 sm:-translate-y-1/2 sm:-left-8 md:-left-10 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 shrink-0 select-none mx-auto sm:mx-0">
                {!img5Error ? (
                  <img
                    src={DIGNITARY_IMAGE_URL}
                    alt={isHi ? "माननीय प्रधानमंत्री - स्वच्छ भारत मिशन प्रेरणा" : "Hon'ble Prime Minister - Swachh Bharat Mission Inspiration"}
                    width={128}
                    height={128}
                    onError={() => setImg5Error(true)}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Quote Content & Details */}
              <div className="text-center sm:text-left w-full sm:pl-3">
                <p className="text-xs sm:text-sm md:text-[14px] lg:text-[15px] font-medium text-slate-700 leading-relaxed">
                  <span className="text-red-500 font-serif text-lg sm:text-xl font-bold mr-1 inline leading-none">
                    “
                  </span>
                  {t('hero.slogan')}
                  <span className="text-red-500 font-serif text-lg sm:text-xl font-bold ml-1 inline leading-none">
                    ”
                  </span>
                </p>

                {/* Red Accent Divider */}
                <div className="w-10 h-0.5 bg-red-500 my-2 mx-auto sm:mx-0 rounded-full" />

                {/* Speaker & Context Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-slate-600 font-medium text-center sm:text-left">
                  <span className="font-semibold text-slate-800">
                    {t('hero.designation')}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Officials Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 pb-4 items-stretch">
              {OFFICIALS.map((official) => {
                const displayName = isHi ? official.nameHi : official.nameEn;
                const displayDesignation = isHi ? official.designationHi : official.designationEn;

                return (
                  <div
                    key={official.id}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100 p-3 sm:p-5 md:p-6 flex flex-col items-center text-center justify-start h-full transition-all hover:-translate-y-1.5 hover:shadow-xl duration-300"
                  >
                    {/* Circular Avatar with soft white ring & shadow */}
                    <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-50 ring-2 sm:ring-4 ring-white shadow-md mb-2 sm:mb-4 shrink-0">
                      {official.image ? (
                        <img
                          src={official.image}
                          alt={`${displayName} - ${displayDesignation}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                          Image {official.id}
                        </div>
                      )}
                    </div>

                    {/* Dignitary Name */}
                    <h4 className="text-[11px] sm:text-sm md:text-[15px] lg:text-[17px] font-bold text-slate-900 leading-snug mb-1">
                      {displayName}
                    </h4>

                    {/* Designation */}
                    <p className="text-[10px] sm:text-xs md:text-[13px] text-slate-500 font-normal leading-relaxed">
                      {displayDesignation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});
