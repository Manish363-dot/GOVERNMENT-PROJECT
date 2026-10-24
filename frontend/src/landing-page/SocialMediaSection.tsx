import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ExternalLink,
  Play,
  Share2,
  ChevronLeft,
  ChevronRight,
  Video
} from 'lucide-react';

export const SocialMediaSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const socialWorkPosts = [
    {
      id: 'fb-gaushala',
      title: isHi
        ? 'निराश्रित व आवारा गोवंश संरक्षण — 5 नई गौशालाओं का निर्माण'
        : 'Stray Cattle Relief & 5 New Cow Shelters Under Construction',
      description:
        'अल्मोड़ा जिले के ग्रामीण क्षेत्रों में निराश्रित और आवारा गोवंश की समस्या से किसानों को राहत दिलाने के लिए पांच नई गौशालाओं का निर्माण किया जा रहा है, जबकि दो गौशालाओं का विस्तारीकरण किया जा रहा है।',
      hashtags: [
        '#Almora',
        '#Uttarakhand',
        '#Gaushala',
        '#CowShelter',
        '#StrayCattle',
        '#AnimalWelfare',
        '#FarmersRelief'
      ],
      videoUrl: 'https://www.facebook.com/share/v/18YZ6kmwKb/',
      badge: isHi ? 'गौवंश संरक्षण व कृषक कल्याण' : 'Farmer Relief & Animal Welfare'
    },
    {
      id: 'fb-swm-development',
      title: isHi
        ? 'ग्रामीण विकास, स्वच्छता एवं ठोस अपशिष्ट प्रबंधन कार्य'
        : 'Rural Cleanliness, SWM & Development Works Progress',
      description: isHi
        ? 'जिला पंचायत अल्मोड़ा द्वारा जनपद के समस्त 11 विकासखंडों में ठोस अपशिष्ट प्रबंधन, डोर-टू-डोर कचरा एकत्रीकरण, एवं ग्रामीण स्वच्छता अभियान संबंधी कार्यों का धरातलीय निरीक्षण व वीडियो बुलेटिन।'
        : 'Ground inspection and video report of solid waste management, door-to-door waste collection fleet, and sanitation drives across all 11 blocks under Zila Panchayat Almora.',
      hashtags: [
        '#Almora',
        '#Uttarakhand',
        '#PanchayatiRaj',
        '#SwachhBharatGrameen',
        '#RuralDevelopment',
        '#CleanAlmora'
      ],
      videoUrl: 'https://www.facebook.com/share/v/1FGZx4tChj/?mibextid=wwXIfr',
      badge: isHi ? 'ठोस अपशिष्ट एवं विकास कार्य' : 'Rural Development & SWM'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(2);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Responsive cards per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else {
        setCardsPerView(2);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, socialWorkPosts.length - cardsPerView);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  }, [maxIndex]);

  const handleShare = (url: string, title: string) => {
    if (navigator.share) {
      navigator.share({
        title,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <section id="social-engagement" className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Section with Navigation Controls (Matching NoticesSection layout) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-100 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-3.5 border border-blue-200">
              <Share2 className="w-3.5 h-3.5 text-blue-800" />
              <span>{isHi ? 'सोशल मीडिया जुड़ाव' : 'Social Connect'}</span>
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              Social Engagement
            </h2>
          </div>

          {/* Slider Controls (Prev / Next Buttons) */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {currentIndex + 1} - {Math.min(currentIndex + cardsPerView, socialWorkPosts.length)} / {socialWorkPosts.length}
            </span>
            <button
              onClick={prevSlide}
              aria-label="Previous Post"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Post"
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:bg-navy-900 hover:text-white hover:border-navy-900 shadow-xs flex items-center justify-center text-slate-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider / Carousel Container */}
        <div className="relative overflow-hidden -mx-2 px-2 py-2" ref={sliderRef}>
          <div 
            className="flex transition-transform duration-500 ease-in-out gap-6 sm:gap-8"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
            }}
          >
            {socialWorkPosts.map((post) => (
              <div
                key={post.id}
                className="w-full md:w-[calc(50%-1rem)] shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div>

                  {/* Video Preview Container with Play Button Overlay */}
                  <div className="p-4 sm:p-5">
                    <a
                      href={post.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block rounded-xl overflow-hidden bg-slate-950 aspect-video group cursor-pointer shadow-inner border border-slate-800"
                      title={isHi ? 'फेसबुक पर वीडियो देखें' : 'Watch video on Facebook'}
                    >
                      {/* Dark gradient backdrop */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/90 to-navy-950/80" />
                      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" /> 


                      {/* Center: Play Button */}
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.7)] group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300">
                          <Play className="w-7 h-7 fill-white translate-x-0.5" />
                        </div>
                        <span className="mt-2 text-[11px] font-semibold text-white/90 group-hover:text-amber-300 transition-colors drop-shadow-sm">
                          {isHi ? 'वीडियो देखें ▶' : 'Click to Watch ▶'}
                        </span>
                      </div>

                      {/* Bottom overlay title */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
                        <p className="text-white text-xs font-bold truncate drop-shadow-sm">
                          {post.title}
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* Content description & hashtags */}
                  <div className="px-4 sm:px-5 pb-3 space-y-2.5 text-slate-700 text-xs sm:text-[13px] leading-relaxed">
                    <p className="font-bold text-navy-950 text-sm sm:text-base leading-snug">
                      {post.title}
                    </p>
                    
                    <p className="text-slate-600 leading-normal">
                      {post.description}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.hashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                  <a
                    href={post.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>{isHi ? 'वीडियो लिंक खोलें' : 'Watch the video'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleShare(post.videoUrl, post.title)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isHi ? 'साझा करें' : 'Share'}
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">{isHi ? 'शेयर' : 'Share'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
});

SocialMediaSection.displayName = 'SocialMediaSection';
