import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Award, BookOpen, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePledgeCount } from '@/hooks/usePledgeCount';

import { BlogGalleryModal } from './BlogGalleryModal';

const BG_IMAGE_NAMES = ['image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image6.jpeg'];

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL || 'https://zila-panchayat-images.s3.ap-south-1.amazonaws.com';

const HERO_IMAGES = BG_IMAGE_NAMES.map(
  (filename) => `${S3_BUCKET}/portal-logos/${filename}`
);

// Dignitary photo image5.jpg from 'portal-logos' bucket
const DIGNITARY_IMAGE_URL = `${S3_BUCKET}/portal-logos/image5.jpg`;
const CM_IMAGE_URL = `${S3_BUCKET}/portal-logos/CM.jpg`;
const MK_IMAGE_URL = `${S3_BUCKET}/portal-logos/MK.jpg`;
const CH_IMAGE_URL = `${S3_BUCKET}/portal-logos/CH.jpeg`;
const AMA_IMAGE_URL = `${S3_BUCKET}/portal-logos/AMA.jpeg`;

const OFFICIALS = [
  {
    id: 1,
    name: "Sh. Pushkar Singh Dhami",
    designation: "Hon'ble Chief Minister of Uttarakhand",
    image: CM_IMAGE_URL,
  },
  {
    id: 2,
    name: "Sh. Madan Kaushik",
    designation: "Hon'ble Panchayati Raj Minister, Uttarakhand",
    image: MK_IMAGE_URL,
  },
  {
    id: 3,
    name: "Smt. Hema Gaira",
    designation: "Chairperson, Zila Panchayat Almora",
    image: CH_IMAGE_URL,
  },
  {
    id: 4,
    name: "Sh. Rajesh Kumar",
    designation: "Apar Mukhya Adhikari (AMA), Almora",
    image: AMA_IMAGE_URL,
  },
];

export const HeroSection = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const { count } = usePledgeCount();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [img5Error, setImg5Error] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);

  const scrollToPledge = useCallback(() => {
    const pledgeElement = document.getElementById('pledge');
    if (pledgeElement) {
      pledgeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

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

  const openBlogModal = useCallback(() => setIsBlogModalOpen(true), []);
  const closeBlogModal = useCallback(() => setIsBlogModalOpen(false), []);

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
            {/* Real-time Swachhata Pledge Counter CTA Button */}
            <Button
              size="lg"
              onClick={scrollToPledge}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-semibold shadow-xl border border-emerald-400/40 px-5 sm:px-6 h-12 text-sm transition-all duration-300 transform hover:-translate-y-0.5 group cursor-pointer"
            >
              <div className="flex items-center justify-center gap-2">
                {/* Live Pulse Beacon */}
                <Award className="w-4.5 h-4.5 text-amber-300 shrink-0 group-hover:rotate-12 transition-transform" />

                {/* Counter & Action */}
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="font-extrabold text-amber-300 text-base sm:text-lg tracking-tight font-mono">
                    {count.toLocaleString('en-IN')}
                  </span>
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {isHi ? 'नागरिकों ने शपथ ली' : (count === 1 ? 'Citizen Pledged' : 'Citizens Pledged')}
                  </span>
                  <span className="hidden md:inline-block text-emerald-200/60 font-light">•</span>
                  <span className="text-[11px] sm:text-xs font-bold text-amber-200 bg-emerald-950/60 group-hover:bg-emerald-950 px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap">
                    {isHi ? 'शपथ लें →' : 'Take Pledge →'}
                  </span>
                </div>
              </div>
            </Button>

            <Button size="lg" className="w-full sm:w-auto bg-white text-navy-900 hover:bg-slate-100 font-semibold shadow-lg border border-white px-6 h-12 text-sm" onClick={openBlogModal}>
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
          <div className="mt-6 sm:mt-10 w-full max-w-7xl mx-auto px-2 sm:px-6 relative z-30 translate-y-2 sm:translate-y-[1%] mb-8 sm:-mb-20">
            {/* Main PM Card */}
            <div className="relative bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 p-4 sm:py-5 sm:px-6 sm:pl-28 md:pl-32 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 min-h-[100px] mb-4">
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

            {/* 4 Officials Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 pb-4 items-stretch">
              {OFFICIALS.map((official) => (
                <div
                  key={official.id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100 p-3 sm:p-5 md:p-6 flex flex-col items-center text-center justify-start h-full transition-all hover:-translate-y-1.5 hover:shadow-xl duration-300"
                >
                  {/* Circular Avatar with soft white ring & shadow */}
                  <div className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-slate-50 ring-2 sm:ring-4 ring-white shadow-md mb-2 sm:mb-4 shrink-0">
                    {official.image ? (
                      <img
                        src={official.image}
                        alt={official.name}
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
                    {official.name}
                  </h4>

                  {/* Designation */}
                  <p className="text-[10px] sm:text-xs md:text-[13px] text-slate-500 font-normal leading-relaxed">
                    {official.designation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <BlogGalleryModal isOpen={isBlogModalOpen} onClose={closeBlogModal} />
    </section>
  );
});
