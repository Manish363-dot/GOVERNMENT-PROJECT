import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, MessageSquareWarning, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { BlogGalleryModal } from './BlogGalleryModal';

const BG_IMAGE_NAMES = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg','image6.jpeg'];

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';

const HERO_IMAGES = BG_IMAGE_NAMES.map(
  (filename) => `${S3_BUCKET}/portal-logos/${filename}`
);

// Dignitary photo image5.jpg from 'portal-logos' bucket
const DIGNITARY_IMAGE_URL = `${S3_BUCKET}/portal-logos/image5.jpg`;
const CM_IMAGE_URL = `${S3_BUCKET}/portal-logos/CM.jpg`;
const MK_IMAGE_URL = `${S3_BUCKET}/portal-logos/MK.jpg`;
const CH_IMAGE_URL = `${S3_BUCKET}/portal-logos/CH.jpeg`;

export function HeroSection() {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [img5Error, setImg5Error] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  // Preload background images and dignitary image
  useEffect(() => {
    [...HERO_IMAGES, DIGNITARY_IMAGE_URL].forEach((url) => {
      const img = new Image();
      img.src = url;
    });
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
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ))}

        {/* Lighter Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07182f]/70 via-[#0d3262]/55 to-[#1d4ed8]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-0">
        {/* Main Hero Content - Centered */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center animate-fade-in">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 border border-white/25 shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-100 tracking-wide">
              उत्तराखंड शासन • Zila Panchayat Safai Portal
            </span>
          </div>

          <h1 className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 tracking-tight text-white max-w-4xl mx-auto drop-shadow-md">
            <span className="block text-white">
              {t('hero.titleLine1', 'District Panchayat Almora')}
            </span>
            <span className="block mt-1 sm:mt-2 text-slate-100">
              {t('hero.titleLine2', 'Solid Waste Management')}
            </span>
            <span className="block mt-1 sm:mt-2 text-yellow-400 font-extrabold">
              {t('hero.titleLine3', 'Grievance Redressal Portal')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
            {t('hero.subtitle')}
          </p>

          {/* Buttons: Full-width stacked on mobile, inline on sm+ */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-emerald-700 text-white font-semibold shadow-lg border border-emerald-500/30 px-6 h-12 text-sm" asChild>
              <a href="#complaint" className="flex items-center justify-center">
                <MessageSquareWarning className="w-4.5 h-4.5 mr-2 text-white" />
                {t('hero.registerComplaint', 'Register Complaint')}
              </a>
            </Button>
            <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-slate-100 font-semibold shadow-lg border border-white px-6 h-12 text-sm" onClick={() => setIsBlogModalOpen(true)}>
              <BookOpen className="w-4.5 h-4.5 mr-2 text-navy-900" />
              {t('hero.ourBlogs', 'Our Blogs')}
            </Button>
          </div>

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
          <div className="mt-6 sm:mt-10 w-full max-w-7xl mx-auto px-2 sm:px-6 relative z-30 translate-y-[15%] sm:translate-y-[1%] -mb-4 sm:-mb-20">
            {/* Main PM Card */}
            <div className="relative bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:py-5 sm:px-6 sm:pl-28 md:pl-32 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 min-h-[110px] mb-4">
              {/* Dignitary Photo */}
              <div className="sm:absolute -top-8 sm:top-1/2 sm:-translate-y-1/2 sm:-left-8 md:-left-10 w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100 shrink-0 select-none mx-auto sm:mx-0">
                {!img5Error ? (
                  <img
                    src={DIGNITARY_IMAGE_URL}
                    alt="Dignitary"
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-slate-500 font-medium text-center sm:text-left">
                  <span className="font-semibold text-slate-800">
                    {t('hero.sloganMission')}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Additional Sections */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  id: 1,
                  name: "Shri Pushkar Singh Dhami",
                  designation: "Chief Minister, Uttarakhand",
                  image: CM_IMAGE_URL,
                  quote: "स्वच्छ उत्तराखण्ड, स्वस्थ उत्तराखण्ड"
                },
                { id: 2, name: "Madan Kaushik", designation: "Minister for Disaster Management and Rehabilitation of Uttarakhand", image: MK_IMAGE_URL, quote: "" },
                { id: 3, name: "Hema Gaira", designation: "Chairman Zila Panchayat Almora", image: CH_IMAGE_URL, quote: "" },
                { id: 4, name: "Rajesh Kumar", designation: "Apar Mukhya Adhikari (AMA)", image: null, quote: "" }
              ].map((official) => (
                <div key={official.id} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-3 sm:py-4 sm:px-5 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-2xl duration-300">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-slate-200 overflow-hidden bg-slate-50 mb-2 sm:mb-3 shadow-md">
                    {official.image ? (
                      <img src={official.image} alt={official.name} className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] sm:text-xs font-medium">Image {official.id}</div>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">{official.name}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-semibold">{official.designation}</p>
                  
                  {/* Optional Quote Space */}
                  {official.quote ? (
                    <p className="text-[10px] sm:text-[11px] text-slate-600 mt-2 sm:mt-3 italic border-t border-red-500 pt-2 w-full font-medium leading-tight">
                      "{official.quote}"
                    </p>
                  ) : (
                    <div className="mt-2 sm:mt-3 pt-2 w-full border-t border-red-500 min-h-[20px]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <BlogGalleryModal isOpen={isBlogModalOpen} onClose={() => setIsBlogModalOpen(false)} />
    </section>
  );
}
