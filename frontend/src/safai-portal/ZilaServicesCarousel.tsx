import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  Trash2,
  MessageSquareWarning,
  Building2,
  Leaf,
  MapPin,
  Headphones,
  Droplets,
  HeartPulse,
  Sparkles
} from 'lucide-react';

export interface ServiceWorkItem {
  id: string;
  logoSrc?: string;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  iconBg?: string;
  iconColor?: string;
  headingHi: string;
  headingEn: string;
  paraHi: string;
  paraEn: string;
}

export const ZILA_SERVICES_DATA: ServiceWorkItem[] = [
  {
    id: 'rural-dev',
    logoSrc: '/assets/logos/logo1.png',
    fallbackIcon: Building2,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-700',
    headingHi: 'ग्रामीण विकास एवं निर्माण',
    headingEn: 'Rural Development',
    paraHi: 'सतत ग्रामीण बुनियादी ढांचे और संपर्क मार्गों का निर्माण',
    paraEn: 'Building sustainable village infrastructure'
  },
  {
    id: 'solid-waste',
    logoSrc: '/assets/logos/logo5.png',
    fallbackIcon: Trash2,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-700',
    headingHi: 'ठोस अपशिष्ट प्रबंधन',
    headingEn: 'Solid Waste Management',
    paraHi: 'दैनिक घर-घर कचरा एकत्रीकरण एवं एमआरएफ रीसाइक्लिंग',
    paraEn: 'Daily door-to-door collection & MRF recycling'
  },
  {
    id: 'panchayati-raj',
    logoSrc: '/assets/logos/logo2.png',
    fallbackIcon: Building2,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-700',
    headingHi: 'पंचायती राज स्वशासन',
    headingEn: 'Panchayati Raj Governance',
    paraHi: 'ग्राम पंचायतों का सुदृढ़ीकरण एवं स्थानीय स्वशासन',
    paraEn: 'Empowering grassroots local governance'
  },
  {
    id: 'community-engagement',
    logoSrc: '/assets/logos/logo3.png',
    fallbackIcon: Sparkles,
    iconBg: 'bg-purple-50 border-purple-100',
    iconColor: 'text-purple-700',
    headingHi: 'जन-सहभागिता अभियान',
    headingEn: 'Community Engagement',
    paraHi: 'स्वच्छ भारत मिशन में नागरिकों की सक्रिय भागीदारी',
    paraEn: 'Fostering participation in local governance'
  },
  {
    id: 'healthcare-sanitation',
    fallbackIcon: HeartPulse,
    iconBg: 'bg-rose-50 border-rose-100',
    iconColor: 'text-rose-600',
    headingHi: 'स्वास्थ्य एवं स्वच्छता सेवाएं',
    headingEn: 'Healthcare Initiatives',
    paraHi: 'नालियों की सफाई, कीटनाशक छिड़काव व जन-स्वास्थ्य सुरक्षा',
    paraEn: 'Improving rural health & sanitation services'
  },
  {
    id: 'drinking-water',
    fallbackIcon: Droplets,
    iconBg: 'bg-cyan-50 border-cyan-100',
    iconColor: 'text-cyan-600',
    headingHi: 'स्वच्छ पेयजल स्रोत संरक्षण',
    headingEn: 'Clean Water Protection',
    paraHi: 'ग्रामीण प्राकृतिक जलस्रोतों व नौलों का नियमित संरक्षण',
    paraEn: 'Safeguarding natural springs & rural water bodies'
  },
  {
    id: 'e-governance',
    logoSrc: '/assets/logos/logo4.png',
    fallbackIcon: Building2,
    iconBg: 'bg-indigo-50 border-indigo-100',
    iconColor: 'text-indigo-700',
    headingHi: 'ई-गवर्नेंस एवं डिजिटल सेवाएं',
    headingEn: 'E-Governance',
    paraHi: 'डिजिटल तकनीक द्वारा ग्रामीण जनसेवाओं का सशक्तिकरण',
    paraEn: 'Empowering rural communities through technology'
  },
  {
    id: 'gps-tracking',
    fallbackIcon: Truck,
    iconBg: 'bg-blue-50 border-blue-100',
    iconColor: 'text-blue-600',
    headingHi: 'स्मार्ट जीपीएस वाहन ट्रैकिंग',
    headingEn: 'GPS Vehicle Tracking',
    paraHi: 'समस्त वार्डों में सफाई वाहनों की 24x7 लाइव जीपीएस निगरानी',
    paraEn: 'Real-time GPS tracking across district wards'
  },
  {
    id: 'grievance-redressal',
    fallbackIcon: MessageSquareWarning,
    iconBg: 'bg-orange-50 border-orange-100',
    iconColor: 'text-orange-600',
    headingHi: 'नागरिक जन-शिकायत निवारण',
    headingEn: 'Public Grievance Redressal',
    paraHi: 'सफाई संबंधी ऑनलाइन शिकायत दर्ज व समयबद्ध निस्तारण',
    paraEn: 'Swift citizen complaint filing & resolution'
  },
  {
    id: 'pilgrim-sanitation',
    fallbackIcon: MapPin,
    iconBg: 'bg-amber-50 border-amber-100',
    iconColor: 'text-amber-600',
    headingHi: 'तीर्थ एवं पर्यटन स्थल स्वच्छता',
    headingEn: 'Heritage & Pilgrim Sites',
    paraHi: 'जागेश्वर धाम सहित प्रमुख तीर्थों पर विशेष सफाई अभियान',
    paraEn: 'Cleanliness drives at Jageshwar & scenic hubs'
  },
  {
    id: 'organic-compost',
    fallbackIcon: Leaf,
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconColor: 'text-emerald-600',
    headingHi: 'जैविक खाद निर्माण व कम्पोस्टिंग',
    headingEn: 'Organic Composting',
    paraHi: 'गीले जैविक कचरे से खाद तैयार कर किसानों को वितरण',
    paraEn: 'Eco-friendly composting & vermiculture'
  },
  {
    id: 'toll-free-helpline',
    fallbackIcon: Headphones,
    iconBg: 'bg-teal-50 border-teal-100',
    iconColor: 'text-teal-600',
    headingHi: '24x7 नागरिक हेल्पलाइन',
    headingEn: 'Toll-Free Helpline 1800-185-1850',
    paraHi: 'सफाई व्यवस्था हेतु निःशुल्क सहायता नंबर 1800-185-1850',
    paraEn: '24x7 citizen support & sanitation assistance'
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
                  {/* Circular Logo / Icon on Left */}
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center p-1.5 shrink-0 shadow-2xs overflow-hidden ${item.iconBg || 'bg-slate-50 border-slate-100'}`}>
                    {item.logoSrc ? (
                      <img
                        src={item.logoSrc}
                        alt={isHi ? item.headingHi : item.headingEn}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.icon-fallback');
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`icon-fallback ${item.logoSrc ? 'hidden' : ''} flex items-center justify-center w-full h-full`}>
                      <FallbackIcon className={`w-5 h-5 ${item.iconColor || 'text-navy-900'}`} />
                    </div>
                  </div>

                  {/* Heading & Small Para on Right */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-poppins font-bold text-navy-900 text-xs sm:text-[13px] tracking-tight leading-snug truncate">
                      {isHi ? item.headingHi : item.headingEn}
                    </h4>
                    <p className="text-[11px] sm:text-[11.5px] text-slate-500 font-normal leading-tight mt-0.5 truncate">
                      {isHi ? item.paraHi : item.paraEn}
                    </p>
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
