import { useEffect, useState } from 'react';
import { Shield, Sparkles, Globe, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface TopBarLogoItem {
  id: string;
  title: string;
  file_name?: string;
  logo_url?: string;
  sort_order: number;
}

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayatimages.s3.ap-south-1.amazonaws.com';

export const PANCHAYATI_RAJ_LOGO_URL = `${S3_BUCKET}/portal-logos/logo2.webp`;

// 4 Default logo slots with descriptive official titles for accessibility (Lighthouse WCAG)
const DEFAULT_LOGOS: TopBarLogoItem[]   = [   
  {
    id: 'logo-1',
    title: 'उत्तराखंड शासन आधिकारिक राजचिह्न (Emblem of Uttarakhand)',
    file_name: 'logo1.png',
    sort_order: 1,
  },
  {
    id: 'logo-2',
    title: 'स्वच्छ भारत मिशन ग्रामीण (Swachh Bharat Mission)',
    file_name: 'logo5.png',
    sort_order: 2,
  },
  {
    id: 'logo-3',
    title: 'कार्यालय जिला पंचायत अल्मोड़ा (Zila Panchayat Almora)',
    file_name: 'logo3.png',
    sort_order: 3,
  },
  {
    id: 'logo-4',
    title: 'डिजिटल इंडिया एवं स्वच्छ देवभूमि (Digital India)',
    file_name: 'logo4.png',
    sort_order: 4,
  },
];

const FALLBACK_ICONS = [
  <Shield key="1" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />,
  <Sparkles key="2" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />,
  <Globe key="3" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />,
  <Award key="4" className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />,
];

interface TopBarLogosProps {
  variant?: 'public' | 'dashboard';
  className?: string;
}

export function TopBarLogos({ variant = 'public', className = '' }: TopBarLogosProps) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [logos, setLogos] = useState<TopBarLogoItem[]>(DEFAULT_LOGOS);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const withStorageUrls = DEFAULT_LOGOS.map((item) => {
      return {
        ...item,
        logo_url: `${S3_BUCKET}/portal-logos/${item.file_name}`,
      };
    });
    setLogos(withStorageUrls);
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const leftLogos = logos.slice(0, 2);
  const rightLogos = logos.slice(2, 4);

  // Render a single logo - clean image, no boxes, no cards, no borders, not clickable
  const renderLogo = (logo: TopBarLogoItem, idx: number) => {
    const hasError = imageErrors[logo.id];
    const imgHeight = variant === 'dashboard' 
      ? 'h-5 min-[360px]:h-6 sm:h-7 md:h-9 text-slate-400' 
      : 'h-6 min-[360px]:h-7 sm:h-8 md:h-10 lg:h-12 text-slate-400';

    const primaryUrl = logo.logo_url || `${S3_BUCKET}/portal-logos/${logo.file_name}`;

    return (
      <div 
        key={logo.id} 
        className="flex items-center justify-center shrink-0"
      >
        {!hasError ? (
          <img
            src={primaryUrl}
            alt={logo.title || `Logo ${logo.sort_order}`}
            width={48}
            height={48}
            onError={(e) => {
              const target = e.currentTarget;
              if (logo.file_name && !target.src.includes(`/assets/logos/${logo.file_name}`)) {
                target.src = `/assets/logos/${logo.file_name}`;
              } else {
                handleImageError(logo.id);
              }
            }}
            className={`${imgHeight} w-auto max-w-[24px] min-[360px]:max-w-[28px] min-[440px]:max-w-[36px] sm:max-w-[50px] md:max-w-[65px] lg:max-w-[90px] xl:max-w-[115px] object-contain select-none pointer-events-none transition-all drop-shadow-xs`}
            draggable={false}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className={`flex items-center gap-1 ${imgHeight}`}>
            {FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}
            <span className="hidden sm:inline text-[9px] sm:text-xs font-semibold select-none uppercase tracking-wide">
              {logo.title}
            </span>
          </div>
        )}
      </div>
    );
  };

  const fontClass = isHi 
    ? "font-['Noto_Sans_Devanagari',_'Hind',_sans-serif] font-bold tracking-normal" 
    : "font-poppins font-bold tracking-normal";

  const sloganSizeClass = "text-[10px] min-[360px]:text-[11px] min-[420px]:text-xs min-[540px]:text-[13px] sm:text-sm md:text-[15px] lg:text-lg xl:text-xl 2xl:text-[22px]";

  // Public Variant
  return (
    <div
      className={`w-full relative bg-cover bg-center bg-no-repeat border-b border-slate-200/80 shadow-xs ${className}`}
      style={{
        backgroundImage: `url('/assets/backgroundbg.png')`,
        backgroundColor: '#faf8f5',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-1 min-[360px]:px-2 sm:px-4 md:px-6 lg:px-8 py-1.5 sm:py-2 md:py-2.5">
        <div className="w-full flex items-center justify-between flex-nowrap gap-1 min-[360px]:gap-1.5 sm:gap-3 md:gap-4">
          {/* Left Logos (ALWAYS VISIBLE - 2 logos) */}
          <div className="flex shrink-0 items-center justify-start gap-1 min-[360px]:gap-1.5 sm:gap-2.5 md:gap-3.5">
            {leftLogos.map((logo, idx) => renderLogo(logo, idx))}
          </div>

          {/* Middle Slogan */}
          <a 
            href="#home" 
            className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 sm:px-2 md:px-3 group select-none py-0.5"
          >
            {/* Top Tagline (Yellow / Amber) */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5">
              <span className="h-[1px] w-2 sm:w-4 bg-gradient-to-r from-transparent to-amber-600" />
              <span className="font-hind font-bold text-amber-900 text-[8px] min-[360px]:text-[9px] min-[420px]:text-[10px] sm:text-xs tracking-wider whitespace-nowrap">
                {isHi ? 'गांव का विकास, प्रदेश का विकास' : 'Village Progress, State Progress'}
              </span>
              <span className="h-[1px] w-2 sm:w-4 bg-gradient-to-l from-transparent to-amber-600" />
            </div>

            {/* Main Slogan: सशक्त पंचायत, विकसित उत्तराखंड 🍃 */}
            <div className="flex items-center justify-center flex-wrap gap-x-2 sm:gap-x-2.5 gap-y-0.5 leading-tight">
              {/* Part 1: सशक्त पंचायत, (Navy Blue Gradient) */}
              <span className={`${fontClass} text-transparent bg-clip-text bg-gradient-to-r from-[#0a2558] via-[#003882] to-[#004bb5] ${sloganSizeClass} whitespace-nowrap leading-normal py-0.5 drop-shadow-xs`}>
                {isHi ? 'सशक्त पंचायत,' : 'Empowered Panchayat,'}
              </span>

              {/* Part 2: विकसित उत्तराखंड (Forest Green Gradient) + Leaf Icon */}
              <span className="inline-flex items-center gap-1 sm:gap-1.5 whitespace-nowrap py-0.5">
                <span className={`${fontClass} text-transparent bg-clip-text bg-gradient-to-r from-[#045928] via-[#0d7938] to-[#128a42] ${sloganSizeClass} whitespace-nowrap leading-normal drop-shadow-xs`}>
                  {isHi ? 'विकसित उत्तराखंड' : 'Developed Uttarakhand'}
                </span>
                <svg 
                  className="w-2.5 h-2.5 min-[360px]:w-3 min-[360px]:h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-emerald-600 shrink-0 inline-block drop-shadow-xs transform rotate-12 group-hover:scale-110 transition-transform ml-0.5" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                </svg>
              </span>
            </div>
          </a>

          {/* Right Logos (ALWAYS VISIBLE - 2 logos) */}
          <div className="flex shrink-0 items-center justify-end gap-1 min-[360px]:gap-1.5 sm:gap-2.5 md:gap-3.5">
            {rightLogos.map((logo, idx) => renderLogo(logo, idx + 2))}
          </div>
        </div>
      </div>
    </div>
  );
}
