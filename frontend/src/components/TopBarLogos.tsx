import { useEffect, useState } from 'react';
import { Shield, Sparkles, Globe, Award } from 'lucide-react';

export interface TopBarLogoItem {
  id: string;
  title: string;
  file_name?: string;
  logo_url?: string;
  sort_order: number;
}

// 4 Default logo slots
const DEFAULT_LOGOS: TopBarLogoItem[] = [
  {
    id: 'logo-1',
    title: 'Logo 1 (Left)',
    file_name: 'logo1.png',
    sort_order: 1,
  },
  {
    id: 'logo-2',
    title: 'Logo 2 (Left)',
    file_name: 'logo2.png',
    sort_order: 2,
  },
  {
    id: 'logo-3',
    title: 'Logo 3 (Right)',
    file_name: 'logo3.png',
    sort_order: 3,
  },
  {
    id: 'logo-4',
    title: 'Logo 4 (Right)',
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
  const [logos, setLogos] = useState<TopBarLogoItem[]>(DEFAULT_LOGOS);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://your-bucket-name.s3.amazonaws.com';
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
    const hasError = imageErrors[logo.id] || !logo.logo_url;
    const imgHeight = variant === 'dashboard' ? 'h-7 sm:h-9 md:h-10 text-slate-400' : 'h-7 sm:h-10 md:h-14 text-slate-400';

    return (
      <div key={logo.id} className="flex items-center justify-center shrink-0">
        {!hasError ? (
          <img
            src={logo.logo_url}
            alt={logo.title || `Logo ${logo.sort_order}`}
            onError={() => handleImageError(logo.id)}
            className={`${imgHeight} w-auto max-w-[65px] xs:max-w-[90px] sm:max-w-[140px] md:max-w-[160px] object-contain select-none pointer-events-none transition-all`}
            draggable={false}
          />
        ) : (
          <div className={`flex items-center gap-1 ${imgHeight}`}>
            {FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}
            <span className="text-[10px] sm:text-xs font-semibold select-none uppercase tracking-wide">
              {logo.title}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (variant === 'dashboard') {
    return (
      <div className={`w-full flex items-center justify-between px-2 sm:px-6 md:px-8 py-1.5 sm:py-2 ${className} flex-nowrap overflow-x-hidden`}>
        {/* Left Logos */}
        <div className="flex-1 flex items-center justify-start gap-2 sm:gap-6 md:gap-10">
          {leftLogos.map((logo, idx) => renderLogo(logo, idx))}
        </div>

        {/* Right Logos */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-6 md:gap-10">
          {rightLogos.map((logo, idx) => renderLogo(logo, idx + 2))}
        </div>
      </div>
    );
  }

  // Public Variant
  return (
    <div className={`w-full bg-white border-b border-slate-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-1.5 sm:py-3">
        <div className="w-full flex items-center justify-between flex-nowrap overflow-x-hidden">
          {/* Left Logos */}
          <div className="flex-1 flex items-center justify-start gap-2 sm:gap-6 md:gap-10">
            {leftLogos.map((logo, idx) => renderLogo(logo, idx))}
          </div>

          {/* Right Logos */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-6 md:gap-10">
            {rightLogos.map((logo, idx) => renderLogo(logo, idx + 2))}
          </div>
        </div>
      </div>
    </div>
  );
}
