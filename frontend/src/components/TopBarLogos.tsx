import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
    async function fetchLogos() {
      try {
        const { data, error } = await supabase
          .from('top_bar_logos')
          .select('id, title, file_name, logo_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(4);

        if (!error && data && data.length > 0) {
          const resolved = data.map((item) => {
            let finalUrl = item.logo_url;
            if (item.file_name) {
              const { data: storageData } = supabase.storage
                .from('portal-logos')
                .getPublicUrl(item.file_name);
              if (storageData?.publicUrl) {
                finalUrl = storageData.publicUrl;
              }
            }
            return {
              ...item,
              logo_url: finalUrl,
            };
          });
          setLogos(resolved);
        } else {
          // Resolve storage URLs for default files (logo1.png - logo4.png)
          const withStorageUrls = DEFAULT_LOGOS.map((item) => {
            const { data: storageData } = supabase.storage
              .from('portal-logos')
              .getPublicUrl(item.file_name || `logo${item.sort_order}.png`);
            return {
              ...item,
              logo_url: storageData?.publicUrl,
            };
          });
          setLogos(withStorageUrls);
        }
      } catch {
        // Fallback silently
      }
    }

    fetchLogos();
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const leftLogos = logos.slice(0, 2);
  const rightLogos = logos.slice(2, 4);

  // Render a single logo - clean image, no boxes, no cards, no borders, not clickable
  const renderLogo = (logo: TopBarLogoItem, idx: number) => {
    const hasError = imageErrors[logo.id] || !logo.logo_url;
    const imgHeight = variant === 'dashboard' ? 'h-7 sm:h-10 text-slate-400' : 'h-8 sm:h-14 text-slate-400';

    return (
      <div key={logo.id} className="flex items-center justify-center">
        {!hasError ? (
          <img
            src={logo.logo_url}
            alt={logo.title || `Logo ${logo.sort_order}`}
            onError={() => handleImageError(logo.id)}
            className={`${imgHeight} w-auto max-w-[70px] sm:max-w-[160px] object-contain select-none pointer-events-none`}
            draggable={false}
          />
        ) : (
          <div className={`flex items-center gap-1.5 ${imgHeight}`}>
            {FALLBACK_ICONS[idx % FALLBACK_ICONS.length]}
            <span className="text-[10px] sm:text-sm font-semibold select-none uppercase tracking-wide">
              {logo.title}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (variant === 'dashboard') {
    return (
      <div className={`w-full flex items-center justify-between px-2 sm:px-8 py-2 ${className} flex-nowrap`}>
        {/* Left Logos */}
        <div className="flex-1 flex items-center justify-start gap-2 sm:gap-10">
          {leftLogos.map((logo, idx) => renderLogo(logo, idx))}
        </div>

        {/* Right Logos */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-10">
          {rightLogos.map((logo, idx) => renderLogo(logo, idx + 2))}
        </div>
      </div>
    );
  }

  // Public Variant
  return (
    <div className={`w-full bg-white border-b border-slate-100 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="w-full flex items-center justify-between flex-nowrap px-1 sm:px-0">
          {/* Left Logos */}
          <div className="flex-1 flex items-center justify-start gap-2 sm:gap-10">
            {leftLogos.map((logo, idx) => renderLogo(logo, idx))}
          </div>

          {/* Right Logos */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-10">
            {rightLogos.map((logo, idx) => renderLogo(logo, idx + 2))}
          </div>
        </div>
      </div>
    </div>
  );
}
