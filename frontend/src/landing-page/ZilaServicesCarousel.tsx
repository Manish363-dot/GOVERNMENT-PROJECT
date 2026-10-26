import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Trash2,
  Building2,
  ShieldCheck,
  Store,
  Hotel,
  HardHat,
  PawPrint
} from 'lucide-react';

export interface ServiceWorkItem {
  id: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  headingHi: string;
  headingEn: string;
}

export const ZILA_SERVICES_DATA: ServiceWorkItem[] = [
  {
    id: 'solid-waste',
    fallbackIcon: Trash2,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-700',
    headingHi: 'ठोस अपशिष्ट एवं स्वच्छता प्रबंधन',
    headingEn: 'Solid Waste & Sanitation'
  },
  {
    id: 'rural-roads',
    fallbackIcon: Building2,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-700',
    headingHi: 'ग्रामीण संपर्क मार्ग एवं अवसंरचना',
    headingEn: 'Rural Roads & Infrastructure'
  },
  {
    id: 'commercial-asset',
    fallbackIcon: Building2,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-700',
    headingHi: 'पंचायती परिसंपत्ति एवं दुकान प्रबंधन',
    headingEn: 'Commercial Asset Management'
  },
  {
    id: 'citizen-services',
    fallbackIcon: ShieldCheck,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-700',
    headingHi: 'नागरिक सेवाएं',
    headingEn: 'Citizen Services'
  },
  {
    id: 'shop-licensing',
    fallbackIcon: Store,
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-700',
    headingHi: 'दुकान लाइसेंस एवं व्यापार कर',
    headingEn: 'Shop Licensing & Trade Tax'
  },
  {
    id: 'land-hotel-map',
    fallbackIcon: Hotel,
    iconBg: 'bg-cyan-50 border-cyan-100',
    iconColor: 'text-cyan-700',
    headingHi: 'भूमि एवं होटल मानचित्र स्वीकृति',
    headingEn: 'Land & Hotel Map Approval'
  },
  {
    id: 'contractor-licensing',
    fallbackIcon: HardHat,
    iconBg: 'bg-orange-50 border-orange-100',
    iconColor: 'text-orange-700',
    headingHi: 'ठेकेदारी लाइसेंसिंग',
    headingEn: 'Contractor Licensing'
  },
  {
    id: 'animal-shed',
    fallbackIcon: PawPrint,
    iconBg: 'bg-teal-50 border-teal-100',
    iconColor: 'text-teal-700',
    headingHi: 'पशु शेड योजना',
    headingEn: 'Animal Shed Scheme'
  }
];

export interface ZilaServicesCarouselProps {
  className?: string;
  showHeading?: boolean;
}

export const ZilaServicesCarousel: React.FC<ZilaServicesCarouselProps> = ({
  className = '',
  showHeading = false
}) => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));
  const [isPaused, setIsPaused] = useState(false);

  // Seamless infinite loop with 2 identical sets
  const doubleServices = useMemo(() => {
    return [...ZILA_SERVICES_DATA, ...ZILA_SERVICES_DATA];
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Optional Top Section Heading */}
      {showHeading && (
        <div className="text-center mb-6">
          <h3 className="font-poppins font-extrabold text-xl sm:text-2xl text-navy-900">
            {isHi ? 'जिला पंचायत अल्मोड़ा द्वारा प्रदत्त सेवाएं एवं कार्य' : 'Services & Works by Zila Panchayat Almora'}
          </h3>
          <div className="h-1 w-20 bg-amber-400 rounded-full mx-auto mt-2" />
        </div>
      )}

      {/* Outer Viewport with Left/Right Soft Gradient Fade */}
      <div
        className="relative w-full overflow-hidden py-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Gradient Mask */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10"
          aria-hidden="true"
        />

        {/* Right Gradient Mask */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10"
          aria-hidden="true"
        />

        {/* Continuous Moving Track */}
        <div className="overflow-x-hidden py-1">
          <div
            className="animate-infinite-moving-carousel flex gap-3.5 sm:gap-4.5 w-max items-center select-none"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {doubleServices.map((item, idx) => {
              const FallbackIcon = item.fallbackIcon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 px-4 py-3 sm:px-4.5 sm:py-3.5 flex items-center gap-3.5 shrink-0"
                  style={{ minWidth: '270px', maxWidth: '340px' }}
                >
                  {/* Circular Icon */}
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${item.iconBg || 'bg-slate-50 border-slate-100'}`}>
                    <FallbackIcon className={`w-5 h-5 ${item.iconColor || 'text-navy-900'}`} />
                  </div>

                  {/* Heading & Small Para on Right */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-poppins font-bold text-navy-900 text-xs sm:text-[13px] tracking-tight leading-snug truncate">
                      {isHi ? item.headingHi : item.headingEn}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
