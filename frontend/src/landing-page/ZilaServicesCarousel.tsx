import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface ServiceWorkItem {
  id: string;
  headingHi: string;
  headingEn: string;
}

export const ZILA_SERVICES_DATA: ServiceWorkItem[] = [
  {
    id: 'solid-waste',
    headingHi: 'ठोस अपशिष्ट एवं स्वच्छता प्रबंधन',
    headingEn: 'Solid Waste & Sanitation'
  },
  {
    id: 'rural-roads',
   
    headingHi: 'ग्रामीण संपर्क मार्ग एवं अवसंरचना',
    headingEn: 'Rural Roads & Infrastructure'
  },
  {
    id: 'commercial-asset',
    headingHi: 'पंचायती परिसंपत्ति एवं दुकान प्रबंधन',
    headingEn: 'Commercial Asset Management'
  },
  {
    id: 'citizen-services',
    headingHi: 'नागरिक सेवाएं',
    headingEn: 'Citizen Services'
  },
  {
    id: 'shop-licensing',
    headingHi: 'दुकान लाइसेंस एवं व्यापार कर',
    headingEn: 'Shop Licensing & Trade Tax'
  },
  {
    id: 'land-hotel-map',
    headingHi: 'भूमि एवं होटल मानचित्र स्वीकृति',
    headingEn: 'Land & Hotel Map Approval'
  },
  {
    id: 'contractor-licensing',
    headingHi: 'ठेकेदारी लाइसेंसिंग',
    headingEn: 'Contractor Licensing'
  },
  {
    id: 'animal-shed',
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
          <h3 className={`text-xl sm:text-2xl text-navy-900 ${isHi ? 'font-hind font-bold leading-normal pt-1' : 'font-poppins font-extrabold'}`}>
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
        <div className="overflow-x-hidden py-2">
          <div
            className="animate-infinite-moving-carousel flex gap-3.5 sm:gap-4.5 w-max items-center select-none"
            style={{
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {doubleServices.map((item, idx) => {
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 px-4 py-3 sm:px-4.5 sm:py-3.5 flex items-center justify-center text-center shrink-0"
                  style={{ minWidth: '290px', maxWidth: '380px' }}
                >
                  {/* Heading centered with proper Hindi font-hind and line-height */}
                  <div className="min-w-0 flex-1 py-1 text-center">
                    <h4 className={`text-navy-900 text-xs sm:text-[13.5px] leading-normal whitespace-nowrap text-center pt-1 pb-0.5 ${
                      isHi 
                        ? 'font-hind font-semibold sm:font-bold tracking-normal' 
                        : 'font-poppins font-bold tracking-tight'
                    }`}>
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
